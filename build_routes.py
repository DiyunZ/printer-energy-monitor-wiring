"""Generate the concept netlist, two SVG drawings and static website."""
from pathlib import Path
from html import escape as E
import json
from draw_external import draw_external

OUT = Path(__file__).resolve().parent
REV = 'Rev. 8 · build package A · 2026-09-20'
C = {'L':'#202d3a','N':'#65758a','PE':'#18814a','CT':'#8544a5','USB':'#23739d','DC':'#aa621e','V':'#1567c1'}
# Shared physical placement. The SVG is an X/Z projection of the same millimetre
# coordinates consumed by layout3d.js. Electrical port symbols are spaced for clarity.
DIMENSIONS = json.loads((OUT/'layout_dimensions.json').read_text())
BODIES = {p['id']: p for p in DIMENSIONS['parts'] + DIMENSIONS['instances']}
PLAN = DIMENSIONS['plan']
SCALE = PLAN['scale']

def project(point):
    return tuple(round(o + SCALE*v, 5) for o,v in zip(PLAN['origin'], point))

def position(part, dx=0, dz=0):
    x,_,z = BODIES[part]['position']
    return round(x+dx,5), round(z+dz,5)

def pin(part, index):
    return position(part, -11.6+(index-1)*5.8, BODIES['terminals']['size'][2]/2)

