// ARTIFACT_WORKDIR must contain a node_modules symlink to the bundled runtime.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import requestTools from './purchase_request.cjs';

if (!process.env.ARTIFACT_WORKDIR) throw new Error('Set ARTIFACT_WORKDIR to the prepared artifact runtime directory');
const requireArtifact = createRequire(path.join(process.env.ARTIFACT_WORKDIR, 'package.json'));
const {Workbook, SpreadsheetFile} = requireArtifact('@oai/artifact-tool');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = process.env.REQUEST_OUTPUT || path.resolve(root, '../outputs/purchase-request-2026-09-29');
const bom = JSON.parse(await fs.readFile(path.join(root, 'procurement.json'), 'utf8'));
const data = requestTools.requestData(bom);
const workbook = Workbook.create();
await fs.mkdir(outputDir, {recursive:true});

const columns = [
  ['Quantity', 10], ['Units', 10], ['Price (USD / unit)', 16], ['Catalog/Part #', 24],
  ['Description', 61], ['Item URL', 61],
  ['Is this item consumable or be in use for less than 1 year before disposal?', 32],
  ['Is this a repair part or service?', 25], ['No Delivery Expected', 23],
  ['Line total (USD)', 18], ['Selling unit / package contents', 42],
  ['Collection / fulfillment', 43], ['Manufacturer / Model #', 25],
  ['Price checked', 17], ['Description checked', 20]
];

for (const seller of data.sellers) {
  const sheet = workbook.worksheets.add(seller.name);
  const first = 8, last = first + seller.rows.length - 1;
  sheet.showGridLines = false;
  sheet.tabColor = '#173F64';
  sheet.getRange(`A1:O${last}`).format.font = {name:'Arial', size:11, color:'#203346'};
  sheet.getRange(`A1:O${last}`).format.verticalAlignment = 'center';
  sheet.getRange('A1:O1').format.rowHeight = 8;
  sheet.getRange('A2').values = [[`Purchase request · ${seller.name}`]];
  sheet.getRange('A2').format.font = {name:'Arial', size:16, bold:true, color:'#173F64'};
  sheet.getRange('A2:O2').format.rowHeight = 28;
  sheet.getRange('A2:F2').format.borders = {bottom:{style:'thin', color:'#BACBD8'}};
  sheet.getRange('A3').values = [['Vendor materials subtotal (USD)']];
  sheet.getRange('E3').formulas = [[`=SUM(J${first}:J${last})`]];
  sheet.getRange('E3').setNumberFormat('"$"#,##0.00');
  sheet.getRange('E3').format.font.bold = true;
  sheet.getRange('F3').values = [['Shipping, tariffs, tax, fabrication and labor excluded.']];
  sheet.getRange('A4').values = [['One vendor per request. Quantity counts selling units; each can mean one complete pack or roll.']];
  sheet.getRange('A5').values = [['Professor to confirm consumable classification. Review collection notes before submitting.']];
  sheet.getRange('A4:O5').format.font = {name:'Arial', size:11, color:'#576D7F'};
  sheet.getRange('A3:O5').format.rowHeight = 23;
  sheet.getRange('A6:O6').format.rowHeight = 10;
  sheet.getRange('A7:O7').values = [columns.map(([label]) => label)];
  sheet.getRange('A7:O7').format = {
    fill:'#173F64', font:{name:'Arial', size:11, bold:true, color:'#FFFFFF'},
    horizontalAlignment:'center', verticalAlignment:'center', wrapText:true, rowHeight:54,
    borders:{insideVertical:{style:'thin',color:'#FFFFFF'}}
  };
  columns.forEach(([, width], i) => { sheet.getRangeByIndexes(0, i, last, 1).format.columnWidth = width; });
  const values = seller.rows.map(r => [r.quantity, r.units, r.price, r.catalog, r.description, r.url,
    r.consumable, r.repair, r.noDeliveryExpected ? 'Checked' : 'Unchecked', null,
    r.sellingUnit + (r.sharedNote ? ` ${r.sharedNote}` : ''), r.fulfillment,
    r.model, new Date(`${r.priceCheckedOn}T00:00:00Z`), new Date(`${r.verifiedOn}T00:00:00Z`)]);
  sheet.getRange(`A${first}:O${last}`).values = values;
  sheet.getRange(`A${first}:O${last}`).format.wrapText = true;
  seller.rows.forEach((r, i) => {
    const lines = Math.max(Math.ceil(r.description.length / 61), Math.ceil(r.url.length / 61),
      Math.ceil((r.sellingUnit + r.sharedNote).length / 42), Math.ceil(r.fulfillment.length / 43));
    sheet.getRange(`A${first+i}:O${first+i}`).format.rowHeight = Math.max(40, lines * 14 + 8);
  });
  sheet.getRange(`D${first}:F${last}`).format.verticalAlignment = 'top';
  sheet.getRange(`A${first}:A${last}`).setNumberFormat('0');
  sheet.getRange(`C${first}:C${last}`).setNumberFormat('0.00#');
  sheet.getRange(`D${first}:I${last}`).setNumberFormat('@');
  sheet.getRange(`M${first}:M${last}`).setNumberFormat('@');
  sheet.getRange(`N${first}:O${last}`).setNumberFormat('mm/dd/yy');
  sheet.getRange(`J${first}`).formulas = [[`=ROUND(A${first}*C${first},2)`]];
  sheet.getRange(`J${first}:J${last}`).fillDown();
  sheet.getRange(`J${first}:J${last}`).setNumberFormat('"$"#,##0.00');
  sheet.getRange(`A${first}:A${last}`).format.horizontalAlignment = 'right';
  sheet.getRange(`C${first}:C${last}`).format.horizontalAlignment = 'right';
  sheet.getRange(`J${first}:J${last}`).format.horizontalAlignment = 'right';
  for (let row = first; row <= last; row++) {
    if (row % 2 === 0) sheet.getRange(`A${row}:O${row}`).format.fill = '#F1F5F8';
  }
  sheet.getRange(`B${first}:B${last}`).dataValidation = {rule:{type:'list', values:['each', 'feet']}};
  sheet.getRange(`G${first}:G${last}`).dataValidation = {rule:{type:'list', values:['Professor to confirm', 'Yes', 'No']}};
  sheet.getRange(`G${first}:G${last}`).conditionalFormats.add('containsText', {
    text:'Professor to confirm', format:{fill:'#FFF1D4', font:{color:'#805207'}}
  });
  sheet.freezePanes.freezeRows(7);
  sheet.freezePanes.freezeColumns(4);
  // Prove the line total and subtotal respond to an input edit, then restore it.
  const initial = seller.rows[0];
  sheet.getRange('A8').values = [[initial.quantity + 1]];
  assert.equal(Math.round(sheet.getRange('J8').values[0][0] * 100), Math.round((initial.quantity + 1) * initial.price * 100));
  assert.equal(Math.round(sheet.getRange('E3').values[0][0] * 100), Math.round((seller.total + initial.price) * 100));
  sheet.getRange('A8').values = [[initial.quantity]];
}

