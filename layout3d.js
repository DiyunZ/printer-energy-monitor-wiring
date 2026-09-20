import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

// All geometry is in millimetres. Only the camera changes the screen scale.
const host = document.querySelector('#model-view');
const status = document.querySelector('#model-status');
const $ = id => document.getElementById(id);
const V = a => new THREE.Vector3(...a);

async function start() {
  const [dimensions, cad, buffer, review] = await Promise.all([
    fetch('./layout_dimensions.json?v=9').then(r => { if (!r.ok) throw Error('Dimensions unavailable'); return r.json(); }),
    fetch('./assets/enclosure.json').then(r => { if (!r.ok) throw Error('CAD manifest unavailable'); return r.json(); }),
    fetch('./assets/enclosure.bin').then(r => { if (!r.ok) throw Error('CAD geometry unavailable'); return r.arrayBuffer(); }),
    fetch('./installation_review.json?v=9').then(r => { if (!r.ok) throw Error('Installation review unavailable'); return r.json(); })
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
  controls.maxZoom = 5;
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
  let assemblyStage = 0;
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
    m.userData.part = id;
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
    cableRoutes.push({part:id,samples:curve.getSpacedPoints(300),radius});
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
  box([48,87,4],[qx,qy,211],'#f2f1e8','q0',3); // insulating support insert; exact stack pending
  box([17,47,5],[qx,qy,216],'#232b32','q0',2);
  const toggle = box([12,7,15],[qx,qy+3,224],'#edf1ee','q0',1); toggle.rotation.x=-.35;
  const terminalZ = qz - parts.q0.size[2]/2 - parts.q0.studProjection;
  for (const y of [-1,1]) breakerTerminals.push(cylinder(2.413,parts.q0.studProjection,[qx,qy+y*parts.q0.terminalPitch/2,terminalZ+parts.q0.studProjection/2],'#b8a77a','q0','z'));
  for (const y of [-1,1]) breakerMounts.push(cylinder(1.753,2,[qx,qy+y*parts.q0.mountPitch/2,218.9],'#b8c0c1','q0','z'));
  decal('Q0\nMAIN',37,20,[qx,qy+57,214],'q0','front');
  tag('Q0 · external handle',[qx-9,qy+71,217],'q0');
  // Fuse holder and short, bonded DIN rail.
  const [rw,rh,rd] = parts.rail.size, [rx,ry,rz] = parts.rail.position;
  planBodies.rail = [box([rw,1.5,rd],[rx,ry-rh/2+.75,rz],material('#bdc6c9',.65),'rail')];
  for(const side of [-1,1]) planBodies.rail.push(box([rw,rh,1.5],[rx,ry,rz+side*(rd/2-.75)],material('#aeb9be',.6),'rail'));
  fitBodies.fuse=[box(parts.fuse.size,parts.fuse.position,'#d4d8d4','fuse',1.5)];
  box([14,4,35],[-60,85.6,-28],'#f2f0e3','fuse',1);
  decal('Fv',12,18,[-60,88,-28],'fuse');
  tag('Fv · fixed fuse',[-63,100,-31],'fuse');
  // Secured five-way connector groups. Two separate bridged PE connectors provide spare bond capacity.
  dimensions.instances.filter(p=>p.part==='terminals').forEach(p => {
    const [x,,z] = p.position, name = p.id;
    fitBodies[name]=[box([p.size[0],4,p.size[2]],[x,4,z],'#e2e7e5','terminals',2),box(parts.terminals.size,[x,10.075,z],'#a6b8b7','terminals',1)];
    for(let i=0;i<5;i++) box([4.3,2,12],[x-11.6+i*5.8,15.15,z],'#df762e','terminals',.6);
    decal(name,25,13,[x,6.2,z+18],'terminals');
  });
  tag('JL / JN / PE',[-142,35,-45],'terminals');
  // Side receptacle: actual Leviton yoke dimensions and a RACO handy-box envelope.
  const [ox,oy,oz] = parts.outletguard.position, [od,oh,ow] = parts.outletguard.size;
  const metal = material('#9ca9af',.5);
  box([1.2,oh,ow],[ox-od/2+.6,oy,oz],metal,'outletguard');
  for(const y of [-1,1]) box([od,1.2,ow],[ox,oy+y*(oh/2-.6),oz],metal,'outletguard');
  for(const z of [-1,1]) box([od,oh,1.2],[ox,oy,oz+z*(ow/2-.6)],metal,'outletguard');
  fitBodies.outletguard=[...group('outletguard').children];
  box([4,124,78],[189,oy,oz],'#f1f0e6','outlet',2); // proposed insulating support insert
  box([2,114.3,69.85],[192,oy,oz],material('#d5dadd',.65),'outlet',1.5);
  box([2,103.2,33.3],[187,oy,oz],metal,'outlet');
  planBodies.outlet=[box([parts.outlet.size[0],37,parts.outlet.size[2]],parts.outlet.position,'#beafa0','outlet',2)];
  cylinder(16.65,5,[196,oy,oz],'#f0eee6','outlet','x');
  for(const z of [-6.35,6.35]) box([1.2,9,2.3],[199,oy+5,oz+z],'#303237','outlet');
  cylinder(3,1.2,[199,oy-7,oz],'#303237','outlet','x');
  for(const y of [-40,40]) cylinder(2,2,[193.5,oy+y,oz],'#75828a','outlet','x');
  decal('ELITEpro ADAPTER\nONLY · UNMETERED',65,18,[194,oy+76,oz],'outlet','right');
  planBodies.adapter=[box(parts.adapter.size,parts.adapter.position,'#272b30','adapter',5)];
  box([5,32,23],[195,oy,oz],'#15191d','adapter',1);
  decal('AC / DC',32,25,[218,154,oz],'adapter','up','#272b30','#d2d7dc');
  tag('XA + existing adapter',[246,171,oz],'adapter');
  // Entry fittings. Their centres mark proposed openings; source CAD is not a drilling template.
  function gland(id) {
    const p=instances[id], pos=p.position, axis=p.axis;
    const r=p.size[1]/2, length=p.size[axis==='x'?0:2];
    planBodies[id]=[cylinder(r,length,pos,'#343e45','entries',axis)];
    const v=[...pos],axisN=axis==='x'?0:axis==='y'?1:2;v[axisN]+=length/2;
    cylinder(r*.68,4,v,'#171e23','entries',axis);
  }
  ['supply-entry','printer-entry','dc-entry','usb-entry'].forEach(gland);
  tag('SUPPLY IN',[-239,54,144],'entries'); tag('TO PRINTER',[3,44,-254],'entries');
  // Actual wire routes remain in the separately validated schematic. These curved paths show physical routing intent.
  const hot='#20262b', neutral='#c9d0d5', pe='#23945e', blue='#268bd4', signal='#a08bb5';
  cable([[-275,43,128],[-225,43,128],[-172,43,128]],'#293137',4.6,'entries');
  planBodies['supply-plug']=[box(instances['supply-plug'].size,instances['supply-plug'].position,'#e2b837','entries',6)];
  for (const z of [-6.35,6.35]) box([16,6.4,1.5],[-329,46,128+z],'#b6b9b3','entries');
  cylinder(2.4,18,[-330,34,128],'#b6b9b3','entries','x');
  cable([[-172,43,128],[-150,43,128],[-140,119,132],[qx,qy+parts.q0.terminalPitch/2,terminalZ]],hot,1.7,'q0');
  cable([[qx,qy-parts.q0.terminalPitch/2,terminalZ],[-141,60,123],[-149,22,77],[-151,23,-98],[-134,15,-120]],hot,1.7,'terminals');
  cable([[-120,14,-137],[-100,cy,-135],[-88,cy,cz],[-20,cy,cz],[0,cy,-150],[0,36,-233]],hot,1.7,'ct');
  cable([[-170,42,128],[-157,24,112],[-159,21,-33],[-134,14,-51]],neutral,1.7,'terminals');
  cable([[-121,13,-67],[-113,15,-95],[-113,15,-161],[-11,15,-172],[-4,36,-233]],neutral,1.7,'entries');
  cable([[-168,43,128],[-158,19,108],[-139,13,27]],pe,1.7,'terminals');
  cable([[-128,13,9],[-147,13,-10],[-150,12,-180],[-8,13,-183],[-8,36,-233]],pe,1.7,'entries');
  cable([[0,36,-233],[0,36,-256],[18,36,-283]],'#2a333c',4.6,'entries');
  planBodies['printer-plug']=[box(instances['printer-plug'].size,instances['printer-plug'].position,'#e2b837','entries',6)];
  cylinder(12,3,[24,36,-326],'#e1d7ad','entries','z');
  cable([[-130,14,-120],[-97,20,-100],[-78,22,-80],[-60,27,-72]],hot,1.7,'fuse');
  cable([[-135,13,-120],[-146,21,-116],[-155,22,-160],[133,30,-160],[144,76,-20],[169,105,-5]],hot,1.7,'outlet');
  cable([[-127,13,-52],[-140,21,-32],[-145,20,-151],[131,26,-151],[139,72,-16],[169,115,-5]],neutral,1.7,'outlet');
  cable([[-118,13,25],[-100,12,32],[-83,12,44]],pe,1.7,'terminals');
  cable([[-71,13,60],[-97,22,96],[-87,24,151],[134,25,151],[143,67,36],[167,117,29]],pe,1.7,'outlet');
  cable([[-78,13,60],[-39,14,17],[-24,13,-19],[-27,7,-28]],pe,1.7,'rail');
  cable([[-82,13,60],[-85,14,49],[-106,7,51]],pe,1.7,'panel');
  cable([[-67,13,60],[-91,17,88],[-86,18,145],[137,19,145],[139,86,25],[131,86,25]],pe,1.7,'outletguard');
  cylinder(3,3,[-106,4,51],'#b1a66c','panel');
  // Blue pigtails and three full voltage leads, including a visible retained-slack zone.
  const leadPorts = [3,2,0], leadColors = ['#283039','#ad4d4a','#dddcd1'];
  for(let i=0;i<3;i++) {
    const p=instances[`A${i+1}`], [x,,plugZ]=p.position, z=plugZ-9;
    const startPt = i===0?[-60,27,16]:[-124+i*6,14,-49];
    cable([startPt,[-44-i*8,30,29],[x,22,z]],blue,1.65);
    planBodies[p.id]=[cylinder(p.size[0]/2,p.size[2],p.position,blue,'leads','z')];
    cylinder(4.4,26,[x,22,z+30],'#b8b5a4','leads','z');
    const slack=instances['lead-slack'];
    const ex=portX[leadPorts[i]];
    const pathsFor = turns => {
      const coil=[];
      for(let j=0;j<=240;j++) {const t=j/240, a=t*Math.PI*2*turns;coil.push([slack.position[0]+44*Math.cos(a),24+i*slack.layerSpacingMm+t*turns*slack.pitchMm,slack.position[2]+37*Math.sin(a)]);}
      return [[[x,22,z+43],coil[0]],coil,[coil.at(-1),[24+i*6,28+i*5,143],[41+i*4,37,-94],[48+i*5,30,-151],[ex,18,-153],[ex,18,mz-ml/2-16]]];
    };
    const lengthOf = points => {const c=new THREE.CatmullRomCurve3(points.map(V),false,'centripetal');c.arcLengthDivisions=Math.max(200,points.length*10);return c.getLength();};
    let lo=4,hi=6.5;
    for(let j=0;j<28;j++){const n=(lo+hi)/2,len=pathsFor(n).reduce((s,p)=>s+lengthOf(p),0);if(len<slack.flexibleLengthMm)lo=n;else hi=n;}
    const turns=(lo+hi)/2, paths=pathsFor(turns);
    const leadSegments=paths.map(p=>cable(p,leadColors[i],slack.assumedCableDiameterMm/2));
    const coilBounds=new THREE.Box3().setFromObject(leadSegments[1]);
    voltageLeadLengths.push({id:`A${i+1}`,modeledFlexibleLengthMm:leadSegments.reduce((n,m)=>n+m.userData.lengthMm,0),turns,pitchMm:slack.pitchMm,assumedDiameterMm:slack.assumedCableDiameterMm,coilMin:coilBounds.min.toArray(),coilMax:coilBounds.max.toArray()});
    cylinder(4.7,30,[ex,18,mz-ml/2-16],'#b6b4a5','leads','z');
  }
  tag('3 blue voltage adapters',[-22,56,59],'leads');
  tag('Retained lead slack',[-35,49,132],'leads');
  // CT pair reaches CH1, distinct from voltage sockets and AC/DC power.
  cable([[cx+6,cy+15,cz],[cx+23,53,cz-8],[44,61,-150],[102,59,-139],[mx+22,44,mz-ml/2-4]],'#bfc3c0',1,'ct');
  cable([[cx+3,cy+15,cz+2],[cx+20,55,cz-8],[42,63,-153],[104,61,-140],[mx+17,44,mz-ml/2-4]],'#30323a',1,'ct');
  // Separate factory DC return and USB routes on the low-voltage end.
  cable([[236,96,oz],[249,76,42],[234,78,106],[172,78,106],[153,62,118],[mx-17,18,mz+ml/2+17]],'#554534',1.8,'adapter');
  cylinder(4.5,20,[mx-17,18,mz+ml/2+12],'#24282b','adapter','z');
  const usbZ = instances['usb-entry'].position[2];
  cable([[mx+16,23,mz+ml/2+12],[117,31,125],[155,55,usbZ],[217,55,usbZ],[267,38,195]],'#516d86',2.2,'entries');
  box([10,11,20],[mx+16,23,mz+ml/2+11],'#43576a','entries',2);
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
  function info(id) {
    activePart = id; const p=parts[id]; if(!p)return;
    $('model-part').value=id; $('part-name').textContent=p.name; $('part-evidence').textContent=p.status;
    $('part-size').textContent=p.size?p.size.map(n=>Number(n.toFixed(1))).join(' × ')+' mm':'Route geometry only';
    $('part-note').textContent=p.note; $('part-source').hidden=!p.source;
    if(p.source) {$('part-source').href=p.source;$('part-source').textContent='Manufacturer source ↗';}
    if(groups[id] && id!=='case' && id!=='panel') { selection.box.setFromObject(groups[id]);selection.visible=!selection.box.isEmpty(); } else selection.visible=false;
    render();
  }
  dimensions.parts.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name;$('model-part').append(opt);});
  $('model-part').addEventListener('change',e=>info(e.target.value));
  function updateLabels() {
    const w=host.clientWidth,h=host.clientHeight;
    const occupied=[];
    labels.forEach(({el,position,id,kind})=>{
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
  function render(){renderer.render(scene,camera);updateLabels();}
  function resize() {
    const w=host.clientWidth,h=host.clientHeight,aspect=w/h,half=Math.max(325,350/aspect);
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
      camera.zoom=THREE.MathUtils.clamp(camera.zoom*(mode==='lifted'?.85:1/.85),.65,5);
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
      const first=id==='case'?1:id==='panel'?2:['rail','terminals','meter','ct','fuse'].includes(id)?3:['q0','outlet','outletguard','entries'].includes(id)?4:5;
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
  function setAssembly(stage) {
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
  function zoom(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.65,5);camera.updateProjectionMatrix();render();}
  $('model-zoom-in').onclick=()=>zoom(1.2);$('model-zoom-out').onclick=()=>zoom(1/1.2);
  $('model-reset').onclick=()=>{setAssembly(0);$('model-shell').value='xray';appearance();view('iso');};
  $('compare-layout').onclick=()=>{setAssembly(0);$('model-shell').value='xray';appearance();view('top');$('layout').scrollIntoView({block:'start'});};
  $('model-save').onclick=()=>{render();const link=document.createElement('a');link.download='elitepro-enclosure-3d.png';link.href=renderer.domElement.toDataURL('image/png');link.click();};
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
    const hit=ray.intersectObjects(picking).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit)info(hit.object.userData.part);
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='3D graphics context lost. Reload the page to restore; the dimension schedule remains available.';});
  controls.addEventListener('change',render);
  controls.addEventListener('start',()=>document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false')));
  new ResizeObserver(resize).observe(host);
  view('iso');resize();appearance();info('meter');
  $('model-loading').hidden=true;host.dataset.ready='true';
  status.textContent='Drag to rotate · Scroll / pinch to zoom · Click a component for its dimensions';
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
    return cableRoutes.flatMap((r,index)=>{const envelope=b.clone().expandByScalar(r.radius);const hits=r.samples.filter(p=>envelope.containsPoint(p)).length;return hits?[{index,part:r.part,samplesInside:hits}]:[]});
  }
  window.enclosureDiagnostics=()=>({units:dimensions.units,camera:camera.position.toArray(),zoom:camera.zoom,mode:$('model-shell').value,selected:activePart,cadSize:cad.bounds.size,projectedMeter:V(parts.meter.position).project(camera).toArray(),meterSize:parts.meter.size,meshCount:picking.length,triangles:renderer.info.render.triangles,wiresVisible:wires.visible,lidOffset:lidObjects[0].position.y,shellVisible:shellObjects[0].visible,shellOpacity:shellMat.opacity,fitBodies:boundsOf(fitBodies),planBodies:boundsOf({...planBodies,...fitBodies}),voltageLeadLengths,breakerTerminals:breakerTerminals.map(m=>m.position.toArray()),breakerMounts:breakerMounts.map(m=>m.position.toArray()),assemblyStage,panelInsertionOffset:groups.panel.position.y,visibleGroups:Object.entries(groups).filter(([,g])=>g.visible).map(([id])=>id),lidVisible:lidObjects[0].visible,meterRouteIntrusions:meterRouteIntrusions()});
}
start().catch(error=>{
  console.error(error);$('model-loading').hidden=true;
  status.textContent='3D could not load on this device. The dimension schedule and 2D wiring below are still available. Try a browser with WebGL enabled.';
  host.dataset.ready='error';
});