M = {
 'IN.L':position('supply-entry',18.5,-12), 'IN.N':position('supply-entry',18.5), 'IN.PE':position('supply-entry',18.5,12),
 'Q0.IN':position('q0',-5,-BODIES['q0']['size'][2]/2-BODIES['q0']['studProjection']),
 'Q0.OUT':position('q0',5,-BODIES['q0']['size'][2]/2-BODIES['q0']['studProjection']),
 'OUT.L':position('printer-entry',0,-18.5), 'OUT.N':position('printer-entry',-4,-18.5), 'OUT.PE':position('printer-entry',-8,-18.5),
 'Fv.IN':position('fuse',0,-BODIES['fuse']['size'][2]/2), 'Fv.OUT':position('fuse',0,BODIES['fuse']['size'][2]/2),
 'D.L1':position('meter',23,-113), 'D.L2':position('meter',8,-113), 'D.N':position('meter',-23,-113),
 'D.+':position('meter',34.5,-93), 'D.-':position('meter',34.5,-75), 'D.USB':position('meter',16,118),
 'D.DC+':position('meter',-17,118), 'D.DC-':position('meter',-10,118),
 'CT.+':position('ct',-8,BODIES['ct']['size'][2]/2), 'CT.-':position('ct',8,BODIES['ct']['size'][2]/2),
 'PLATE':(-125,60), 'RAIL':position('rail',28), 'JV.1':pin('JV',1), 'JV.2':pin('JV',2),
 'JPE.B1':pin('PE',5), 'JPE.B2':pin('PE+',5),
 'AUX.L':position('outlet',-5,-10), 'AUX.N':position('outlet',-5), 'AUX.PE':position('outlet',-7,16),
 'AUX.FACE.L':position('outlet',22,-6.35), 'AUX.FACE.N':position('outlet',22,6.35),
 'PSU.L':position('adapter',0,-6.35), 'PSU.N':position('adapter',0,6.35),
 'PSU.DC+':position('adapter',21,12), 'PSU.DC-':position('adapter',21,18), 'PC':(280,180),
 **{f'JL.{i}':pin('JL',i) for i in range(1,5)},
 **{f'JN.{i}':pin('JN',i) for i in range(1,6)},
 **{f'JPE.{i}':pin('PE',i) for i in range(1,3)},
 **{f'JPE.{i+2}':pin('PE+',i) for i in range(1,5)},
}
A = {name:project(point) for name,point in M.items()}
# 01–19 and 24–25: installed conductors/cables; 20–23: factory plug/cable paths.
# Routing waypoints are intentionally rectilinear. Component locations are not rearranged for routing.
raw = [
 ('01','L','IN.L','Q0.IN',[(-137,116),(-137,144),(-117,144)],(-137,130),'Input hot → Q0 IN','main'),
 ('02','L','Q0.OUT','JL.1',[(-100,M['Q0.OUT'][1]),(-100,148),(-154,148),(-154,-103),(-136.6,-103)],(-154,88),'Q0 OUT → hot distribution JL','main'),
 ('03','L','JL.2','OUT.L',[(-115,-118.85),(-115,-123),(-12,-123),(-12,-175),(0,-175)],(-25,-123),'JL → printer hot; one pass through CT','main'),
 ('04','L','JL.3','Fv.IN',[(-125,-104),(-83,-104),(-83,-78),(-60,-78)],(-83,-89),'JL → Fv voltage-tap fuse','voltage'),
 ('05','V','JV.2','D.L1',[(-33.8,58),(-33,58),(-33,165),(40,165),(40,-156),(114,-156)],(40,-15),'JV → blue A1 → full lead → L1 (HOT)','voltage'),
 ('06','N','IN.N','JN.1',[(-170,128),(-170,-33),(-136.6,-33)],(-170,-12),'Input neutral → neutral distribution JN','neutral'),
 ('07','N','JN.2','OUT.N',[(-130.8,-36),(-148,-36),(-148,-176),(-4,-176)],(-148,-80),'JN → printer neutral; outside CT','neutral'),
 ('08','V','JN.3','D.L2',[(-125,-10),(-97,-10),(-97,38),(-24,38),(-24,159),(46,159),(46,-149),(99,-149)],(46,60),'JN → blue A2 → full lead → L2 (NEUTRAL)','voltage'),
 ('09','V','JN.4','D.N',[(-119.2,-17),(-91,-17),(-91,44),(-15,44),(-15,153),(52,153),(52,-142),(68,-142)],(52,125),'JN → blue A3 → full lead → N (NEUTRAL)','voltage'),
 ('10','PE','IN.PE','JPE.1',[(-145,140),(-145,35),(-136.6,35)],(-145,78),'Input PE → protective-earth distribution','earth'),
 ('11','PE','JPE.2','OUT.PE',[(-130.8,43),(-161,43),(-161,-185),(-8,-185)],(-161,-143),'PE → printer ground; outside CT','earth'),
 ('12','PE','JPE.3','PLATE',[(-86.6,77),(-125,77)],(-125,69),'PE → dedicated metal-plate bond','earth'),
 ('13','PE','JPE.4','RAIL',[(-80.8,85),(-18,85),(-18,-28)],(-18,15),'PE → dedicated metal-rail bond','earth'),
 ('14','CT','CT.+','D.+',[(-63,-102),(134,-102),(134,-101)],(35,-102),'CT white (+) → current-input CH1 +','signal'),
 ('15','CT','CT.-','D.-',[(-47,-95),(142,-95),(142,-83)],(16,-95),'CT black (−) → current-input CH1 −','signal'),
 ('16','USB','D.USB','PC',[(140,110),(140,BODIES['usb-entry']['position'][2]),(280,BODIES['usb-entry']['position'][2])],(235,BODIES['usb-entry']['position'][2]),'USB Type B → protected exit → ELOG computer','signal'),
 ('17','L','JL.4','AUX.L',[(-119.2,-163),(150,-163),(150,3)],(150,-128),'JL → AUX receptacle hot; before CT','aux'),
 ('18','N','JN.5','AUX.N',[(-105,-48.85),(-105,-154),(157,-154),(157,13)],(157,-50),'JN → AUX receptacle neutral','aux'),
 ('19','PE','JPE.5','AUX.PE',[(-75,93),(137,93),(137,38),(M['AUX.PE'][0],38)],(115,93),'PE → XA ground contact','earth'),
 ('20','L','AUX.FACE.L','PSU.L',[],(207,6.65),'Existing adapter AC blade: hot contact','aux'),
 ('21','N','AUX.FACE.N','PSU.N',[],(207,19.35),'Existing adapter AC blade: neutral contact','aux'),
 ('22','DC','PSU.DC+','D.DC+',[(254,25),(254,106),(150,106),(150,118),(74,118)],(254,72),'Original adapter → external DC coupling → round extension: center-positive path','aux'),
 ('23','DC','PSU.DC-','D.DC-',[(246,31),(246,111),(154,111),(154,125),(81,125)],(246,86),'Original adapter → external DC coupling → round extension: sleeve-negative path','aux'),
 ('24','L','Fv.OUT','JV.1',[(-60,22),(-39.6,22)],(-60,18),'Fv OUT → JV: 14 AWG transition before blue A1','voltage'),
 ('25','PE','JPE.B1','JPE.B2',[(-113.4,33),(-63.4,33)],(-106,33),'PE port 5 → PE+ port 5: required green bridge','earth'),
]
wires = [dict(id=n,kind=k,start=a,end=b,points=[A[a],*[project(p) for p in m],A[b]],badge=project(lab),description=d,group=g) for n,k,a,b,m,lab,d,g in raw]
CT_WINDOW = (*project(position('ct',-BODIES['ct']['size'][0]/2,-3)), *project(position('ct',BODIES['ct']['size'][0]/2,3)))

