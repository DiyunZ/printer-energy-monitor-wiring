const $ = id => document.getElementById(id);
const stage = $('main-stage'), diagram = stage.querySelector('svg');
const viewer = $('wiring-viewer'), dialog = $('wiring-fullscreen');
const viewerHome = viewer.parentNode, viewerNext = viewer.nextSibling;
const wires = [...diagram.querySelectorAll('.wire')];
const routes = [...diagram.querySelectorAll('.wire-route')];
const groups = {
  all: null, main: ['01','02','03'], voltage: ['01','02','05','06','08','09'],
  neutral: ['06','07','08','09','18','21'], earth: ['10','11','12','19'],
  aux: ['01','02','06','10','17','18','19','20','21','22','23'], signal: ['14','15','16'],
};
const hints = {
  all: 'Drag to pan · Select a wire for endpoints.',
  main: 'CT1 measures printer hot only.',
  voltage: 'A1 → L1 (hot) · A2 → L2 (neutral) · A3 → N (neutral)',
  neutral: 'Neutral remains separate from protective earth.',
  earth: 'PE bonds the printer, outlet and panel.',
  aux: 'Internal adapter power branches before CT1; its original DC cable connects directly to the logger.',
  signal: 'CT → CH1. PC USB is offline only: unplug SUPPLY IN from the wall, keep the lid closed, then connect the existing cable’s free USB-A end to the PC.',
};
let activeIds = null;
function activate(mode) {
  document.querySelectorAll('[data-mode]').forEach(button => {
    const on = button.dataset.mode === mode;
    button.classList.toggle('active', on); button.setAttribute('aria-pressed', String(on));
  });
}
function show(ids, label) {
  activeIds = ids;
  for (const wire of wires) {
    wire.classList.toggle('muted', Boolean(ids && !ids.includes(wire.dataset.id)));
    wire.classList.toggle('selected', Boolean(ids?.length === 1 && ids.includes(wire.dataset.id)));
  }
  document.querySelectorAll('.row').forEach(row => {
    row.classList.toggle('dimrow', Boolean(ids && !ids.includes(row.dataset.id)));
    row.classList.toggle('selected-row', Boolean(ids?.length === 1 && ids.includes(row.dataset.id)));
  });
  $('status').textContent = label;
  $('trace-endpoints').hidden = true;
  $('zoom-focus').hidden = !ids;
  if (viewMode === 'selection') viewMode = 'manual';
}
function endpoint(name) {
  const exact = {
    'D.+': 'ELITEpro CH1 +', 'D.-': 'ELITEpro CH1 −',
    'D.DC+': 'ELITEpro DC center (+)', 'D.DC-': 'ELITEpro DC sleeve (−)',
    'CT.+': 'CT1 white (+)', 'CT.-': 'CT1 black (−)',
    'AUX.FACE.L': 'XA hot contact', 'AUX.FACE.N': 'XA neutral contact',
  };
  if (exact[name]) return exact[name];
  const [part, ...rest] = name.split('.'), port = rest.join(' ');
  if (part === 'JPE') return 'PE port ' + port;
  const names = { IN: 'Supply', OUT: 'Printer', D: 'ELITEpro', AUX: 'XA', PSU: 'Adapter', CT: 'CT1', PLATE: 'Panel PE', PC: 'ELOG computer' };
  return (names[part] || part) + (port ? (/^\d+$/.test(port) ? ' port ' : ' ') + port : '');
}
function trace(id) {
  const route = $('wire-' + id);
  activate(null);
  show([id], 'Connection ' + id + ' · ' + route.querySelector('title').textContent);
  $('trace-endpoints').textContent = endpoint(route.dataset.start) + ' → ' + endpoint(route.dataset.end);
  $('trace-endpoints').hidden = false;
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  const refocus = viewMode === 'selection';
  activate(button.dataset.mode); show(groups[button.dataset.mode], hints[button.dataset.mode]);
  if (refocus) activeIds ? focusSelection() : readable();
}));
for (const wire of wires) {
  wire.addEventListener('click', () => trace(wire.dataset.id));
  wire.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); trace(wire.dataset.id); focusSelection(); }
  });
}
document.querySelectorAll('.trace').forEach(button => button.addEventListener('click', () => {
  trace(button.dataset.id); focusSelection(); viewer.scrollIntoView({ block: 'start' });
}));

