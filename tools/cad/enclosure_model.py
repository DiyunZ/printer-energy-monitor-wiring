"""Machining template for the BUD NBF-32126 enclosure and reused aluminum.
Units mm: X across, Y above panel underside, Z toward Q0.
Factory STEP linked on the NBF-32126 page supplies the NBF-32226 common
base, lid and two latches; opaque lid is an illustrative shared silhouette.
BUD drawing hbnbf32226.pdf specifies 3 mm walls and 229.8 x 325.3 mm
M5 support pattern. Factory STEP places centers 229.75 x 325.25 mm;
that 0.05 mm difference is inside the drawing's +/-1 mm tolerance.
The custom 260 x 340 mm panel has 10 mm corner chamfers to clear raised features.
Carling C-series and Heyco drawings define wall interfaces, outside the
skill's bundled standards database. No finished assembly certification.
Carrier holes are transfer-drilled from the received 221-505 carriers.
Run: python tools/cad/enclosure_model.py --source-step NBF-32126.step
"""
from pathlib import Path
import argparse, hashlib, json, math, struct
from build123d import (BuildPart, BuildSketch, Mode, Plane, Locations, Circle,
                      Rectangle, SlotOverall, add, extrude, import_step,
                      export_step, export_stl,
                      Pos, Rot, Part, Polygon)

# INTERFACE: manufacturer drawing/STEP, not a bundled standard.
wall_slope = math.tan(math.radians(1.0))
front_reference_mm = (50.315160, 193.495690)
side_reference_mm = (50.111830, 142.692040)
wall_normal_thickness_mm = 3.0
q0_rectangle_mm = (10.97, 36.78)
q0_hole_d_mm = 3.96
q0_pitch_mm = 52.37
power_entry_d_mm = 21.0
# Heyco thick-panel bushing 3104: manufacturer hole 22.2 mm. Actual
# cable plug passage and snap fit must be accepted before drilling.
usb_bore_d_mm = 22.2
usb_yz_mm = (55.0, 167.0)
panel_thickness_mm = 1.89738
# DESIGN: project locations and tooling allowances.
cut_depth_mm = 20.0
q0_xy_mm = (-107.0, 80.0)
supply_yz_mm = (43.0, 128.0)
printer_xy_mm = (0.0, 36.0)
panel_bond_xz_mm = (-110.0, 60.0)
anchor_holes_xz_mm = [(-122,80),(8,-163),(38,-151),(-79,130),(9,130),(122,154)]
strap_slots_xz_mm = [(40,-70),(122,-70),(40,50),(122,50)]
strap_slot_mm = (21.0, 4.0)
equipment_slots_xz_mm = [(-56,-65),(-56,-15),(-4.85,-77),(-4.85,-3)]
m4_clear_d_mm = 4.5
bond_clear_d_mm = 5.3
source_transform_y_mm = 119.30026
panel_outline_mm = (260.0,340.0)
panel_corner_chamfer_mm = 10.0
panel_supports_xz_mm = [(-114.875,-162.625),(114.875,-162.625),(-114.875,162.625),(114.875,162.625)]
mesh_tolerance_mm = .3
mesh_angle = .3
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
    for name,wall,p in [('SUPPLY','left',supply_yz_mm),('OUTPUT','rear',printer_xy_mm)]:
        result.append(dict(id=name,wall=wall,plane=f(wall,p),diameter=power_entry_d_mm,tolerance_mm=.1))
    result.append(dict(id='USB cable exit',wall='right',plane=f('right',usb_yz_mm),diameter=usb_bore_d_mm,tolerance_mm=.1))
    return result


