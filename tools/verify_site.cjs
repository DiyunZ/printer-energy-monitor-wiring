// Browser regression checks. Run a local HTTP server before invoking this file.
// CHECK_URL=http://127.0.0.1:8770/ node tools/verify_site.cjs
// QA_OUTPUT and EXPORT_DRAWINGS=1 optionally save review artifacts outside the repo.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=process.env.CHECK_URL||'http://127.0.0.1:8770/';
const out=process.env.QA_OUTPUT;
const root=path.resolve(__dirname,'..');
const close=(a,b,t=.05)=>Math.abs(a-b)<t;
(async()=>{
 if(out)fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[],failedRequests=[];page.on('pageerror',e=>errors.push(String(e)));
 page.on('requestfailed',r=>failedRequests.push(r.url()));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('#model-view').dataset.ready==='true',{timeout:45000});
 assert.match(await page.title(),/3D enclosure/);
 const diag=()=>page.evaluate(()=>window.enclosureDiagnostics());
 const initial=await diag();assert.equal(initial.units,'mm');assert.ok(initial.triangles>100000);
 assert.deepEqual(initial.meterSize,[63,47,216]);
 [63,47,216].forEach((n,i)=>assert.ok(close(initial.fitBodies.meter.size[i],n),'Rendered meter body dimension '+i));
 // Actual geometry, not just labels, must preserve the long meter silhouette.
 assert.ok(initial.fitBodies.meter.size[2]/initial.fitBodies.meter.size[0]>3.4);
 const bodies=Object.entries(initial.fitBodies);
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const [a,A]=bodies[i],[b,B]=bodies[j];
  const overlaps=A.min.every((v,k)=>Math.min(A.max[k],B.max[k])-Math.max(v,B.min[k])>.1);
  assert.ok(!overlaps,`Modeled primary body overlap: ${a} / ${b}`);
 }
 assert.equal(initial.mode,'xray');assert.ok(initial.shellOpacity<.2);
 if(out)await page.locator('#layout').screenshot({path:path.join(out,'layout-desktop.png')});
 for(const name of ['top','front','right','iso']){
  await page.locator(`[data-view="${name}"]`).click();
  assert.equal(await page.locator(`[data-view="${name}"]`).getAttribute('aria-pressed'),'true');
 }
 for(const mode of ['closed','lifted','cutaway','xray']){
  await page.locator('#model-shell').selectOption(mode);const d=await diag();
  assert.equal(d.mode,mode);assert.equal(d.shellVisible,mode!=='cutaway');
  assert.equal(d.lidOffset,mode==='lifted'?230:0);assert.equal(d.shellOpacity,mode==='closed'?1:.12);
 }
 const canvas=page.locator('#model-view canvas');await canvas.scrollIntoViewIfNeeded();
 let box=await canvas.boundingBox();let before=await diag();
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.45);await page.mouse.down();
 await page.mouse.move(box.x+box.width*.67,box.y+box.height*.55,{steps:12});await page.mouse.up();
 assert.notDeepEqual((await diag()).camera,before.camera,'Mouse drag must orbit the actual camera');
 before=await diag();await page.mouse.wheel(0,-180);
 await page.waitForFunction(z=>window.enclosureDiagnostics().zoom>z,before.zoom);
 await canvas.focus();before=await diag();await page.keyboard.press('ArrowLeft');
 assert.notDeepEqual((await diag()).camera,before.camera,'Keyboard must orbit');
 await page.keyboard.press('Home');assert.ok(close((await diag()).camera[0],initial.camera[0]));
 await page.locator('#model-zoom-in').click();assert.ok(close((await diag()).zoom,1.2));
 await page.locator('#model-zoom-out').click();assert.ok(close((await diag()).zoom,1));
 await page.locator('#model-part').selectOption('ct');assert.match(await page.locator('#part-evidence').textContent(),/unidentified/);
 await page.locator('[data-view="top"]').click();await page.locator('#model-shell').selectOption('cutaway');
 await page.locator('#model-wires').uncheck();await page.locator('#model-label-toggle').uncheck();
 assert.equal((await diag()).wiresVisible,false);
 const position=(await diag()).projectedMeter;box=await canvas.boundingBox();
 await page.mouse.click(box.x+(position[0]+1)/2*box.width,box.y+(1-position[1])/2*box.height);
 assert.equal((await diag()).selected,'meter','Clicking the visible meter should select it');
 await page.locator('#model-wires').check();await page.locator('#model-label-toggle').check();
 if(out)await page.locator('#model-view').screenshot({path:path.join(out,'layout-top.png')});
 await page.locator('#model-reset').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#model-save').click()]);
 assert.equal(download.suggestedFilename(),'elitepro-enclosure-3d.png');
 const downloaded=await download.path();assert.ok(fs.statSync(downloaded).size>50000);
 if(out)await download.saveAs(path.join(out,'exported-model.png'));
 // Existing circuit controls remain functional.
 const ids=await page.locator('#main-stage .wire').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.id))]);assert.equal(ids.length,24);
 const expected={all:null,main:['01','02','03'],voltage:['01','02','04','05','06','08','09'],neutral:['06','07','08','09','18','21'],earth:['10','11','12','13','19','24'],aux:['01','02','06','10','17','18','19','20','21','22','23'],signal:['14','15','16']};
 for(const [mode,want] of Object.entries(expected)){
  await page.locator(`[data-mode="${mode}"]`).click();
  const actual=await page.locator('#main-stage .wire:not(.muted)').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.id))].sort());
  assert.deepEqual(actual,want||ids.slice().sort());
 }
 await page.locator('#connections summary').click();
 for(const id of ids){await page.locator(`.trace[data-id="${id}"]`).click();assert.match(await page.locator('#status').textContent(),new RegExp('Connection '+id+' ·'));}
 await page.locator('#wire-24').focus();await page.keyboard.press('Enter');assert.match(await page.locator('#status').textContent(),/Connection 24/);
 await page.locator('[data-mode="all"]').click();await page.locator('#zoom-in').click();assert.equal(await page.locator('#zoom-level').textContent(),'125%');await page.locator('#zoom-reset').click();
 await page.locator('#connections summary').click();
 for(const [width,height] of [[1440,1100],[768,1024],[390,844]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow at '+width);
  await page.locator('#zoom-fit').click();assert.ok(await page.locator('#main-stage').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'Circuit fit overflow at '+width);
  await page.locator('#zoom-reset').click();
  if(out){await page.locator('#layout').screenshot({path:path.join(out,`layout-${width}.png`)});}
 }
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#')));
 for(const href of [...new Set(links)]){const res=await page.request.get(new URL(href,base).href);assert.equal(res.status(),200,href);}
 for(const file of ['materials.html','references.html']){
  await page.goto(new URL(file,base).href);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' mobile overflow');
  if(file==='materials.html')assert.equal(await page.locator('tbody tr').count(),16);
  else assert.equal(await page.locator('#r1').count(),1);
 }
 await page.goto(new URL('wiring_routes.html',base).href);await page.waitForURL(url=>url.href===base||url.href===base+'index.html');
 assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
 if(process.env.EXPORT_DRAWINGS==='1'){
  const render=await browser.newPage({viewport:{width:1800,height:1300},deviceScaleFactor:2});
  for(const name of ['wiring_routes','connector_detail']){await render.goto(new URL(name+'.svg',base).href);await render.locator('svg').screenshot({path:path.join(root,name+'.png')});}
 }
 const report={date:new Date().toISOString(),base,connections:24,circuitGroups:7,renderedMeterBody:initial.fitBodies.meter.size,primaryBodyOverlaps:false,mouseOrbit:true,wheelZoom:true,keyboardOrbit:true,picking:true,shellModes:4,pngExport:true,viewportWidths:[1440,768,390],pageOverflow:false,internalLinks:true,materialsRows:16,jsErrors:errors,physicalBuildValidated:false};
 if(out)fs.writeFileSync(path.join(out,'browser-validation.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
