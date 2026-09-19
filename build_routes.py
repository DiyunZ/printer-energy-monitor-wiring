"""Generate the concept netlist, two SVG drawings and static website."""
from pathlib import Path
from html import escape as E
import json
from draw_external import draw_external

OUT = Path(__file__).resolve().parent
REV = 'Rev. 4 · scaled 3D layout · 2026-09-19'
C = {'L':'#202d3a','N':'#65758a','PE':'#18814a','CT':'#8544a5','USB':'#23739d','DC':'#aa621e','V':'#1567c1'}
# Functional ports; actual meter end views are in connector_detail.svg.
A = {
 'IN.L':(180,260),'IN.N':(180,350),'IN.PE':(180,440),'Q0.IN':(310,260),'Q0.OUT':(450,260),
 'JL.1':(550,260),'JL.2':(590,260),'JL.3':(630,260),'JL.4':(670,260),
 'JN.1':(550,350),'JN.2':(590,350),'JN.3':(630,350),'JN.4':(670,350),'JN.5':(710,350),
 'JPE.1':(550,440),'JPE.2':(590,440),'JPE.3':(630,440),'JPE.4':(670,440),'JPE.5':(710,440),'JPE.6':(750,440),
 'OUT.L':(1390,260),'OUT.N':(1390,350),'OUT.PE':(1390,440),'Fv.IN':(790,540),'Fv.OUT':(880,540),
 'D.L1':(1130,780),'D.L2':(1130,840),'D.N':(1130,900),'D.+':(1260,700),'D.-':(1320,700),'D.USB':(1360,1045),
 'D.DC+':(1130,1020),'D.DC-':(1130,1070),'CT.+':(1010,310),'CT.-':(1050,310),
 'PLATE':(290,1110),'RAIL':(460,1110),'OUTLETBOX':(530,1048),'AUX.L':(340,770),'AUX.N':(340,830),'AUX.PE':(340,890),
 'AUX.FACE.L':(570,790),'AUX.FACE.N':(570,850),'PSU.L':(710,790),'PSU.N':(710,850),
 'PSU.DC+':(890,810),'PSU.DC-':(890,860),'PC':(1660,1130),
}
# 01–19 and 24: installed conductors/cables; 20–23: existing factory plug/cable paths.
raw = [
 ('01','L','IN.L','Q0.IN',[],(242,260),'Input hot → Q0 IN','main'),
 ('02','L','Q0.OUT','JL.1',[],(500,260),'Q0 OUT → hot distribution JL','main'),
 ('03','L','JL.2','OUT.L',[],(1200,260),'JL → printer hot; one pass through CT','main'),
 ('04','L','JL.3','Fv.IN',[(630,300),(775,300),(775,540)],(775,470),'JL → Fv voltage-tap fuse','voltage'),
 ('05','V','Fv.OUT','D.L1',[(960,540),(960,780)],(1000,780),'Fv → blue A1 → full lead → L1 (HOT)','voltage'),
 ('06','N','IN.N','JN.1',[],(335,350),'Input neutral → neutral distribution JN','neutral'),
 ('07','N','JN.2','OUT.N',[],(1200,350),'JN → printer neutral; outside CT','neutral'),
 ('08','V','JN.3','D.L2',[(630,380),(920,380),(920,590),(930,590),(930,840)],(1000,840),'JN → blue A2 → full lead → L2 (NEUTRAL)','voltage'),
 ('09','V','JN.4','D.N',[(670,400),(895,400),(895,630),(900,630),(900,900)],(1000,900),'JN → blue A3 → full lead → N (NEUTRAL)','voltage'),
 ('10','PE','IN.PE','JPE.1',[],(335,440),'Input PE → protective-earth distribution','earth'),
 ('11','PE','JPE.2','OUT.PE',[],(1200,440),'PE → printer ground; outside CT','earth'),
 ('12','PE','JPE.3','PLATE',[(630,495),(230,495),(230,1110)],(230,1050),'PE → dedicated metal-plate bond','earth'),
 ('13','PE','JPE.4','RAIL',[(670,480),(260,480),(260,1080),(460,1080)],(375,1080),'PE → dedicated metal-rail bond','earth'),
 ('14','CT','CT.+','D.+',[(1010,665),(1260,665)],(1160,665),'CT white (+) → current-input CH1 +','signal'),
 ('15','CT','CT.-','D.-',[(1050,635),(1320,635)],(1190,635),'CT black (−) → current-input CH1 −','signal'),
 ('16','USB','D.USB','PC',[(1385,1045),(1385,1130)],(1585,1130),'USB Type B → protected exit → ELOG computer','signal'),
 ('17','L','JL.4','AUX.L',[(670,280),(735,280),(735,680),(300,680),(300,770)],(425,680),'JL → AUX receptacle hot; before CT','aux'),
 ('18','N','JN.5','AUX.N',[(710,375),(755,375),(755,570),(320,570),(320,830)],(425,570),'JN → AUX receptacle neutral','aux'),
 ('19','PE','JPE.5','AUX.PE',[(710,610),(280,610),(280,935),(340,935)],(410,610),'PE → AUX ground and bonded mounting hardware','earth'),
 ('20','L','AUX.FACE.L','PSU.L',[],(640,790),'Existing adapter AC blade: hot contact','aux'),
 ('21','N','AUX.FACE.N','PSU.N',[],(640,850),'Existing adapter AC blade: neutral contact','aux'),
 ('22','DC','PSU.DC+','D.DC+',[(920,810),(920,1020)],(1000,1020),'Factory barrel cable: center-positive path','aux'),
 ('23','DC','PSU.DC-','D.DC-',[(905,860),(905,1070)],(1000,1070),'Factory barrel cable: negative sleeve path','aux'),
 ('24','PE','JPE.6','OUTLETBOX',[(750,460),(765,460),(765,595),(595,595),(595,1048)],(595,995),'PE → dedicated outlet rear-box bond','earth'),
]
wires = [dict(id=n,kind=k,start=a,end=b,points=[A[a],*m,A[b]],badge=lab,description=d,group=g) for n,k,a,b,m,lab,d,g in raw]

