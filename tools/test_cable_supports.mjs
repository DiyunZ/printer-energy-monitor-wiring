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
