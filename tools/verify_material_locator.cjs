// Exercise the public BOM links against actual rendered meshes and camera bounds.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const bom = JSON.parse(fs.readFileSync(path.join(root, 'procurement.json')));
const dimensions = JSON.parse(fs.readFileSync(path.join(root, 'layout_dimensions.json')));
const base = process.env.CHECK_URL || 'http://127.0.0.1:8770/';
const out = process.env.QA_OUTPUT;
const close = (a,b) => Math.abs(a-b) < .05;

(async () => {
  if (out) fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    const ready = () => page.waitForFunction(() => document.querySelector('#model-view')?.dataset.ready === 'true', { timeout: 45000 });
    const openMore=async()=>{if(await page.locator('#model-more').getAttribute('open')===null)await page.locator('#model-more > summary').click();};
    const diag = () => page.evaluate(() => window.enclosureDiagnostics().materialLocator);
    const clickMaterial = async id => {
      if(bom.items.find(p=>p.id===id).availability!=='buy' && await page.locator('#owned-materials').getAttribute('open')===null)await page.locator('#owned-materials > summary').click();
      await page.locator(`#material-${id} .locate-material`).click();
    };
    await page.goto(base); await ready();
    assert.equal(await page.locator('#model-part option').count(), bom.items.length);
    const initial = await diag(), ids = bom.items.map(p => p.id).sort();
    assert.deepEqual(Object.keys(initial.locations).sort(), ids, 'Every BOM group needs rendered geometry');
    assert.equal(initial.selected, null);
    assert.equal(await page.evaluate(()=>enclosureDiagnostics().usbPreviewVisible),false,'External PC cable is absent from normal operation');
    const allMeshes = Object.values(initial.locations).flatMap(ps => ps.flatMap(p => p.meshes));
    assert.equal(new Set(allMeshes).size, allMeshes.length, 'Each physical mesh belongs to exactly one material');
    const counts = { connectors: 3, carriers: 3, 'blue-leads': 3, 'voltage-leads': 3, 'ring-lugs': 3, 'tie-mounts': 6, 'cable-ties': 6, 'logger-restraint': 4, fasteners: 17, 'usb-port': 1, 'usb-internal': 1, 'usb-sleeve': 1 };
    for (const [id,count] of Object.entries(counts)) assert.equal(initial.locations[id].length, count, id);
    // Rendered fasteners retain the actual machining datums; avoid importing the CAD runtime.
    for (const [i,point] of dimensions.installationHardware.cableMountsXZ.entries()) {
      const p = initial.locations.fasteners.find(p => p.key === `anchor-${i}`);
      assert.ok(close((p.min[0]+p.max[0])/2,point[0]) && close((p.min[2]+p.max[2])/2,point[1]));
    }
    await page.locator('#tab-wiring').click();
    for (const p of bom.items) {
      const link = page.locator(`#material-${p.id} .locate-material`);
      assert.equal(new URL(await link.getAttribute('href'),base).searchParams.get('material'), p.id);
      await clickMaterial(p.id);
      const d = await diag();
      assert.equal(await page.locator('#layout').isVisible(),true);
      assert.equal(d.selected,p.id); assert.equal(d.occurrence,'all');
      assert.equal(new URL(page.url()).searchParams.get('material'),p.id);
      assert.equal(new URL(page.url()).hash,'#layout');
      assert.equal(d.highlightMeshCount,d.locations[p.id].reduce((n,p)=>n+p.meshes.length,0));
      assert.ok(d.visibleHighlightCount > 0 && d.visibleMarkers > 0,p.id+' must be visibly highlighted');
      assert.ok(d.overlaysAligned,p.id+' overlay must follow the actual meshes');
      assert.equal(await page.locator('#material-installation-note').textContent(),p.location_summary);
      assert.equal(await page.locator('#part-installation').textContent(),p.installation);
      assert.equal(await page.locator('#part-installation').isVisible(),false,'Full installation notes stay in Details');
      assert.equal(await page.locator('#material-location-panel').isVisible(),d.locations[p.id].length>1,'Only repeated parts need a location picker');
      assert.equal(await page.locator('#part-alert').isVisible(),!!p.notice);
      if(p.notice)assert.equal(await page.locator('#part-alert').textContent(),p.notice);
      assert.ok(await page.locator('#model-view').evaluate(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight && r.bottom>0;}),'BOM click must reveal 3D');
      assert.equal(await page.locator('#model-view canvas').evaluate(el=>el===document.activeElement),true);
    }
    await page.locator('.part-details > summary').click();
    assert.equal(await page.locator('#part-installation').isVisible(),true);
    await page.locator('#model-part').selectOption('meter');
    assert.equal(await page.locator('#part-installation').isVisible(),false,'Changing materials collapses old details');
    let inspectedOccurrences = 0;
    for (const id of ['carriers','ring-lugs','tie-mounts','fasteners']) {
      await page.locator('#model-part').selectOption(id);
      for (const p of initial.locations[id]) {
        await page.locator('#material-location').selectOption(p.key);
        const d = await diag(); inspectedOccurrences++;
        assert.equal(d.occurrence,p.key); assert.equal(d.highlightMeshCount,p.meshes.length);
        assert.ok(d.visibleMarkers>0 && d.visibleHighlightCount>0);
        d.target.forEach((n,i)=>assert.ok(close(n,(p.min[i]+p.max[i])/2),`${id}/${p.key} camera must frame this occurrence`));
      }
    }
    for (const [id,shot] of [['carriers','carriers'],['adapter','internal-adapter'],['ring-lugs','ring-terminals']]) {
      await page.locator('#model-part').selectOption(id);
      if(id==='carriers')await page.locator('#material-location').selectOption(initial.locations[id][0].key);
      const d=await diag(); if(id==='carriers')assert.ok(d.ghostCount>0,id+' surrounding housing must become transparent');
      if(out)await page.locator('#design').screenshot({path:path.join(out,`locator-${shot}.png`)});
    }
    await page.locator('#model-part').selectOption('breaker');
    await page.locator('#model-part').selectOption('ct');
    await page.goBack(); assert.equal((await diag()).selected,'breaker');
    await page.goForward(); assert.equal((await diag()).selected,'ct');
    // Direct wiring bookmarks and tab history retain the selected material and camera.
    await page.goto(new URL('?material=ct#wiring',base).href);await ready();
    assert.equal(await page.locator('#wiring').isVisible(),true);
    assert.equal((await diag()).selected,'ct');
    await page.locator('#tab-layout').click();
    assert.equal(await page.locator('#model-view canvas').isVisible(),true);
    await page.locator('[data-view="top"]').click();
    const tabView=await page.evaluate(()=>({camera:enclosureDiagnostics().camera,zoom:enclosureDiagnostics().zoom}));
    assert.ok(tabView.camera.every(Number.isFinite)&&Number.isFinite(tabView.zoom));
    await page.locator('#tab-wiring').click();await page.goBack();
    assert.equal(await page.locator('#layout').isVisible(),true);
    assert.deepEqual(await page.evaluate(()=>({camera:enclosureDiagnostics().camera,zoom:enclosureDiagnostics().zoom})),tabView);
    await page.goForward();assert.equal(await page.locator('#wiring').isVisible(),true);
    await page.locator('#tab-layout').click();
    await page.locator('#model-part').selectOption('enclosure');
    await openMore();await page.locator('#model-shell').selectOption('lifted');
    assert.ok((await diag()).overlaysAligned,'Lid highlight must move with the lid');
    await page.locator('#model-part').selectOption('usb');
    assert.equal(await page.evaluate(()=>enclosureDiagnostics().mode),'closed');
    assert.equal(await page.evaluate(()=>enclosureDiagnostics().usbPreviewVisible),true);
    await openMore();await page.locator('#model-shell').selectOption('closed');
    assert.equal(await page.evaluate(()=>enclosureDiagnostics().usbPreviewVisible),true,'Offline USB export works with the lid closed');
    if(out)await page.locator('#design').screenshot({path:path.join(out,'usb-closed-lid.png')});
    await page.locator('#model-shell').selectOption('cutaway');
    assert.equal(await page.evaluate(()=>enclosureDiagnostics().usbPreviewVisible),true);
    await openMore();await page.locator('#model-wires').uncheck();
    assert.ok((await diag()).visibleHighlightCount < (await diag()).highlightMeshCount,'Hidden cable routes must hide their overlay');
    await page.locator('#model-label-toggle').uncheck();assert.equal((await diag()).visibleMarkers,0);
    await page.locator('#model-label-toggle').check();
    await page.locator('#model-part').selectOption('breaker');
    assert.equal(await page.locator('#model-more').getAttribute('open'),null,'Selecting a material closes controls that would cover its inspector');
    await page.locator('#material-show-all').click();
    assert.equal((await diag()).selected,null);assert.equal((await diag()).ghostCount,0);assert.equal((await diag()).highlightMeshCount,0);
    assert.equal(new URL(page.url()).searchParams.has('material'),false);
    // Starting from a partially assembled view must still locate all hardware.
    await page.goto(new URL('#assembly-preview',base).href);await ready();await page.locator('#assembly-stage').selectOption('2');
    await clickMaterial('ring-lugs');assert.equal(await page.evaluate(()=>enclosureDiagnostics().assemblyStage),0);
    await page.locator('#model-part').selectOption('meter');
    if(await page.locator('#owned-materials').getAttribute('open')!==null)await page.locator('#owned-materials > summary').click();
    await page.locator('#material-return').click();
    assert.equal(await page.locator('#material-meter').isVisible(),true,'Return link opens a collapsed owned group');
    await page.goto(new URL('#material-ct',base).href);await ready();
    assert.equal(await page.locator('#material-ct').isVisible(),true,'Owned material bookmarks open their group');
    await page.locator('#owned-materials > summary').click();
    await page.locator('#confirm a[href="#material-ct"]').click();
    assert.equal(await page.locator('#material-ct').isVisible(),true,'Review links reopen the group even at the same anchor');
    await page.locator('#material-breaker .locate-material').focus();await page.keyboard.press('Enter');assert.equal((await diag()).selected,'breaker');
    // The standalone BOM navigates to the correct material on a fresh page load.
    await page.goto(new URL('materials.html',base).href);
    assert.equal(await page.locator('.locate-material').count(),bom.items.length);
    await page.locator('.locate-material[data-material="ring-lugs"]').click();await ready();
    assert.equal((await diag()).selected,'ring-lugs');
    await page.reload();await ready();assert.equal((await diag()).selected,'ring-lugs');
    for(const width of [768,390]) {
      await page.setViewportSize({width,height:844});await clickMaterial('breaker');
      assert.equal((await diag()).selected,'breaker');assert.ok((await diag()).visibleMarkers>0);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(out)await page.locator('#design').screenshot({path:path.join(out,`locator-${width}.png`)});
    }
    assert.equal(await page.locator('body').evaluate(el=>/[\u3400-\u9fff]/.test(el.innerText)),false,'Website remains English');
    // Unknown material links remain a usable assembly view rather than crashing.
    await page.goto(new URL('?material=unknown#layout',base).href);await ready();assert.equal((await diag()).selected,null);
    assert.deepEqual(errors,[]);
    const report={materials:bom.items.length,allLinksTested:true,uniqueInstalledMeshes:allMeshes.length,installedCounts:counts,individualLocationsTested:inspectedOccurrences,deepLinks:true,history:true,keyboard:true,singleLocationPickerHidden:true,criticalNoticesVisible:true,viewportWidths:[1440,768,390],jsErrors:errors,physicalInstallationValidated:false};
    if(out)fs.writeFileSync(path.join(out,'material-locator-validation.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