def validate():
    """Check connectivity, breaker-open behavior and CT geometry."""
    breakers={name.split('.')[0] for name in A if name.startswith('Q')}
    assert breakers=={'Q0'}
    assert [w['id'] for w in wires] == [f'{i:02}' for i in range(1,25)]
    for w in wires:
        if w['id'] in ['03','04','17']: assert w['start'].startswith('JL.')
    assert A['JL.2'][0]<985<1085<A['OUT.L'][0]
    for w in wires:
        assert w['points'][0] == A[w['start']] and w['points'][-1] == A[w['end']]
        assert all(p[0] == q[0] or p[1] == q[1] for p,q in zip(w['points'],w['points'][1:])), w['id']
    hits=[]
    for w in wires:
        for p,q in zip(w['points'],w['points'][1:]):
            h=p[1]==q[1] and 245<p[1]<275 and max(p[0],q[0])>985 and min(p[0],q[0])<1085
            v=p[0]==q[0] and 985<p[0]<1085 and max(p[1],q[1])>245 and min(p[1],q[1])<275
            if h or v: hits.append(w['id'])
    assert hits == ['03'], hits
    def graph(closed):
        parent={x:x for x in A}
        def root(x):
            while parent[x] != x: x=parent[x]
            return x
        def join(x,y): parent[root(y)]=root(x)
        for w in wires: join(w['start'],w['end'])
        for prefix in ['JL.','JN.','JPE.']:
            nodes=[x for x in A if x.startswith(prefix)]
            for node in nodes[1:]: join(nodes[0],node)
        for x,y in [('Fv.IN','Fv.OUT'),('AUX.L','AUX.FACE.L'),('AUX.N','AUX.FACE.N')]: join(x,y)
        if closed: join('Q0.IN','Q0.OUT')
        return root
    closed=graph(True)
    for w in wires:
        for name,point in A.items():
            if closed(name)==closed(w['start']): continue
            for p,q in zip(w['points'],w['points'][1:]):
                on_segment=(p[0]==q[0]==point[0] and min(p[1],q[1])<=point[1]<=max(p[1],q[1])) or (p[1]==q[1]==point[1] and min(p[0],q[0])<=point[0]<=max(p[0],q[0]))
                assert not on_segment, f'Wire {w["id"]} crosses an unrelated terminal dot: {name}'
    for node in ['OUT.L','D.L1','AUX.L','PSU.L']: assert closed(node)==closed('IN.L')
    for node in ['OUT.N','D.L2','D.N','AUX.N','PSU.N']: assert closed(node)==closed('IN.N')
    for node in ['OUT.PE','AUX.PE','PLATE','RAIL','OUTLETBOX']: assert closed(node)==closed('IN.PE')
    assert len({closed(n) for n in ['IN.L','IN.N','IN.PE','D.+','D.-','D.DC+','D.DC-','PC']})==8
    opened=graph(False)
    for node in ['OUT.L','D.L1','AUX.L','PSU.L']: assert opened(node)!=opened('IN.L')
    for node in ['OUT.PE','AUX.PE','PLATE','RAIL','OUTLETBOX']: assert opened(node)==opened('IN.PE')
    return dict(revision=REV,connection_count=len(wires),circuit_breaker_count=len(breakers),
        blue_adapters={'A1':'L1 / hot','A2':'L2 / neutral','A3':'N / neutral'},
        endpoints_and_orthogonal_routes=True,no_unrelated_terminal_dot_crossings=True,only_printer_hot_through_CT=True,
        mains_neutral_PE_CT_DC_nets_separate=True,Q0_opens_all_downstream_hot_branches=True,
        PE_continuity_independent_of_Q0=True,aux_and_voltage_taps_before_CT=True,
        lead_fuse_rating='TBD by qualified electrical personnel',
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
def start_svg(w,h,label):
    parts.clear()
    add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{label}">')
    add('<style>text{font-family:Arial,Helvetica,sans-serif}.wire{cursor:pointer;transition:opacity .15s}.muted{opacity:.09}.selected .core{stroke-width:9}.wire:focus{outline:none}.wire:focus .core{stroke-width:9}</style>')
    rect(0,0,w,h,'#fff','#fff',0)

def make_diagram():
    start_svg(1800,1270,'Single-breaker ELITEpro XC enclosure schematic, revision 4')
    text(48,55,'One breaker. Separate printer and logger branches.',34,weight=700)
    text(48,91,'120 V L / N / PE candidate • Functional routing, not a drilling template • '+REV,20,color='#63768a')
    rect(210,150,1430,1010,'#f7f9fb','#9dabb8',18)
    text(235,183,'CLOSED ENCLOSURE • all terminations guarded',17,color='#63768a')
    text(45,210,'FROM WALL',21,weight=700);text(45,236,'Grounded plug',17,color='#63768a')
    for y,label,k in [(260,'HOT · L','L'),(350,'NEUTRAL · N','N'),(440,'EARTH · PE','PE')]:
        line([(65,y),(180,y)],C[k],5);text(45,y+32,label,17,C[k],600)
    rect(310,215,140,90,'#fff','#6e7e8e')
    text(380,238,'Q0',22,weight=700,anchor='middle')
    line([(310,260),(345,260)],C['L'],4);line([(405,260),(450,260)],C['L'],4);line([(345,260),(399,243)],C['L'],4)
    text(380,290,'ONE BREAKER',15,weight=700,anchor='middle')
    text(360,202,'Rating / switching duty: TBD',15,color='#63768a',anchor='middle')
    for prefix,y,k,label in [('JL',260,'L','JL · HOT'),('JN',350,'N','JN · NEUTRAL'),('JPE',440,'PE','JPE · PE')]:
        end=750 if prefix=='JPE' else 710
        rect(531,y-18,end-531+19,36,'#fff','#bbc7d0',6);line([(550,y),(end,y)],C[k],8);text(550,y-29,label,17,C[k],700)
    rect(975,202,120,109,'#fff','#99a8b4',12);rect(985,245,100,30,'#e7ecf0','#8c9ba6',3)
    text(1035,231,'CT 1',22,weight=700,anchor='middle');text(1035,294,'LOAD →',17,weight=700,anchor='middle')
    text(850,198,'Only printer hot passes through CT',17,C['CT'],600)
    rect(1390,211,205,270,'#fff','#99a8b4',12);text(1492,238,'PRINTER OUTPUT',19,weight=700,anchor='middle')
    for y,label,k in [(260,'L','L'),(350,'N','N'),(440,'PE','PE')]: text(1410,y+6,label,19,C[k],700)
    for y,label in [(303,'Grounded female'),(328,'connector'),(395,'Original printer'),(420,'cord plugs in here')]:text(1486,y,label,17,anchor='middle')
    rect(790,514,90,52,'#fff9ee','#b58d46',5);line([(798,540),(872,540)],'#9c772f',3)
    text(835,502,'Fv · FUSE',18,'#8b651e',700,'middle');text(1140,530,'Fv rating / interrupt capacity: TBD',16,color='#8b651e')
    text(1140,570,'Blue adapters: A1 / A2 / A3',17,C['V'],700)
    # Keep the photographed long, narrow case separate from enlarged port callouts.
    # Dashed gray leaders identify case ends; they are not electrical conductors.
    leader='stroke-dasharray="3 5"'
    line([(1370,721),(1410,721)],'#8e9cab',2,extra=leader)
    line([(1345,840),(1395,840),(1395,710),(1410,710)],'#8e9cab',2,extra=leader)
    line([(1360,1095),(1370,1095),(1370,1110),(1410,1110)],'#8e9cab',2,extra=leader)
    text(1480,677,'ELITEpro XC · body outline',17,weight=600,anchor='middle')
    rect(1415,695,124,425,'#283643','#1a2935',17,extra='id="elitepro-body"')
    rect(1421,724,112,360,'#0967b4','#075797',9)
    for x in [1430,1460,1490,1520]:circle(x,741,3,'#b9d6b1','#6b99aa')
    for y in [773,788,803,965,980,995]:rect(1429,y,97,4,'#075da6','#075da6',2)
    text(1477,860,'DENT',29,'#fff',700,'middle')
    text(1477,904,'ELITEpro XC',17,'#fff',600,'middle')
    text(1477,932,'POWER METER',12,'#dcecfb',500,'middle')
    text(1477,1032,'LOGGING',12,'#fff',500,'middle')
    text(1477,1049,'ON / COMM',11,'#fff',400,'middle');circle(1477,1067,4,'#c4d8ec','#e0edf8')
    rect(1235,690,135,54,'#fff','#acbdcb',5)
    text(1260,728,'CH1 +',15,C['CT'],600,'middle');text(1320,728,'CH1 −',15,C['CT'],600,'middle')
    text(1138,759,'VOLTAGE · ENLARGED',14,color='#63768a',weight=600)
    rect(1130,766,215,154,'#fff','#acbdcb',6)
    for y,label in [(780,'L1 · HOT'),(840,'L2 · NEUTRAL'),(900,'N · NEUTRAL')]:text(1149,y+7,label,18,weight=600)
    text(1140,946,'L3 unused · S is CT shield',16,color='#63768a')
    text(1140,970,'Analog inputs unused',16,color='#63768a')
    text(1138,995,'DC / USB · ENLARGED',14,color='#63768a',weight=600)
    rect(1130,1003,230,97,'#fff','#acbdcb',6)
    text(1149,1027,'Center +',17,C['DC']);text(1149,1077,'Sleeve −',17,C['DC'])
    text(1345,1051,'USB',17,C['USB'],600,'end')
    rect(340,717,230,195,'#fff','#a0adb9',12);text(455,744,'XA · AUX OUTLET',20,weight=700,anchor='middle')
    for y,label,k in [(770,'L / brass','L'),(830,'N / silver','N'),(890,'PE / green','PE')]: text(357,y+7,label,17,C[k],600)
    text(484,789,'5-15R',24,weight=700,anchor='middle');text(484,817,'125 V / 15 A',15,anchor='middle')
    text(456,970,'ADAPTER ONLY · UNMETERED',16,color='#8b651e',weight=600,anchor='middle')
    rect(710,728,180,183,'#253644','#253644',12)
    for y,label,size in [(757,'EXISTING',17),(782,'2-PIN ADAPTER',18),(829,'AC → DC',21),(882,'Verify label / polarity',14)]:text(800,y,label,size,'#fff',600,'middle')
    text(632,729,'Plug in',19,weight=600,anchor='middle')
    text(615,1000,'Factory plug / cable paths: 20–23',16,color='#8b651e')
    text(615,1030,'Use the intact original adapter cable.',16,color='#63768a')
    for w in wires:
        n,k,p=w['id'],w['kind'],w['points']
        add(f'<g class="wire" id="wire-{n}" data-id="{n}" data-kind="{k}" tabindex="0" role="button" aria-label="{E(n+": "+w["description"])}"><title>{E(w["description"])}</title>')
        line(p,'#fff',12);line(p,C[k],5,extra='class="core" '+('stroke-dasharray="9 6"' if k in ('CT','USB') else ''))
        if k=='N': line(p,'#fff',2)
        if n=='23': line(p,'#fff',1.6,extra='stroke-dasharray="5 4"')
        for xy in (p[0],p[-1]):circle(*xy,4,'#fff',C[k])
        badge(*w['badge'],n,k);add('</g>')
    for n,y,name,endcolor in [('05',780,'A1 · HOT',C['L']),('08',840,'A2 · NEUTRAL','#b8343e'),('09',900,'A3 · NEUTRAL',C['N'])]:
        add(f'<g class="wire" data-id="{n}" data-kind="V">')
        rect(1031,y-11,34,22,'#1673c5','#0b4f90',4);rect(1068,y-10,23,20,'#dee4eb','#738296',3)
        line([(1091,y),(1130,y)],endcolor,5)
        if n=='09':line([(1091,y),(1130,y)],'#fff',2)
        text(980,y-20,name,15,C['V'],600);add('</g>')
    for prefix in ['JL.','JN.','JPE.']:
        for name,xy in A.items():
            if name.startswith(prefix):circle(*xy,4,C['L'] if prefix=='JL.' else C['N'] if prefix=='JN.' else C['PE'],'#fff')
    for x,label in [(290,'Plate bond'),(460,'Rail bond')]:circle(x,1110,10,'#f5de9f','#9b7f40');text(x,1142,label,16,anchor='middle')
    circle(530,1048,10,'#f5de9f','#9b7f40');text(530,1020,'Outlet-box bond',15,anchor='end')
    rect(1660,1080,104,83,'#ecf4f9','#8499ad',8);text(1712,1114,'PC',24,weight=700,anchor='middle');text(1712,1144,'ELOG',17,anchor='middle')
    text(880,1200,'White gaps = insulated crossings. Filled bus dots = joins. Blue = voltage adapters, never protective earth.',19,anchor='middle')
    text(48,1237,'Design review required: Q0 and Fv ratings, CT model, lead protection and physical clearances are not yet released for construction.',18,color='#8b651e')
    add('</svg>');return ''.join(parts)

def main():
    validation=validate();svg=make_diagram();(OUT/'wiring_routes.svg').write_text(svg)
    start_svg(1800,1200,'ELITEpro connectors, blue adapter chain and enclosure front-panel concept')
    draw_external(add,rect,text,line,circle,C);add('</svg>');detail=''.join(parts)
    (OUT/'connector_detail.svg').write_text(detail)
    rows=''.join(f'<tr class="row" data-id="{w["id"]}"><td><button class="trace" data-id="{w["id"]}" aria-label="Trace connection {w["id"]}">{w["id"]}</button></td><td>{E(w["description"])}</td><td>{E(w["start"])} → {E(w["end"])}</td></tr>' for w in wires)
    dimensions=json.loads((OUT/'layout_dimensions.json').read_text())
    dimension_rows=''.join('<tr><td>'+E(p['name'])+'</td><td>'+(' × '.join(f'{v:.1f}' for v in p['size']) if p['size'] else 'Routing only')+'</td><td>'+E(p['status'])+(' · <a href="'+E(p['source'])+'">Source</a>' if p['source'] else '')+'</td></tr>' for p in dimensions['parts'])
    materials=json.loads((OUT/'procurement.json').read_text())
    material_rows=''.join('<tr><td>'+E(p['item'])+'</td><td>'+E(p['quantity'])+'</td><td><strong>'+E(p['model'])+'</strong><br>'+E(p['reason'])+'</td><td>'+''.join('<a href="'+E(l['url'])+'">'+E(l['label'])+' ↗</a><br>' for l in p['links'])+'<small>'+E(p['status'])+'</small></td></tr>' for p in materials['items'])
    html=(OUT/'page_template.html').read_text().replace('<!-- MAIN_DIAGRAM -->',svg).replace('<!-- DETAIL_DIAGRAM -->',detail).replace('<!-- CONNECTION_ROWS -->',rows).replace('<!-- DIMENSION_ROWS -->',dimension_rows).replace('<!-- MATERIAL_ROWS -->',material_rows).replace('{{REV}}',REV)
    (OUT/'index.html').write_text(html)
    (OUT/'routes.json').write_text(json.dumps({'revision':REV,'anchors':A,'wires':wires},indent=2)+'\n')
    (OUT/'validation.json').write_text(json.dumps(validation,indent=2)+'\n')
    print(f'Generated {len(wires)} connections, 2 SVG drawings and index.html; connectivity checks passed.')

if __name__=='__main__':main()