workbook.recalculate();
for (const seller of data.sellers) {
  const sheet = workbook.worksheets.getItem(seller.name);
  assert.equal(Math.round(sheet.getRange('E3').values[0][0] * 100), Math.round(seller.total * 100));
  for (let i = 0; i < seller.rows.length; i++) {
    const row = seller.rows[i], actual = sheet.getRange(`A${i+8}:O${i+8}`).values[0];
    assert.equal(actual[0], row.quantity); assert.equal(actual[2], row.price);
    assert.equal(actual[3], row.catalog); assert.equal(actual[4], row.description);
    assert.equal(actual[5], row.url); assert.equal(Math.round(actual[9]*100), Math.round(row.total*100));
  }
  console.log((await workbook.inspect({kind:'table', range:`'${seller.name}'!A7:F10`, include:'values,formulas', tableMaxRows:4, tableMaxCols:6, maxChars:2500})).ndjson);
  const preview = await workbook.render({sheetName:seller.name, range:'A1:F11', scale:1.25, format:'png'});
  await fs.writeFile(path.join(outputDir, `${seller.id}-preview.png`), new Uint8Array(await preview.arrayBuffer()));
  const fields = await workbook.render({sheetName:seller.name, range:'G7:O10', scale:1, format:'png'});
  await fs.writeFile(path.join(outputDir, `${seller.id}-fields-preview.png`), new Uint8Array(await fields.arrayBuffer()));
}
const errors = await workbook.inspect({kind:'match', searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!|#SPILL!|#CALC!', options:{useRegex:true, maxResults:20}, summary:'Formula error scan', maxChars:1500});
console.log(errors.ndjson);
const output = await SpreadsheetFile.exportXlsx(workbook);
const filename = path.join(outputDir, 'purchase-request.xlsx');
await output.save(filename);
await fs.mkdir(path.join(root, 'downloads'), {recursive:true});
await fs.copyFile(filename, path.join(root, 'downloads/purchase-request.xlsx'));
console.log(JSON.stringify({output:filename, sheets:data.sellers.map(s=>s.name), rows:data.rows.length, total:data.total}));
