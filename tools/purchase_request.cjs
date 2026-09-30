// Shared projection for the professor's form and the Excel download.
const fs = require('node:fs');
const path = require('node:path');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatPrice = value => value.toFixed(Math.max(2, (String(value).split('.')[1] || '').length));
const sellerId = seller => seller === 'DigiKey' ? 'digikey' : 'home-depot';

function requestData(bom) {
  const form = bom.purchasing.request_form;
  const rows = bom.purchasing.rows.map(row => {
    const r = row.request;
    if (!r?.description || !r.catalog_number || !r.verified_on || !r.image?.src)
      throw new Error(`Missing purchase request evidence: ${row.sku}`);
    if (!['each', 'ft', 'pack', 'roll'].includes(row.unit))
      throw new Error(`Unmapped form unit: ${row.unit}`);
    if (row.quantity < (row.minimum_order_quantity || 1))
      throw new Error(`Below retailer minimum: ${row.sku}`);
    if (Math.round(row.quantity * row.unit_price_usd * 100) !== Math.round(row.extended_usd * 100))
      throw new Error(`Incorrect line total: ${row.sku}`);
    const units = row.unit === 'ft' ? 'feet' : 'each';
    const sellingUnit = row.unit === 'pack' ? `${row.pieces_per_unit} pieces per pack; each = one whole pack.`
      : row.unit === 'roll' ? '12 ft × 3/4 in per roll; each = one whole roll.'
      : row.unit === 'ft' ? `One continuous ${row.quantity} ft length. Price is per foot.`
      : row.material_ids.includes('usb-sleeve') ? 'One 4 ft stick; each = one whole stick.'
      : r.manufacturer_part_number === '1207639' ? 'One 250 mm rail; cut the required 60 mm during fabrication.'
      : 'One individual item per each.';
    return {
      id: `${sellerId(row.seller)}-${r.catalog_number.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`,
      seller: row.seller, sku: row.sku, materialIds: row.material_ids,
      quantity: row.quantity, units, price: row.unit_price_usd, priceText: formatPrice(row.unit_price_usd),
      catalog: r.catalog_number, catalogLabel: r.catalog_label,
      model: r.manufacturer_part_number, description: r.description, url: row.url,
      descriptionField: r.description_field, sourceUrl: r.verified_url,
      verifiedOn: r.verified_on, priceCheckedOn: row.price_checked_on || row.checked_on,
      consumable: form.consumable_or_under_one_year === null ? form.consumable_note : (form.consumable_or_under_one_year ? 'Yes' : 'No'),
      consumablePending: form.consumable_or_under_one_year === null,
      repair: form.repair_part_or_service ? 'Yes' : 'No',
      noDeliveryExpected: form.no_delivery_expected,
      sellingUnit, total: row.extended_usd, image: r.image,
      fulfillment: r.fulfillment_note || '',
      sharedNote: row.material_ids.length > 1 ? 'Two total: one internal XA connector and one printer output connector.' : ''
    };
  });
  if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Duplicate purchase request item');
  const total = rows.reduce((sum, r) => sum + Math.round(r.total * 100), 0) / 100;
  if (total !== bom.purchasing.material_subtotal_usd) throw new Error('Purchase request total mismatch');
  const sellers = [...new Set(rows.map(r => r.seller))].map(name => ({
    name, id: sellerId(name), rows: rows.filter(r => r.seller === name),
    total: rows.filter(r => r.seller === name).reduce((sum, r) => sum + Math.round(r.total * 100), 0) / 100
  }));
  return {rows, sellers, total, checkedOn: bom.purchasing.checked_on};
}

