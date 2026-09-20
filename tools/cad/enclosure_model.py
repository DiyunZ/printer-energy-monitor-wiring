"""ELITEpro enclosure build-package A. Units: mm; X across, Y up, Z front.
Process: drill/mill purchased Hammond PCJ16148CC polycarbonate shell and
14R1513 steel panel. Deburr; preserve original cover/gasket/support geometry.
Vendor interfaces are NOT in the skill's standards registry. Sources:
Hammond PCJ16148CC STEP (shell solid 0, panel solid 33, no scaling);
Carling C-Series p.11 rectangular cutout and 52.37 pitch;
Leviton 5279-C instruction sheet 43.66..44.45 bore / 53.57 pitch;
Hammond 1427NCGPG13LB 21.0 bore; icotek 45026 32.3 bore.
Carrier fixing holes are intentionally transfer-drilled from actual 221-505
parts: the published drawing does not locate their longitudinal datum.
REVIEW model, not unconditional machining/electrical release; see Build_Package.md.
Run: python tools/cad/enclosure_model.py --source-step PCJ16148CC.step
Optional --cache DIR accepts BREP generated from that same vendor source.
"""
from pathlib import Path
import argparse, hashlib, json, math, os, struct
from build123d import (BuildPart, BuildSketch, Mode, Plane, Locations, Circle,
                      Rectangle, SlotOverall, add, extrude, import_step,
                      import_brep, export_brep, export_step, export_stl,
                      Pos, Rot, Part)

# INTERFACE: manufacturer drawing/STEP, not a bundled standard.
wall_slope = .016353 / .999866
front_reference_mm = (77.634259, 206.725339)
side_reference_mm = (74.854341, 181.279873)
wall_normal_thickness_mm = 4.7752
q0_rectangle_mm = (10.97, 36.78)
q0_hole_d_mm = 3.96
q0_pitch_mm = 52.37
xa_bore_d_mm = 44.0
xa_pitch_mm = 53.57
xa_fixing_d_mm = 4.0
power_entry_d_mm = 21.0
split_entry_d_mm = 32.3
panel_thickness_mm = 1.89738
# DESIGN: project locations and tooling allowances.
cut_depth_mm = 20.0
q0_xy_mm = (-112.0, 120.0)
xa_yz_mm = (121.0, 13.0)
supply_yz_mm = (43.0, 128.0)
printer_xy_mm = (0.0, 36.0)
dc_yz_mm = (78.0, 106.0)
rail_holes_xz_mm = [(-95.0, -28.0), (-15.0, -28.0)]
panel_bond_xz_mm = (-125.0, 60.0)
rail_bond_xz_mm = (-27.0, -28.0)
anchor_holes_xz_mm = [(-153,80),(8,-175),(38,-151),(-79,130),(9,130),(145,158)]
strap_slots_xz_mm = [(50,-70),(132,-70),(50,50),(132,50)]
strap_slot_mm = (21.0, 4.0)
m4_clear_d_mm = 4.5
bond_clear_d_mm = 5.3
source_transform_y_mm = 181.7624
mesh_tolerance_mm = .3
mesh_angle = .3
cache_dir = None
source_step = None


def interfaces():
    return []  # Vendor dimensions checked below; no unrelated labware declaration.


def frames():
    c = 1 / math.sqrt(1 + wall_slope ** 2)
    s = wall_slope * c
    front = lambda y: front_reference_mm[1] + wall_slope * (y - front_reference_mm[0])
    right = lambda y: side_reference_mm[1] + wall_slope * (y - side_reference_mm[0])
    def face(name, p):
        if name == 'front':
            return Plane((p[0],p[1],front(p[1])), x_dir=(1,0,0), z_dir=(0,-s,c))
        if name == 'rear':
            return Plane((p[0],p[1],-front(p[1])), x_dir=(-1,0,0), z_dir=(0,-s,-c))
        if name == 'right':
            return Plane((right(p[0]),p[0],p[1]), x_dir=(0,0,-1), z_dir=(c,-s,0))
        return Plane((-right(p[0]),p[0],p[1]), x_dir=(0,0,1), z_dir=(-c,-s,0))
    return face


def wall_features():
    f = frames()
    result = [dict(id='Q0 toggle', wall='front', plane=f('front',q0_xy_mm),
                   rect=q0_rectangle_mm, tolerance_mm=.12)]
    for sign in [-1,1]:
        result.append(dict(id=f'Q0 fixing {sign:+}',wall='front',plane=f('front',q0_xy_mm),
                           at=(0,sign*q0_pitch_mm/2), diameter=q0_hole_d_mm, tolerance_mm=.12))
    result.append(dict(id='XA outlet',wall='right',plane=f('right',xa_yz_mm),diameter=xa_bore_d_mm,tolerance_mm=.15))
    for sign in [-1,1]:
        result.append(dict(id=f'XA fixing {sign:+}',wall='right',plane=f('right',xa_yz_mm),
                           at=(0,sign*xa_pitch_mm/2),diameter=xa_fixing_d_mm,tolerance_mm=.1))
    for name,wall,p,d in [('SUPPLY','left',supply_yz_mm,power_entry_d_mm),
        ('OUTPUT','rear',printer_xy_mm,power_entry_d_mm),('DC','right',dc_yz_mm,split_entry_d_mm)]:
        result.append(dict(id=name,wall=wall,plane=f(wall,p),diameter=d,tolerance_mm=.1))
    return result


