// Delivery ticks are a personal receiving aid. They stay in this browser and never change procurement.json.
const KEY = 'printer-energy-monitor:delivered';
const boxes = [...document.querySelectorAll('[data-delivered]')];
const summary = document.getElementById('delivery-summary');
let delivered = new Set(), saved = true;
try { delivered = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { saved = false; }

function render() {
  for (const box of boxes) {
    const on = delivered.has(box.dataset.delivered);
    const row = box.closest('tr'), badge = row.querySelector('.inventory-badge');
    badge.dataset.status ??= badge.textContent;
    badge.textContent = on ? '✓ Delivered' : badge.dataset.status;
    row.classList.toggle('is-delivered', on);
    box.checked = on;
  }
  summary.textContent = `${delivered.size} of ${boxes.length} delivered · `
    + (saved ? 'ticks are saved in this browser only' : 'this browser blocks storage, so ticks last until the page closes');
}

for (const box of boxes) {
  box.closest('label').hidden = false;
  box.addEventListener('change', () => {
    delivered[box.checked ? 'add' : 'delete'](box.dataset.delivered);
    try { localStorage.setItem(KEY, JSON.stringify([...delivered])); saved = true; } catch { saved = false; }
    render();
  });
}
// A stored id whose material has since left the list must not inflate the count.
const known = new Set(boxes.map(box => box.dataset.delivered));
for (const id of delivered) if (!known.has(id)) delivered.delete(id);
summary.hidden = false;
render();