def validate():
    """Check connectivity, breaker-open behavior and CT geometry."""
    breakers={name.split('.')[0] for name in A if name.startswith('Q')}
    assert breakers=={'Q0'}
    assert [w['id'] for w in wires] == [f'{i:02}' for i in range(1,26)]
    for w in wires:
        if w['id'] in ['03','04','17']: assert w['start'].startswith('JL.'), 'Hot branches must start at JL after Q0, before CT'
    left,top,right,bottom = CT_WINDOW
    for w in wires:
        assert w['points'][0] == A[w['start']] and w['points'][-1] == A[w['end']]
        assert all(p[0] == q[0] or p[1] == q[1] for p,q in zip(w['points'],w['points'][1:])), w['id']
    hits=[]
    for w in wires:
        for p,q in zip(w['points'],w['points'][1:]):
            h=p[1]==q[1] and top<p[1]<bottom and max(p[0],q[0])>left and min(p[0],q[0])<right
            v=p[0]==q[0] and left<p[0]<right and max(p[1],q[1])>top and min(p[1],q[1])<bottom
            if h or v: hits.append(w['id'])
    assert hits == ['03'], f'Only printer hot may cross the CT aperture: {hits}'
    def graph(closed, fuse_closed=True):
        parent={x:x for x in A}
        def root(x):
            while parent[x] != x: x=parent[x]
            return x
        def join(x,y): parent[root(y)]=root(x)
        for w in wires: join(w['start'],w['end'])
        for prefix in ['JL.','JN.','JV.']:
            nodes=[x for x in A if x.startswith(prefix)]
            for node in nodes[1:]: join(nodes[0],node)
        for nodes in [('JPE.1','JPE.2','JPE.B1'),('JPE.3','JPE.4','JPE.5','JPE.6','JPE.B2')]:
            for node in nodes[1:]: join(nodes[0],node)
        for x,y in [('AUX.L','AUX.FACE.L'),('AUX.N','AUX.FACE.N')]: join(x,y)
        if fuse_closed: join('Fv.IN','Fv.OUT')
        if closed: join('Q0.IN','Q0.OUT')
        return root
    closed=graph(True)
    for w in wires:
        for name,point in A.items():
            if closed(name)==closed(w['start']): continue
            for p,q in zip(w['points'],w['points'][1:]):
                on_segment=(p[0]==q[0]==point[0] and min(p[1],q[1])<=point[1]<=max(p[1],q[1])) or (p[1]==q[1]==point[1] and min(p[0],q[0])<=point[0]<=max(p[0],q[0]))
                assert not on_segment, f'Wire {w["id"]} crosses an unrelated terminal dot: {name}'
    for node in ['OUT.L','D.L1','AUX.L','PSU.L']: assert closed(node)==closed('IN.L'), f'{node} must be supplied by hot through Q0'
    for node in ['OUT.N','D.L2','D.N','AUX.N','PSU.N']: assert closed(node)==closed('IN.N'), f'{node} must remain on neutral'
    for node in ['OUT.PE','AUX.PE','PLATE','RAIL']: assert closed(node)==closed('IN.PE'), f'{node} must remain on protective earth'
    assert len({closed(n) for n in ['IN.L','IN.N','IN.PE','D.+','D.-','D.DC+','D.DC-','PC']})==8, 'Mains, PE, CT, DC and USB nets must remain separate'
    opened=graph(False)
    for node in ['OUT.L','D.L1','AUX.L','PSU.L']: assert opened(node)!=opened('IN.L')
    for node in ['OUT.PE','AUX.PE','PLATE','RAIL']: assert opened(node)==opened('IN.PE')
    fuse_open=graph(True,False)
    assert fuse_open('D.L1')!=fuse_open('IN.L'), 'L1 sensing must not bypass Fv'
    for node in ['OUT.L','AUX.L']: assert fuse_open(node)==fuse_open('IN.L'), 'Fv must protect only the voltage tap'
    for i,w in enumerate(wires):
        for other in wires[i+1:]:
            for p,q in zip(w['points'],w['points'][1:]):
                for r,s in zip(other['points'],other['points'][1:]):
                    axis = 0 if p[1]==q[1]==r[1]==s[1] else 1 if p[0]==q[0]==r[0]==s[0] else None
                    if axis is not None:
                        overlap=min(max(p[axis],q[axis]),max(r[axis],s[axis]))-max(min(p[axis],q[axis]),min(r[axis],s[axis]))
                        assert overlap<=.01, f'Wire segments overlap: {w["id"]} / {other["id"]}'
    return dict(revision=REV,connection_count=len(wires),circuit_breaker_count=len(breakers),
        blue_adapters={'A1':'L1 / hot','A2':'L2 / neutral','A3':'N / neutral'},
        endpoints_and_orthogonal_routes=True,no_unrelated_terminal_dot_crossings=True,no_overlapping_wire_segments=True,only_printer_hot_through_CT=True,
        mains_neutral_PE_CT_DC_nets_separate=True,Q0_opens_all_downstream_hot_branches=True,
        PE_continuity_independent_of_Q0=True,aux_and_voltage_taps_before_CT=True,
        Fv_opens_only_L1_sensing=True,PE_bridge_explicit=True,
        lead_fuse_rating='KLKR.500T 0.5 A candidate; existing lead ratings and coordination required',
        physical_build_validated=False,protection_coordination_validated=False)

