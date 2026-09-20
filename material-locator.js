import * as THREE from 'three';

// Installation locations reference the meshes used to draw the assembly.
// A material can have several installed occurrences; spare stock has no mesh.
export function installMaterialLocator({ items, locations, scene, camera, controls, host, render, prepare, describe, resetView }) {
  const $ = id => document.getElementById(id);
  const byId = new Map(items.map(p => [p.id, p]));
  const overlay = new THREE.Group(); scene.add(overlay);
  const restored = [], markers = [];
  let selected = null, occurrence = 'all';
  const tint = new THREE.MeshBasicMaterial({ color: '#f3a52d', transparent: true, opacity: .53, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
  const outline = new THREE.LineBasicMaterial({ color: '#8b4e00', transparent: true, opacity: .9, depthTest: false });
  const bounds = objects => objects.reduce((b, m) => b.union(new THREE.Box3().setFromObject(m)), new THREE.Box3());
  const chosen = () => (locations[selected] || []).filter(p => occurrence === 'all' || p.key === occurrence);

  function removeHighlights() {
    for (const [object, original] of restored.splice(0)) { object.material.dispose(); object.material = original; }
    for (const child of [...overlay.children]) {
      overlay.remove(child);
      if (child.isLineSegments) child.geometry.dispose(); // Mesh geometry belongs to the assembly.
    }
    markers.splice(0).forEach(m => m.el.remove());
  }
  function writeUrl(id, replace = false) {
    const url = new URL(location.href);
    if (id) { url.searchParams.set('material', id); url.hash = 'layout'; }
    else url.searchParams.delete('material');
    if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }
  function clear(updateUrl = true) {
    removeHighlights(); selected = null; occurrence = 'all';
    $('material-location-panel').hidden = true; $('material-focus').hidden = true;
    $('material-location-count').textContent = '';
    $('model-status').textContent = 'Drag to rotate · Scroll / pinch to zoom';
    if (updateUrl) writeUrl(null);
  }
  function frame(objects) {
    const b = bounds(objects), center = b.getCenter(new THREE.Vector3());
    const offset = new THREE.Vector3(-650, 760, 850);
    camera.position.copy(center).add(offset); controls.target.copy(center); camera.up.set(0, 1, 0);
    camera.zoom = 1; controls.update(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    let extent = 0;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(camera); extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y));
    }
    // Retain surrounding equipment, even when looking at one small screw or lug.
    const contextLimit = Math.min(camera.right - camera.left, camera.top - camera.bottom) / 150;
    camera.zoom = THREE.MathUtils.clamp(Math.min(.72 / Math.max(extent, .01), contextLimit), .65, 10);
    camera.updateProjectionMatrix();
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', 'false'));
  }
  function highlight(reframe = true) {
    removeHighlights();
    const selectedLocations = chosen();
    const objects = [...new Set(selectedLocations.flatMap(p => p.objects))];
    const ghosts = new Set(selectedLocations.flatMap(p => p.reveal || []));
    for (const object of ghosts) if (!objects.includes(object)) {
      const original = object.material, faded = original.clone();
      faded.transparent = true; faded.opacity = .13; faded.depthWrite = false;
      restored.push([object, original]); object.material = faded;
    }
    scene.updateMatrixWorld(true);
    for (const object of objects) {
      const fill = new THREE.Mesh(object.geometry, tint);
      fill.matrixAutoUpdate = false; fill.matrix.copy(object.matrixWorld); fill.renderOrder = 990;
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry, 40), outline);
      edge.matrixAutoUpdate = false; edge.matrix.copy(object.matrixWorld); edge.renderOrder = 991;
      fill.userData.source = edge.userData.source = object;
      overlay.add(fill, edge);
    }
    for (const p of selectedLocations) {
      const b = bounds(p.objects), position = b.getCenter(new THREE.Vector3()); position.y = b.max.y + 8;
      const el = document.createElement('span'); el.className = 'model-tag installation-tag';
      const number = locations[selected].indexOf(p) + 1;
      el.textContent = selectedLocations.length > 6 ? String(number) : `${number} · ${p.label}`;
      $('model-labels').append(el); markers.push({ el, position, objects: p.objects });
    }
    if (reframe) frame(objects);
    const count = selectedLocations.length;
    $('material-location-count').textContent = `${count} of ${locations[selected].length} installation locations highlighted`;
    $('model-status').textContent = 'Amber = selected material · Drag to rotate';
    render();
  }
  function select(id, { navigate = true, scroll = false } = {}) {
    if (!byId.has(id) || !locations[id]?.length) return false;
    clear(false); prepare(); selected = id; occurrence = 'all';
    const p = byId.get(id); describe(p);
    $('model-part').value = id;
    $('material-location-panel').hidden = locations[id].length === 1; $('material-focus').hidden = false;
    $('material-location').replaceChildren(new Option('All locations', 'all'), ...locations[id].map((p, i) => new Option(`${i + 1}. ${p.label}`, p.key)));
    $('material-location').disabled = locations[id].length === 1;
    $('material-return').href = `#material-${id}`;
    if (navigate) writeUrl(id);
    highlight();
    if (scroll) { $('model-view').scrollIntoView({ block: 'center' }); host.querySelector('canvas').focus({ preventScroll: true }); }
    return true;
  }
  function visible(object) {
    for (let p = object; p; p = p.parent) if (!p.visible) return false;
    return true;
  }
  function sync() {
    if (!selected) return;
    scene.updateMatrixWorld(true);
    for (const overlayMesh of overlay.children) {
      const source = overlayMesh.userData.source;
      overlayMesh.matrix.copy(source.matrixWorld); overlayMesh.visible = visible(source);
    }
  }
  function updateLabels() {
    const w = host.clientWidth, h = host.clientHeight, occupied = [];
    for (const { el, position, objects } of markers) {
      const b = bounds(objects); b.getCenter(position); position.y = b.max.y + 8;
      const p = position.clone().project(camera);
      el.hidden = !$('model-label-toggle').checked || !objects.some(visible) || p.z < -1 || p.z > 1 || Math.abs(p.x) > .96 || Math.abs(p.y) > .96;
      if (el.hidden) continue;
      const x = THREE.MathUtils.clamp((p.x + 1) / 2 * w, el.offsetWidth / 2 + 6, w - el.offsetWidth / 2 - 6);
      let y = (1 - p.y) / 2 * h;
      const overlaps = () => occupied.some(r => Math.abs(r.x - x) < (r.w + el.offsetWidth) / 2 + 3 && Math.abs(r.y - y) < 23);
      for (let i = 0; i < 8 && overlaps(); i++) y -= 25;
      el.hidden = y < 30 || overlaps();
      if (!el.hidden) { el.style.left = `${x}px`; el.style.top = `${y}px`; occupied.push({ x, y, w: el.offsetWidth }); }
    }
  }
  $('material-location').addEventListener('change', e => { occurrence = e.target.value; highlight(); });
  $('material-show-all').onclick = () => { clear(); resetView(); render(); };
  $('material-return').onclick = () => {
    // A filter may have hidden the row that owns the currently selected material.
    document.querySelector('[data-inventory="all"]')?.click();
  };
  document.addEventListener('click', e => {
    const link = e.target.closest('a.locate-material');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (select(link.dataset.material, { scroll: true })) e.preventDefault();
  });
  function fromUrl(scroll = true) {
    const id = new URL(location.href).searchParams.get('material');
    if (!select(id, { navigate: false, scroll })) { clear(false); resetView(); render(); }
  }
  window.addEventListener('popstate', () => fromUrl(location.hash === '#layout'));
  return {
    select, clear, fromUrl, updateLabels, sync,
    get active() { return selected; },
    isGhost: object => restored.some(([m]) => m === object),
    diagnostics: () => ({ selected, occurrence, ghostCount: restored.length, highlightMeshCount: overlay.children.filter(m => m.isMesh).length,
      visibleHighlightCount: overlay.children.filter(m => m.isMesh && m.visible).length,
      overlaysAligned: overlay.children.every(m => m.matrix.equals(m.userData.source.matrixWorld)),
      locations: Object.fromEntries(Object.entries(locations).map(([id, entries]) => [id, entries.map(p => ({ key: p.key, label: p.label, meshes: p.objects.map(m => m.uuid), min: bounds(p.objects).min.toArray(), max: bounds(p.objects).max.toArray() }))])),
      visibleMarkers: markers.filter(m => !m.el.hidden).length,
      target: controls.target.toArray() })
  };
}