function renderPurchaseRequest(bom, root) {
  const data = requestData(bom);
  const field = (row, key, label, value, hint = '', wide = false) => `<div class="request-field${wide ? ' full-width' : ''}"><div class="field-label"><span id="${row.id}-${key}-label">${label}</span><button type="button" data-copy="${row.id}-${key}" aria-label="Copy ${label} for ${escape(row.catalog)}" hidden>Copy</button></div><div class="field-value${key === 'url' ? ' url-value' : ''}" id="${row.id}-${key}" aria-labelledby="${row.id}-${key}-label" tabindex="0">${escape(value)}</div>${hint ? `<small>${escape(hint)}</small>` : ''}</div>`;
  const card = (r, index) => `<details class="request-item" id="${r.id}"${index === 0 ? ' open' : ''}>
<summary><img src="${escape(r.image.src)}" alt="${escape(r.image.alt)}" width="64" height="64" loading="lazy"><span class="item-title"><strong>${escape(r.model)}</strong><span>${escape(r.description)}</span></span><span class="item-amount">${r.quantity} ${r.units}<strong>$${r.total.toFixed(2)}</strong></span><span class="expand-mark" aria-hidden="true">⌄</span></summary>
<div class="request-body"><div class="item-meta"><a href="${escape(r.url)}" target="_blank" rel="noopener">Open retailer listing ↗</a><a href="#${r.id}" class="permalink">Link to this item</a><span>${escape(r.image.caption)}</span></div>
<div class="form-fields">
${field(r, 'quantity', 'Quantity', r.quantity)}
${field(r, 'units', 'Units', r.units, `Select “${r.units}” in the school menu.`)}
${field(r, 'price', 'Price', r.priceText, 'USD per selling unit')}
${field(r, 'catalog', 'Catalog/Part #', r.catalog, `${r.catalogLabel}; manufacturer / model: ${r.model}`)}
${field(r, 'description', 'Description', r.description, `Exact ${r.seller} ${r.descriptionField}; checked ${r.verifiedOn}.`, true)}
${field(r, 'url', 'Item URL', r.url, '', true)}
</div>
<div class="classification-fields"><div><span>Is this item consumable or be in use for less than 1 year before disposal?</span><strong class="${r.consumablePending ? 'pending' : ''}">${escape(r.consumable)}</strong></div><div><span>Is this a repair part or service?</span><strong>${r.repair}</strong><small>New assembly</small></div><div><label><input type="checkbox" disabled${r.noDeliveryExpected ? ' checked' : ''}> No Delivery Expected</label><small>${r.noDeliveryExpected ? 'Checked' : 'Leave unchecked — physical goods.'}</small></div></div>
<div class="selling-note"><p>${escape(r.sellingUnit)}${r.sharedNote ? ` ${escape(r.sharedNote)}` : ''}</p><p>Line total: ${r.quantity} × $${r.priceText} = <strong>$${r.total.toFixed(2)}</strong>. Price checked ${r.priceCheckedOn}.</p>${r.fulfillment ? `<p class="pickup-note">${escape(r.fulfillment)}</p>` : ''}</div></div></details>`;
  const sections = data.sellers.map(s => `<section class="vendor-section" id="${s.id}" aria-labelledby="${s.id}-title"><div class="vendor-heading"><h2 id="${s.id}-title">${s.name}</h2><p>${s.rows.length} order lines · <strong>$${s.total.toFixed(2)}</strong> materials</p></div>${s.rows.map(card).join('\n')}</section>`).join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Purchase request · ELITEpro XC</title><link rel="stylesheet" href="purchase-request.css"><script src="purchase-request.js" defer></script></head>
<body><main><nav class="site-nav" aria-label="Project"><a href="index.html#hardware">← Purchase list</a><a href="index.html#design">Design</a><a href="documents.html">Build documents</a></nav>
<header><p class="eyebrow">PRINTER ENERGY MONITOR</p><h1>Purchase request</h1><p class="intro">Copy the fields into the school’s <strong>Add New Items to Cart</strong> form. Submit a separate request for each vendor.</p><div class="toolbar"><a class="download" href="downloads/purchase-request.xlsx" download>Download Excel · 2 vendor sheets ↓</a><span>${data.rows.length} order lines · <strong>$${data.total.toFixed(2)}</strong> materials</span></div></header>
<div class="request-guide"><p><strong>Units follow the school menu.</strong> Use <b>each</b> for a single item, a complete pack or a complete roll; use <b>feet</b> for cut-to-length wire. Price is per selling unit, not the line total.</p><p><strong class="pending-text">Professor to confirm:</strong> consumable / under-one-year classification for all items. Repair/service: No. No Delivery Expected: leave unchecked.</p><p><strong>Home Depot pickup:</strong> the three cut-to-length wire lines require Champaign collection; delivery to ZIP 61820 is unavailable.</p><p class="quote-date">Descriptions and unit prices checked ${data.checkedOn}. Materials only; shipping, tariffs, tax, fabrication and labor excluded. <a href="revision.html#checkout">Current price basis and changes</a>.</p></div>
<nav class="vendor-nav" aria-label="Choose vendor">${data.sellers.map(s => `<a href="#${s.id}" data-vendor="${s.id}">${s.name} <span>${s.rows.length} items · $${s.total.toFixed(2)}</span></a>`).join('')}</nav>
<noscript><p>Both vendor lists are shown below. Select field text to copy; the Excel download works without JavaScript.</p></noscript>
${sections}<p class="footer-note">Descriptions reproduce the selected retailer field exactly. Product photos come from the linked listings; family photos are representative. This page prepares a request and does not submit or place an order.</p></main><div id="copy-status" role="status" aria-live="polite"></div></body></html>\n`;
  fs.writeFileSync(path.join(root, 'purchase-request.html'), html);
  return data;
}

module.exports = {requestData, renderPurchaseRequest, formatPrice};