def panel_features():
    p = Plane((0,0,0),x_dir=(1,0,0),z_dir=(0,-1,0))
    result = [dict(id=f'Tie anchor {i+1}',plane=p,at=pt,diameter=m4_clear_d_mm)
               for i,pt in enumerate(anchor_holes_xz_mm)]
    result += [dict(id='Panel PE bond',plane=p,at=panel_bond_xz_mm,diameter=bond_clear_d_mm)]
    result += [dict(id=f'Strap slot {i+1}',plane=p,at=pt,slot=strap_slot_mm)
               for i,pt in enumerate(strap_slots_xz_mm)]
    result += [dict(id=f'Power strap slot {i+1}',plane=p,at=pt,slot=strap_slot_mm,rotation=0)
               for i,pt in enumerate(equipment_slots_xz_mm)]
    # One locating bore and three slots accommodate the vendor drawing tolerance.
    for i,at in enumerate(panel_supports_xz_mm):
        result.append(dict(id=f'Panel mounting {i+1}',plane=p,at=at,
                           **({'diameter':6.0} if i==0 else {'slot':(8.0,6.0),'rotation':90})))
    return result


def factory_parts():
    if not source_step:
        raise ValueError('Provide the factory STEP linked on the BUD NBF-32126 page.')
    source=import_step(source_step)
    if len(source.solids()) != 4:
        raise ValueError('Vendor assembly changed; review the four-solid mapping.')
    return [Pos(0,source_transform_y_mm,0)*Rot(Y=-90)*p for p in source.solids()]


def panel_blank(height=panel_thickness_mm, y=0):
    x,z=(n/2 for n in panel_outline_mm);c=panel_corner_chamfer_mm
    outline=[(-x+c,-z),(x-c,-z),(x,-z+c),(x,z-c),(x-c,z),(-x+c,z),(-x,z-c),(-x,-z+c)]
    with BuildPart() as blank:
        with BuildSketch(Plane((0,y,0),x_dir=(1,0,0),z_dir=(0,1,0))):
            Polygon(*outline)
        extrude(amount=height)
    return blank.part


def intersection_volume(a,b):
    result=a.intersect(b)
    if result is None: return 0.0
    return result.volume if hasattr(result,'volume') else sum(p.volume for p in result)


def originals():
    return factory_parts()[0],panel_blank()


def machine(original, features):
    with BuildPart() as model:
        add(original)
        for f in features:
            with BuildSketch(f['plane']):
                with Locations(f.get('at',(0,0))):
                    if 'rect' in f: Rectangle(*f['rect'])
                    elif 'slot' in f: SlotOverall(*f['slot'],rotation=f.get('rotation',90))
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
      {'feature':'19.05 mm strap passes slots', 'clear':{'box':(2.0,6.0,19.3),'at':[(x,0,z) for x,z in strap_slots_xz_mm]}},
      {'feature':'M4 cable anchor screws clear', 'clear':{'cylinder':4,'axis':'y','at':anchor_holes_xz_mm,'span':(-2,4)}},
    ]


def update_meshes(parts, destination, panel_sweep):
    source=factory_parts()
    bodies=[parts[0],source[1],source[2],source[3],parts[1]]
    roles=['shell','lid','hardware','hardware','panel']
    names=['BUD NBF common base','Opaque cover silhouette','Latch 1','Latch 2','Reused aluminum panel']
    meta={'source':'https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/',
          'drawing':'https://www.budind.com/wp-content/uploads/2019/01/hbnbf32226.pdf',
          'units':'mm','conversion':'Factory STEP; rotate Y -90 deg, translate Y +119.30026 mm. No scaling. build123d 0.11.1.',
          'fabrication':'BUD common shell and custom aluminum panel machined; lid and latches retained from linked factory STEP. Opaque-cover silhouette illustrative. Carrier holes transfer-drilled.',
          'panel_insertion':panel_sweep,
          'wall_opening_ids':[f['id'] for f in wall_features()],
          'meshes':[]}
    chunks=[];offset=0
    for p,role,name in zip(bodies,roles,names):
        vertices,triangles=p.tessellate(mesh_tolerance_mm,mesh_angle)
        xyz=[n for v in vertices for n in tuple(v)]; faces=[n for tri in triangles for n in tri]
        raw=struct.pack('<'+'f'*len(xyz),*xyz);inds=struct.pack('<'+'I'*len(faces),*faces)
        meta['meshes'].append(dict(name=name,role=role,positionOffset=offset,positionCount=len(xyz),
                                   indexOffset=offset+len(raw),indexCount=len(faces)))
        chunks += [raw,inds];offset += len(raw)+len(inds)
    bb=source[0].bounding_box()
    for p in source[1:]: bb=bb.add(p.bounding_box())
    meta['bounds']={'min':list(bb.min),'max':list(bb.max),'size':list(bb.size)}
    destination.mkdir(exist_ok=True,parents=True)
    (destination/'enclosure.bin').write_bytes(b''.join(chunks))
    (destination/'enclosure.json').write_text(json.dumps(meta,indent=2)+'\n')