def panel_features():
    p = Plane((0,0,0),x_dir=(1,0,0),z_dir=(0,-1,0))
    result = [dict(id=f'Rail fixing {i+1}',plane=p,at=pt,diameter=m4_clear_d_mm)
              for i,pt in enumerate(rail_holes_xz_mm)]
    result += [dict(id=f'Tie anchor {i+1}',plane=p,at=pt,diameter=m4_clear_d_mm)
               for i,pt in enumerate(anchor_holes_xz_mm)]
    result += [dict(id='Panel PE bond',plane=p,at=panel_bond_xz_mm,diameter=bond_clear_d_mm)]
    result += [dict(id='Rail PE through panel',plane=p,at=rail_bond_xz_mm,diameter=bond_clear_d_mm)]
    result += [dict(id=f'Strap slot {i+1}',plane=p,at=pt,slot=strap_slot_mm)
               for i,pt in enumerate(strap_slots_xz_mm)]
    return result


def originals():
    if cache_dir and (Path(cache_dir)/'case.brep').exists():
        return [import_brep(Path(cache_dir)/(n+'.brep')) for n in ['case','panel']]
    if not source_step:
        raise ValueError('Provide --source-step with the Hammond factory STEP.')
    source = import_step(source_step)
    if len(source.solids()) != 38:
        raise ValueError('Vendor assembly changed; review solid mapping.')
    bodies = [Pos(0,source_transform_y_mm,0)*Rot(X=-90)*source.solids()[i] for i in [0,33]]
    if cache_dir:
        Path(cache_dir).mkdir(exist_ok=True,parents=True)
        for n,s in zip(['case','panel'],bodies): export_brep(s,Path(cache_dir)/(n+'.brep'))
    return bodies


def machine(original, features):
    with BuildPart() as model:
        add(original)
        for f in features:
            with BuildSketch(f['plane']):
                with Locations(f.get('at',(0,0))):
                    if 'rect' in f: Rectangle(*f['rect'])
                    elif 'slot' in f: SlotOverall(*f['slot'],rotation=90)
                    else: Circle(f['diameter']/2)
            extrude(amount=cut_depth_mm,both=True,mode=Mode.SUBTRACT)
    return model.part


def build_parts():
    case,panel=originals()
    return machine(case,wall_features()),machine(panel,panel_features())


def build() -> Part:
    with BuildPart() as assembly:
        for p in build_parts(): add(p)
    return assembly.part


def checks():
    # Absolute independent go-gauges, not a restatement of the hole parameters.
    return [
      {'feature':'XA 42.9 mm body clears bore', 'clear':{'cylinder':42.9,'axis':'x','at':[(121,13)],'span':(170,190)}},
      {'feature':'KVT M32 shanks clear', 'clear':{'cylinder':32.0,'axis':'x','at':[(78,106)],'span':(168,190)}},
      {'feature':'19.05 mm strap passes slots', 'clear':{'box':(2.0,6.0,19.3),'at':[(x,0,z) for x,z in strap_slots_xz_mm]}},
      {'feature':'M4 rail screws clear', 'clear':{'cylinder':4,'axis':'y','at':[(-95,-28),(-15,-28)],'span':(-2,4)}},
    ]


def update_meshes(parts, destination):
    # Preserve all original lid / gasket / fastener meshes; replace only the two machined solids.
    root=Path(__file__).resolve().parents[2]
    meta=json.loads((root/'assets/enclosure.json').read_text())
    old=(root/'assets/enclosure.bin').read_bytes()
    chunks=[];offset=0
    for i,m in enumerate(meta['meshes']):
        if i in [0,33]:
            vertices,triangles=parts[[0,33].index(i)].tessellate(mesh_tolerance_mm,mesh_angle)
            xyz=[n for v in vertices for n in tuple(v)]
            faces=[n for tri in triangles for n in tri]
            p=struct.pack('<'+'f'*len(xyz),*xyz); inds=struct.pack('<'+'I'*len(faces),*faces)
            m['positionCount']=len(xyz);m['indexCount']=len(faces)
        else:
            p=old[m['positionOffset']:m['positionOffset']+m['positionCount']*4]
            inds=old[m['indexOffset']:m['indexOffset']+m['indexCount']*4]
        m['positionOffset']=offset;m['indexOffset']=offset+len(p)
        chunks += [p,inds];offset += len(p)+len(inds)
    meta['fabrication']='Project openings in shell 0 and panel 33; build123d 0.11.1, 0.3 mm tessellation; other meshes retained. Carrier fixing holes transfer-drilled, not in mesh.'
    destination.mkdir(exist_ok=True,parents=True)
    (destination/'enclosure.bin').write_bytes(b''.join(chunks))
    (destination/'enclosure.json').write_text(json.dumps(meta,indent=2)+'\n')