parts=[]
def add(s): parts.append(s)
def rect(x,y,w,h,fill='#fff',stroke='#c7d1db',r=8,extra=''):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" {extra}/>')
def text(x,y,s,size=20,color='#203346',weight=400,anchor='start'):
    add(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{E(s)}</text>')
def line(points,color='#718096',width=2,extra=''):
    add('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" {extra}/>')
def circle(x,y,r=6,fill='#fff',stroke='#718096',extra=''):
    add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2" {extra}/>')
def badge(x,y,num,k):
    rect(x-17,y-12,34,24,'#fff',C[k],5);text(x,y+6,num,16,C[k],700,'middle')
def start_svg(w,h,label,extra=''):
    parts.clear()
    add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{label}" {extra}>')
    add('<style>text{font-family:Arial,Helvetica,sans-serif}.wire{cursor:pointer;transition:opacity .15s}.muted{opacity:.09}.selected .core{stroke-width:9}.wire:focus{outline:none}.wire:focus .core{stroke-width:9}</style>')
    rect(0,0,w,h,'#fff','#fff',0)

def footprint(part, fill='#fff', stroke='#9eacb7', radius=4):
    """A component envelope, projected without any per-part stretching or relocation."""
    if part == 'case':
        bounds = PLAN['shellBounds']; low,high = bounds['min'],bounds['max']
        x,y = project((low[0],low[2])); w,h = SCALE*(high[0]-low[0]),SCALE*(high[2]-low[2])
    else:
        p=BODIES[part]; x,y=project(position(part,-p['size'][0]/2,-p['size'][2]/2))
        w,h=SCALE*p['size'][0],SCALE*p['size'][2]
    rect(x,y,w,h,fill,stroke,radius,extra=f'class="component-footprint" data-layout-id="{E(part)}"')
    return x,y,w,h

def at(part, label, dz=0, size=18, color='#203346', weight=600):
    x,y=project(position(part,0,dz)); text(x,y,label,size,color,weight,'middle')

def callout(part, label, x, y, edge='left', detail=None):
    px,py=project(position(part)); width=BODIES[part]['size'][0]*SCALE
    px += (-1 if edge=='left' else 1)*width/2
    end=x+8 if edge=='right' else x-8
    line([(px,py),(end,py),(end,y-7)],'#94a4b1',1.5,extra='stroke-dasharray="3 5"')
    anchor='end' if edge=='left' else 'start'
    text(x,y,label,21,weight=600,anchor=anchor)
    if detail: text(x,y+25,detail,16,'#63768a',anchor=anchor)

def make_diagram():
    start_svg(PLAN['width'],PLAN['height'],'ELITEpro enclosure wiring plan, aligned with the 3D top view',
        f'data-layout-scale="{SCALE}" data-layout-origin-x="{PLAN["origin"][0]}" data-layout-origin-y="{PLAN["origin"][1]}"')
    text(48,55,'Same enclosure. Same component positions.',34,weight=700)
    text(48,92,'TOP VIEW · Rear / printer exit above · Front / Q0 below · '+REV,20,color='#63768a')
    text(48,124,'Body footprints use the 3D X/Z coordinates. Terminal symbols are spaced for clarity; wires use straight routes.',19,color='#63768a')
    footprint('case','#edf1f4','#9dabb8',20)
    footprint('panel','#fafbfc','#b6c3cb',3)
    for i,(x,z) in enumerate(DIMENSIONS['installationHardware']['cableMountsXZ']):
        px,py=project((x-5.4,z-12))
        rect(px,py,10.8*SCALE,16*SCALE,'#edf0ea','#c3ccc4',2,extra=f'class="installation-detail" data-anchor="{i+1}"')
    text(1240,414,'REAR · PRINTER EXIT',19,'#63768a',600,'middle')
    text(1040,1490,'FRONT · Q0 HANDLE',19,'#63768a',600,'middle')
    # Existing molded cord ends and their entries, retained in the same locations as 3D.
    line([project(position('supply-plug',24)),project(position('supply-entry'))],'#465563',18)
    line([project(position('printer-entry')),project((0,-265)),project(position('printer-plug',0,25))],'#465563',18)
    for part in ['supply-plug','printer-plug']: footprint(part,'#e9c658','#b9972b',8)
    for part in ['supply-entry','printer-entry','dc-entry','usb-entry']: footprint(part,'#71808a','#46535b',5)
    footprint('dc-coupling','#e4d5bf','#8c7352',7)
    callout('dc-coupling','DC extension joint',1740,985,'right',detail='Outside · 5.5 / 2.1 mm')
    callout('supply-plug','FROM WALL',150,1215,'left',detail='Grounded plug')
    callout('printer-plug','TO PRINTER',1160,185,'right',detail='Grounded female connector')
    callout('dc-entry','DC cable entry',1740,1176,'right')
    callout('usb-entry','USB exit',1600,1410,'right')
    footprint('rail','#dce2e4','#9ba8b0',2)
    for dz in [-14,14]: line([project(position('rail',-50,dz)),project(position('rail',50,dz))],'#adb8be',2)
    stops=DIMENSIONS['installationHardware']['railStops']
    for x,_,z in stops['positions']:
        px,py=project((x-stops['size'][0]/2,z-stops['size'][2]/2))
        rect(px,py,stops['size'][0]*SCALE,stops['size'][2]*SCALE,'#c8cecb','#9ba8a4',1,extra='class="installation-detail"')
    slack=BODIES['lead-slack']; sx,sy=project(position('lead-slack'))
    add(f'<ellipse cx="{sx}" cy="{sy}" rx="{slack["size"][0]*SCALE/2}" ry="{slack["size"][2]*SCALE/2}" fill="#eef2f6" stroke="#acb8c2" stroke-dasharray="6 6"/>')
    for part in ['JL','JN','PE','PE+','JV']:
        footprint(part,'#edf0e9','#b6c1b4',4)
        x,z=position(part); bw,_,bd=BODIES['terminals']['size']
        px,py=project((x-bw/2,z-bd/2));rect(px,py,bw*SCALE,bd*SCALE,'#bfcaca','#7f9195',3)
        for i in range(5):
            px,py=project((x-13.75+i*5.8,z-6));rect(px,py,4.3*SCALE,12*SCALE,'#e58b3c','#bb6728',2)
        at(part,part if part in ['JL','JN','JV'] else 'PE 1' if part=='PE' else 'PE 2',21,16)
    # Connection 25 is the physical bridge between the two PE connectors.
    for part in ['JL','JN','PE','PE+','JV']:
        line([project(pin(part,1)),project(pin(part,5))],C['L'] if part in ['JL','JV'] else C['N'] if part=='JN' else C['PE'],4)
    footprint('fuse','#eee5cf','#a48b50',3);at('fuse','Fv',3,20)
    footprint('ct','#e8e6da','#9d9d8d',6)
    l,t,r,b=CT_WINDOW;rect(l,t,r-l,b-t,'#fff','#979e9f',0)
    at('ct','CT1',-6,17);at('ct','LOAD →',11,14)
    footprint('q0','#3c4a56','#273542',4);at('q0','Q0',3,20,'#fff')
    # Direct-mounted Q0 handle; its mounting pattern is in the fabrication package.
    px,py=project(position('q0',-6,32.14));rect(px,py,12*SCALE,15*SCALE,'#e9eeea','#63717a',2)
    footprint('outlet','#c9bbae','#a39284',2)
    px,py=project((182.04,13-31.75));rect(px,py,2.4*SCALE,63.5*SCALE,'#e7e5d9','#8397a5',2)
    footprint('adapter','#293744','#293744',6)
    at('adapter','AC/DC',-11,18,'#fff');at('adapter','ADAPTER',16,14,'#fff')
    bx,by,bw,bh=footprint('meter','#263748','#1c2b3a',11)
    rect(bx+4,by+20*SCALE,bw-8,bh-40*SCALE,'#126ab8','#0c589c',6,extra='id="elitepro-body"')
    at('meter','DENT',-31,31,'#fff',700);at('meter','ELITEpro XC',-12,18,'#fff')
    at('meter','216 × 63 mm',6,17,'#dbedff');at('meter','LOGGING',65,15,'#fff')
    # All terminal routes retain their validated electrical endpoints.
    for w in wires:
        n,k,p=w['id'],w['kind'],w['points']
        add(f'<g class="wire" id="wire-{n}" data-id="{n}" data-kind="{k}" tabindex="0" role="button" aria-label="{E(n+": "+w["description"])}"><title>{E(w["description"])}</title>')
        line(p,'#fff',10);line(p,C[k],4,extra='class="core" '+('stroke-dasharray="9 6"' if k in ('CT','USB') else ''))
        if k=='N': line(p,'#fff',1.6)
        if n=='23': line(p,'#fff',1.6,extra='stroke-dasharray="5 4"')
        for xy in (p[0],p[-1]):circle(*xy,4,'#fff',C[k])
        add('</g>')
    # Draw numbered badges after all paths so crossings cannot erase a number.
    for w in wires:
        add(f'<g class="wire" data-id="{w["id"]}" data-kind="{w["kind"]}">')
        badge(*w['badge'],w['id'],w['kind']);add('</g>')
    for i,n in enumerate(['05','08','09']):
        part=f'A{i+1}';add(f'<g class="wire" data-id="{n}" data-kind="V">')
        footprint(part,'#2382ca','#125387',3)
        p=BODIES[part];px,py=project(position(part,-4.4,8))
        rect(px,py,8.8*SCALE,26*SCALE,'#d1d0c4','#929385',3)
        at(part,part,1,13,'#fff',700);add('</g>')
    for prefix in ['JL.','JN.','JPE.','JV.']:
        for name,xy in A.items():
            if name.startswith(prefix):circle(*xy,3.7,C['L'] if prefix in ['JL.','JV.'] else C['N'] if prefix=='JN.' else C['PE'],'#fff')
    for name in ['PLATE','RAIL']:circle(*A[name],7,'#e9d69d','#9b7f40')
    add('<g style="paint-order:stroke;stroke:#fff;stroke-width:4;stroke-linejoin:round">')
    for name,label,dx,dy in [('D.N','N',0,-11),('D.L2','L2',0,-11),('D.L1','L1',0,-11),('D.+','CH1 +',12,-8),('D.-','CH1 −',12,17),('D.DC+','DC',0,-63),('D.USB','USB',0,-63)]:
        x,y=A[name];text(x+dx,y+dy,label,16,C['CT'] if 'CH1' in label else '#203346',600,'start' if 'CH1' in label else 'middle')
    add('</g>')
    callout('JL','JL · hot distribution',430,579,detail='Printer + Fv + adapter branches')
    callout('JN','JN · neutral',430,760)
    callout('PE','JPE · protective earth',430,956,detail='Two bridged PE connectors')
    callout('fuse','Fv · voltage-tap fuse',430,875,detail='On the bonded DIN rail')
    callout('outlet','XA · flanged outlet',1628,838,'right',detail='Dedicated outlet in right wall')
    callout('adapter','EXISTING ADAPTER',1670,927,'right',detail='Outside enclosure · plugs into XA')
    callout('q0','Q0 · ONE BREAKER',630,1585,'left',detail='Front wall · handle outside')
    callout('A2','A1 / A2 / A3',430,1085,detail='Blue voltage pigtails')
    text(880,1420,'Retained lead slack',17,'#63768a',500,'middle')
    text(1460,659,'CH1 symbols spaced',14,'#63768a');text(1460,681,'Actual socket ends: detail below',14,'#63768a')
    x,y=A['PC'];rect(x,y,106,76,'#edf4f8','#8d9eac',6);text(x+53,y+30,'PC',22,weight=700,anchor='middle');text(x+53,y+58,'ELOG',17,anchor='middle')
    # A real millimetre reference, plus panel extents from the same data source.
    x,y=project((-10,243));line([(x,y),(x+100*SCALE,y)],'#657b8e',3)
    for xx in [x,x+100*SCALE]:line([(xx,y-7),(xx,y+7)],'#657b8e',2)
    text(x+50*SCALE,y+29,'100 mm · all body footprints',17,'#63768a',anchor='middle')
    text(48,1665,'White gaps = insulated crossings. Filled bus dots = joins. Factory plug / cable paths: 20–23.',20)
    text(48,1700,'One shared component layout; simplified terminals and wire bends. Use the 3D Top view to compare.',20)
    text(48,1735,'Component estimates and electrical selection limits still apply. This is a design reference, not a fabrication or energization release.',18,color='#8b651e')
    add('</svg>');return ''.join(parts)

def material_photo(p):
    photo = p['image']
    style = ''
    if 'crop' in photo:
        x, y, w, h = photo['crop']
        ratio = photo['width'] * w / (photo['height'] * h)
        style = f' style="width:{100/w:.5f}%;left:{-100*x/w:.5f}%;top:{-100*y/h:.5f}%"'
    img = '<img src="'+E(photo['src'])+'" alt="'+E(photo['alt'])+'" width="'+str(photo['width'])+'" height="'+str(photo['height'])+'" loading="lazy" decoding="async"'+style+'>'
    if 'crop' in photo:
        img = f'<span class="material-crop" style="max-width:{140*ratio:.5f}px;aspect-ratio:{ratio:.5f}">'+img+'</span>'
    caption = {'reference':'Reference image', 'design':'Design concept'}.get(photo['kind'])
    return '<figure class="material-photo" data-image-kind="'+E(photo['kind'])+'"><a class="material-image" href="'+E(photo['src'])+'" target="_blank" rel="noopener" aria-label="View full image: '+E(p['item'])+'">'+img+'</a>'+('<figcaption>'+caption+'</figcaption>' if caption else '')+'</figure>'

def main():
    validation=validate();svg=make_diagram();(OUT/'wiring_routes.svg').write_text(svg)
    start_svg(1800,1200,'ELITEpro connectors, blue adapter chain and enclosure front-panel concept')
    draw_external(add,rect,text,line,circle,C);add('</svg>');detail=''.join(parts)
    (OUT/'connector_detail.svg').write_text(detail)
    rows=''.join(f'<tr class="row" data-id="{w["id"]}"><td><button class="trace" data-id="{w["id"]}" aria-label="Trace connection {w["id"]}">{w["id"]}</button></td><td>{E(w["description"])}</td><td>{E(w["start"])} → {E(w["end"])}</td></tr>' for w in wires)
    materials=json.loads((OUT/'procurement.json').read_text())
    material_rows={'owned':[], 'buy':[]}
    for p in materials['items']:
        owned=p['availability']=='owned'
        badge='✓ Owned' if owned else '□ To buy'
        purchase_links=[];reference_links=[]
        for link in p['links']:
            anchor='<a data-link-kind="'+E(link['kind'])+'" href="'+E(link['url'])+'">'+E(link['label'])+' ↗</a>'
            (reference_links if link['kind']=='reference' else purchase_links).append(anchor)
        photo=p['image']
        credit='<a href="'+E(photo['source_url'])+'">Image: '+E(photo['source_label'])+' ↗</a>' if photo.get('source_url') else ''
        details='<details class="material-details"><summary>Details</summary><p class="material-reason">'+E(p['reason'])+'</p><p class="material-note">'+E(p['status'])+'</p>'
        if p.get('quantity_summary'):
            details+='<p class="material-quantity"><strong>Quantity &amp; pack size:</strong> '+E(p['quantity'])+'</p>'
        details+=''.join(reference_links)+'<p class="material-image-note">'+E(photo['caption'])+'</p>'+credit+'</details>'
        notice='<p class="material-notice">'+E(p['notice'])+'</p>' if p.get('notice') else ''
        material_rows[p['availability']].append('<tr id="material-'+E(p['id'])+'" data-availability="'+E(p['availability'])+'"><td data-label="Inventory"><span class="inventory-badge '+p['availability']+'">'+badge+'</span></td><td data-label="Material"><span class="material-name">'+E(p['item'])+'</span>'+material_photo(p)+'<a class="locate-material" data-material="'+E(p['id'])+'" href="?material='+E(p['id'])+'#layout" aria-label="View '+E(p['item'])+' in 3D">View in 3D ↑</a></td><td data-label="Quantity needed">'+E(p.get('quantity_summary',p['quantity']))+'</td><td data-label="Part / details"><strong>'+E(p['model'])+'</strong>'+notice+details+'</td><td class="material-links" data-label="Purchase">'+(''.join(purchase_links) if purchase_links else '<span class="reuse-note">Reuse</span>')+'</td></tr>')
    html=(OUT/'page_template.html').read_text().replace('<!-- MAIN_DIAGRAM -->',svg).replace('<!-- DETAIL_DIAGRAM -->',detail).replace('<!-- CONNECTION_ROWS -->',rows).replace('<!-- BUY_ROWS -->',''.join(material_rows['buy'])).replace('<!-- OWNED_ROWS -->',''.join(material_rows['owned'])).replace('{{BUY_COUNT}}',str(len(material_rows['buy']))).replace('{{OWNED_COUNT}}',str(len(material_rows['owned']))).replace('{{REV}}',REV)
    (OUT/'index.html').write_text(html)
    (OUT/'routes.json').write_text(json.dumps({'revision':REV,'anchors':A,'projection':PLAN,'wires':wires},indent=2)+'\n')
    (OUT/'validation.json').write_text(json.dumps(validation,indent=2)+'\n')
    print(f'Generated {len(wires)} connections, 2 SVG drawings and index.html; connectivity checks passed.')

if __name__=='__main__':main()
