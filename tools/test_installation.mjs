import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit, bounds, sweptBox, flangeGap } from './audit_installation.mjs';
import * as T from '../vendor/three.module.js';
const read = name => JSON.parse(fs.readFileSync(new URL('../' + name, import.meta.url)));
const d = read('layout_dimensions.json'), p = read('procurement.json'), m = read('assets/enclosure.json');
const b = fs.readFileSync(new URL('../assets/enclosure.bin', import.meta.url));
const buffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const run = (dimensions = d, procurement = p) => audit(dimensions, m, buffer, procurement);
const result = run();
test('current nominal checks pass while unresolved release gates stay visible', () => {
  assert.equal(result.checks.filter(c => c.result === 'fail').length, 0);
  assert.ok(result.checks.some(c => c.id === 'Machined wall geometry' && c.result === 'pass'));
  assert.match(result.release, /NOT RELEASED/);
  assert.equal(result.insertion_sweeps.length, 10);
  assert.ok(result.insertion_sweeps.every(s => s.shell_triangle_hits === 0));
});
test('old split-entry locations fail real flange clearance even when small model bodies fit', () => {
  const dc = d.instances.find(p => p.id === 'dc-entry');
  const usb = structuredClone(d.instances.find(p => p.id === 'usb-entry'));
  assert.ok(flangeGap(dc, usb) > 25);
  usb.position[2] = 139;
  assert.ok(flangeGap(dc, usb) < 1);
});
test('old breaker body depth and #8 ring option are rejected', () => {
  const old = structuredClone(d), wrong = structuredClone(p);
  old.parts.find(p => p.id === 'q0').size[2] = 49.28;
  wrong.items.find(p => p.id === 'ring-lugs').model = '3M MV14-8R/LX-BOTTLE';
  const checks = run(old, wrong).checks;
  assert.equal(checks.find(c => c.id === 'Q0 catalog body').result, 'fail');
  assert.equal(checks.find(c => c.id === 'Q0 ring size').result, 'fail');
});
test('a final-position fit does not imply an unobstructed insertion path', () => {
  const panel = d.parts.find(p => p.id === 'panel'), outlet = d.parts.find(p => p.id === 'outlet');
  assert.equal(bounds(panel).intersectsBox(bounds(outlet)), false);
  assert.equal(sweptBox(panel).intersectsBox(bounds(outlet)), true);
});
test('every inventory group is covered once with an explicit result and remaining checks', () => {
  const review = read('installation_review.json');
  assert.equal(review.materials.length, p.items.length);
  assert.deepEqual(review.materials.map(r => r.id).sort(), p.items.map(r => r.id).sort());
  for (const r of review.materials) {
    assert.ok(r.checked && r.remaining && r.result);
    for (const s of r.sources) assert.match(review.sources[s], /^https:\/\//);
  }
});
test('historical PE routes cut through the meter instead of passing around it', () => {
  const meter = bounds(d.parts.find(p => p.id === 'meter')).expandByScalar(1.7);
  const oldRoutes = [
    [[-71,13,60],[-40,12,29],[-13,12,67],[136,16,67],[142,67,36],[167,117,29]],
    [[-67,13,60],[-35,13,36],[140,20,44],[131,86,25]]
  ];
  for(const route of oldRoutes) {
    const c = new T.CatmullRomCurve3(route.map(p => new T.Vector3(...p)), false, 'centripetal');
    assert.ok(c.getSpacedPoints(300).some(p => meter.containsPoint(p)));
  }
});
