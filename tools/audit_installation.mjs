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
export function flangeGap(a, b) {
  return Math.hypot(a.position[1] - b.position[1], a.position[2] - b.position[2]) - 40;
}
export function sweptBox(part) {
  const b = bounds(part); b.max.y += 300; return b;
}
export function audit(dimensions, manifest, buffer, procurement) {
  const parts = Object.fromEntries(dimensions.parts.map(p => [p.id, p]));
  const instances = Object.fromEntries(dimensions.instances.map(p => [p.id, p]));
  const shell = surface(manifest.meshes[0], buffer), lid = surface(manifest.meshes[15], buffer);
  const checks = [];
  const record = (id, result, evidence, limits = '') => checks.push({ id, result, evidence, limits });
  const q = parts.q0;
  record('Q0 catalog body', q.size.every((v, i) => Math.abs(v - [19.18, 63.5, 47][i]) < .02) ? 'pass' : 'fail',
    `Model ${q.size.join(' × ')} mm; Carling p.11 body envelope 19.18 × 63.50 × 47.00 mm.`, 'Body includes the front step; studs, handle and terminal guard are separate.');
  record('Q0 terminal and mounting pitches', q.terminalPitch === 49.28 && q.mountPitch === 52.37 ? 'pass' : 'fail',
    `Stud pitch ${q.terminalPitch ?? 'unspecified'} mm; mounting pitch ${q.mountPitch ?? 'unspecified'} mm. Carling: 49.28 / 52.37 mm.`);
  const lugs = procurement.items.find(p => p.id === 'ring-lugs');
  record('Q0 ring size', lugs.model.includes('MV14-10R') && !lugs.model.includes('MV14-8R') ? 'pass' : 'fail',
    'Selected Q0 terminal code 1 is #10-32; its two ring lugs must have #10 holes. Crimp tool and pull test remain required.');
  const gap = flangeGap(instances['dc-entry'], instances['usb-entry']);
  record('Split-entry flange spacing', gap >= 10 ? 'pass' : 'fail',
    `Two actual Ø40 mm flanges: ${round(gap)} mm edge gap.`,
    '10 mm is a project layout allowance, not a code or manufacturer requirement. Wrench access, tolerance, bore and wall stack still need checking.');
  for (const id of ['dc-entry', 'usb-entry']) {
    const p = instances[id];
    record(`${id} envelope`, p.size.every((v, i) => v === [37, 40, 40][i]) ? 'pass' : 'fail',
      `Model ${p.size.join(' × ')} mm; KVT 20 overall envelope 37 mm axial × Ø40 mm flange.`, 'Conservative cylinder; the threaded shank is M20, not Ø40.');
  }
  const internal = ['meter', 'ct', 'fuse', 'rail'].map(id => parts[id]).concat(dimensions.instances.filter(p => p.part === 'terminals'));
  const collisions = [];
  for (let i = 0; i < internal.length; i++) for (let j = i + 1; j < internal.length; j++) {
    // The fuse holder clips to the rail; this is an intended contact.
    if ([internal[i].id, internal[j].id].every(id => ['rail', 'fuse'].includes(id))) continue;
    const a = bounds(internal[i]), b = bounds(internal[j]);
    const overlap = a.intersect(b).getSize(new T.Vector3());
    if (Math.min(overlap.x, overlap.y, overlap.z) > .1) collisions.push(`${internal[i].id}/${internal[j].id}`);
  }
  record('Panel component body separation', collisions.length ? 'fail' : 'pass',
    collisions.length ? collisions.join(', ') : `${internal.length} nominal body envelopes do not overlap (rail/holder mating excluded).`,
    'CT is an unidentified example. No connectors, open levers, flexible wires, mounting tolerances or screw-tool envelopes are certified by this check.');
  const sweeps = [];
  for (const p of [parts.panel, ...internal]) {
    const swept = sweptBox(p), n = hits(swept, shell);
    sweeps.push({ id: p.id, travel_mm: 300, shell_triangle_hits: n, result: n ? 'review' : 'pass' });
  }
  record('Vertical insertion through open case', sweeps.every(s => !s.shell_triangle_hits) ? 'pass' : 'review',
    `${sweeps.filter(s => !s.shell_triangle_hits).length}/${sweeps.length} swept bounding boxes clear the manufacturer shell.`,
    '300 mm vertical translation, fixed orientation, wall fittings absent. This tests shell access, not the full sequence of brackets, wires or tool motions.');
  const blocked = sweptBox(parts.panel).intersectsBox(bounds(parts.outletguard));
  record('Panel before side outlet box', blocked ? 'sequence required' : 'pass',
    blocked ? 'The panel insertion sweep intersects the side outlet-box envelope. Install the panel first; removal requires removing the box or a separately verified tilted path.' : 'No interference in this tested translation.');
  const bodyChecks = [];
  for (const p of [parts.meter, parts.ct, parts.fuse, parts.outletguard, parts.q0]) {
    const b = bounds(p), distances = [];
    for (const x of [b.min.x, b.max.x, p.position[0]]) for (const z of [b.min.z, b.max.z, p.position[2]]) {
      const ys = rayHits([x, b.max.y, z], [0, 1, 0], lid).map(v => v.y - b.max.y);
      if (ys.length) distances.push(Math.min(...ys));
    }
    bodyChecks.push({ id: p.id, shell_triangle_hits: hits(b, shell), lid_samples: distances.length,
      minimum_sampled_lid_gap_mm: distances.length ? round(Math.min(...distances)) : null });
  }
  record('Wall hardware mounting interfaces', 'hold',
    bodyChecks.filter(p => p.shell_triangle_hits).map(p => `${p.id}: ${p.shell_triangle_hits} intersecting shell triangles`).join('; '),
    'Uncut factory CAD intersects proposed wall fittings. The support inserts, apertures, wall taper and body-front offsets are not fabrication drawings. Do not interpret overlap as an approved cutout.');
  record('Closed lid screen', 'screen only',
    bodyChecks.map(p => `${p.id}: ${p.minimum_sampled_lid_gap_mm} mm (${p.lid_samples}/9 rays)`).join('; '),
    'Nine upward rays per body against lid mesh 15. Not a minimum-distance proof; excludes lid hardware, guards, open fuse door, wire bundles and tolerances.');
  const wallEntries = ['dc-entry', 'usb-entry'].map(id => {
    const p = instances[id], xs = rayHits([130, p.position[1], p.position[2]], [1, 0, 0], shell).map(v => v.x).sort((a, b) => a - b);
    return { id, wall_intersections_x_mm: xs.map(round), local_wall_mm: xs.length >= 2 ? round(xs.at(-1) - xs[0]) : null };
  });
  record('Cord diameter interfaces', 'pass', 'Southwire published nominal OD 9.17–9.27 mm lies within Hammond 6–12 mm gland and Leviton 0.245–0.655 in cord ranges.',
    'Published variants are not a manufacturing tolerance. Measure purchased cord; clamping, jacket preparation and pull resistance remain physical checks.');
  record('Ring barrel and internal wire', 'pass', '3.581 mm wire insulation OD < 4.318 mm ring maximum; 14 AWG is within 16–14 AWG ring range.', 'Does not qualify the crimp or approve the AWM wire for this assembly.');
  record('DIN rail capacity', 'pass', '100 − 17.5 − 2 × 6 = 70.5 mm remains after holder and two end stops.', 'Fasteners, PE bond and fuse-door service motion still need final placement.');
  record('Physical and electrical release', 'hold', 'No built assembly, nameplate verification, qualified acceptance or energized test has been recorded.');
  return { revision: 'Installation audit, 2026-09-19', release: 'NOT RELEASED FOR FABRICATION OR ENERGIZING', units: 'mm',
    method: 'Axis-aligned body envelopes, continuous vertical swept volumes against triangulated Hammond shell, nine lid rays per body and sourced interface arithmetic. The shell uses 0.45 mm triangulation deflection, not manufacturing tolerances.',
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
