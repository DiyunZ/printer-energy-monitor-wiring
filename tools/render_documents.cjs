// Generate readable HTML documents and the BOM from the checked-in source data.
// Requires marked, only at generation time; the deployed site has no npm dependency.
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');
const root = path.resolve(__dirname, '..');
const bom = JSON.parse(fs.readFileSync(path.join(root, 'procurement.json')));
const owned = bom.items.filter(p => p.availability === 'owned');
const kit = bom.items.filter(p => p.availability === 'kit');
const toBuy = bom.items.filter(p => p.availability === 'buy');
const toFabricate = bom.items.filter(p => p.availability === 'fabricate');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function materialPhoto(p) {
 const photo=p.image;
 let style='', ratio;
 if(photo.crop){
  const [x,y,w,h]=photo.crop;
  ratio=photo.width*w/(photo.height*h);
  style=` style="width:${100/w}%;left:${-100*x/w}%;top:${-100*y/h}%"`;
 }
 // Width attributes also keep the downloaded Markdown readable without our CSS.
 let img=`<img src="${escape(photo.src)}" alt="${escape(photo.alt)}" width="180" height="${Math.round(180*photo.height/photo.width)}" loading="lazy" decoding="async"${style}>`;
 if(photo.crop)img=`<span class="material-crop" style="max-width:${176*ratio}px;aspect-ratio:${ratio}">${img}</span>`;
 const credit=photo.source_url?`<a href="${escape(photo.source_url)}">Image: ${escape(photo.source_label)} ↗</a>`:'';
 return `<figure class="material-photo" data-image-kind="${photo.kind}"><a class="material-image" href="${escape(photo.src)}" target="_blank" rel="noopener" aria-label="View full image: ${escape(p.item)}">${img}</a><figcaption>${escape(photo.caption)}${credit}</figcaption></figure>`;
}
function materialPrice(p) {
 if(p.availability !== 'buy')return '';
 const rows=bom.purchasing.rows.filter(r=>r.material_ids.includes(p.id));
 if(!rows.length)throw new Error('Missing purchase price: '+p.id);
 const directLinks=p.id==='fasteners';
 let subtotal=0;
 const lines=rows.map(r=>{
  const quantity=r.material_ids.length>1?r.quantity_by_material[p.id]:r.quantity;
  const cents=Math.round(quantity*r.unit_price_usd*100);subtotal+=cents;
  const price=r.unit_price_usd.toFixed(Number(r.unit_price_usd.toFixed(2))===r.unit_price_usd?2:3);
  let calculation=r.unit==='each'?`${quantity} × $${price} each`:`${quantity} ${r.unit} × $${price}/${r.unit}`;
  if(r.pieces_per_unit>1)calculation+=` · ${r.pieces_per_unit} pieces/${r.unit}`;
  let sku=rows.length>1?`<span class="price-sku">${escape(r.sku)}</span>`:'';
  if(directLinks){
   sku=`<a class="price-sku" data-link-kind="buy" href="${escape(r.url)}">${escape(r.sku)} ↗</a>`;
   calculation=r.seller+' · '+calculation;
  }
  return `<p>${sku}${escape(calculation)}${rows.length>1?` = $${(cents/100).toFixed(2)}`:''}</p>`;
 }).join('');
 const breakdown=rows.length>2&&!directLinks?`<details class="price-details"><summary>${rows.length} item prices</summary>${lines}</details>`:lines;
 return `<div class="material-price" data-material-id="${escape(p.id)}" data-subtotal-usd="${(subtotal/100).toFixed(2)}"><strong class="price-total">$${(subtotal/100).toFixed(2)}</strong> <span class="price-label">subtotal</span><div class="price-breakdown">${breakdown}</div></div>`;
}
let text = `# Materials checklist\n\n**□ ${toBuy.length} purchase groups · ◇ ${toFabricate.length} reuse / fabrication group · ✓ ${owned.length} confirmed owned groups${kit.length ? ` · ✓ ${kit.length} kit supplied` : ''}**\n\n${bom.scope}\n\n**Inventory basis:** ${bom.inventory_basis}\n\nA check means on hand, not electrically approved. Counts refer to material groups, not individual pieces. Needed quantities and vendor pack sizes differ. The user confirms the existing USB cable is owned. Reuse it intact; no additional data cable or USB coupler is ordered.\n\nBuy links go to specific products; Select / Configure links need a size or rating first; Quote links require a supplier quote. Reused stock and fabrication are listed separately from purchases. Check current stock, minimum orders and lead times with each supplier. No orders have been placed.\n`;
text += `\n${bom.image_note} Click an image to view the original. Use **View in 3D** to highlight each material’s installation locations. Image sources are credited below each picture.\n`;
const order=bom.purchasing;
const total=order.rows.reduce((sum,r)=>sum+Math.round(r.quantity*r.unit_price_usd*100),0)/100;
if(Math.abs(total-order.material_subtotal_usd)>.001)throw new Error('Purchasing total does not match order quantities');
for(const r of order.rows){
 if(r.material_ids.length>1 && (!r.quantity_by_material || Object.keys(r.quantity_by_material).length!==r.material_ids.length || r.material_ids.reduce((sum,id)=>sum+r.quantity_by_material[id],0)!==r.quantity))throw new Error('Shared purchase quantities do not match: '+r.sku);
}
text += `\n<h2 id="order-plan">Priced order plan · $${total.toFixed(2)} materials</h2>\n\nChecked ${order.checked_on}. ${order.scope}\n\n${order.supplier_policy}\n\n| Seller / exact item | Quantity to enter | Unit price (USD) | Line total (USD) | Availability / packaging |\n|---|---|---|---|---|\n`;
for(const r of order.rows)text+=`| ${r.seller} · [${r.sku}](${r.url}) | ${r.quantity} ${r.unit}${r.pieces_per_unit>1?` (${r.pieces_per_unit} pieces per ${r.unit})`:''} | $${r.unit_price_usd.toFixed(Number(r.unit_price_usd.toFixed(2))===r.unit_price_usd?2:3)} | $${r.extended_usd.toFixed(2)} | ${r.availability_note} |\n`;
text+='\n| Seller | Materials subtotal (USD) |\n|---|---|\n';
for(const seller of [...new Set(order.rows.map(r=>r.seller))])text+=`| ${seller} | $${(order.rows.filter(r=>r.seller===seller).reduce((sum,r)=>sum+Math.round(r.extended_usd*100),0)/100).toFixed(2)} |\n`;
text+=`| **All selected materials** | **$${total.toFixed(2)}** |\n\nThe two 515CV installation rows below share the **single two-piece order line above**. Do not order two for each location. Aluminum stock and electrical acceptance remain open; see the [receiving record](build.html#receiving-record).\n`;
for (const [id, title, items, sourceLabel] of [['purchase-list',`□ Purchase list · ${toBuy.length} groups`,toBuy,'Price & purchase (USD)'],['fabrication-list',`◇ Reuse / fabrication · ${toFabricate.length}`,toFabricate,'Fabrication / source'],['owned-list',`✓ Existing equipment · ${owned.length+kit.length}`,[...owned,...kit],'Source']]) {
 text += `\n<h2 id="${id}">${title}</h2>\n\n`;
 if(id==='purchase-list')text+=`Prices checked ${order.checked_on}; subtotals include purchase packs and spares. Shared 515CV stock is allocated as one connector per location. [Full order quantities and seller totals](#order-plan).\n\n`;
 if(id==='fabrication-list')text+='Mounting panel: use the professor’s offered aluminum after checking the stock. **Fabrication cost is pending and excluded from the purchase subtotal.**\n\n';
 text += `| Inventory | Item | Quantity needed | Part and purpose | ${sourceLabel} | Remaining checks |\n|---|---|---|---|---|---|\n`;
 for (const p of items) text += `| ${p.availability === 'owned' ? '✓ Owned' : p.availability === 'kit' ? '✓ Kit included' : p.availability === 'fabricate' ? '◇ Reuse / fabricate' : '□ To buy'} | <span class="material-name">${escape(p.item)}</span>${materialPhoto(p)}<a class="locate-material" data-material="${escape(p.id)}" href="index.html?material=${escape(p.id)}#layout" aria-label="View ${escape(p.item)} in 3D">View in 3D ↑</a> | ${p.quantity} | **${p.model}** — ${p.reason} | ${materialPrice(p)}${p.links.length ? p.links.map(l=>`[${l.label}](${l.url})`).join('<br>') : p.availability==='buy' ? '' : 'Reuse · No purchase needed'} | ${p.status}${p.compliance ? `<br>**${p.compliance.status}:** ${p.compliance.detail} [Evidence](${p.compliance.url})` : ''} |\n`;
}
text += '\n## Software and lab equipment\n\nArrange access separately from the enclosure purchases. These resources are not marked as owned.\n\n';
for (const r of bom.setup_requirements) text += `- **${r.item} — ${r.action}.** ${r.reason}${r.url ? ` [DENT download](${r.url})` : ''}\n`;
text += `\n\n## Build details\n\nThe [build package](build.html) contains the machining files, exact fastener sizes and links, wire allowances, assembly order and the outstanding release items. Internal XA uses Leviton 515CV, the same SKU as the printer output. The original adapter and cable remain inside; no XA or DC wall opening. Three WAGO groups provide JL, JN and PE; A1 connects directly to JL after Q0. Upstream-only voltage-lead protection remains subject to electrical acceptance. Six groups, including the existing USB cable, are confirmed owned.\n\nThe adapter photo confirms CUI SMI6-9-V-P5: 9 V DC, 0.667 A, center positive. The three multicolor pigtails are user-confirmed original DENT kit components, matched to the LD-SKTSP family; the CT matches Mini HSC. The original DC cable connects directly to the logger; no extension or DC entry is purchased. The existing USB cable passes directly through one protected right-wall hole for closed-lid offline export; its internal portion requires the selected 600 V sleeve. CT scale and voltage-lead protection/termination remain acceptance items. Purchase status must not be inferred from an ownership tick.\n\n[Installation audit](installation.html) · [Interactive layout and circuit](index.html) · [Dimension schedule](layout_dimensions.json) · [Primary references](references.html)\n`;
fs.writeFileSync(path.join(root, 'Procurement_BOM.md'), text);
// The audit and per-material review are separate from ownership and purchase links.
const review=JSON.parse(fs.readFileSync(path.join(root,'installation_review.json')));
const checks=JSON.parse(fs.readFileSync(path.join(root,'installation_checks.json')));
const cables=JSON.parse(fs.readFileSync(path.join(root,'installation_cables.json')));
const sources=ids=>ids.map(id=>`[${id}](${review.sources[id]})`).join(', ');
const groups=Object.fromEntries(['Catalog match','Conditional','Measure','Hold'].map(s=>[s,review.materials.filter(p=>p.result===s).length]));
let audit=`# Installation audit\n\n**${review.result}.**\n\nAll **${review.materials.length} material groups** were reviewed: ${Object.entries(groups).map(([k,n])=>`${n} ${k.toLowerCase()}`).join(' · ')}. A catalog match confirms the stated interface only; it is not approval of the complete item or assembly.\n\n${review.scope}\n\nThe box and major panel parts have nominal space, but the current design cannot be called a perfect or fully installable assembly. Machining geometry is supplied; Exact CT scaling, voltage-lead protection and physical/electrical acceptance remain open. XA and DC remain inside. One existing USB cable runs directly from DENT through a protected right-wall hole to the PC; its internal portion is sleeved. Export with mains unplugged and lid closed. Do not treat a purchase link or an inventory tick as a release.\n\n[Inspect the 3D installation stages](index.html#assembly-preview) · [Materials and buying links](materials.html) · [Machine-readable checks](installation_checks.json)\n\n## Corrections from the audit\n\n`;
audit+=review.corrections.map(t=>`- ${t}`).join('\n');
audit+='\n\n## Printer compatibility\n\n| Printer | Manufacturer information | Design assessment |\n|---|---|---|\n';
for(const p of review.printers)audit+=`| ${p.name} | ${p.published} ${sources(p.sources)} | ${p.assessment} |\n`;
audit+='\nThese watts-to-amps values assume unity power factor and are not current ratings. Q0 supplies the selected printer plus the logger adapter and voltage tap. A 15 A breaker / connector proposal is not approval for a 15 A continuous load. No simultaneous three-printer load or separately powered accessory is included.\n\n<h2 id="simulation">Installation simulation</h2>\n\n';
audit+=`${checks.method}\n\nThe analysis uses the checked-in component coordinates and actual shell triangles. It is not an FEA, tolerance study, collision-free cable-routing proof, thermal test, electrical clearance assessment or physical dry fit. The closed-lid check samples nine rays against the lid skin; it does not establish the smallest clearance to every lid fastener or operating part.\n\n`;
for(const s of review.assembly)audit+=`### ${s.stage}. ${s.title}\n\n${s.action}\n\n**Result:** ${s.result}\n\n`;
audit+='## Numerical checks\n\n| Check | Result | Evidence and limit |\n|---|---|---|\n';
for(const c of checks.checks)audit+=`| ${c.id} | **${c.result.toUpperCase()}** | ${c.evidence} ${c.limits} |\n`;
audit+='\nThe former XA/DC wall positions remain solid. Exact CAD booleans provide Q0, two power-gland bores and one Ø22.2 mm USB cable-exit bore. Axis-aligned wall-device illustrations still do not model wall draft and cannot prove the mounted interface.\n\n## Voltage-lead storage scenario\n\nThe old illustration had 4.5 turns rising only 6 mm, giving 1.33 mm pitch against its assumed 3 mm cable diameter. The new illustration separates turns and lead layers and adjusts turns for 2 m of flexible cable per lead. Connector body lengths are outside that flexible-length target. Actual leads have not been measured.\n\n| Lead | Modeled flexible length | Turns | Pitch / assumed OD |\n|---|---|---|\n';
for(const p of cables.leads)audit+=`| ${p.id} | ${p.modeledFlexibleLengthMm.toFixed(1)} mm | ${p.turns.toFixed(2)} | ${p.pitchMm} / ${p.assumedDiameterMm} mm |\n`;
audit+=`\nCable-to-meter screen: ${cables.meterRouteScreen?.samplesPerCurve ?? 301} points per curve; ${cables.meterRouteScreen?.intrusions.length ?? 0} sampled intrusions against the logger body expanded by wire radius. This does not check all other objects or wire-to-wire clearances.\n`;
audit+='\nThe elliptical coil centerline uses 44 and 37 mm radii (minimum planar radius of curvature about 31.1 mm). No manufacturer bend limit is available for the actual leads. Transitions between coils, plugs, supports and other wires still need routing and physical inspection. [Rendered cable measurements](installation_cables.json).\n\n## All materials and interfaces\n\n**Hold** means essential identification, source resolution or custom engineering is missing. **Measure** needs the actual part. **Conditional** has a plausible catalog interface with unresolved installation conditions. **Catalog match** covers only the interface described. Ownership remains unchanged.\n\n| Material | Result | Checked | Remaining work |\n|---|---|---|---|\n';
for(const p of review.materials)audit+=`| [${p.item}](index.html#material-${p.id})<br>${p.model}<br>${p.availability==='owned'?'✓ Owned':p.availability==='kit'?'✓ Kit included':p.availability==='fabricate'?'◇ Reuse / fabricate':'□ To buy'} | **${p.result}** | ${p.checked} ${sources(p.sources)} | ${p.remaining} |\n`;
audit+='\n## Receiving and commissioning items\n\n'+review.needed.map(t=>`- ${t}`).join('\n');
audit+='\n\nRecord receiving checks, update any affected drawings if substitutions are needed, then conduct a documented dry fit and qualified electrical acceptance. There is no hardware test result or energizing approval in this audit.\n\n## Reproduce the checks\n\nRun `node tools/audit_installation.mjs` and `node --test tools/test_installation.mjs`. Run the browser checks after regenerating drawings; `EXPORT_AUDIT=1` refreshes the rendered cable measurements from the local model. Then run `node tools/render_documents.cjs`. Software passes describe only the tested geometry / website behavior.\n\n[Review data and primary links](installation_review.json) · [Geometry check results](installation_checks.json) · [3D layout](index.html#layout)\n';
fs.writeFileSync(path.join(root,'Installation_Audit.md'),audit);
// Supporting material lives here so the main page stays focused on review and purchasing.
const dimensions=JSON.parse(fs.readFileSync(path.join(root,'layout_dimensions.json')));
let documents=`# Build documents

- [Design, sourcing and component evidence](revision.html)
- [Machining files and assembly guide](build.html) — drawings, fasteners and assembly order.
- [Interactive installation sequence](index.html#assembly-preview) — inspect the six stages in 3D.
- [Protection review](protection.html) — Q0, upstream voltage-lead protection and the remaining evidence.
- [Installation audit](installation.html) — checks completed and remaining acceptance items.
- [Full materials list](materials.html) · [Download BOM](Procurement_BOM.md)
- [Manufacturer sources and design limits](references.html)

## Drawings

[Wiring SVG](wiring_routes.svg) · [Wiring PNG](wiring_routes.png) · [Connector SVG](connector_detail.svg) · [Connector PNG](connector_detail.png)

<h2 id="operation">Operation</h2>

Daily use begins only after qualified electrical inspection and setup.

1. **Configure offline.** With mains unplugged and the lid closed, connect the free exterior USB-A end of the existing cable to the ELOG computer; use ELOG to set the clock, actual CT range and interval. Confirm logging is enabled and sufficient memory remains. Disconnect from the PC before reconnecting mains; the whole cable stays attached to the box.
2. **Run independently.** XA and the adapter stay secured inside. With Q0 OFF and the lid closed, connect one printer and the supply. Switch Q0 ON. The opaque lid hides the logger LEDs; verify recording by an offline export after the supervised pilot. Record each job's start, phase changes and finish times against the synchronized clock.
3. **Download in batches.** After the printer finishes its shutdown/cooldown, switch Q0 OFF, unplug mains and verify absence of mains voltage. Keep the lid closed, connect the same free USB-A end to the PC and export the records in ELOG. Preserve raw data before clearing memory. Disconnect from the PC and stow the free end before the next powered run.

**Q0 OFF is not isolation; its input remains live. Unplug SUPPLY IN from the wall before connecting a PC or opening the box. The complete USB cable stays attached to the box during printing; its exterior end is disconnected from the PC.**

The logger stores time-series data in non-volatile memory and can be powered by USB for readout ([DENT manual](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), printed pp. 7, 18, 119). The internal portion of the existing USB cable requires rated insulation even though the PC is connected only offline. The selected black FIT-221 sleeve has a manufacturer 600 V rating; its application, end coverage and restraint remain physical acceptance items. USB does not provide mains isolation. Validate one complete offline run and export before collecting the experiment series.

### Initial setup and electrical checks

Qualified electrical personnel verify terminations, polarity, PE continuity, insulation, protection and enclosure fit before releasing the assembly. Q0 opens hot only; PE stays continuous. Upstream Q0 protection for the original voltage leads and supply suitability must be accepted before energizing.

Configure ELOG for single phase / two wire, CH1 voltage high L1 and low N, the actual CT type/range and logging interval. Disable unused channels. Verify sensible readings and positive real power against an independent reference meter; prove recording and restart behavior with a supervised power cycle.

## Software and lab equipment

Arrange access separately; these resources are not marked as owned.

`;
for(const r of bom.setup_requirements)documents+=`- **${r.item} — ${r.action}.** ${r.reason}${r.url?` [DENT download](${r.url})`:''}\n`;
documents+=`
## Purchasing notes

Quantities are for one enclosure; supplier pack sizes may be larger. Check stock and lead times. “Select / Configure” needs a size or rating choice; “Quote / Fabrication” needs supplier follow-up. Owned means on hand, not approved for use. Purchase holds remain marked beside the relevant materials.

Click photos to enlarge them. Reference images and design concepts are labeled; photos are not to scale. Image credits are in each material's Details and the full BOM.

<h2 id="dimensions">Dimensions and model notes</h2>

**Concept layout; use the build package for machining.** Manufacturer CAD, published sizes and estimates share one scale. Small hardware and cable dressing are simplified; spare stock is excluded. Received parts still need a physical fit check.

Amber marks the selected material; hidden housings become transparent. Top view matches the wiring plan. The selected case has gray walls and an opaque lid. X-ray mode is a visualization aid, not a transparent product cover. The lid silhouette comes from the manufacturer-linked common-base STEP; compare the actual opaque lid. Drag to rotate, scroll or pinch to zoom; keyboard controls are arrow keys, + / − and Home.

| Component | Model envelope (mm) | Evidence / limit |
|---|---|---|
`;
for(const p of dimensions.parts)documents+=`| ${p.name} | ${p.size?p.size.map(n=>n.toFixed(1)).join(' × '):'Routing only'} | ${p.status}${p.source?` · [Source](${p.source})`:''} |\n`;
documents+='\n[Dimensions JSON](layout_dimensions.json) · [Enclosure CAD provenance](assets/enclosure.json) · [Materials JSON](procurement.json) · [Cable-support checks](installation_supports.json)\n';
fs.writeFileSync(path.join(root,'Build_Documents.md'),documents);
const styles=`:root{font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#203346;background:#edf2f6}body{max-width:1250px;margin:25px auto;padding:28px;background:white;border-radius:8px}h1{font-size:30px;line-height:1.2}h2{font-size:22px;margin-top:30px}a{color:#17619c}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:12px;border:1px solid #d8e0e7;vertical-align:top;text-align:left}th{background:#edf3f8}.table-wrap{overflow-x:auto}.table-wrap .material-photo{width:180px;max-width:180px}table{min-width:760px}code{background:#edf2f6;padding:2px 4px}nav{display:flex;gap:18px;flex-wrap:wrap;font-size:14px}@media(max-width:600px){body{margin:0;padding:20px}h1{font-size:26px}}`;
for(const [input, output, title] of [['Procurement_BOM.md','materials.html','Materials and purchase links'],['Wiring_References_EN.md','references.html','Sources and design limits'],['Installation_Audit.md','installation.html','Installation audit'],['Build_Package.md','build.html','Machining and assembly package'],['Build_Documents.md','documents.html','Build documents'],['Protection_Review.md','protection.html','Protection and data review'],['Design_Revision_B.md','revision.html','Design, sourcing and component evidence']]) {
 const raw=fs.readFileSync(path.join(root,input),'utf8');
 const rendered=marked.parse(raw).replace(/<table>/g,'<div class="table-wrap"><table>').replace(/<\/table>/g,'</table></div>').replace(/<td>(R\d+)<\/td>/g,(_,id)=>`<td id="${id.toLowerCase()}">${id}</td>`);
 fs.writeFileSync(path.join(root,output),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · ELITEpro XC</title><link rel="stylesheet" href="material-images.css?v=19"><style>${styles}</style></head><body><nav><a href="index.html#design">← Design</a><a href="index.html#hardware">Materials</a><a href="documents.html">Build documents</a><a href="${input}" download>Download Markdown</a></nav>${rendered}</body></html>\n`);
}
console.log('Generated BOM, build document hub, reference pages and installation audit');