def main():
    global cache_dir,source_step
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-step');parser.add_argument('--cache')
    parser.add_argument('--output',default=str(Path(__file__).resolve().parents[2]/'fabrication'))
    a=parser.parse_args();cache_dir=a.cache;source_step=a.source_step
    target=Path(a.output);target.mkdir(exist_ok=True,parents=True)
    parts=build_parts();report=[]
    for name,p in zip(['case-machined','panel-machined'],parts):
        if not p.is_valid: raise ValueError(name+' invalid solid')
        export_step(p,target/(name+'.step'))
        export_stl(p,target/(name+'.stl'),tolerance=mesh_tolerance_mm,angular_tolerance=mesh_angle)
        report.append(dict(id=name,valid=p.is_valid,solids=len(p.solids()),volume_mm3=p.volume,bounds_mm=list(p.bounding_box().size)))
    # Boolean clearance measured against the exported design; each cutter must remove stock.
    original=originals()
    for idx,features in enumerate([wall_features(),panel_features()]):
        for f in features:
            cut=machine(original[idx],[f])
            removed=original[idx].volume-cut.volume
            if removed<1: raise ValueError(f['id']+' did not remove stock')
            report.append(dict(id=f['id'],removed_mm3=removed,result='pass'))
    # Independent exact-shape gauges checked through the local wall planes.
    for f in wall_features():
        with BuildPart() as gauge:
            with BuildSketch(f['plane']):
                with Locations(f.get('at',(0,0))):
                    if 'rect' in f: Rectangle(10.8,36.5)
                    else: Circle((f['diameter']-.2)/2)
            extrude(amount=cut_depth_mm,both=True)
        interference=parts[0].intersect(gauge.part)
        volume=0 if interference is None else interference.volume
        if volume>1e-4: raise ValueError(f['id']+' blocked')
        report.append(dict(id=f['id']+' through gauge',intrusion_mm3=volume,result='pass'))
    # Independent strap width/thickness and M4 shaft gauges at the panel interfaces.
    panel_plane = Plane((0,0,0),x_dir=(1,0,0),z_dir=(0,-1,0))
    for name,at,rect,diameter in (
        [(f'Strap {i+1} 19.3 x 2.0 mm gauge',p,(2.0,19.3),None)
         for i,p in enumerate(strap_slots_xz_mm)] +
        [(f'Rail {i+1} M4 gauge',p,None,4.0)
         for i,p in enumerate(rail_holes_xz_mm)] +
        [(f'Anchor {i+1} M4 gauge',p,None,4.0)
         for i,p in enumerate(anchor_holes_xz_mm)] +
        [('Rail PE #10 shaft gauge',(-27,-28),None,4.83)]):
        with BuildPart() as gauge:
            with BuildSketch(panel_plane):
                with Locations(at):
                    if rect: Rectangle(*rect)
                    else: Circle(diameter/2)
            extrude(amount=4,both=True)
        interference=parts[1].intersect(gauge.part)
        volume=0 if interference is None else interference.volume
        if volume>1e-4: raise ValueError(name+' blocked')
        report.append(dict(id=name,intrusion_mm3=volume,result='pass'))
    (target/'cad-checks.json').write_text(json.dumps({'units':'mm','status':'Digital geometry checks only; open release conditions in build.html',
        'source_step_sha256': hashlib.sha256(Path(source_step).read_bytes()).hexdigest() if source_step else None,
        'unchecked_standard_interfaces':'Vendor interfaces outside bundled standards database; dimensions from linked drawings, no physical qualification.',
        'results':report},indent=2)+'\n')
    features=[]
    for f in wall_features():
        q=f['plane'].from_local_coords((*f.get('at',(0,0)),0))
        features.append({k:v for k,v in f.items() if k!='plane'}|{'center_xyz_mm':tuple(q),'normal':tuple(f['plane'].z_dir)})
    (target/'wall-openings.json').write_text(json.dumps(features,indent=2)+'\n')
    update_meshes(parts,Path(__file__).resolve().parents[2]/'assets')
    print('Exported two machined solids; all '+str(len(report)-2)+' cut / through gauges passed.',flush=True)

if __name__=='__main__': main()
