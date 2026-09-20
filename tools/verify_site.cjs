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
const bom=JSON.parse(fs.readFileSync(path.join(root,'procurement.json')));
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
 // Keep the main page focused while preserving access to supporting information.
 assert.deepEqual(await page.locator('main > section').evaluateAll(es=>es.map(e=>e.id)),['design','confirm','hardware']);
 assert.deepEqual(await page.locator('header nav a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),['#design','#hardware','#confirm','documents.html']);
 assert.equal(await page.locator('details[open]').count(),0,'Supporting details should be collapsed initially');
 assert.equal(await page.locator('#layout').isVisible(),true);
 assert.equal(await page.locator('#wiring').isVisible(),false);
 assert.equal(await page.locator('.materials tbody tr:visible').count(),23);
 assert.equal(await page.locator('#owned-materials').getAttribute('open'),null);
 assert.equal(await page.locator('#confirm .review-items li').count(),3);
 assert.equal(await page.locator('#assembly-preview').isVisible(),false);
 await page.locator('#tab-layout').focus();await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('#wiring').isVisible(),true);
 assert.equal(await page.locator('#layout').isVisible(),false);
 assert.equal(await page.locator('#tab-wiring').getAttribute('aria-selected'),'true');
 assert.equal(await page.locator('#connectors .detail-stage').isVisible(),false);
 await page.locator('#connectors > summary').click();
 assert.equal(await page.locator('#connectors .detail-stage').isVisible(),true);
 await page.locator('#connectors > summary').click();
 await page.locator('#tab-layout').click();
 await page.locator('.part-details > summary').click();
 assert.equal(await page.locator('#part-note').isVisible(),true);
 await page.locator('.part-details > summary').click();
 const openMore=async()=>{if(await page.locator('#model-more').getAttribute('open')===null)await page.locator('#model-more > summary').click();};
 assert.equal(await page.locator('#part-size').isVisible(),false);
 assert.equal(await page.locator('#model-save').isVisible(),false);
 await page.locator('#model-more > summary').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#model-save').isVisible(),true);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#model-save').isVisible(),false);
 assert.equal(await page.locator('#model-more > summary').evaluate(e=>e===document.activeElement),true);
 const openOwned=async()=>{if(await page.locator('#owned-materials').getAttribute('open')===null)await page.locator('#owned-materials > summary').click();};
 const diag=()=>page.evaluate(()=>window.enclosureDiagnostics());
 const initial=await diag();assert.equal(initial.units,'mm');assert.ok(initial.triangles>100000);
 assert.ok(close(initial.fitBodies.q0.size[2],47),'Q0 actual rendered body depth');
 assert.ok(close(initial.breakerTerminals[1][1]-initial.breakerTerminals[0][1],49.28),'Actual terminal pitch');
 assert.ok(close(initial.breakerMounts[1][1]-initial.breakerMounts[0][1],52.37),'Actual mounting pitch');
 assert.deepEqual(initial.meterRouteIntrusions,[],'Illustrated cable routes must not cut through the meter body');
 const lengths=initial.voltageLeadLengths;
 assert.equal(lengths.length,3);
 for(let i=0;i<lengths.length;i++){
  assert.ok(close(lengths[i].modeledFlexibleLengthMm,2000,.1),'Full 2 m flexible-length scenario');
  assert.ok(lengths[i].pitchMm>lengths[i].assumedDiameterMm,'Coil turns need space at assumed diameter');
  if(i)assert.ok(lengths[i].coilMin[0]<lengths[i-1].coilMin[0]-3.9 && lengths[i].coilMax[0]>lengths[i-1].coilMax[0]+3.9,'Concentric coils preserve radial spacing');
 }
 if(process.env.EXPORT_AUDIT==='1'){
  assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Export audit from local model only');
  fs.writeFileSync(path.join(root,'installation_cables.json'),JSON.stringify({scope:'Illustrative 2 m flexible length per lead at assumed 3 mm OD; actual hardware not measured',leads:lengths,meterRouteScreen:{minimumSamplesPerCurve:601,intrusions:initial.meterRouteIntrusions,limit:'Sampled route centerlines tested against the meter body enlarged by each assumed wire radius. Does not establish clearances to other objects or between wires.'}},null,2)+'\n');
 }
 // Compare actual SVG geometry to actual WebGL meshes, not two copies of labels.
 const plan=await page.locator('#main-stage svg').evaluate(svg=>({
  scale:Number(svg.dataset.layoutScale),origin:[Number(svg.dataset.layoutOriginX),Number(svg.dataset.layoutOriginY)],
  bodies:[...svg.querySelectorAll('.component-footprint')].map(e=>({id:e.dataset.layoutId,x:e.x.baseVal.value,y:e.y.baseVal.value,w:e.width.baseVal.value,h:e.height.baseVal.value}))
 }));
 assert.equal(plan.bodies.length,23,'Every placed body, including the external DC coupling, must appear in the wiring plan');
 assert.deepEqual(plan.bodies.map(p=>p.id).sort(),Object.keys(initial.planBodies).sort());
 for(const p of plan.bodies){
  const actual=initial.planBodies[p.id],bounds=[actual.min[0],actual.min[2],actual.size[0],actual.size[2]];
  const drawn=[(p.x-plan.origin[0])/plan.scale,(p.y-plan.origin[1])/plan.scale,p.w/plan.scale,p.h/plan.scale];
  drawn.forEach((n,i)=>assert.ok(close(n,bounds[i]),`${p.id} plan/3D ${['X','Z','width','depth'][i]} mismatch: ${n} vs ${bounds[i]} mm`));
 }
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
 if(out)await page.locator('#design').screenshot({path:path.join(out,'layout-desktop.png')});
 await page.locator('#tab-wiring').click();await page.locator('#compare-layout').click();
 assert.equal(await page.locator('[data-view="top"]').getAttribute('aria-pressed'),'true');
 assert.ok(close((await diag()).camera[0],20));assert.ok(close((await diag()).camera[2],0));
 assert.ok(await page.locator('#design').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<20),'Compare button should show the 3D top view');
 if(out){
  await page.locator('#model-view').screenshot({path:path.join(out,'aligned-3d-top.png')});
  const drawing=await browser.newPage({viewport:{width:2000,height:1790}});
  await drawing.goto(new URL('wiring_routes.svg',base).href);
  await drawing.locator('svg').screenshot({path:path.join(out,'aligned-wiring-plan.png')});await drawing.close();
 }
 for(const name of ['top','front','right','iso']){
  if(['front','right'].includes(name))await openMore();
  await page.locator(`[data-view="${name}"]`).click();
  assert.equal(await page.locator(`[data-view="${name}"]`).getAttribute('aria-pressed'),'true');
 }
 await openMore();
 await page.locator('#model-dimensions').check();
 assert.ok(await page.locator('.model-tag.dimension:visible').count()>0);
 await page.locator('#model-dimensions').uncheck();
 assert.equal(await page.locator('.model-tag.dimension:visible').count(),0);
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
 before=await diag();
 await page.locator('#tab-wiring').click();await page.locator('[data-mode="earth"]').click();
 await page.locator('#tab-layout').click();
 assert.deepEqual((await diag()).camera,before.camera,'Tab changes preserve camera orientation');
 assert.equal((await diag()).zoom,before.zoom,'Tab changes preserve zoom');
 await page.locator('#tab-wiring').click();
 assert.equal(await page.locator('[data-mode="earth"]').getAttribute('aria-pressed'),'true','Tab changes preserve circuit selection');
 await page.locator('#tab-layout').click();
 await page.locator('#model-part').selectOption('ct');assert.match(await page.locator('#part-evidence').textContent(),/Mini HSC family matched.*probable/);
 await page.locator('[data-view="top"]').click();await openMore();await page.locator('#model-shell').selectOption('cutaway');
 await page.locator('#model-wires').uncheck();await page.locator('#model-label-toggle').uncheck();
 assert.equal((await diag()).wiresVisible,false);
 const position=(await diag()).projectedMeter;box=await canvas.boundingBox();
 await page.mouse.click(box.x+(position[0]+1)/2*box.width,box.y+(1-position[1])/2*box.height);
 assert.equal((await diag()).selected,'meter','Clicking the visible meter should select it');
 await openMore();await page.locator('#model-wires').check();await page.locator('#model-label-toggle').check();
 if(out)await page.locator('#model-view').screenshot({path:path.join(out,'layout-top.png')});
 await page.locator('#model-reset').click();
 await page.goto(new URL('#assembly-preview',base).href);
 assert.equal(await page.locator('#assembly-preview').getAttribute('open'),'');
 for(let step=1;step<=6;step++){
  await page.locator('#assembly-stage').selectOption(String(step));const a=await diag();
  assert.equal(a.assemblyStage,step);assert.equal(a.wiresVisible,step>=5);
  assert.equal(a.visibleGroups.includes('outlet'),step>=4);
  assert.equal(a.lidVisible,step===6);
  if(step===2){
   await page.locator('#assembly-progress').fill('0');assert.equal((await diag()).panelInsertionOffset,300);
   await page.locator('#assembly-progress').fill('50');assert.equal((await diag()).panelInsertionOffset,150);
   if(out)await page.locator('#design').screenshot({path:path.join(out,'panel-insertion.png')});
   await page.locator('#assembly-progress').fill('100');assert.equal((await diag()).panelInsertionOffset,0);
  }
 }
 await page.locator('#model-reset').click();assert.equal((await diag()).assemblyStage,0);
 await page.locator('#assembly-preview > summary').click();
 await openMore();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#model-save').click()]);
 assert.equal(download.suggestedFilename(),'elitepro-enclosure-3d.png');
 const downloaded=await download.path();assert.ok(fs.statSync(downloaded).size>50000);
 if(out)await download.saveAs(path.join(out,'exported-model.png'));
 await page.locator('#model-more > summary').click();
 // Existing circuit controls remain functional.
 await page.locator('#tab-wiring').click();
 const ids=await page.locator('#main-stage .wire').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.id))]);assert.equal(ids.length,25);
 const expected={all:null,main:['01','02','03'],voltage:['01','02','04','05','06','08','09','24'],neutral:['06','07','08','09','18','21'],earth:['10','11','12','13','19','25'],aux:['01','02','06','10','17','18','19','20','21','22','23','25'],signal:['14','15','16']};
 for(const [mode,want] of Object.entries(expected)){
  await page.locator(`[data-mode="${mode}"]`).click();
  const actual=await page.locator('#main-stage .wire:not(.muted)').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.id))].sort());
  assert.deepEqual(actual,want||ids.slice().sort());
 }
 await page.locator('#connections summary').click();
 for(const id of ids){await page.locator(`.trace[data-id="${id}"]`).click();assert.match(await page.locator('#status').textContent(),new RegExp('Connection '+id+' ·'));}
 await page.locator('#wire-25').focus();await page.keyboard.press('Enter');assert.match(await page.locator('#status').textContent(),/Connection 25/);
 await page.locator('[data-mode="all"]').click();
 const wiringScale=Number(await page.locator('#main-stage').getAttribute('data-scale'));
 await page.locator('#zoom-in').click();assert.ok(close(Number(await page.locator('#main-stage').getAttribute('data-scale')),Math.min(2.5,wiringScale*1.25),.001));await page.locator('#zoom-reset').click();
 await page.locator('#connections summary').click();
 // Ownership follows the user's confirmation, not whether an item appears in the model.
 const ownedIds=['meter','ct','blue-leads','voltage-leads','adapter'];
 assert.deepEqual(bom.items.filter(p=>p.availability==='owned').map(p=>p.id),ownedIds);
 assert.equal(bom.items.find(p=>p.id==='usb').availability,'kit');
 assert.equal(await page.locator('.materials tbody tr').count(),bom.items.length);
 await openOwned();
 for(const p of bom.items){
  const row=page.locator('#material-'+p.id);
  assert.equal(await row.getAttribute('data-availability'),p.availability);
  assert.match(await row.locator('.inventory-badge').textContent(),p.availability==='owned'?/✓.*Owned/:p.availability==='kit'?/✓.*Kit included/:/□.*To buy/);
  assert.equal(await row.locator('.material-note').textContent(),p.status,'Full receiving and fit checks must be retained');
  assert.equal(await row.locator('.material-note').isVisible(),false);
  assert.equal(await row.locator('td[data-label="Quantity needed"]').textContent(),p.quantity_summary||p.quantity);
  if(p.quantity_summary)assert.ok((await row.locator('.material-quantity').textContent()).includes(p.quantity));
  if(p.notice){
   assert.equal(await row.locator('.material-notice').textContent(),p.notice);
   assert.equal(await row.locator('.material-notice').isVisible(),true,'Decision-critical notices stay visible');
  }
  assert.equal(await row.locator('.material-details .material-reason').textContent(),p.reason,'Full specifications must be retained');
  assert.equal(await row.locator('.material-details .material-reason').isVisible(),false);
  if(p.availability==='buy'){
   assert.ok(p.links.some(l=>['buy','configure','quote'].includes(l.kind)),p.id+' must have a purchase or quote route, not just a PDF');
   assert.ok(await row.locator('a[data-link-kind="buy"],a[data-link-kind="configure"],a[data-link-kind="quote"]').count()>0,p.id+' missing rendered purchase route');
   assert.equal(await row.locator('.material-links a').first().isVisible(),true,p.id+' purchase route must not be collapsed');
  }
  for(const l of p.links)assert.equal(await row.locator('a[data-link-kind]').evaluateAll((es,label)=>es.find(e=>e.textContent.trim()===label+' ↗')?.getAttribute('href'),l.label),l.url);
  const photo=row.locator('td[data-label="Material"] .material-photo');
  assert.equal(await photo.count(),1,p.id+' needs an image below its name');
  assert.equal(await photo.locator('img').getAttribute('src'),p.image.src);
  assert.equal(await photo.locator('img').getAttribute('alt'),p.image.alt);
  const caption={reference:'Reference image',design:'Design concept'}[p.image.kind];
  if(caption)assert.equal(await photo.locator('figcaption').textContent(),caption);
  else assert.equal(await photo.locator('figcaption').count(),0,'Routine photo captions are omitted');
  assert.equal(await row.locator('.material-image-note').textContent(),p.image.caption);
  if(p.image.source_url)assert.equal(await row.locator('.material-details a').filter({hasText:'Image: '}).getAttribute('href'),p.image.source_url);
  assert.ok(await row.evaluate(e=>e.querySelector('.material-photo').getBoundingClientRect().top>=e.querySelector('.material-name').getBoundingClientRect().bottom),p.id+' photo must be below the material name');
 }
 await page.locator('#material-breaker .material-details summary').click();
 assert.equal(await page.locator('#material-breaker .material-details .material-reason').isVisible(),true);
 await page.locator('#material-breaker .material-details summary').click();
 await page.locator('.material-photo img').evaluateAll(es=>Promise.all(es.map(async img=>{img.loading='eager';await img.decode();if(!img.naturalWidth||!img.naturalHeight)throw Error('Image did not load: '+img.src);})));
 await page.locator('#owned-materials > summary').click();
 assert.deepEqual(await page.locator('.materials tbody tr:visible').evaluateAll(rows=>rows.map(r=>r.id)),bom.items.filter(p=>p.availability==='buy').map(p=>'material-'+p.id));
 await openOwned();
 assert.equal(await page.locator('#owned-materials tbody tr:visible').count(),ownedIds.length+1);
 await page.locator('#owned-materials > summary').click();
 if(out){await page.locator('#hardware').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'inventory-desktop.png')});}
 for(const [width,height] of [[1440,1100],[768,1024],[390,844]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow at '+width);
  await page.locator('#tab-wiring').click();await page.locator('#zoom-fit').click();assert.ok(await page.locator('#main-stage').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'Circuit fit overflow at '+width);
  await page.locator('#zoom-reset').click();
  await page.locator('#tab-layout').click();
  if(out){await page.locator('#design').screenshot({path:path.join(out,`layout-${width}.png`)});}
  assert.ok(await page.locator('.materials').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+2)),'Materials overflow at '+width);
  if(width===390){
   await openOwned();assert.equal(await page.locator('#owned-materials tbody tr:visible').count(),ownedIds.length+1);
   if(out)await page.locator('#material-meter').screenshot({path:path.join(out,'inventory-mobile.png')});
   await page.locator('#material-meter .material-details summary').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('#material-meter .material-details .material-reason').isVisible(),true,'Material specifications must open by keyboard on mobile');
   await page.keyboard.press('Enter');
   await page.locator('#owned-materials > summary').click();
  }
 }
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#')));
 for(const href of [...new Set(links)]){const res=await page.request.get(new URL(href,base).href);assert.equal(res.status(),200,href);}
 for(const file of ['materials.html','references.html','installation.html','build.html','documents.html','protection.html']){
  await page.goto(new URL(file,base).href);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' mobile overflow');
  if(file==='materials.html'){
   assert.equal(await page.locator('tbody tr').count(),bom.items.length);
   assert.equal(await page.locator('tbody tr').filter({hasText:'✓ Owned'}).count(),ownedIds.length);
   assert.equal(await page.locator('tbody tr').filter({hasText:'□ To buy'}).count(),bom.items.length-ownedIds.length-1);
   assert.equal(await page.locator('.material-photo img').count(),bom.items.length);
   assert.ok(await page.locator('.material-image').evaluateAll(es=>es.every(e=>e.clientWidth>=150)),'Document image columns must remain readable');
   await page.locator('.material-photo img').evaluateAll(es=>Promise.all(es.map(async img=>{img.loading='eager';await img.decode();})));
  }
  else if(file==='references.html')assert.equal(await page.locator('#r1').count(),1);
  else if(file==='installation.html') {
   assert.match(await page.locator('body').innerText(),/RECEIVING AND ELECTRICAL RELEASE ITEMS OPEN/);
   assert.equal(await page.locator('a[href^="index.html#material-"]').count(),bom.items.length);
   assert.equal(await page.locator('#simulation').count(),1);
  } else if(file==='build.html') {
   assert.equal(await page.locator('#fasteners').count(),1);
   const localLinks=await page.locator('a[href^=\"fabrication/\"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
   assert.ok(localLinks.length>=10);
   for(const href of localLinks)assert.equal((await page.request.get(new URL(href,base).href)).status(),200,href);
  } else if(file==='protection.html') {
   const text=await page.locator('body').innerText();
   assert.match(text,/Q0 and Fv are not fully released/);
   assert.match(text,/Room 0100/);
   assert.match(text,/draft, not sent/);
  } else {
   assert.equal(await page.locator('#operation').count(),1);
   assert.equal(await page.locator('#dimensions').count(),1);
   assert.match(await page.locator('body').innerText(),/Q0 OFF is not isolation/);
   for(const href of ['build.html','installation.html','materials.html','references.html','index.html#assembly-preview'])assert.ok(await page.locator(`a[href="${href}"]`).count()>0);
   const local=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#')));
   for(const href of [...new Set(local)])assert.equal((await page.request.get(new URL(href,base).href)).status(),200,href);
   await page.locator('a[href="index.html#assembly-preview"]').click();
   await page.waitForFunction(()=>document.querySelector('#model-view').dataset.ready==='true');
   assert.equal(await page.locator('#assembly-preview').isVisible(),true,'Document hub opens interactive assembly');
   assert.equal(await page.locator('#assembly-preview').getAttribute('open'),'');
  }
 }
 await page.goto(new URL('#operation',base).href);
 await page.waitForURL(new URL('documents.html#operation',base).href);
 assert.equal(await page.locator('#operation').isVisible(),true,'Existing operation bookmarks reach the document hub');
 await page.goto(new URL('wiring_routes.html',base).href);await page.waitForURL(url=>url.href===base||url.href===base+'index.html');
 assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
 if(process.env.EXPORT_DRAWINGS==='1'){
  const render=await browser.newPage({viewport:{width:1800,height:1300},deviceScaleFactor:2});
  for(const name of ['wiring_routes','connector_detail']){await render.goto(new URL(name+'.svg',base).href);await render.locator('svg').screenshot({path:path.join(root,name+'.png')});}
 }
 const report={date:new Date().toISOString(),base,connections:25,circuitGroups:7,alignedComponentFootprints:plan.bodies.length,planTo3DMaximumToleranceMm:.05,compareTopView:true,renderedMeterBody:initial.fitBodies.meter.size,primaryBodyOverlaps:false,mouseOrbit:true,wheelZoom:true,keyboardOrbit:true,picking:true,shellModes:4,pngExport:true,viewportWidths:[1440,768,390],pageOverflow:false,internalLinks:true,materialsRows:bom.items.length,materialImagesLoaded:bom.items.length,ownedGroups:ownedIds.length,kitGroups:1,purchaseGroups:bom.items.length-ownedIds.length-1,ownedGroupCollapsedByDefault:true,designTabs:true,buildDocumentHub:true,assemblyStages:6,panelInsertionSlider:true,progressiveDisclosure:true,criticalNoticesVisible:true,advancedControlsKeyboard:true,coilScenarioLengthMm:2000,jsErrors:errors,physicalBuildValidated:false};
 if(out)fs.writeFileSync(path.join(out,'browser-validation.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
