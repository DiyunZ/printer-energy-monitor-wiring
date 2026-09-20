import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { installMaterialLocator } from './material-locator.js?v=17';
import { addInstallationHardware } from './installation-hardware.js?v=17';
import { screenCableBodies } from './cable-supports.js?v=15';
import { showDesignPanel } from './site-navigation.js?v=15';

// All geometry is in millimetres. Only the camera changes the screen scale.
const host = document.querySelector('#model-view');
const status = document.querySelector('#model-status');
const $ = id => document.getElementById(id);
const V = a => new THREE.Vector3(...a);

async function start() {
  const [dimensions, cad, buffer, review, procurement] = await Promise.all([
    fetch('./layout_dimensions.json?v=17').then(r => { if (!r.ok) throw Error('Dimensions unavailable'); return r.json(); }),
    fetch('./assets/enclosure.json?v=17').then(r => { if (!r.ok) throw Error('CAD manifest unavailable'); return r.json(); }),
    fetch('./assets/enclosure.bin?v=17').then(r => { if (!r.ok) throw Error('CAD geometry unavailable'); return r.arrayBuffer(); }),
    fetch('./installation_review.json?v=17').then(r => { if (!r.ok) throw Error('Installation review unavailable'); return r.json(); }),
    fetch('./procurement.json?v=17').then(r => { if (!r.ok) throw Error('Materials unavailable'); return r.json(); })
  ]);
  const parts = Object.fromEntries(dimensions.parts.map(p => [p.id, p]));
  const instances = Object.fromEntries(dimensions.instances.map(p => [p.id, p]));
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xeef2f4);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', 'Interactive enclosure. Drag to orbit, scroll to zoom. Arrow keys rotate; plus and minus zoom; Home resets.');
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-430, 430, 350, -350, 1, 3500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 10;
  controls.maxPolarAngle = Math.PI * .93;
  controls.target.set(20, 65, 0);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x7e8c9a, 1.9);
  scene.add(hemi);
  const light = new THREE.DirectionalLight(0xffffff, 2.5);
  light.position.set(-320, 700, 420);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  Object.assign(light.shadow.camera, { left: -450, right: 450, top: 450, bottom: -450, near: 100, far: 1500 });
  light.shadow.bias = -.001;
  scene.add(light);
  const fill = new THREE.DirectionalLight(0xe2ecff, 1.3); fill.position.set(500, 300, -400); scene.add(fill);
  const physical = new THREE.Group(); scene.add(physical);
  const wires = new THREE.Group(); scene.add(wires);
  const dims = new THREE.Group(); scene.add(dims);
  const groups = {}, labels = [], picking = [], shellObjects = [], lidObjects = [], hideWithCase = [], fitBodies = {}, planBodies = {};
  const voltageLeadLengths = [], breakerTerminals = [], breakerMounts = [], cableRoutes = [];
  let assemblyStage = 0, locator = null;
  const allMeshes = [], materialLocations = {};
  function mark(id, key, label, objects, reveal = []) {
    if (!objects.length) return;
    const entries = materialLocations[id] ||= [];
    let entry = entries.find(p => p.key === key);
    if (!entry) { entry = { key, label, objects: [], reveal }; entries.push(entry); }
    for (const m of objects) {
      if (m.userData.materialId && m.userData.materialId !== id) throw Error(`Conflicting material: ${m.userData.materialId} / ${id}`);
      m.userData.materialId = id; entry.objects.push(m);
    }
  }
  function capture(id, key, label, build, reveal = []) {
    const start = allMeshes.length; build(); mark(id, key, label, allMeshes.slice(start), reveal);
  }
  function locatedCable(id, key, label, ...args) { const m = cable(...args); m.userData.route.id=`${id}:${key}`; mark(id, key, label, [m]); return m; }
  const mats = new Map();
  const material = (color, metal = 0) => {
    const key = `${color}/${metal}`;
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: .58, metalness: metal }));
    return mats.get(key);
  };
  function group(id) {
    if (!groups[id]) { groups[id] = new THREE.Group(); groups[id].name = id; physical.add(groups[id]); }
    return groups[id];
  }
  function mesh(geometry, mat, pos, id, parent) {
    const m = new THREE.Mesh(geometry, mat); m.position.copy(V(pos));
    m.castShadow = !mat.transparent; m.receiveShadow = true;
    (parent || group(id)).add(m);
    m.userData.part = id; allMeshes.push(m);
    if (id && !['case', 'panel'].includes(id)) picking.push(m);
    return m;
  }
  function box(size, pos, color, id, radius = 0, parent = null) {
    const geo = radius ? new RoundedBoxGeometry(...size, 2, Math.min(radius, ...size.map(v => v / 3))) : new THREE.BoxGeometry(...size);
    return mesh(geo, typeof color === 'string' || typeof color === 'number' ? material(color) : color, pos, id, parent);
  }
  function cylinder(radius, length, pos, color, id, axis = 'y', parent = null, sides = 24) {
    const m = mesh(new THREE.CylinderGeometry(radius, radius, length, sides), material(color), pos, id, parent);
    if (axis === 'z') m.rotation.x = Math.PI / 2;
    if (axis === 'x') m.rotation.z = Math.PI / 2;
    return m;
  }
  function cable(points, color, radius = 1.5, id = 'leads', smooth = true, parent = wires) {
    const curve = smooth ? new THREE.CatmullRomCurve3(points.map(V), false, 'centripetal') : new THREE.CurvePath();
    if (!smooth) for (let i = 1; i < points.length; i++) curve.add(new THREE.LineCurve3(V(points[i - 1]), V(points[i])));
    const m = mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 6), radius, 8, false), material(color), [0,0,0], id, parent);
    curve.arcLengthDivisions = Math.max(200, points.length * 10);
    m.userData.lengthMm = curve.getLength();
    m.userData.route={part:id,samples:curve.getSpacedPoints(Math.max(600,points.length*8)).map(p=>p.toArray()),radius};
    cableRoutes.push(m.userData.route);
    return m;
  }
  function tag(text, position, id, kind = '') {
    const el = document.createElement('span'); el.className = `model-tag ${kind}`; el.textContent = text;
    $('model-labels').append(el); labels.push({ el, position: V(position), id, kind });
  }
  function decal(text, width, height, position, id, facing = 'up', background = '#edf1f4', ink = '#23394e') {
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.max(128, Math.round(1024 * height / width));
    const ctx = c.getContext('2d'); ctx.fillStyle = background; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = text.split('\n'); ctx.font = `600 ${Math.min(c.height / (lines.length + .8), c.width / Math.max(...lines.map(s => s.length)) * 1.5)}px Arial`;
    lines.forEach((line, i) => ctx.fillText(line, c.width / 2, c.height * (i + 1) / (lines.length + 1), c.width * .9));
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const m = mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }), position, id);
    if (facing === 'up') m.rotation.x = -Math.PI / 2;
    if (facing === 'right') m.rotation.y = Math.PI / 2;
    m.userData.annotation=true;
    return m;
  }
  // The unscaled manufacturer assembly includes the actual taper, feet, panel, fasteners and lift-off lid.
  const shellMat = new THREE.MeshStandardMaterial({ color: '#a4b2bd', transparent: true, opacity: .12, depthWrite: false, roughness: .7, side: THREE.DoubleSide });
  const lidMat = new THREE.MeshStandardMaterial({ color: '#bed9e5', transparent: true, opacity: .08, depthWrite: false, roughness: .2, side: THREE.DoubleSide });
  cad.meshes.forEach((entry, index) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, entry.positionOffset, entry.positionCount), 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, entry.indexOffset, entry.indexCount), 1));
    geo.computeVertexNormals();
    let mat = entry.role === 'shell' ? shellMat : entry.role === 'lid' ? (index === 15 ? lidMat : material('#64747b', .4)) : entry.role === 'panel' ? material('#eef0ed', .18) : material('#9aa4a7', .55);
    const obj = mesh(geo, mat, [0,0,0], entry.role === 'panel' ? 'panel' : 'case');
    obj.name = entry.name; obj.castShadow = false;
    if (index === 0) planBodies.case = [obj];
    if (entry.role === 'panel' && !planBodies.panel) planBodies.panel = [obj];
    if (entry.role === 'shell') shellObjects.push(obj);
    if (entry.role === 'lid') lidObjects.push(obj);
    if (index > 0 && index < 15) hideWithCase.push(obj);
    if (index === 0 || index === 15) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 36), new THREE.LineBasicMaterial({ color: '#627e91', transparent: true, opacity: .19 }));
      group('case').add(edges); (index === 0 ? shellObjects : lidObjects).push(edges);
    }
  });
  // ELITEpro. Body dimensions come directly from the selected data row, not a drawing-space allocation.
  const [mw,mh,ml] = parts.meter.size, [mx,my,mz] = parts.meter.position;
  fitBodies.meter=[box([mw,mh,ml-32], [mx,my,mz], '#1359b6', 'meter', 6)];
  for (const end of [-1,1]) fitBodies.meter.push(box([mw,mh,20], [mx,my,mz+end*(ml/2-10)], '#242e3a', 'meter', 4));
  for (const z of [-72,-53,-34,35,54,73]) {
    for (const side of [-1,1]) box([5,1.3,2.4], [mx+side*26,my+mh/2,mz+z], '#286cc0', 'meter', 1);
  }
  for (const z of [-91,91]) for (const x of [-23,23]) cylinder(4.5, 4, [mx+x,4,mz+z], '#667680','meter');
  decal('DENT\nELITEpro XC', 46, 82, [mx,my+mh/2+.4,mz], 'meter', 'up', '#1359b6', '#f4f7ff');
  for (let i=0;i<4;i++) cylinder(1.8,1,[mx-22+i*14,my+mh/2+.6,mz-89],'#b5d4c5','meter');
  cylinder(1.8,1,[mx,my+mh/2+.6,mz+89],'#c2d1d9','meter');
  const portX = [mx-23,mx-8,mx+8,mx+23];
  portX.forEach((x,i) => { cylinder(5.1,2,[x,18,mz-ml/2-1],i===0?'#e5e2cf':'#101923','meter','z'); cylinder(2.8,2.2,[x,18,mz-ml/2-2],'#baab7e','meter','z'); });
  box([53,10,7],[mx,39,mz-ml/2-2],'#252c31','meter',1);
  for(let i=0;i<9;i++) cylinder(1.8,1,[mx-23+i*5.75,44.5,mz-ml/2-2],'#b0bbc1','meter');
  cylinder(4,2,[mx-17,18,mz+ml/2+1],'#0e141a','meter','z');
  box([12,13,3],[mx+16,23,mz+ml/2+1],'#c3c8c9','meter',1);
  box([8,8,3.5],[mx+16,23,mz+ml/2+2],'#2a3138','meter');
  tag('ELITEpro XC', [mx,64,mz-1], 'meter');
  for(const z of [-70,50]) capture('logger-restraint', String(z), z < 0 ? 'Rear logger strap' : 'Front logger strap', () => {
    box([82,1.2,19.05],[91,54.1,z],'#404a50','meter',.3);
    box([82,1.2,19.05],[91,-1.1,z],'#404a50','meter',.3);
    for(const x of [50,132]) box([1.2,54,19.05],[x,26.5,z],'#404a50','meter',.3);
  });
  // CT ring: the model aperture goes along X. Only the printer hot conductor crosses it.
  const [cx,cy,cz] = parts.ct.position;
  const [ctw,cth,ctd] = parts.ct.size;
  const shape = new THREE.Shape(); const sw=ctd/2, sh=cth/2;
  shape.moveTo(-sw,-sh); shape.lineTo(sw,-sh); shape.lineTo(sw,sh); shape.lineTo(-sw,sh); shape.closePath();
  const hole = new THREE.Path(); hole.absarc(0,0,5.1,0,Math.PI*2,true); shape.holes.push(hole);
  const ctgeo = new THREE.ExtrudeGeometry(shape,{depth:ctw,bevelEnabled:false,curveSegments:24}); ctgeo.translate(0,0,-ctw/2); ctgeo.rotateY(Math.PI/2);
  fitBodies.ct=[mesh(ctgeo,material('#e5e4d8'),[cx,cy,cz],'ct')];
  box([29.8,.8,26.6],[cx,cy+10,cz],'#aaa99f','ct');
  box([20,2,14],[cx,cy+21.5,cz],'#d8d7cc','ct',.8);
  decal('CT1  →',25,12,[cx,cy+23,cz],'ct'); tag('CT1 · hot only',[cx,64,cz-7],'ct');
  // One panel-mounted breaker, with its two terminals inside and handle outside the front wall.
  const [qx,qy,qz] = parts.q0.position;
  fitBodies.q0=[box(parts.q0.size,[qx,qy,qz],'#313b43','q0',2)];
  box([17,47,5],[qx,qy,qz+25.4],'#232b32','q0',2);
  const toggle = box([12,7,15],[qx,qy+3,qz+36],'#edf1ee','q0',1); toggle.rotation.x=-.35;
  const terminalZ = qz - parts.q0.size[2]/2 - parts.q0.studProjection;
  for (const y of [-1,1]) breakerTerminals.push(cylinder(2.413,parts.q0.studProjection,[qx,qy+y*parts.q0.terminalPitch/2,terminalZ+parts.q0.studProjection/2],'#b8a77a','q0','z'));
  for (const y of [-1,1]) {
    const m=cylinder(1.753,2,[qx,qy+y*parts.q0.mountPitch/2,208.5],'#b8c0c1','q0','z'); breakerMounts.push(m);
    mark('fasteners', `q0-${y}`, `Q0 mounting screw ${y < 0 ? 1 : 2}`, [m]);
  }
  decal('Q0\nMAIN',37,20,[qx,qy+57,214],'q0','front');
  tag('Q0 · external handle',[qx-9,qy+71,217],'q0');
  // Fuse holder and short, bonded DIN rail.
  const [rw,rh,rd] = parts.rail.size, [rx,ry,rz] = parts.rail.position;
  const railWeb=new THREE.Shape();railWeb.moveTo(-rw/2,-rd/2);railWeb.lineTo(rw/2,-rd/2);railWeb.lineTo(rw/2,rd/2);railWeb.lineTo(-rw/2,rd/2);railWeb.closePath();
  for(const [x,z,r] of [...dimensions.installationHardware.railFixingsXZ.map(([x,z])=>[x,z,2.25]),[...dimensions.installationHardware.railBondXZ,2.65]]){
    const hole=new THREE.Path();hole.absarc(x-rx,z-rz,r,0,Math.PI*2,true);railWeb.holes.push(hole);
  }
  const railGeo=new THREE.ExtrudeGeometry(railWeb,{depth:1.5,bevelEnabled:false,curveSegments:24});railGeo.rotateX(Math.PI/2);railGeo.translate(0,.75,0);
  planBodies.rail = [mesh(railGeo,material('#bdc6c9',.65),[rx,ry-rh/2+.75,rz],'rail')];
  for(const side of [-1,1]) planBodies.rail.push(box([rw,rh,1.5],[rx,ry,rz+side*(rd/2-.75)],material('#aeb9be',.6),'rail'));
  fitBodies.fuse=[box(parts.fuse.size,parts.fuse.position,'#d4d8d4','fuse',1.5)];
  box([14,4,35],[-60,70.4,-28],'#f2f0e3','fuse',1);
  decal('Fv',12,18,[-60,72.8,-28],'fuse');
  tag('Fv · fixed fuse',[-63,89,-31],'fuse');
  // Secured five-way connector groups. Two separate bridged PE connectors provide spare bond capacity.
  dimensions.instances.filter(p=>p.part==='terminals').forEach(p => {
    const [x,,z] = p.position, name = p.id;
    const carrier=box([p.size[0],4,p.size[2]],[x,4,z],'#e2e7e5','terminals',2);
    const connector=box(parts.terminals.size,[x,10.075,z],'#a6b8b7','terminals',1);
    fitBodies[name]=[carrier,connector];
    const connectorMeshes=[connector];
    for(let i=0;i<5;i++) connectorMeshes.push(box([4.3,2,12],[x-11.6+i*5.8,15.15,z],'#df762e','terminals',.6));
    mark('connectors', name, name, connectorMeshes);
    const carrierMeshes=[carrier];
    for(const side of [-1,1]) carrierMeshes.push(box([1.5,11,22],[x+side*16.5,12,z-3],'#e2e7e5','terminals',.5));
    mark('carriers', name, `${name} carrier`, carrierMeshes, connectorMeshes);
    decal(name,25,13,[x,6.2,z+18],'terminals');
  });
  tag('JL / JN / PE',[-142,35,-45],'terminals');
  // Direct-mounted flanged receptacle: no separate rear box or wall support.
  const [ox,oy,oz] = parts.outlet.position;
  const faceX=182.04;
  planBodies.outlet=[cylinder(21.4,43.6,[faceX-21.8,oy,oz],'#d8d8cd','outlet','x'),
    cylinder(31.75,2.4,[faceX+1.2,oy,oz],'#f0eee6','outlet','x'),
    cylinder(17.65,2.4,[faceX+3.6,oy,oz],'#f0eee6','outlet','x')];
  for(const z of [-6.35,6.35])box([.6,9,2.3],[faceX+5,oy+5,oz+z],'#303237','outlet');
  cylinder(3,.6,[faceX+5,oy-7,oz],'#303237','outlet','x');
  for(const y of [-26.785,26.785]) mark('fasteners', `xa-${y}`, `XA flange screw ${y < 0 ? 1 : 2}`, [cylinder(2,1,[faceX+2.9,oy+y,oz],'#75828a','outlet','x')]);
  decal('ELITEpro ADAPTER\nONLY · UNMETERED',65,18,[faceX+3,oy+51,oz],'outlet','right');
  planBodies.adapter=[box(parts.adapter.size,parts.adapter.position,'#272b30','adapter',5)];
  decal('9 V DC',32,25,[201.84,153.3,oz],'adapter','up','#272b30','#d2d7dc');
  tag('XA + existing adapter',[233,174,oz],'adapter');
  // Entry fittings use drawing locations; bore geometry is in the machined shell mesh.
  function gland(id) {
    const p=instances[id], pos=p.position, axis=p.axis;
    const r=p.size[1]/2, length=p.size[axis==='x'?0:2];
    const split=id==='dc-entry';
    function hollow(outer,depth,at,color) {
      const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
      const hole=new THREE.Path();
      if(split){hole.moveTo(-10.6,-10.6);hole.lineTo(-10.6,10.6);hole.lineTo(10.6,10.6);hole.lineTo(10.6,-10.6);hole.closePath();}
      else hole.absarc(0,0,4.7,0,Math.PI*2,true);
      shape.holes.push(hole);
      const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:32});g.translate(0,0,-depth/2);
      if(axis==='x')g.rotateY(Math.PI/2);
      return mesh(g,material(color),at,'entries');
    }
    planBodies[id]=[hollow(r,length,pos,'#343e45')];
    const v=[...pos],axisN=axis==='x'?0:axis==='y'?1:2;v[axisN]+=length/2;
    const trim=hollow(split?r:r*.68,4,v,'#171e23');
    mark(split ? 'split-entries' : 'cord-glands', id, p.label, [...planBodies[id],trim]);
  }
  ['supply-entry','printer-entry','dc-entry'].forEach(gland);
  tag('SUPPLY IN',[-239,54,144],'entries'); tag('TO PRINTER',[3,44,-254],'entries');
  // Actual wire routes remain in the separately validated schematic. These curved paths show physical routing intent.
  const hot='#20262b', neutral='#c9d0d5', pe='#23945e', blue='#268bd4', signal='#a08bb5';
  locatedCable('cord','supply','Supply cord',[[-275,43,128],[-225,43,128],[-157,43,128]],'#293137',4.6,'entries');
  planBodies['supply-plug']=[box(instances['supply-plug'].size,instances['supply-plug'].position,'#e2b837','entries',6)];
  const supplyStart=allMeshes.length;
  for (const z of [-6.35,6.35]) box([16,6.4,1.5],[-329,46,128+z],'#b6b9b3','entries');
  cylinder(2.4,18,[-330,34,128],'#b6b9b3','entries','x');
  mark('supply-plug','plug','Supply plug',[...planBodies['supply-plug'],...allMeshes.slice(supplyStart)]);
  locatedCable('cord','supply-hot','Supply hot to Q0',[[-157,45,128],[-145,51,131],[-138,103,142],[qx,qy+parts.q0.terminalPitch/2-15.5,terminalZ+8]],hot,1.7,'q0');
  locatedCable('internal-wire','q0-jl','Q0 output to JL',[[qx,qy-parts.q0.terminalPitch/2-15.5,terminalZ+8],[-143,43,121],[-148,12,100],[-148,12,72],[-148,12,35],[-150,15,-98],[-134,15,-118]],hot,1.7,'terminals');
  locatedCable('cord','printer-hot-in','Printer hot to CT',[[-120,14,-138],[-99,19,-148],[-87,cy,cz],[-78,cy,cz]],hot,1.7,'ct');
  locatedCable('cord','printer-hot-ct','Printer hot through CT',[[-78,cy,cz],[-32,cy,cz]],hot,1.7,'ct',false);
  locatedCable('cord','printer-hot-out','Printer hot from CT',[[-32,cy,cz],[-15,cy,-135],[0,35,-167],[0,38,-190]],hot,1.7,'ct');
  locatedCable('cord','supply-neutral','Supply neutral',[[-157,42,130],[-154,25,115],[-153,12,100],[-153,12,72],[-153,12,-33],[-134,14,-48]],neutral,1.7,'terminals');
  locatedCable('cord','printer-neutral','Printer neutral',[[-121,13,-68],[-99,22,-91],[-97,15,-158],[-20,18,-162],[-2,35,-190]],neutral,1.7,'entries');
  locatedCable('cord','supply-pe','Supply protective earth',[[-157,41,126],[-161,20,110],[-158,12,100],[-158,12,72],[-158,12,45],[-139,13,28]],pe,1.7,'terminals');
  locatedCable('cord','printer-pe','Printer protective earth',[[-128,13,7],[-162,13,-10],[-162,12,-189],[-25,16,-191],[2,35,-190]],pe,1.7,'entries');
  locatedCable('cord','printer','Jacket through output gland',[[0,36,-190],[0,36,-240]],'#2a333c',4.6,'entries',false);
  locatedCable('cord','printer','Printer cord outside enclosure',[[0,36,-240],[0,36,-258],[18,36,-283]],'#2a333c',4.6,'entries');
  planBodies['printer-plug']=[box(instances['printer-plug'].size,instances['printer-plug'].position,'#e2b837','entries',6)];
  mark('printer-connector','connector','Printer output connector',[...planBodies['printer-plug'],cylinder(12,3,[24,36,-326],'#e1d7ad','entries','z')]);
  locatedCable('internal-wire','jl-fv','JL to Fv',[[-130,14,-120],[-97,20,-100],[-78,22,-80],[-60,27,-72]],hot,1.7,'fuse');
  locatedCable('internal-wire','xa-hot','XA hot',[[-135,13,-138],[-146,17,-154],[-132,12,-175],[-35,12,-175],[0,12,-175],[40,12,-175],[132,22,-175],[143,76,-20],[141,113,4]],hot,1.7,'outlet');
  locatedCable('internal-wire','xa-neutral','XA neutral',[[-127,13,-48],[-148,21,-65],[-143,21,-153],[-117,12,-167],[-35,12,-167],[0,12,-167],[40,12,-167],[133,26,-167],[140,72,-16],[141,121,4]],neutral,1.7,'outlet');
  locatedCable('internal-wire','pe-bridge','PE bridge',[[-118,13,25],[-100,12,32],[-83,12,44]],pe,1.7,'terminals');
  locatedCable('internal-wire','xa-pe','XA protective earth',[[-71,13,62],[-91,18,78],[-97,19,22],[-92,19,-80],[-92,12,-183],[-35,12,-183],[0,12,-183],[40,12,-183],[140,24,-183],[148,67,36],[141,128,25]],pe,1.7,'outlet');
  locatedCable('internal-wire','rail-pe','Rail bond',[[-78,13,62],[-52,23,78],[-4,23,72],[-3,23,7],[-9,14,-9],[-27+15.5/Math.sqrt(2),8.9,-28+15.5/Math.sqrt(2)]],pe,1.7,'rail');
  locatedCable('internal-wire','panel-pe','Panel bond',[[-82,13,62],[-99,13,78],[-119,8,83],[-125,7.4,75.5]],pe,1.7,'panel');
  locatedCable('internal-wire','fv-jv','Fv to JV',[[-60,26,11.25],[-60,25,22],[-39.6,18,22],[-39.6,14,37.15]],hot,1.45,'fuse');
  // OEM voltage pigtails and three full voltage leads, including a visible retained-slack zone.
  const leadPorts = [3,2,0], leadColors = ['#283039','#ad4d4a','#dddcd1'];
  for(let i=0;i<3;i++) {
    const p=instances[`A${i+1}`], [x,,plugZ]=p.position, z=plugZ-9;
    const startPt = i===0?[-33.8,14,37.15]:[-124+i*6,14,-49];
    const shortLead=cable(i===0?[startPt,[-44,29,49],[x,22,z]]:[startPt,[-99,24,-30],[-86-i*4,31,-5],[-80-i*4,32,21],[-53,31,40],[x,22,z]],blue,1.65);
    shortLead.userData.route.id=`blue:A${i+1}`;
    planBodies[p.id]=[cylinder(p.size[0]/2,p.size[2],p.position,blue,'leads','z')];
    mark('blue-leads',p.id,p.label,[shortLead,...planBodies[p.id]]);
    const longPlug=cylinder(4.4,26,[x,22,z+30],'#b8b5a4','leads','z');
    const slack=instances['lead-slack'];
    const ex=portX[leadPorts[i]];
    const pathsFor = turns => {
      const coil=[];
      for(let j=0;j<=320;j++) {const t=j/320, a=Math.PI/2+t*Math.PI*2*turns;coil.push([slack.position[0]+(40+i*4)*Math.cos(a),10.6+t*turns*slack.pitchMm,slack.position[2]+(31+i*4)*Math.sin(a)]);}
      return [[[x,22,z+43],[x+15,7,z+43],[26+i*5,7,z+43],[26+i*5,7,175+i*4],[-35,7,175+i*4],coil[0]],coil,[coil.at(-1),[24+i*6,51+i*5,170],[39+i*4,40,-90],[43+i*5,30,-143],[ex,18,-158],[ex,18,mz-ml/2-31]]];
    };
    const lengthOf = points => {const c=new THREE.CatmullRomCurve3(points.map(V),false,'centripetal');c.arcLengthDivisions=Math.max(200,points.length*10);return c.getLength();};
    let lo=2,hi=9;
    for(let j=0;j<28;j++){const n=(lo+hi)/2,len=pathsFor(n).reduce((s,p)=>s+lengthOf(p),0);if(len<slack.flexibleLengthMm)lo=n;else hi=n;}
    const turns=(lo+hi)/2, paths=pathsFor(turns);
    const leadSegments=paths.map(p=>cable(p,leadColors[i],slack.assumedCableDiameterMm/2));
    leadSegments[1].userData.route.id=`voltage:A${i+1}`;
    leadSegments[0].userData.route.id=`voltage-feed:A${i+1}`;
    leadSegments[2].userData.route.id=`voltage-tail:A${i+1}`;
    const coilBounds=new THREE.Box3().setFromObject(leadSegments[1]);
    voltageLeadLengths.push({id:`A${i+1}`,modeledFlexibleLengthMm:leadSegments.reduce((n,m)=>n+m.userData.lengthMm,0),turns,pitchMm:slack.pitchMm,assumedDiameterMm:slack.assumedCableDiameterMm,coilMin:coilBounds.min.toArray(),coilMax:coilBounds.max.toArray()});
    const meterPlug=cylinder(4.7,30,[ex,18,mz-ml/2-16],'#b6b4a5','leads','z');
    mark('voltage-leads',p.id,`${p.id} to ${['L1','L2','N'][i]}`,[longPlug,...leadSegments,meterPlug]);
    decal(p.id,8,8,[x,28,plugZ],'leads');
  }
  tag('3 OEM voltage adapters',[-22,56,59],'leads');
  tag('Retained lead slack',[-35,49,148],'leads');
  // CT pair reaches CH1, distinct from voltage sockets and AC/DC power.
  locatedCable('ct','white','CT CH1 positive',[[cx+6,50,cz],[-27,47,-145],[8,11,-149],[22,11,-149],[30,11,-149],[40,11,-149],[73,16,-149],[mx+22,44,mz-ml/2-4]],'#bfc3c0',1,'ct');
  locatedCable('ct','black','CT CH1 negative',[[cx+3,50,cz+3],[-29,49,-148],[8,11,-153],[22,11,-153],[30,11,-153],[40,11,-153],[70,18,-153],[mx+17,44,mz-ml/2-4]],'#30323a',1,'ct');
  // Original flat cord stays outside. Only the round factory extension crosses the DC insert.
  // Flexible paths show routing intent; the assembly schedule retains the full cable lengths.
  const coupling=instances['dc-coupling'], [dx,dy,dz]=coupling.position;
  planBodies[coupling.id]=[
    cylinder(coupling.size[0]/2,30,[dx,dy,dz-15],'#42484e','adapter','z'),
    cylinder(5.7,30,[dx,dy,dz+15],'#252a30','adapter','z')
  ];
  mark('adapter','adapter','Outside XA and original cord',[planBodies[coupling.id][0]]);
  mark('dc-extension','extension','External coupling to logger DC input',[planBodies[coupling.id][1]]);
  tag('DC COUPLING',[dx,dy+18,dz],'adapter');
  cable([[207,89,oz],[230,83,23],[dx,dy,dz-30]],'#554534',1.4,'adapter');
  locatedCable('dc-extension','extension','External coupling to logger DC input',[[dx,dy,dz+30],[dx,dy,149],[290,dy,144],[276,dy,106],[224,dy,106]],'#393e44',2.6,'adapter');
  locatedCable('dc-extension','extension','External coupling to logger DC input',[[224,78,106],[208,78,106],[185.5,78,106],[165,78,106],[146,78,106]],'#393e44',2.6,'adapter');
  const dcInside=locatedCable('dc-extension','extension','External coupling to logger DC input',[[146,78,106],[142,32,134],[142,12,143],[142,12,150],[142,12,158],[124,16,175],[84,18,174],[mx-17,18,mz+ml/2+39]],'#393e44',2.6,'adapter');
  dcInside.userData.route.id='dc-extension:internal';
  mark('dc-extension','extension','External coupling to logger DC input',[cylinder(4.8,35,[mx-17,18,mz+ml/2+21.5],'#24282b','adapter','z')]);
  // Kit USB is removable service equipment. It is absent during energized operation.
  const usbPreviewStart = allMeshes.length;
  locatedCable('usb','usb','Temporary USB — mains unplugged',[[mx+16,23,mz+ml/2+21],[132,30,132],[148,92,150],[151,160,160],[169,205,180],[215,215,180],[255,205,180]],'#516d86',2.4,'entries');
  mark('usb','usb','Temporary USB — mains unplugged',[box([10,11,20],[mx+16,23,mz+ml/2+11],'#43576a','entries',2)]);
  const usbPreview = allMeshes.slice(usbPreviewStart);
  const supportChecks=addInstallationHardware({ dimensions, instances, parts, allMeshes, box, cylinder, mesh, material, decal, mark, capture, materialLocations, cableRoutes });
  // Remaining integral features belong to their purchased assembly, not a new BOM item.
  const assemblyMaterials={case:'enclosure',panel:'panel',meter:'meter',ct:'ct',q0:'breaker',outlet:'receptacle',adapter:'adapter',rail:'din-rail',fuse:'fuse-holder'};
  for(const [part,id] of Object.entries(assemblyMaterials)) {
    const objects=allMeshes.filter(m=>m.userData.part===part&&!m.userData.materialId&&!m.userData.annotation);
    if(id==='enclosure') {
      mark(id,'case','Case and factory fittings',objects.filter(m=>!lidObjects.includes(m)));
      mark(id,'lid','Clear lid and factory fittings',objects.filter(m=>lidObjects.includes(m)));
    } else mark(id,id==='adapter'?'adapter':part,parts[part].name,objects);
  }
  for(const p of procurement.items) if(!materialLocations[p.id]?.length) throw Error(`Missing installation geometry: ${p.id}`);
  if(allMeshes.some(m=>m.userData.part&&!m.userData.materialId&&!m.userData.annotation)) throw Error('Unassigned installation geometry');
  // World-space dimension lines retain the same millimetre scale as the solids.
  function dimension(a,b,text,pos) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(a),V(b)]), new THREE.LineBasicMaterial({ color:'#527086' })); dims.add(line);
    [a,b].forEach(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),material('#527086'));m.position.copy(V(p));dims.add(m)});
    tag(text,pos,null,'dimension');
  }
  dimension([-163.5125,2,200],[163.5125,2,200],'Panel 327 mm',[0,3,216]);
  dimension([-176,2,-187.325],[-176,2,187.325],'Panel 374.7 mm',[-203,2,0]);
  dimension([132,7,mz-108],[132,7,mz+108],'Meter 216 mm',[139,7,mz]);
  dimension([-175,-22,257],[-75,-22,257],'100 mm',[-125,-22,269]);
  const floor = box([6000,2,6000],[0,-25.6,0],'#eef2f4',null,0,scene); floor.receiveShadow=true;floor.castShadow=false;
  const grid = new THREE.GridHelper(1000,20,'#cbd5dc','#e0e6ea'); grid.position.y=-24.5; scene.add(grid);
  const selection = new THREE.Box3Helper(new THREE.Box3(), 0xb87921); scene.add(selection);selection.visible=false;
  let activePart = 'meter';
  function materialCopy(p) {
    $('model-more').open=false;
    $('material-installation-note').textContent=p.location_summary;
    $('part-installation').textContent=p.installation;
    $('part-alert').hidden=!p.notice;
    $('part-alert').textContent=p.notice||'';
    document.querySelector('.part-details').open=false;
  }
  function info(id) {
    locator?.clear(false); activePart = id; const p=parts[id]; if(!p)return;
    materialCopy(procurement.items.find(item=>item.id===id));
    $('part-size').hidden=false;document.querySelector('.model-inspector .axes').hidden=false;
    $('model-part').value=id; $('part-name').textContent=p.name; $('part-evidence').textContent=p.status;
    $('part-size').textContent=p.size?p.size.map(n=>Number(n.toFixed(1))).join(' × ')+' mm':'Route geometry only';
    $('part-note').textContent=p.note; $('part-source').hidden=!p.source;
    if(p.source) {$('part-source').href=p.source;$('part-source').textContent='Manufacturer source ↗';}
    if(groups[id] && id!=='case' && id!=='panel') { selection.box.setFromObject(groups[id]);selection.visible=!selection.box.isEmpty(); } else selection.visible=false;
    render();
  }
  procurement.items.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.item;$('model-part').append(opt);});
  $('model-part').addEventListener('change',e=>locator.select(e.target.value));
  function updateLabels() {
    const w=host.clientWidth,h=host.clientHeight;
    const occupied=[];
    labels.forEach(({el,position,id,kind})=>{
      if(locator?.active){el.hidden=true;return;}
      const p=position.clone().project(camera);
      const concealed=(assemblyStage>0&&((kind==='dimension')||(id&&groups[id]&&!groups[id].visible)))||($('model-shell').value==='closed'&&(['meter','ct','fuse','terminals','leads'].includes(id)||(kind==='dimension'&&el.textContent!=='100 mm')));
      const show=!concealed&&(kind==='dimension'?$('model-dimensions').checked:$('model-label-toggle').checked)&&p.z>-1&&p.z<1&&Math.abs(p.x)<.93&&Math.abs(p.y)<.93;
      el.hidden=!show;el.classList.toggle('chosen',id===activePart);
      if(!show)return;
      const x=THREE.MathUtils.clamp((p.x+1)/2*w,el.offsetWidth/2+8,w-el.offsetWidth/2-8);
      let y=(1-p.y)/2*h;
      const overlaps=()=>occupied.some(r=>Math.abs(r.x-x)<(r.w+el.offsetWidth)/2+4&&Math.abs(r.y-y)<(r.h+el.offsetHeight)/2+3);
      for(let n=0;n<5&&overlaps();n++)y-=el.offsetHeight+4;
      if(y<35||overlaps()){el.hidden=true;return;}
      occupied.push({x,y,w:el.offsetWidth,h:el.offsetHeight});
      el.style.left=x+'px';el.style.top=y+'px';
    });
  }
  function render(){usbPreview.forEach(m=>m.visible=locator?.active==='usb'&&['cutaway','lifted'].includes($('model-shell').value)&&assemblyStage===0&&$('model-wires').checked);locator?.sync();renderer.render(scene,camera);updateLabels();locator?.updateLabels();}
  function resize() {
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h)return; // Hidden tabs retain the last valid projection and canvas size.
    const aspect=w/h,half=Math.max(325,350/aspect);
    camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;
    camera.updateProjectionMatrix();renderer.setSize(w,h);render();
  }
  function view(name) {
    const presets={iso:[-650,760,850],top:[20,1050,0],front:[20,115,1050],right:[1080,105,5]};
    const raised=$('model-shell').value==='lifted';
    camera.position.copy(V(presets[name]||presets.iso));camera.position.y+=raised?80:0;
    controls.target.set(20,raised?145:65,0);camera.up.set(0,1,0);camera.zoom=raised?.85:1;
    controls.update();camera.updateProjectionMatrix();render();
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
  }
  let previousMode='xray';
  function appearance() {
    const mode=$('model-shell').value;
    if((mode==='lifted')!==(previousMode==='lifted')) {
      const delta=mode==='lifted'?80:-80;
      controls.target.y+=delta;camera.position.y+=delta;
      camera.zoom=THREE.MathUtils.clamp(camera.zoom*(mode==='lifted'?.85:1/.85),.65,10);
      camera.updateProjectionMatrix();controls.update();
    }
    previousMode=mode;
    shellObjects.forEach(m=>m.visible=mode!=='cutaway');hideWithCase.forEach(m=>m.visible=mode!=='cutaway');
    lidObjects.forEach(m=>{m.visible=mode!=='cutaway';m.position.y=mode==='lifted'?230:0;});
    shellMat.opacity=mode==='closed'?1:.12;shellMat.depthWrite=mode==='closed';shellMat.transparent=mode!=='closed';shellMat.needsUpdate=true;
    lidMat.opacity=mode==='closed'?.22:.08;wires.visible=$('model-wires').checked;dims.visible=$('model-dimensions').checked;
    applyAssembly();
    render();
  }
  function applyAssembly() {
    const stage=assemblyStage;
    for(const [id,g] of Object.entries(groups)) {
      const first=id==='case'?1:id==='panel'?2:['rail','terminals','meter','ct','fuse'].includes(id)?3:['q0','outlet','entries'].includes(id)?4:5;
      g.visible=stage===0||stage>=first;
    }
    groups.panel.position.y=stage===2?300*(1-Number($('assembly-progress').value)/100):0;
    if(stage>0&&stage<6)lidObjects.forEach(m=>m.visible=false);
    wires.visible=$('model-wires').checked&&(stage===0||stage>=5);
    dims.visible=$('model-dimensions').checked&&stage===0;
    if(stage>0)selection.visible=false;
    $('assembly-distance').textContent=`${Math.round(groups.panel.position.y)} mm above final position`;
  }
  review.assembly.forEach(s=>{const opt=document.createElement('option');opt.value=s.stage;opt.textContent=`${s.stage}. ${s.title}`;$('assembly-stage').append(opt);});
  function setAssembly(stage, clearLocation = true) {
    if(clearLocation)locator?.clear();
    assemblyStage=stage;$('assembly-stage').value=String(stage);
    $('assembly-motion').hidden=stage!==2;$('assembly-previous').disabled=stage===0;$('assembly-next').disabled=stage===6;
    const step=review.assembly.find(s=>s.stage===stage);
    $('assembly-note').textContent=step?`${step.action} ${step.result}`:'Complete design overview. Unresolved interfaces remain listed in the installation audit.';
    appearance();
  }
  $('assembly-stage').addEventListener('change',e=>setAssembly(Number(e.target.value)));
  $('assembly-previous').onclick=()=>setAssembly(Math.max(0,assemblyStage-1));
  $('assembly-next').onclick=()=>setAssembly(Math.min(6,assemblyStage+1));
  $('assembly-progress').addEventListener('input',()=>{applyAssembly();render();});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
  ['model-shell','model-wires','model-dimensions','model-label-toggle'].forEach(id=>$(id).addEventListener('change',appearance));
  function zoom(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.65,10);camera.updateProjectionMatrix();render();}
  $('model-zoom-in').onclick=()=>zoom(1.2);$('model-zoom-out').onclick=()=>zoom(1/1.2);
  $('model-reset').onclick=()=>{setAssembly(0);$('model-shell').value='xray';appearance();info('meter');view('iso');};
  $('compare-layout').onclick=()=>{document.getElementById('tab-layout').click();setAssembly(0);$('model-shell').value='xray';appearance();view('top');$('design').scrollIntoView({block:'start'});};
  $('model-save').onclick=()=>{render();const link=document.createElement('a');link.download='elitepro-enclosure-3d.png';link.href=renderer.domElement.toDataURL('image/png');link.click();};
  const more=$('model-more');
  document.addEventListener('pointerdown',e=>{if(!more.contains(e.target))more.open=false;});
  more.addEventListener('keydown',e=>{
    if(e.key==='Escape') {more.open=false;more.querySelector('summary').focus();e.preventDefault();}
  });
  renderer.domElement.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);
      if(e.key==='ArrowLeft')s.theta-=.15;if(e.key==='ArrowRight')s.theta+=.15;
      if(e.key==='ArrowUp')s.phi-=.12;if(e.key==='ArrowDown')s.phi+=.12;
      s.phi=THREE.MathUtils.clamp(s.phi,.03,Math.PI*.93);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();
    } else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.2);}else if(e.key==='-'){e.preventDefault();zoom(1/1.2);}else if(e.key==='Home'){e.preventDefault();view('iso');}
  });
  const ray = new THREE.Raycaster();let pointerStart=null;
  renderer.domElement.addEventListener('pointerdown',e=>{pointerStart=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!pointerStart||Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])>5)return;
    const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
    const hit=ray.intersectObjects(picking).find(h=>{if(!h.object.userData.materialId||locator?.isGhost(h.object))return false;for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit)locator.select(hit.object.userData.materialId);
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='3D graphics context lost. Reload the page to restore; the dimension schedule remains available.';});
  controls.addEventListener('change',render);
  controls.addEventListener('start',()=>document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false')));
  const aliases={enclosure:'case',breaker:'q0',receptacle:'outlet','fuse-holder':'fuse',connectors:'terminals',carriers:'terminals','din-rail':'rail','blue-leads':'leads','voltage-leads':'leads'};
  locator=installMaterialLocator({items:procurement.items,locations:materialLocations,scene,camera,controls,host,render,
    prepare:id=>{showDesignPanel('layout');resize();setAssembly(0,false);$('assembly-preview').hidden=true;$('assembly-preview').open=false;$('model-shell').value=id==='usb'?'cutaway':'xray';$('model-wires').checked=true;appearance();selection.visible=false;},
    describe:p=>{
      activePart=p.id;
      materialCopy(p);
      const detail=parts[aliases[p.id]||p.id];
      // The BOM fuse is the cartridge; the original part named fuse is its holder.
      const size=p.id==='fuse'?[dimensions.installationHardware.fuseCartridge.diameter,dimensions.installationHardware.fuseCartridge.diameter,dimensions.installationHardware.fuseCartridge.length]:p.id==='carriers'?instances.JL.size:detail?.size;
      $('part-name').textContent=p.model;$('part-size').hidden=!size;
      $('part-size').textContent=size?size.map(n=>Number(n.toFixed(1))).join(' × ')+' mm':'';
      document.querySelector('.model-inspector .axes').hidden=!size;
      $('part-evidence').textContent=p.id==='fuse'?'Catalog cartridge envelope; holder is see-through':detail?.status||'Installation detail · simplified geometry';
      $('part-note').textContent=p.reason;
      const source=p.id==='fuse'?dimensions.installationHardware.fuseCartridge.source:detail?.source||p.links.find(l=>l.kind==='reference')?.url;
      $('part-source').hidden=!source;if(source){$('part-source').href=source;$('part-source').textContent='Manufacturer source ↗';}
    },
    resetView:()=>{info('meter');view('iso');}
  });
  new ResizeObserver(resize).observe(host);
  window.addEventListener('design-viewchange',resize);
  view('iso');resize();appearance();info('meter');
  $('model-loading').hidden=true;host.dataset.ready='true';
  status.textContent='Drag to rotate · Scroll / pinch to zoom';
  if(new URL(location.href).searchParams.has('material'))locator.fromUrl(location.hash==='#layout');
  // Expose read-only diagnostics so regression checks inspect the real rendered model.
  function boundsOf(bodies) {
    return Object.fromEntries(Object.entries(bodies).map(([id,objects])=>{
      const b=new THREE.Box3();objects.forEach(m=>b.union(new THREE.Box3().setFromObject(m)));
      return [id,{min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new THREE.Vector3()).toArray()}];
    }));
  }
  function meterRouteIntrusions(){
    const b=new THREE.Box3(V(parts.meter.position).sub(V(parts.meter.size).multiplyScalar(.5)),V(parts.meter.position).add(V(parts.meter.size).multiplyScalar(.5)));
    // Screen the insulated route against the meter body; actual port terminations are modeled outside it.
    return cableRoutes.flatMap((r,index)=>{const envelope=b.clone().expandByScalar(r.radius);const hits=r.samples.filter(p=>envelope.containsPoint(V(p))).length;return hits?[{index,part:r.part,samplesInside:hits}]:[]});
  }
  window.enclosureDiagnostics=()=>({supportChecks,usbPreviewVisible:usbPreview.some(m=>m.visible),materialLocator:locator.diagnostics(),units:dimensions.units,camera:camera.position.toArray(),zoom:camera.zoom,mode:$('model-shell').value,selected:activePart,cadSize:cad.bounds.size,projectedMeter:V(parts.meter.position).project(camera).toArray(),meterSize:parts.meter.size,meshCount:picking.length,triangles:renderer.info.render.triangles,wiresVisible:wires.visible,lidOffset:lidObjects[0].position.y,shellVisible:shellObjects[0].visible,shellOpacity:shellMat.opacity,fitBodies:boundsOf(fitBodies),planBodies:boundsOf({...planBodies,...fitBodies}),voltageLeadLengths,breakerTerminals:breakerTerminals.map(m=>m.position.toArray()),breakerMounts:breakerMounts.map(m=>m.position.toArray()),assemblyStage,panelInsertionOffset:groups.panel.position.y,visibleGroups:Object.entries(groups).filter(([,g])=>g.visible).map(([id])=>id),lidVisible:lidObjects[0].visible,meterRouteIntrusions:meterRouteIntrusions()});
  window.cableGeometryDiagnostics=()=>({supports:supportChecks,routes:cableRoutes,
    bodyIntrusions:screenCableBodies(cableRoutes,boundsOf(fitBodies),parts.ct)});
}
start().catch(error=>{
  console.error(error);$('model-loading').hidden=true;
  status.textContent='3D could not load on this device. The dimension schedule and 2D wiring below are still available. Try a browser with WebGL enabled.';
  host.dataset.ready='error';
});
