// User workflow: tick a material as delivered, reload, and find the tick kept in this browser.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.CHECK_URL||'http://127.0.0.1:8770/';
const bom=JSON.parse(fs.readFileSync(path.join(__dirname,'..','procurement.json')));
(async()=>{
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base);
  const total=bom.items.length,summary=page.locator('#delivery-summary');
  await summary.waitFor();
  assert.deepEqual((await page.locator('[data-delivered]').evaluateAll(es=>es.map(e=>e.dataset.delivered))).sort(),bom.items.map(p=>p.id).sort());
  assert.equal(await page.locator('.delivered-toggle[hidden]').count(),0);
  assert.match(await summary.innerText(),new RegExp(`^0 of ${total} delivered`));
  const [first,second]=bom.items.filter(p=>p.availability==='buy').map(p=>p.id);
  const box=page.locator(`[data-delivered="${first}"]`),badge=page.locator(`#material-${first} .inventory-badge`);
  const original=await badge.textContent();
  await box.check();
  assert.equal(await badge.textContent(),'✓ Delivered');
  assert.match(await summary.innerText(),new RegExp(`^1 of ${total} delivered`));
  await page.reload();await summary.waitFor();
  assert.ok(await box.isChecked(),'Tick lost on reload');
  assert.equal(await badge.textContent(),'✓ Delivered');
  assert.match(await page.locator(`#material-${first}`).getAttribute('class'),/is-delivered/);
  assert.equal(await page.locator(`#material-${second} .inventory-badge`).textContent(),original);
  for(const [width,height] of [[1440,1100],[768,1024],[390,844]]){
   await page.setViewportSize({width,height});
   assert.ok(await page.locator('.materials').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+2)),'Materials overflow at '+width);
  }
  await box.uncheck();
  assert.equal(await badge.textContent(),original);
  assert.match(await summary.innerText(),new RegExp(`^0 of ${total} delivered`));
  await page.reload();await summary.waitFor();
  assert.equal(await box.isChecked(),false);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({base,materials:total,tickKeptAcrossReload:true,clearedTickRestoresStatus:true,viewportWidths:[1440,768,390],errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
