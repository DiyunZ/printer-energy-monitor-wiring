import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import requestTools from './purchase_request.cjs';
const root = new URL('../', import.meta.url);
const bom = JSON.parse(fs.readFileSync(new URL('procurement.json', root)));
const data = requestTools.requestData(bom);

test('school request includes every purchase once and excludes owned/fabricated groups', () => {
  assert.equal(data.rows.length, 33);
  assert.deepEqual(data.sellers.map(s => [s.name, s.rows.length, s.total]), [['DigiKey',17,175.37],['Home Depot',16,97.63]]);
  assert.equal(data.total, 273);
  assert.equal(data.rows.filter(r => r.model === '515CV').length, 1);
  assert.equal(data.rows.find(r => r.model === '515CV').quantity, 2);
  for (const r of data.rows) for (const id of r.materialIds)
    assert.equal(bom.items.find(p => p.id === id).availability, 'buy');
});

test('school units count sale packs and rolls; cut wire meets retailer minimum', () => {
  const rings = data.rows.find(r => r.model === '15-104');
  assert.equal(rings.units, 'each'); assert.equal(rings.quantity, 1); assert.match(rings.sellingUnit, /15 pieces/);
  const roll = data.rows.find(r => r.model === '90340');
  assert.equal(roll.units, 'each'); assert.equal(roll.quantity, 1); assert.match(roll.sellingUnit, /whole roll/);
  assert.deepEqual(data.rows.filter(r => r.units === 'feet').map(r => r.quantity), [13,6,6]);
  assert.equal(data.rows.filter(r => r.fulfillment.includes('pickup')).length, 3);
  const invalid = structuredClone(bom);
  invalid.purchasing.rows.find(r => r.minimum_order_quantity === 6).quantity = 4;
  assert.throws(() => requestTools.requestData(invalid), /Below retailer minimum/);
});

test('retailer identifiers, punctuation and fractional cent prices survive projection', () => {
  assert.equal(data.rows.find(r => r.model === '2907571').catalog, '277-11849-ND');
  assert.equal(data.rows.find(r => r.model === '515CV').catalog, '301304939');
  assert.equal(data.rows.find(r => r.model === 'NBF-32226').description, 'BOX ABS/PC 15.74"L X 11.81"W');
  assert.equal(data.rows.find(r => r.model === 'F2213/4 BK105').description, 'HEATSHRINK 3/4" X 4\' BLACK');
  assert.equal(data.rows.find(r => r.model === 'PLT2S-C').priceText, '0.316');
  assert.equal(data.rows.find(r => r.model === '4692').priceText, '0.084');
  for (const r of data.rows) {
    const source = bom.purchasing.rows.find(s => s.url === r.url);
    assert.equal(r.description, source.request.description);
    assert.equal(r.descriptionField, r.seller === 'DigiKey' ? 'Description' : 'Product title');
  }
});

test('unresolved classification stays pending and physical new-build form values remain explicit', () => {
  for (const r of data.rows) {
    assert.equal(r.consumable, 'Professor to confirm'); assert.equal(r.consumablePending, true);
    assert.equal(r.repair, 'No'); assert.equal(r.noDeliveryExpected, false);
  }
});

test('every request line has a local product photograph and retailer provenance', () => {
  for (const r of data.rows) {
    const image = fs.readFileSync(new URL(r.image.src, root));
    assert.ok(image[0] === 0xff || image.subarray(1,4).toString() === 'PNG', r.image.src);
    assert.match(r.image.source_image, /^https:\/\//);
    assert.ok(r.verifiedOn && r.sourceUrl && r.catalogLabel);
  }
});

test('missing exact description and unsupported units cannot silently enter the request', () => {
  const badDescription = structuredClone(bom); delete badDescription.purchasing.rows[0].request.description;
  assert.throws(() => requestTools.requestData(badDescription), /Missing purchase request evidence/);
  const badUnit = structuredClone(bom); badUnit.purchasing.rows[0].unit = 'box';
  assert.throws(() => requestTools.requestData(badUnit), /Unmapped form unit/);
});

test('copy handler sends only the exact field value and offers selection if clipboard is denied', async () => {
  const script = fs.readFileSync(new URL('purchase-request.js', root), 'utf8');
  for (const denyClipboard of [false, true]) {
    const written = [], selected = [], buttons = [], nodes = {'copy-status':{textContent:''}};
    const samples = ['BOX ABS/PC 15.74"L X 11.81"W', '0.084', 'feet', 'https://www.homedepot.com/p/204632031'];
    samples.forEach((value, i) => {
      nodes[`field-${i}`] = {id:`field-${i}`, textContent:value, focus(){}};
      nodes[`field-${i}-label`] = {textContent:'Field label'};
      buttons.push({dataset:{copy:`field-${i}`}, hidden:true, addEventListener(event, fn){this.click=fn;}});
    });
    const section = {id:'digikey'};
    vm.runInNewContext(script, {
      document:{
        querySelectorAll:s => s === '.vendor-section' ? [section] : s === '[data-vendor]' ? [] : buttons,
        getElementById:id => nodes[id],
        createRange:() => ({selectNodeContents(field){selected.push(field.textContent);}})
      },
      location:{hash:''}, window:{addEventListener(){}, getSelection:() => ({removeAllRanges(){}, addRange(){}})},
      navigator:{clipboard:{async writeText(value){if(denyClipboard)throw new Error('Denied'); written.push(value);}}},
      clearTimeout(){}, setTimeout(){}
    });
    for (const button of buttons) {assert.equal(button.hidden, false); await button.click();}
    assert.deepEqual(denyClipboard ? selected : written, samples);
    assert.match(nodes['copy-status'].textContent, denyClipboard ? /Text selected/ : /copied/);
  }
});
