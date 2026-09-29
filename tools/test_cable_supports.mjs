import test from 'node:test';
import assert from 'node:assert/strict';
import { fitSupport, auditSupport, screenCableBodies } from '../cable-supports.js';

const support={id:'test',label:'Test',holeXZ:[0,8],axis:'z',routes:['a','b'],captureHalfWidthMm:12};
const routes=[-3,3].map((x,i)=>({id:['a','b'][i],radius:1.7,samples:[[x,12,-20],[x,12,20]]}));
test('both wires fit inside the flat band at both faces and the center',()=>{
  const fit=fitSupport(routes,support),check=auditSupport(fit,support.routes);
  assert.equal(check.pass,true);assert.equal(check.crossings,2);
  assert.ok(check.minimumOpeningClearanceMm>.8);
  assert.ok(check.lengthWithLockAllowanceMm<188);
});
test('a misplaced/empty tie or a missing wire fails instead of silently rendering',()=>{
  assert.throws(()=>fitSupport(routes,{...support,holeXZ:[50,8]}),/Empty cable support/);
  const fit=fitSupport(routes,support);
  assert.equal(auditSupport(fit,support.routes,{...fit.profile,right:0}).pass,false);
  assert.equal(auditSupport(fitSupport(routes.slice(0,1),support),support.routes).pass,false);
});
test('bands that exceed the purchased tie length fail',()=>{
  const fit=fitSupport(routes,support);
  assert.equal(auditSupport(fit,support.routes,{...fit.profile,top:120}).pass,false);
});
test('body screen catches a through-body route but permits the CT aperture',()=>{
  const bodies={ct:{min:[-15,-20,-13],max:[15,20,13]}},ct={position:[0,0,0]};
  const clear=[{id:'hot',radius:1.7,samples:[[-10,0,0],[10,0,0]]}];
  assert.deepEqual(screenCableBodies(clear,bodies,ct),[]);
  assert.equal(screenCableBodies([{...clear[0],samples:[[-10,10,0],[10,10,0]]}],bodies,ct).length,1);
});
test('Q0 entry contact permits only the correct named terminal endpoint',()=>{
  const bodies={q0:{min:[-9,0,-27],max:[9,103,27]}};
  const route={id:'cord:supply-hot',radius:1.7,samples:[[0,120,20],[0,104,20],[0,103,20]]};
  assert.deepEqual(screenCableBodies([route],bodies),[]);
  assert.equal(screenCableBodies([{...route,id:'unrelated'}],bodies).length,1);
  assert.equal(screenCableBodies([{...route,samples:[[0,30,20],...route.samples]}],bodies).length,1);
  assert.equal(screenCableBodies([{...route,samples:[[0,110,20],[0,98,20],[0,103,20]]}],bodies).length,1);
  const output={id:'internal-wire:q0-jl',radius:1.7,samples:[[0,0,20],[0,-1,20],[0,-20,20]]};
  assert.deepEqual(screenCableBodies([output],bodies),[]);
});
test('mount PE termination contact does not excuse a through-block route',()=>{
  const bodies={PE:{min:[-10,0,-10],max:[10,10,10]}};
  const route={id:'internal-wire:mount-pe',radius:1.7,samples:[[0,10,0],[0,11,0],[0,40,0]]};
  assert.deepEqual(screenCableBodies([route],bodies),[]);
  assert.equal(screenCableBodies([{...route,samples:[[0,40,0],[0,5,0],[0,-40,0]]}],bodies).length,1);
});
test('recessed Q0 channels reject wrong terminals, side exits and oversized wires',()=>{
  const bodies={q0:{min:[-9,0,-27],max:[9,116,27]}};
  const channel=[{route:'cord:supply-hot',entry:[0,100,20],outer:[0,118,20],radiusMm:3.5}];
  const route={id:'cord:supply-hot',radius:1.7,samples:[[0,125,20],[0,114,20],[0,100,20]]};
  assert.deepEqual(screenCableBodies([route],bodies,null,channel),[]);
  for(const bad of [{...route,id:'internal-wire:q0-jl'},{...route,radius:4},{...route,samples:[[6,114,20],[0,100,20]]},{...route,samples:[[0,90,20],[0,100,20]]}])
    assert.equal(screenCableBodies([bad],bodies,null,channel).length,1);
});
