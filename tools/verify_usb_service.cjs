// User workflow: locate both mains connectors and preview PC export with a closed lid.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.CHECK_URL||'http://127.0.0.1:8783/',out=process.env.QA_OUTPUT;
(async()=>{
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base);await page.waitForFunction(()=>window.enclosureDiagnostics);
  assert.match(await page.locator('.data-step').innerText(),/unplug SUPPLY IN from the wall/);
  assert.match(await page.locator('.data-step').innerText(),/Disconnect from the PC before reconnecting mains/);
  for(const id of ['supply-plug','printer-connector','usb']){
   await page.locator(`.connection-guide [data-material="${id}"]`).click();
   assert.equal(await page.locator('#model-part').inputValue(),id);
   assert.equal(new URL(page.url()).searchParams.get('material'),id);
  }
  let d=await page.evaluate(()=>enclosureDiagnostics());
  assert.equal(d.mode,'closed');assert.equal(d.lidOffset,0);assert.equal(d.lidVisible,true);
  assert.equal(d.usbServiceMode,'offline-closed-lid');assert.equal(d.usbCableVisible,true);
  assert.equal(d.materialLocator.highlightRespectsOcclusion,true,'Opaque closed wall conceals the internal cable highlight');
  assert.ok(d.camera[0]>500,'PC preview must face the outside of the right wall');
  if(out){fs.mkdirSync(out,{recursive:true});await page.locator('#model-view').screenshot({path:path.join(out,'usb-closed-service.png')});}
  assert.equal(d.usbIntermediateConnections,0);
  assert.ok(d.modeledUsbLengthMm>150&&d.modeledUsbLengthMm<1800);
  await page.locator('#model-part').selectOption('usb-bushing');
  d=await page.evaluate(()=>enclosureDiagnostics());
  assert.equal(d.mode,'closed');assert.equal(d.usbCableVisible,true);
  assert.ok(d.materialLocator.visibleHighlightCount>0);
  if(out)await page.locator('#model-view').screenshot({path:path.join(out,'usb-cable-exit.png')});
  await page.locator('#model-part').selectOption('usb-sleeve');
  d=await page.evaluate(()=>enclosureDiagnostics());
  assert.equal(d.materialLocator.highlightRespectsOcclusion,false,'X-ray view reveals the internal insulation');
  if(out)await page.locator('#model-view').screenshot({path:path.join(out,'usb-internal-sleeve.png')});
  await page.setViewportSize({width:390,height:844});
  await page.locator('.connection-guide [data-material="usb"]').click();
  d=await page.evaluate(()=>enclosureDiagnostics());
  assert.equal(d.mode,'closed');assert.equal(d.usbCableVisible,true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(out)await page.locator('#design').screenshot({path:path.join(out,'usb-mobile.png')});
  assert.deepEqual(errors,[]);
  const report={base,mainConnectionLinks:3,closedLidExportPreview:true,singleOwnedCable:true,intermediateUsbConnections:0,outsideCamera:true,internalSleeveSelectable:true,viewportWidths:[1440,390],errors,physicalExportTested:false};
  if(out)fs.writeFileSync(path.join(out,'usb-validation.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
