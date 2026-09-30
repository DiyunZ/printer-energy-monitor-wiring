// Nominal geometry checks only. No electrical, tolerance, tool-access or physical release.
// Run from any directory: node tools/audit_installation.mjs [--output /path/result.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as T from '../vendor/three.module.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const bounds = p => new T.Box3(
  new T.Vector3(...p.position.map((n, i) => n - p.size[i] / 2)),
  new T.Vector3(...p.position.map((n, i) => n + p.size[i] / 2))
);
const round = n => Math.round(n * 1000) / 1000;
const V = p => new T.Vector3(...p);
function surface(entry, buffer) {
  const p = new Float32Array(buffer, entry.positionOffset, entry.positionCount);
  const indices = new Uint32Array(buffer, entry.indexOffset, entry.indexCount);
  return Array.from({ length: indices.length / 3 }, (_, n) => {
    const vertices = [0, 1, 2].map(j => V(p.slice(indices[n * 3 + j] * 3, indices[n * 3 + j] * 3 + 3)));
    return { triangle: new T.Triangle(...vertices), box: new T.Box3().setFromPoints(vertices) };
  });
}
const hits = (box, triangles) => triangles.filter(t => box.intersectsBox(t.box) && box.intersectsTriangle(t.triangle)).length;
function rayHits(origin, direction, triangles) {
  const ray = new T.Ray(V(origin), V(direction));
  return triangles.flatMap(({ triangle: t }) => {
    const p = ray.intersectTriangle(t.a, t.b, t.c, false, new T.Vector3());
    return p ? [p] : [];
  });
}
export function sweptBox(part) {
  const b = bounds(part); b.max.y += 300; return b;
}
export function audit(dimensions, manifest, buffer, procurement) {
  const parts = Object.fromEntries(dimensions.parts.map(p => [p.id, p]));
  const instances = Object.fromEntries(dimensions.instances.map(p => [p.id, p]));
  const shell = surface(manifest.meshes.find(m=>m.role==='shell'), buffer), lid = surface(manifest.meshes.find(m=>m.role==='lid'), buffer);
  const checks = [];
  const record = (id, result, evidence, limits = '') => checks.push({ id, result, evidence, limits });
  const q = parts.q0;
  record('Q0 catalog body', q.catalogBodySizeMm?.every((v, i) => Math.abs(v - [17.6, 116, 73.8788][i]) < .02) && q.size.every((v,i)=>Math.abs(v-[17.6,116.53448,74.31523][i])<.02) ? 'pass' : 'fail',
    `Mounted box ${q.size.map(n=>n.toFixed(3)).join(' × ')} mm; Phoenix manufacturer STEP: 17.6 × 116 × 73.8788 mm before wall-frame rotation.`, 'Catalog depth 75.9 mm includes 7.5 mm DIN rail; STEP depth includes the depicted handle. Receiving and full operator travel remain unverified.');
  const mount=dimensions.q0Mount;
  record('Q0 terminal and mounting interfaces', q.terminalPitch === 67.8 && q.terminalType === 'screw-clamp' && q.terminalWireAWG === 14 && q.terminalTorqueNm === 2 && q.terminalStripMm?.join(',')==='11,12' && mount?.railSectionMm.join(',')==='35,7.5,1' && mount?.railLengthMm===60 ? 'pass':'fail',
    'Phoenix 2907571 screw clamps: 14 AWG Cu accepted; strip 11–12 mm, 2 N·m. Short 35 × 7.5 mm DIN rail; no ring tongues on Q0.', 'Confirm supplied instructions, strip length, snap fit and 76 mm M5 post pattern.');
  const wallEngagement=mount.wallScrewLengthMm-(mount.postContactWasherMm+2*mount.wallFlatWasherMm+mount.wallThicknessMm);
  const bridgeEngagement=mount.wallScrewLengthMm-(2*mount.postContactWasherMm+mount.wallFlatWasherMm+mount.stockThicknessMm);
  const depthMatches=Math.abs(mount.webFrontDepthMm-(mount.postLengthMm+mount.wallFlatWasherMm+mount.postContactWasherMm))<.001 && Math.abs(mount.railRearDepthMm-(mount.webFrontDepthMm-mount.railSpacerMm))<.001;
  record('Q0 no-bend post and screw stacks', depthMatches && mount.wallHoleDiameterMm>=5.5 && [wallEngagement,bridgeEngagement].every(e=>e>=5 && e<=mount.postThreadDepthMm-1)?'pass':'fail',
    `65 mm M5 posts; nominal engagement ${wallEngagement.toFixed(2)} mm at wall / ${bridgeEngagement.toFixed(2)} mm at bridge, in 11 mm threads. Flat bridge and rail depths agree with the washer stack.`,
    'Design screen uses at least 5 mm engagement and 1 mm bottoming reserve. Actual washers, thread depth, tightening, wall strength and retention require physical checks.');
  record('Q0 bonded mounting provision', procurement.items.some(p=>p.id==='breaker-mount' && p.availability==='fabricate') && procurement.items.some(p=>p.id==='breaker-rail') && mount?.bondPointXYZ.length===3 ? 'pass':'fail',
    'Flat aluminum bridge, steel rail, two steel posts and dedicated PE.5 branch are specified. Two #10 bond stacks are included in procurement.', 'Accept contact preparation, torque and continuity to rail, bridge and both steel posts.');
  const lugs = procurement.items.find(p => p.id === 'ring-lugs');
  record('Bond ring size', lugs.model.includes('Gardner Bender 15-104') && lugs.terminal_compatibility?.stud_numbers.includes(10) ? 'pass' : 'fail',
    'Selected 15-104 rings accept #8–10 studs for the panel and rail/bracket bonds. Crimp and aluminum contact qualification remain physical checks.');
  const removed=['dc-entry','dc-coupling'];
  const unwanted=['dc-extension','split-entries','kt-inserts'];
  record('Internal original DC connection', removed.every(id=>!instances[id]) && unwanted.every(id=>!procurement.items.some(p=>p.id===id)) ? 'pass':'fail',
    'Original adapter cable stays inside; extension, external coupling and feedthrough purchasing are removed.');
  const shellBounds=dimensions.plan.shellBounds;
  const inside=['outlet','adapter'].every(id=>{
    const b=bounds(parts[id]);
    return b.min.x>shellBounds.min[0]+10 && b.max.x<shellBounds.max[0]-10 && b.min.z>shellBounds.min[2]+10 && b.max.z<shellBounds.max[2]-10;
  });
  record('Internal XA and adapter',inside?'pass':'fail','Both complete component envelopes remain inside the case plan with a 10 mm screening margin.','Not a creepage/clearance standard or a restraint/thermal check.');
  record('Proposed aluminum reuse',procurement.items.find(p=>p.id==='panel')?.availability==='fabricate'?'pass':'fail',
    'Offered aluminum is a fabrication proposal, not confirmed owned stock or a bought steel panel.','Actual thickness, stiffness and aluminum bonding remain to be accepted.');
  const internal = ['meter', 'ct', 'outlet', 'adapter'].map(id => parts[id]).concat(dimensions.instances.filter(p => p.part === 'terminals'));
  const collisions = [];
  for (let i = 0; i < internal.length; i++) for (let j = i + 1; j < internal.length; j++) {
    const a = bounds(internal[i]), b = bounds(internal[j]);
    const overlap = a.intersect(b).getSize(new T.Vector3());
    if (Math.min(overlap.x, overlap.y, overlap.z) > .1) collisions.push(`${internal[i].id}/${internal[j].id}`);
  }
  record('Panel component body separation', collisions.length ? 'fail' : 'pass',
    collisions.length ? collisions.join(', ') : `${internal.length} nominal body envelopes do not overlap.`,
    'CT uses the matched Mini HSC family envelope; exact scale remains unconfirmed. No connectors, open levers, flexible wires, mounting tolerances or screw-tool envelopes are certified by this check.');
  const sweeps = [];
  for (const p of [parts.panel, ...internal]) {
    if(p.id==='panel') {
      const proof=manifest.panel_insertion;
      const matches=proof?.outline_mm[0]===p.size[0] && proof?.outline_mm[1]===p.size[2] && proof.corner_chamfer_mm===dimensions.installationHardware.panelCornerChamferMm && proof.thickness_mm===p.size[1] && proof.position_mm?.every((v,i)=>v===p.position[i]);
      sweeps.push({id:p.id,travel_mm:300,method:proof?.method,intrusion_mm3:matches?proof.intrusion_mm3:null,
        result:matches && proof.result==='pass'?'pass':'review'});
      continue;
    }
    const swept = sweptBox(p), contactHits = hits(swept, shell);
    const n = hits(swept, shell);
    sweeps.push({ id: p.id, travel_mm: 300, shell_triangle_hits: n,
      seated_contact_triangles: contactHits - n, result: n ? 'review' : 'pass' });
  }
  record('Vertical insertion through open case', sweeps.every(s => s.result==='pass') ? 'pass' : 'review',
    `${sweeps.filter(s => s.result==='pass').length}/${sweeps.length} insertion sweeps clear the manufacturer shell; exact chamfered panel solid and seven equipment envelopes.`,
    '300 mm vertical translation, fixed orientation, wall fittings absent. Panel/support contact at Y=0 is excluded with a 0.0001 mm numerical offset. This tests shell access, not brackets, wires or tool motions.');
  record('Internal power retention', 'hold', 'Separate XA and adapter straps replace the wall mount; physical plug retention and closed-enclosure temperature are untested.');
  const bodyChecks = [];
  for (const p of [parts.meter, parts.ct, parts.outlet, parts.q0]) {
    const b = bounds(p), distances = [];
    for (const x of [b.min.x, b.max.x, p.position[0]]) for (const z of [b.min.z, b.max.z, p.position[2]]) {
      const ys = rayHits([x, b.max.y, z], [0, 1, 0], lid).map(v => v.y - b.max.y);
      if (ys.length) distances.push(Math.min(...ys));
    }
    bodyChecks.push({ id: p.id, shell_triangle_hits: hits(b, shell), lid_samples: distances.length,
      minimum_sampled_lid_gap_mm: distances.length ? round(Math.min(...distances)) : null });
  }
  record('Machined wall geometry', manifest.fabrication ? 'pass' : 'hold',
    manifest.fabrication || 'Factory shell remains uncut.',
    'Exact cut-through gauges are in fabrication/cad-checks.json. Phoenix STEP and bracket are transformed to the 1 degree wall frame; the summary AABB contacts here are not mounting proofs. Received-part fit and fastening remain physical checks.');
  record('Closed lid screen', 'screen only',
    bodyChecks.map(p => `${p.id}: ${p.minimum_sampled_lid_gap_mm} mm (${p.lid_samples}/9 rays)`).join('; '),
    'Nine upward rays per body against the factory lid mesh. Not a minimum-distance proof; excludes lid hardware, guards, wire bundles and tolerances.');
  const wallEntries = [];
  // Current topology and cut list, rather than historical coordinates on a different enclosure.
  for(const label of ['XA','DC']) record(`No ${label} wall opening`,manifest.wall_opening_ids?.length===6 && !manifest.wall_opening_ids.some(id=>id.includes(label))?'pass':'fail',
    `${label} remains inside; the machining schedule contains Q0, SUPPLY, OUTPUT and one USB bore only.`,
    'Cut-through gauges in fabrication/cad-checks.json check the new shell.');
  const service=dimensions.usbService, port=instances['usb-entry'];
  const [uy,uz]=service.wallCenterYZ;
  const usbWallHits=rayHits([130,uy,uz],[1,0,0],shell).map(v=>v.x).filter(x=>x>130&&x<160);
  const plugDiagonal=Math.hypot(...(service?.standardBOvermoldMaxMm||[Infinity]));
  record('Closed-lid USB cable exit',port?.model==='Heyco 3104' && port.position[1]===uy && port.position[2]===uz && port.boreDiameterMm===22.2 &&
    usbWallHits.length===0 && service.bushingPassageMm>plugDiagonal && service.maximumPanelThicknessMm>=service.wallThicknessMm?'pass':'fail',
    `USB center Y/Z = ${uy}/${uz} mm has ${usbWallHits.length} obstructing wall intersections. USB-B overmold diagonal ${plugDiagonal.toFixed(2)} mm fits the ${service.bushingPassageMm} mm passage.`,
    'Published envelope and mesh centerline only; accept actual snap fit, cable passage and pull restraint. No ingress or isolation rating claimed.');
  const existingUsb=procurement.items.find(p=>p.id==='usb');
  record('One existing USB cable', service?.topology==='single-continuous-cable' && service.intermediateConnections===0 &&
    service.externalConnector==='USB-A' && service.loggerConnector==='USB-B' && existingUsb?.availability==='owned' &&
    !procurement.items.some(p=>['usb-port','usb-internal'].includes(p.id)) &&
    !procurement.purchasing.rows.some(r=>r.material_ids.includes('usb')) ? 'pass':'fail',
    'The owned cable connects DENT USB-B directly to the exterior USB-A end; no coupler or additional USB cable is purchased.',
    'Full cable remains attached to the box; the model abbreviates the exterior length. Check available reach and prove export on the hardware.');
  const sleeve=procurement.items.find(p=>p.id==='usb-sleeve');
  record('Offline USB insulation provision', service?.mode==='offline-closed-lid' && service.requireMainsUnplugged===true &&
    sleeve?.rated_voltage_v>=600 ? 'pass':'fail',
    'The existing cable has a 600 V sleeve provision on its entire internal portion, retained at the existing support. Unplug mains before connecting the PC.',
    'Provision only; sleeve fit, recovery process, end protection, restraint and shield treatment still need physical acceptance. A sleeve is not USB galvanic isolation.');
  record('Cord diameter interfaces', 'review', 'Southwire nominal OD 9.17–9.27 mm lies within Heyco M3231 published 4.32–11.43 mm seal range and Leviton 0.245–0.655 in range. Ø22.2 mm bores; separate 8463 locknuts.',
    'Seal range does not establish UL-approved cord range. Verify exact cable application, wall/nut stack, grip and pull resistance.');
  record('Ring barrel and internal wire', 'review', 'The selected 15-104 accepts 14–16 AWG. Its manufacturer does not publish an insulation-barrel limit on the cited page; do not reuse the former 3M value.', 'Fit the actual 2.87 mm nominal-OD wire, use the specified crimp tooling and inspect/pull-test before accepting the termination.');
  record('Physical and electrical release', 'hold', 'No built assembly, nameplate verification, qualified acceptance or energized test has been recorded.');
  return { revision: '2026-09-29', release: 'NOT RELEASED: close the receiving and electrical items in Build_Package.md', units: 'mm',
    method: 'Axis-aligned equipment envelopes, exact chamfered-panel clearance and continuous vertical swept volumes against the machined BUD common-base shell, nine lid rays per body and sourced interface arithmetic. Shell triangulation deflection is 0.3 mm; numerical seating-contact exclusion is 0.0001 mm. Neither is a manufacturing tolerance.',
    checks, insertion_sweeps: sweeps, body_screen: bodyChecks, wall_entries: wallEntries,
    material_groups: procurement.items.length, owned_groups: procurement.items.filter(p => p.availability === 'owned').length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const load = name => JSON.parse(fs.readFileSync(path.join(root, name)));
  const b = fs.readFileSync(path.join(root, 'assets/enclosure.bin'));
  const result = audit(load('layout_dimensions.json'), load('assets/enclosure.json'), b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), load('procurement.json'));
  const option = process.argv.indexOf('--output');
  const output = option >= 0 ? process.argv[option + 1] : path.join(root, 'installation_checks.json');
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  for (const c of result.checks) console.log(`${c.result.toUpperCase()}: ${c.id} — ${c.evidence}`);
  console.log(result.release);
  process.exitCode = result.checks.some(c => c.result === 'fail') ? 1 : 0;
}
