// Exercise the reported readability issue and the viewport/selection interactions.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.CHECK_URL || 'http://127.0.0.1:8770/';
const out = process.env.QA_OUTPUT;
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'wiring_routes.svg'), 'utf8');
const full = source.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const near = (a, b, epsilon = .001) => Math.abs(a - b) < epsilon;
(async () => {
  if (out) fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    await page.goto(new URL('#wiring', base).href);
    await page.locator('#main-stage[data-ready="true"]').waitFor();
    const camera = () => page.locator('#main-stage svg').evaluate(svg => {
      const v = svg.viewBox.baseVal, m = svg.getScreenCTM();
      return { x: v.x, y: v.y, w: v.width, h: v.height, scale: m.a };
    });
    const fitContains = (v, box) => {
      assert.ok(v.x <= box[0] + .01 && v.y <= box[1] + .01, 'Fit includes top and left');
      assert.ok(v.x + v.w >= box[0] + box[2] - .01 && v.y + v.h >= box[1] + box[3] - .01, 'Fit includes bottom and right');
    };
    assert.equal(await page.locator('#main-stage .wire-route').count(), 21);
    assert.equal(await page.locator('#main-stage .wire-badge:visible').count(), 0, 'Default hides wire numbers');
    assert.equal(await page.locator('#main-stage text:visible').count(), 21, 'Overview keeps short labels only');
    assert.equal(await page.locator('#zoom-focus').isVisible(), false);
    assert.equal(await page.locator('#trace-endpoints').isVisible(), false);
    assert.equal(await page.locator('.legend').count(), 0, 'Circuit buttons replace the repeated legend');
    assert.equal(await page.locator('#connectors').getAttribute('open'), null);
    const labels = await page.locator('#main-stage text:visible').evaluateAll(es => es.filter(e => e.textContent !== 'LOAD →').map(e => Number(e.getAttribute('font-size')) * e.getScreenCTM().a));
    assert.ok(Math.min(...labels) >= 14, 'Default labels must be readable, not the former 5–7 px');
    if (out) await page.locator('#wiring-viewer').screenshot({ path: path.join(out, 'wiring-readable-desktop.png') });

    // Table, pointer, and keyboard selection show one number plus correct physical endpoints.
    await page.locator('#connections summary').click();
    await page.locator('.trace[data-id="14"]').click();
    assert.equal(await page.locator('#trace-endpoints').textContent(), 'CT1 white (+) → ELITEpro CH1 +');
    assert.equal(await page.locator('#main-stage .wire-badge:visible').count(), 1);
    assert.equal(await page.locator('#main-stage .wire-badge.selected').getAttribute('data-id'), '14');
    const routeBox = await page.locator('#wire-14').evaluate(e => { const b = e.getBBox(); return [b.x,b.y,b.width,b.height]; });
    fitContains(await camera(), routeBox);
    assert.ok(await page.locator('[data-endpoint="D.+"]').evaluate(e => e.getBoundingClientRect().right <= document.querySelector('#main-stage').getBoundingClientRect().right - 6), 'Focus leaves room for the CH1 + label');
    assert.ok((await camera()).scale > .7, 'Local route can be enlarged');
    if (out) await page.locator('#wiring-viewer').screenshot({ path: path.join(out, 'wiring-focused-ct.png') });
    await page.locator('.trace[data-id="20"]').click();
    assert.match(await page.locator('#trace-endpoints').textContent(), /XA hot contact/);
    await page.locator('.trace[data-id="21"]').click();
    assert.match(await page.locator('#trace-endpoints').textContent(), /XA neutral contact/);
    await page.locator('#wire-19').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#trace-endpoints').textContent(), 'PE port 4 → XA PE');
    await page.locator('[data-mode="signal"]').click();
    assert.equal(await page.locator('#trace-endpoints').isVisible(), false);
    assert.equal(await page.locator('#main-stage .wire-badge:visible').count(), 0);
    await page.locator('#zoom-focus').click();
    for (const id of ['14','15','16']) {
      const b = await page.locator('#wire-' + id).evaluate(e => { const b = e.getBBox(); return [b.x,b.y,b.width,b.height]; });
      fitContains(await camera(), b);
    }
    await page.locator('[data-mode="all"]').click();
    await page.locator('#zoom-reset').click();
    const beforePan = await camera();
    await page.locator('#main-stage').scrollIntoViewIfNeeded();
    const b = await page.locator('#main-stage').boundingBox();
    await page.mouse.move(b.x + b.width*.5, b.y + b.height*.5); await page.mouse.down();
    await page.mouse.move(b.x + b.width*.5 + 100, b.y + b.height*.5 + 40, { steps: 10 }); await page.mouse.up();
    assert.notDeepEqual(await camera(), beforePan, 'Dragging pans the view');
    assert.equal(await page.locator('#main-stage .wire-badge:visible').count(), 0, 'Dragging must not trace a wire accidentally');
    await page.locator('#main-stage').focus(); const beforeKey = await camera(); await page.keyboard.press('ArrowDown');
    assert.notDeepEqual(await camera(), beforeKey);
    await page.keyboard.press('Home');
    assert.ok((await camera()).scale >= .6999);

    for (const width of [1440,768,390,320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('#zoom-reset').click();
      assert.ok((await camera()).scale >= .6999, 'Readable default survives narrow screens');
      await page.locator('#zoom-fit').click();
      fitContains(await camera(), full);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No page overflow');
      const inlineHeight = await page.locator('#main-stage').evaluate(e => e.clientHeight);
      await page.locator('#wiring-expand').click();
      assert.equal(await page.locator('#wiring-fullscreen').evaluate(e => e.open && e.matches(':modal')), true);
      await page.waitForFunction(h => document.querySelector('#main-stage').clientHeight !== h, inlineHeight);
      fitContains(await camera(), full);
      assert.equal(await page.locator('#wiring-viewer').evaluate(e => e.closest('dialog')?.id), 'wiring-fullscreen');
      await page.locator('#zoom-reset').click();
      if (out && width === 390) await page.locator('#wiring-fullscreen').screenshot({ path: path.join(out, 'wiring-mobile-fullscreen.png') });
      const scale = (await camera()).scale;
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.querySelector('#wiring-viewer').parentNode.id === 'wiring');
      assert.equal(await page.locator('#wiring-fullscreen').isVisible(), false);
      assert.equal(await page.locator('#wiring-viewer').evaluate(e => e.parentNode.id), 'wiring');
      assert.equal(await page.locator('#wiring-expand').evaluate(e => e === document.activeElement), true);
      assert.ok((await camera()).scale >= .6999);
      await page.locator('#zoom-in').click(); assert.ok(near((await camera()).scale, scale*1.25, .01));
    }
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.locator('#zoom-fit').click();
    await page.locator('#wiring-expand').click();
    if (out) await page.locator('#wiring-fullscreen').screenshot({ path: path.join(out, 'wiring-fullscreen-overview.png') });
    await page.locator('#wiring-expand').click();
    await page.waitForFunction(() => document.querySelector('#wiring-viewer').parentNode.id === 'wiring');
    await page.locator('#connections summary').click();
    await page.locator('#connectors summary').click();
    assert.match(await page.locator('#connectors').innerText(), /White gaps are insulated crossings/);
    await page.locator('#connectors summary').click();
    assert.deepEqual(errors, []);
    const report = { defaultVisibleLabels: 21, allPaths: 21, defaultLabelMinimumPx: Math.min(...labels), fitAll: true, focusWireAndGroup: true, physicalEndpointNames: true, dragAndKeyboardPan: true, fullscreenAndEscape: true, viewportWidths: [1440,768,390,320], errors };
    if (out) fs.writeFileSync(path.join(out, 'wiring-validation.json'), JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
