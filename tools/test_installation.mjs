import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit, bounds, sweptBox } from './audit_installation.mjs';
import * as T from '../vendor/three.module.js';
const read = name => JSON.parse(fs.readFileSync(new URL('../' + name, import.meta.url)));
const d = read('layout_dimensions.json'), p = read('procurement.json'), m = read('assets/enclosure.json');
const b = fs.readFileSync(new URL('../assets/enclosure.bin', import.meta.url));
const buffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const run = (dimensions = d, procurement = p) => audit(dimensions, m, buffer, procurement);
const result = run();
test('priced order covers every purchased group and counts each retail increment', () => {
  const order=p.purchasing, rows=order.rows;
  assert.equal(order.cost_basis,'materials_only');
  assert.equal(order.material_subtotal_usd,273.00);
  assert.deepEqual([...new Set(rows.flatMap(r=>r.material_ids))].sort(),p.items.filter(r=>r.availability==='buy').map(r=>r.id).sort());
  assert.equal(new Set(rows.map(r=>r.seller)).size,2);
  for(const r of rows){
    assert.ok(r.quantity>0 && Number.isInteger(r.quantity));
    assert.ok(r.unit_price_usd>0 && r.pieces_per_unit>=1);
    assert.equal(Math.round(r.quantity*r.unit_price_usd*100),Math.round(r.extended_usd*100));
    assert.match(r.url,/^https:\/\//);
  }
  assert.equal(rows.reduce((n,r)=>n+Math.round(r.extended_usd*100),0),Math.round(order.material_subtotal_usd*100));
  assert.equal(order.delivery_estimate,undefined,'Only material prices belong in the selection total');
  const cv=rows.filter(r=>r.sku==='515CV');
  assert.equal(cv.length,1);assert.equal(cv[0].quantity,2);
  assert.deepEqual(cv[0].material_ids,['receptacle','printer-connector']);
  assert.deepEqual(cv[0].quantity_by_material,{'receptacle':1,'printer-connector':1});
  const rings=rows.find(r=>r.material_ids.includes('ring-lugs'));
  assert.equal(rings.quantity,1);assert.equal(rings.pieces_per_unit,15);
  assert.ok(rings.extended_usd<10,'avoid reintroducing the expensive 100-piece bottle');
  const wires=rows.filter(r=>r.material_ids.includes('internal-wire'));
  assert.equal(wires.length,2);
  for(const r of wires){assert.equal(r.unit,'ft');assert.ok(r.quantity*.3048>=1 && r.quantity*.3048<=2);}
  assert.equal(rows.find(r=>r.material_ids.includes('cable-ties')).quantity,10);
});
test('current nominal checks pass while unresolved release gates stay visible', () => {
  assert.equal(result.checks.filter(c => c.result === 'fail').length, 0);
  assert.ok(result.checks.some(c => c.id === 'Machined wall geometry' && c.result === 'pass'));
  assert.match(result.release, /NOT RELEASED/);
  assert.equal(result.insertion_sweeps.length, 8);
  assert.ok(result.insertion_sweeps.every(s => s.result === 'pass'));
});
test('one owned USB cable exits directly through one protected hole', () => {
  assert.equal(d.instances.some(p => p.id === 'usb-entry'), true);
  assert.equal(p.items.find(p => p.id === 'usb').availability, 'owned');
  assert.equal(p.items.some(p => p.id === 'split-entries'), false);
  const openings = read('fabrication/wall-openings.json');
  assert.equal(openings.filter(p=>p.id.startsWith('USB')).length,1);
  for(const id of ['Closed-lid USB cable exit','One existing USB cable','Offline USB insulation provision'])
    assert.equal(result.checks.find(c=>c.id===id).result,'pass');
  const wrong=structuredClone(d);wrong.instances=wrong.instances.filter(p=>p.id!=='usb-entry');
  assert.equal(run(wrong).checks.find(c=>c.id==='Closed-lid USB cable exit').result,'fail');
  const narrow=structuredClone(d);narrow.usbService.bushingPassageMm=15;
  assert.equal(run(narrow).checks.find(c=>c.id==='Closed-lid USB cable exit').result,'fail');
  for(const mutation of [x=>x.usbService.intermediateConnections=1,x=>x.usbService.externalConnector='USB-B']){
    const bad=structuredClone(d);mutation(bad);
    assert.equal(run(bad).checks.find(c=>c.id==='One existing USB cable').result,'fail');
  }
  for(const id of ['usb-port','usb-internal']){
    const bad=structuredClone(p);bad.items.push({id});
    assert.equal(run(d,bad).checks.find(c=>c.id==='One existing USB cable').result,'fail');
  }
  const live=structuredClone(d);live.usbService.requireMainsUnplugged=false;
  assert.equal(run(live).checks.find(c=>c.id==='Offline USB insulation provision').result,'fail');
  const missingSleeve=structuredClone(p);missingSleeve.items=missingSleeve.items.filter(p=>p.id!=='usb-sleeve');
  assert.equal(run(d,missingSleeve).checks.find(c=>c.id==='Offline USB insulation provision').result,'fail');
});
test('internal DC revision rejects reintroduced feedthroughs or extension purchases', () => {
  assert.equal(result.checks.find(c=>c.id==='Internal original DC connection').result,'pass');
  for(const id of ['dc-entry','dc-coupling']){
    const wrong=structuredClone(d);wrong.instances.push({id});
    assert.equal(run(wrong).checks.find(c=>c.id==='Internal original DC connection').result,'fail');
  }
  const wrong=structuredClone(p);wrong.items.push({id:'dc-extension'});
  assert.equal(run(d,wrong).checks.find(c=>c.id==='Internal original DC connection').result,'fail');
});
test('internal power cannot drift outside the enclosure, and reuse is not owned inventory',()=>{
  const wrong=structuredClone(d);wrong.parts.find(p=>p.id==='adapter').position[0]=220;
  assert.equal(run(wrong).checks.find(c=>c.id==='Internal XA and adapter').result,'fail');
  const stock=structuredClone(p);stock.items.find(p=>p.id==='panel').availability='owned';
  assert.equal(run(d,stock).checks.find(c=>c.id==='Proposed aluminum reuse').result,'fail');
  for(const id of ['No XA wall opening','No DC wall opening'])assert.equal(result.checks.find(c=>c.id===id).result,'pass');
});
test('old breaker body depth and #8 ring option are rejected', () => {
  const old = structuredClone(d), wrong = structuredClone(p);
  old.parts.find(p => p.id === 'q0').size[2] = 49.28;
  wrong.items.find(p => p.id === 'ring-lugs').model = '3M MV14-8R/LX-BOTTLE';
  const checks = run(old, wrong).checks;
  assert.equal(checks.find(c => c.id === 'Q0 catalog body').result, 'fail');
  assert.equal(checks.find(c => c.id === 'Bond ring size').result, 'fail');
});
test('the selected #8–10 ring accepts #10 without inventing a barrel rating', () => {
  assert.equal(result.checks.find(c => c.id === 'Bond ring size').result, 'pass');
  const wrong = structuredClone(p);
  wrong.items.find(p => p.id === 'ring-lugs').terminal_compatibility.stud_numbers = [8];
  assert.equal(run(d, wrong).checks.find(c => c.id === 'Bond ring size').result, 'fail');
  assert.equal(result.checks.find(c => c.id === 'Ring barrel and internal wire').result, 'review');
});
test('internal power is above the plate and requires a documented assembly sequence', () => {
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

test('a changed panel cannot inherit the generated insertion proof',()=>{
  for(const mutate of [p=>p.position[0]+=5,p=>p.size[1]+=1]){
    const wrong=structuredClone(d);mutate(wrong.parts.find(p=>p.id==='panel'));
    assert.equal(run(wrong).insertion_sweeps.find(p=>p.id==='panel').result,'review');
  }
});
test('extra wall penetrations are rejected by the machining schedule check',()=>{
  const wrong=structuredClone(m);wrong.wall_opening_ids.push('XA');
  assert.equal(audit(d,wrong,buffer,p).checks.find(c=>c.id==='No XA wall opening').result,'fail');
});

test('purchased groups use real photos, including rail and posts',()=>{
  for(const item of p.items.filter(item=>item.availability==='buy')){
    for(const photo of [item.image,...(item.additional_images||[])]){
      assert.ok(['product','reference'].includes(photo.kind));
      assert.match(photo.src,/\.(jpg|png)$/i);
      assert.ok(fs.existsSync(new URL('../'+photo.src,import.meta.url)));
      assert.ok(photo.source_url);
    }
  }
});
test('no-bend stacks catch wrong depth, short screws and bottoming',()=>{
  const check=x=>run(x).checks.find(c=>c.id==='Q0 no-bend post and screw stacks').result;
  assert.equal(check(d),'pass');
  for(const [key,value] of [['postLengthMm',60],['wallScrewLengthMm',8],['wallScrewLengthMm',20],['wallHoleDiameterMm',3.3]]){
    const changed=structuredClone(d);changed.q0Mount[key]=value;assert.equal(check(changed),'fail',key);
  }
});

test('printer PE curve stays inside the machined shell instead of bowing through it',()=>{
  const line=fs.readFileSync(new URL('../layout3d.js',import.meta.url),'utf8').split('\n').find(l=>l.includes("locatedCable('cord','printer-pe',"));
  const current=JSON.parse(line.match(/\[\[.*\]\]/)[0]);
  const old=[[-113,13,7],[-133,25,-10],[-133,25,-174],[-24,21,-181],[2,35,-176]];
  const shell=m.meshes.find(entry=>entry.role==='shell');
  const positions=new Float32Array(buffer,shell.positionOffset,shell.positionCount);
  const indices=new Uint32Array(buffer,shell.indexOffset,shell.indexCount);
  const triangles=Array.from({length:indices.length/3},(_,i)=>{
    const vertices=[0,1,2].map(j=>new T.Vector3(...positions.slice(indices[i*3+j]*3,indices[i*3+j]*3+3)));
    return {face:new T.Triangle(...vertices),box:new T.Box3().setFromPoints(vertices)};
  });
  const clearance=points=>{
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
    const closest=new T.Vector3();let minimum=Infinity;
    for(const point of curve.getSpacedPoints(1200))for(const {face,box} of triangles){
      if(box.distanceToPoint(point)>=minimum)continue;
      minimum=Math.min(minimum,point.distanceTo(face.closestPointToPoint(point,closest)));
    }
    return minimum;
  };
  assert.ok(clearance(old)<1.7,'Reproduce the old insulation/shell intersection');
  assert.ok(clearance(current)>2,'1.7 mm insulation radius plus 0.3 mm mesh margin');
});