def main():
    global source_step
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-step',required=True)
    parser.add_argument('--output',default=str(Path(__file__).resolve().parents[2]/'fabrication'))
    a=parser.parse_args();source_step=a.source_step
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
        [(f'Power strap {i+1} 19.3 x 2.0 mm gauge',p,(19.3,2.0),None)
         for i,p in enumerate(equipment_slots_xz_mm)] +
        [(f'Anchor {i+1} M4 gauge',p,None,4.0)
         for i,p in enumerate(anchor_holes_xz_mm)] +
        [('Panel PE #10 shaft gauge',panel_bond_xz_mm,None,4.83)] +
        [(f'Panel mount {i+1} M5 gauge',p,None,5.0) for i,p in enumerate(panel_supports_xz_mm)]):
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
    # The custom panel and all component bodies must clear the actual factory base.
    original_shell=original[0]
    intrusion=intersection_volume(parts[1],original_shell)
    if intrusion>1e-4: raise ValueError('Panel intersects factory shell: '+str(intrusion))
    report.append(dict(id='Custom panel to factory base',intrusion_mm3=intrusion,result='pass'))
    sweep_intrusion=intersection_volume(panel_blank(300+panel_thickness_mm-.0001,.0001),original_shell)
    if sweep_intrusion>1e-4: raise ValueError('Panel insertion blocked: '+str(sweep_intrusion))
    panel_sweep=dict(id='panel',travel_mm=300,outline_mm=list(panel_outline_mm),
        corner_chamfer_mm=panel_corner_chamfer_mm,thickness_mm=panel_thickness_mm,position_mm=[0,panel_thickness_mm/2,0],intrusion_mm3=sweep_intrusion,
        method='Exact chamfered blank swept vertically; support contact excluded by 0.0001 mm.',result='pass')
    report.append(panel_sweep)
    (target/'cad-checks.json').write_text(json.dumps({'units':'mm','status':'Digital geometry checks only; open release conditions in build.html',
        'source_step_sha256': hashlib.sha256(Path(source_step).read_bytes()).hexdigest() if source_step else None,
        'unchecked_standard_interfaces':'Vendor interfaces outside bundled standards database; dimensions from linked drawings, no physical qualification.',
        'results':report},indent=2)+'\n')
    features=[]
    for f in wall_features():
        q=f['plane'].from_local_coords((*f.get('at',(0,0)),0))
        features.append({k:v for k,v in f.items() if k!='plane'}|{'center_xyz_mm':tuple(q),'normal':tuple(f['plane'].z_dir)})
    (target/'wall-openings.json').write_text(json.dumps(features,indent=2)+'\n')
    update_meshes(parts,Path(__file__).resolve().parents[2]/'assets',panel_sweep)
    manifest={'generator':'tools/cad/enclosure_model.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'source_step_sha256':hashlib.sha256(Path(source_step).read_bytes()).hexdigest(),
        'source_url':'https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/',
        'outputs':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(target.glob('*-machined.*'))}}
    (target/'cad-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Exported two machined solids; all '+str(len(report)-2)+' cut / through gauges passed.',flush=True)

if __name__=='__main__': main()
