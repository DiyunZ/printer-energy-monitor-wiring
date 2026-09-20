// Browser checks use the actual wire curves and the rendered support profiles.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),d=JSON.parse(fs.readFileSync(path.join(root,'layout_dimensions.json')));
const base=process.env.CHECK_URL||'http://127.0.0.1:8770/',out=process.env.QA_OUTPUT;
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
(async()=>{
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  await page.goto(base);await page.waitForFunction(()=>window.cableGeometryDiagnostics);
  const g=await page.evaluate(()=>cableGeometryDiagnostics());
  assert.equal(g.supports.length,6);
  for(const s of g.supports){assert.equal(s.pass,true,s.id);assert.ok(s.crossings>=2,s.id);}
  assert.deepEqual(g.bodyIntrusions,[],'Routes avoid component bodies away from their electrical terminations');
  const coils=g.routes.filter(r=>/^voltage:A/.test(r.id));
  const separation=[];
  for(let i=0;i<coils.length;i++)for(let j=i+1;j<coils.length;j++){
   const a=coils[i],b=coils[j];let squared=Infinity;
   for(const p of a.samples)for(const q of b.samples){const ds=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(ds<squared)squared=ds;}
   const maxStep=r=>Math.max(...r.samples.slice(1).map((p,i)=>distance(p,r.samples[i])));
   const conservativeGap=Math.sqrt(squared)-a.radius-b.radius-(maxStep(a)+maxStep(b))/2;
   assert.ok(conservativeGap>0,`${a.id}/${b.id} sampled coil surfaces must stay separate`);
   separation.push({pair:[a.id,b.id],sampledSurfaceGapMm:Math.sqrt(squared)-a.radius-b.radius,conservativePolylineGapMm:conservativeGap});
  }
  const ct=d.parts.find(p=>p.id==='ct'),[cx,cy,cz]=ct.position;
  const crossing=g.routes.filter(r=>r.samples.some(p=>Math.abs(p[0]-cx)<ct.size[0]/2&&Math.hypot(p[1]-cy,p[2]-cz)<5.1+r.radius));
  assert.deepEqual(crossing.map(r=>r.id),['cord:printer-hot-ct'],'Exactly one hot conductor crosses the CT aperture');
  assert.ok(Math.abs(cy-ct.size[1]/2-d.parts.find(p=>p.id==='panel').size[1])<.001,'CT rests on the panel');
  for(const [name,id,axis,value,radius] of [['Supply','cord:supply',0,-187,4.6],['Output','cord:printer',2,-213,4.6]]){
   const jacket=g.routes.find(r=>r.id===id&&r.radius===radius&&r.samples.some(p=>Math.abs(p[axis]-value)<1));
   assert.ok(jacket,`${name} gland must enclose the outer jacket`);
   const bare=g.routes.filter(r=>r.id?.startsWith(id+'-')&&r.radius<radius&&r.samples.some(p=>Math.abs(p[axis]-value)<1));
   assert.deepEqual(bare,[],`${name} must not expose individual conductors through the gland`);
  }
  const diag=await page.evaluate(()=>enclosureDiagnostics());
  for(let i=0;i<6;i++){
   const f=diag.materialLocator.locations.fasteners.find(p=>p.key===`anchor-${i}`);
   assert.ok(f.min[1]>-13 && f.min[1]<-12,'16 mm anchor screws stay above the case floor');
  }
  if(out){fs.mkdirSync(out,{recursive:true});
   for(let i=0;i<6;i++){
    await page.locator('#model-part').selectOption('cable-ties');await page.locator('#material-location').selectOption(String(i));
    await page.locator('#model-more > summary').click();await page.locator('#model-shell').selectOption('cutaway');await page.locator('#model-label-toggle').uncheck();await page.locator('#model-more > summary').click();
    await page.locator('#design').screenshot({path:path.join(out,`support-${i+1}.png`)});
   }
  }
  const report={scope:'Digital routing checks; not physical retention, bend-radius or electrical acceptance.',supports:g.supports,
   coilSeparation:separation,componentBodyIntrusions:g.bodyIntrusions,ctAperture:'One straight printer-hot conductor',
   entries:'Outer jackets extend through both power glands; bare conductor breakouts stay inside',
   limitations:'Sampled curves with assumed wire diameters. Named WAGO/fuse terminations exclude a 20 mm endpoint region because port cavities are simplified. Does not certify every wire-to-wire clearance, cable stiffness, torque, pull retention or manufactured fit.'};
  if(process.env.EXPORT_AUDIT==='1'){
   assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname));
   fs.writeFileSync(path.join(root,'installation_supports.json'),JSON.stringify(report,null,2)+'\n');
  }
  console.log(JSON.stringify({supports:6,coilPairs:separation.length,bodyIntrusions:0,ctConductors:1,physicalBuildValidated:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