// Camera changes the SVG viewport only; all projected body and terminal coordinates stay intact.
const originalViewBox = diagram.getAttribute('viewBox');
const [x, y, width, height] = originalViewBox.split(' ').map(Number);
const fullBounds = { x, y, width, height };
const caseBounds = diagram.querySelector('[data-layout-id="case"]').getBBox();
let scale = .7, center = { x: caseBounds.x + caseBounds.width / 2, y: caseBounds.y + caseBounds.height / 2 };
let viewMode = 'readable', printing = false;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function dimensions() {
  const bounds = diagram.getBoundingClientRect();
  return { w: bounds.width, h: bounds.height };
}
function render() {
  const { w, h } = dimensions();
  if (!w || !h || printing) return;
  const vw = w / scale, vh = h / scale;
  for (const [axis, extent, length] of [['x', vw, 'width'], ['y', vh, 'height']]) {
    const margin = Math.min(extent / 2, fullBounds[length] / 2);
    center[axis] = clamp(center[axis], fullBounds[axis] + margin, fullBounds[axis] + fullBounds[length] - margin);
  }
  diagram.setAttribute('viewBox', `${center.x - vw / 2} ${center.y - vh / 2} ${vw} ${vh}`);
  $('zoom-level').textContent = Math.round(scale * 100) + '%';
  $('zoom-out').disabled = scale <= .08; $('zoom-in').disabled = scale >= 2.5;
  $('zoom-fit').classList.toggle('active', viewMode === 'all');
  stage.dataset.view = viewMode; stage.dataset.scale = scale.toFixed(4); stage.dataset.ready = 'true';
}
function fit(bounds, mode, minimum = .08, maximum = 2.5) {
  const { w, h } = dimensions();
  if (!w || !h) return;
  scale = clamp(Math.min((w - 48) / bounds.width, (h - 48) / bounds.height), minimum, maximum);
  center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  viewMode = mode; render();
}
function readable() { fit(caseBounds, 'readable', .7, 1); }
function focusSelection() {
  if (!activeIds) return;
  const boxes = routes.filter(route => activeIds.includes(route.dataset.id)).map(route => route.getBBox());
  const left = Math.min(...boxes.map(b => b.x)), top = Math.min(...boxes.map(b => b.y));
  // Include the adjacent terminal names, not just the stroke endpoints.
  fit({ x: left - 96, y: top - 96, width: Math.max(...boxes.map(b => b.x + b.width)) - left + 192, height: Math.max(...boxes.map(b => b.y + b.height)) - top + 192 }, 'selection');
}
function zoomBy(factor) { viewMode = 'manual'; scale = clamp(scale * factor, .08, 2.5); render(); }
$('zoom-out').onclick = () => zoomBy(1 / 1.25);
$('zoom-in').onclick = () => zoomBy(1.25);
$('zoom-fit').onclick = () => fit(fullBounds, 'all');
$('zoom-reset').onclick = readable;
$('zoom-focus').onclick = focusSelection;
function resize() {
  if (printing) return;
  if (viewMode === 'all') fit(fullBounds, 'all');
  else if (viewMode === 'readable') readable();
  else if (viewMode === 'selection') focusSelection();
  else render();
}
new ResizeObserver(resize).observe(stage);
window.addEventListener('design-viewchange', () => {
  if ($('wiring').hidden && dialog.open) dialog.close();
  resize();
});
readable();

let drag = null, dragged = false;
stage.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !event.isPrimary) return;
  dragged = false;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, center: { ...center } };
});
stage.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  if (!dragged && Math.hypot(dx, dy) < 4) return;
  dragged = true; viewMode = 'manual'; stage.classList.add('dragging');
  stage.setPointerCapture(event.pointerId);
  center = { x: drag.center.x - dx / scale, y: drag.center.y - dy / scale }; render();
});
function endDrag() { drag = null; stage.classList.remove('dragging'); }
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);
stage.addEventListener('lostpointercapture', endDrag);
stage.addEventListener('click', event => { if (dragged && event.detail) { dragged = false; event.preventDefault(); event.stopPropagation(); } }, true);
stage.addEventListener('keydown', event => {
  const pan = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[event.key];
  if (pan) {
    event.preventDefault(); viewMode = 'manual'; center.x += pan[0] * 70 / scale; center.y += pan[1] * 70 / scale; render();
  } else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomBy(1.25); }
  else if (event.key === '-') { event.preventDefault(); zoomBy(1 / 1.25); }
  else if (event.key === 'Home') { event.preventDefault(); readable(); }
});

// A browser-viewport dialog also works in embedded browsers without native fullscreen support.
$('wiring-expand').onclick = () => {
  if (dialog.open) { dialog.close(); return; }
  dialog.append(viewer); dialog.showModal(); document.body.classList.add('wiring-expanded');
  $('wiring-expand').textContent = 'Exit fullscreen'; $('wiring-expand').focus(); resize();
};
dialog.addEventListener('close', () => {
  viewerHome.insertBefore(viewer, viewerNext); document.body.classList.remove('wiring-expanded');
  $('wiring-expand').textContent = 'Fullscreen'; $('wiring-expand').focus(); resize();
});
window.addEventListener('beforeprint', () => { printing = true; diagram.setAttribute('viewBox', originalViewBox); });
window.addEventListener('afterprint', () => { printing = false; resize(); });
