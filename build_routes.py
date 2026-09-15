from pathlib import Path
from html import escape as E
import json
from draw_external import draw_external
OUT=Path(__file__).resolve().parent
C={'L':'#17212e','N':'#718097','R':'#cf3038','PE':'#14864e','CT':'#8a45b7','USB':'#1674ca'}
A={'IN.L':(300,1250),'IN.N':(330,1250),'IN.PE':(360,1250),'OUT.L':(870,1250),'OUT.N':(900,1250),'OUT.PE':(930,1250), 'Q0.IN':(280,990),'Q0.OUT':(280,1130),'Qv.IN':(460,990),'Qv.OUT':(460,1130),'D.L1':(330,800),'D.L2':(385,800),'D.N':(440,800),'D.+':(340,285),'D.-':(390,285),'D.USB':(290,665),'CT.+':(815,1020),'CT.-':(855,1020),'PLATE':(750,1160),'RAIL':(595,1100),'USB.EXIT':(65,520)}
for name,y in [('JL',410),('JN',640),('JPE',870)]:
    for i,x in enumerate([790,835,880,925,970],1): A[f'{name}.{i}']=(x,y)
# Each path is a distinct insulated connection. Crossings have a white bridge halo.
raw=[
('01','L','IN.L','Q0.IN',[(180,1250),(180,950),(280,950)],(180,1190),'Input L → Q0 IN'),
('02','L','Q0.OUT','JL.1',[(210,1130),(210,180),(720,180),(720,460),(790,460)],(520,180),'Q0 OUT → JL-1'),
('03','L','JL.2','OUT.L',[(835,440),(680,440),(680,1080),(920,1080),(920,1200),(870,1200)],(680,1040),'JL-2 → through CT once → output L'),
('04','L','JL.3','Qv.IN',[(880,480),(620,480),(620,920),(460,920)],(620,560),'JL-3 → Qv IN'),
('05','L','Qv.OUT','D.L1',[(540,1130),(540,845),(330,845)],(540,1045),'Qv OUT → DENT L1'),
('06','N','IN.N','JN.1',[(570,1250),(570,700),(790,700)],(570,1210),'Input N → JN-1'),
('07','N','JN.2','OUT.N',[(835,710),(1030,710),(1030,1220),(900,1220)],(1030,1000),'JN-2 → output N'),
('08','R','JN.3','D.L2',[(880,740),(580,740),(580,870),(385,870)],(690,740),'JN-3 → DENT L2 (RED lead to N)'),
('09','N','JN.4','D.N',[(925,760),(600,760),(600,895),(440,895)],(705,760),'JN-4 → DENT N'),
('10','PE','IN.PE','JPE.1',[(710,1250),(710,925),(790,925)],(710,1210),'Input PE → JPE-1'),
('11','PE','JPE.2','OUT.PE',[(835,930),(1010,930),(1010,1240),(930,1240)],(1010,1080),'JPE-2 → output PE'),
('12','PE','JPE.3','PLATE',[(880,960),(750,960)],(750,1005),'JPE-3 → dedicated plate earth stud'),
('13','PE','JPE.4','RAIL',[(925,940),(730,940),(730,1170),(595,1170)],(650,1170),'JPE-4 → dedicated DIN-rail earth point'),
('14','CT','CT.+','D.+',[(815,975),(660,975),(660,250),(340,250)],(660,350),'CT + → DENT CH1 +'),
('15','CT','CT.-','D.-',[(855,965),(645,965),(645,230),(390,230)],(645,390),'CT − → DENT CH1 −'),
('16','USB','D.USB','USB.EXIT',[(250,665),(250,520)],(165,520),'DENT USB → separate gland → computer')]
wires=[]
for no,k,a,b,m,lab,desc in raw:
    wires.append(dict(id=no,kind=k,start=a,end=b,points=[A[a],*m,A[b]],badge=lab,description=desc))
assert [w['id'] for w in wires]==[f'{i:02d}' for i in range(1,17)]
assert len({w['id'] for w in wires})==16
for w in wires:
    assert tuple(w['points'][0])==A[w['start']] and tuple(w['points'][-1])==A[w['end']]
    for p,q in zip(w['points'],w['points'][1:]): assert p[0]==q[0] or p[1]==q[1],w['id']
# Validate that only wire03's conductor crosses the drawn CT aperture.
ct_cross=[]
for w in wires:
    for p,q in zip(w['points'],w['points'][1:]):
        if p[1]==q[1]==1080 and min(p[0],q[0])<805 and max(p[0],q[0])>910: ct_cross.append(w['id'])
assert ct_cross==['03']
parts=[]
def add(s): parts.append(s)
def rect(x,y,w,h,fill='#fff',stroke='#d4dce4',r=8,extra=''):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" {extra}/>')
def text(x,y,s,size=20,color='#172b40',weight=400,anchor='start'):
    add(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{E(s)}</text>')
def line(points,color='#8998a7',width=2,extra=''):
    add(f'<polyline points="'+ ' '.join(f'{x},{y}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round" {extra}/>')
def circle(x,y,r=6,fill='#fff',stroke='#718096',extra=''):
    add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2" {extra}/>')
def ground(x,y,label):
    circle(x,y,13,'#edcf82','#91743b');circle(x,y,5,'#fff','#91743b')
    line([(x,y+16),(x,y+26)],C['PE']);line([(x-13,y+26),(x+13,y+26)],C['PE']);line([(x-9,y+32),(x+9,y+32)],C['PE']);line([(x-4,y+38),(x+4,y+38)],C['PE'])
    # Ground labels are placed separately, clear of wire routes.
def badge(x,y,num,k):
    rect(x-18,y-13,36,26,'#fff',C[k],5);text(x,y+6,num,18,C[k],700,'middle')
add('<svg xmlns="http://www.w3.org/2000/svg" width="1880" height="2380" viewBox="0 0 1880 2380" role="img" aria-label="Single-printer monitor wiring route plan">')
add('<style>text{font-family:"PingFang SC","Heiti SC",Arial,sans-serif}.wire,.row,.external{transition:opacity .18s}.row{cursor:pointer}.wire{cursor:pointer}.muted{opacity:.06}.selected .core{stroke-width:9}.dimrow{opacity:.25}</style>')
rect(0,0,1880,2380,'#fff','#fff',0)
text(65,62,'Single-printer monitor | Wiring layout',39,weight=700)
text(65,105,'120 V single-phase candidate | Original component zones | Individually numbered connections',20,color='#52667c')
rect(65,145,1050,1195,'#dce1e5','#7e8b95',24)
rect(100,170,980,1115,'#f1f4f6','#bac4cc',16)
for x in (90,1090):
    for y in (175,1305): circle(x,y,10,'#fff','#aab4be')
text(1010,270,'Metal mounting plate',19,color='#718096',anchor='end')
# DENT body and deliberately expanded symbolic interfaces.
rect(290,320,180,390,'#0873be','#064a85',13)
rect(302,334,155,45,'#095b9c','#095b9c',5)
for x in (323,357,391,425): circle(x,356,4,'#a4d460','#326125')
text(380,445,'DENT',35,'#fff',700,'middle');text(380,490,'ELITEpro XC',22,'#fff',600,'middle')
text(380,550,'POWER / ENERGY',17,'#fff',500,'middle');text(380,584,'LOGGER',23,'#fff',500,'middle')
text(380,638,'No load current through meter',11,'#e5f3ff',400,'middle')
rect(300,275,130,42,'#f3edfb',C['CT'],6)
text(340,309,'CH1 +',16,C['CT'],700,'middle');text(390,309,'CH1 −',16,C['CT'],700,'middle')
text(480,305,'Expanded port symbols',12,color='#667b90')
rect(275,748,220,70,'#e9f3fd','#7b99b8',7)
text(385,735,'Voltage ports - expanded',16,anchor='middle')
for x,label in [(330,'L1'),(385,'L2'),(440,'N')]: text(x,778,label,20,weight=700,anchor='middle')
line([(375,710),(375,720)],'#8b9aab',2)
text(278,692,'USB',14,color=C['USB'],anchor='end')
# Terminal blocks: bus shown inside each distinct housing, five visible ports.
for name,y,desc,k in [('JL',320,'LINE bus','L'),('JN',550,'NEUTRAL bus','N'),('JPE',780,'EARTH bus','PE')]:

    if name=='JPE':
        text(750,821,'JPE',21,C[k],700,'end');text(750,845,'EARTH',14,C[k],500,'end')
    else: text(770,y-15,f'{name}  {desc}',24,C[k],700)
    rect(760,y,250,90,'#f8f8f4','#a9b2bb',8)
    line([(790,y+60),(970,y+60)],'#bb9757',7)
    for i,x in enumerate([790,835,880,925,970],1):
        rect(x-13,y+12,26,32,'#eb8337','#ba6122',4)
        line([(x,y+60),(x,y+90)],'#a48b5c',4)
        text(x,y+53,str(i),15,'#5b4530',700,'middle')
    text(1018,y+49,'5 ports',15,color='#708091');text(1018,y+69,'common',15,color='#708091')
# DIN and two breakers.
rect(235,1068,395,31,'#b6c2cc','#7b8b99',3)
for x,name,amp in [(240,'Q0','15 A candidate'),(420,'Qv','1 A candidate')]:
    rect(x,990,80,140,'#fafaf7','#9aa7b3',5)
    text(x+5,978,name,20,weight=700)
    text(x+40,1018,'IN',17,weight=600,anchor='middle')
    rect(x+16,1040,48,35,'#242f3a','#101820',2)
    text(x+40,1101,'OUT',16,weight=600,anchor='middle')
    text(x+40,1157,amp,16,color='#63768a',anchor='middle')
# CT: aperture is shown as a horizontal pass-through; signal terminals separate.
rect(795,1015,125,145,'#fafaf6','#a9b2ba',10)
text(857,1054,'CT',22,weight=700,anchor='middle')
rect(802,1067,111,26,'#dce3e8','#8c9aa8',3)
text(857,1125,'LOAD →',18,weight=700,anchor='middle')
text(857,1148,'To printer',15,color='#63768a',anchor='middle')
text(815,1009,'+',18,C['CT'],700,'middle');text(855,1009,'−',18,C['CT'],700,'middle')
ground(750,1160,'Plate earth');ground(595,1100,'Rail earth')
text(768,1191,'Plate earth',16);text(530,1192,'Rail earth',16,anchor='end')
# Glands and cable jackets. Functional L/N/PE fan-out is drawn, never a bare bundle.
for center,label in [(330,'AC INPUT | From wall outlet'),(900,'AC OUTPUT | To printer')]:
    rect(center-30,1290,60,76,'#323d47','#16212c',9)
    rect(center-38,1305,76,24,'#4c5862','#16212c',5)
    line([(center,1366),(center,1398)],'#26313c',27)
    for dx,k in [(-30,'L'),(0,'N'),(30,'PE')]:
        line([(center+dx,1250),(center+dx,1270),(center+dx*.45,1290)],'#fff',9)
        line([(center+dx,1250),(center+dx,1270),(center+dx*.45,1290)],C[k],5)
        # Labels are added after wires as small terminal tags.
    text(center+45,1435,'AC INPUT' if center==330 else 'AC OUTPUT',22,weight=700)
rect(42,503,44,34,'#394650','#172331',5)
text(100,455,'USB → PC',17,C['USB']);text(100,477,'Separate gland',14,C['USB'])
# Wire drawings are traceable: halo denotes insulated crossing without a splice.
for w in wires:
    no,k=w['id'],w['kind'];p=w['points'];col=C[k]
    add(f'<g class="wire" id="wire-{no}" data-id="{no}" data-kind="{k}"><title>{E(no+" · "+w["description"])}</title>')
    line(p,'#fff',11)
    dash='stroke-dasharray="9 6"' if k in ('CT','USB') else ''
    line(p,col,5 if k in ('CT','USB') else 6,extra='class="core" '+dash)
    if k=='N':line(p,'#fff',2)
    for xy in (p[0],p[-1]):circle(*xy,5,'#fff',col)
    badge(*w['badge'],no,k)
    add('</g>')
for center in (330,900):
    for dx,k in [(-30,'L'),(0,'N'),(30,'PE')]:
        rect(center+dx-12,1220,24,22,'#fff','#fff',3);text(center+dx,1236,k,14,C[k],700,'middle')
# Unused terminal indication (only these ports unused).
for name,inds in [('JL',[4,5]),('JN',[5]),('JPE',[5])]:
    for i in inds:
        x,y=A[f'{name}.{i}'];circle(x,y,5,'#dce2e8','#8695a4')
# Sidebar exact connection index.
text(1170,180,'Connection index',29,weight=700)
text(1170,215,'IDs 01–16 match the connection list; click to isolate a wire.',17,color='#63768a')
for idx,w in enumerate(wires):
    y=242+idx*43; no,k=w['id'],w['kind']
    add(f'<g class="row" data-id="{no}">')
    rect(1165,y,650,39,'#f6f8fa' if idx%2==0 else '#fff','#fff',5)
    badge(1192,y+19,no,k);text(1224,y+26,w['description'],20)
    add('</g>')
text(1170,968,'Legend / How to read',26,weight=700)
for i,(k,s) in enumerate([('L','BLACK: line / hot L'),('N','WHITE with gray outline: neutral N'),('R','RED: DENT L2 voltage lead; connected to N'),('PE','GREEN: protective earth PE'),('CT','PURPLE dashed: CT signal (diagram color only)'),('USB','BLUE dashed: USB data cable')]):
    y=1006+i*33;line([(1173,y-6),(1210,y-6)],C[k],5,extra='stroke-dasharray="8 5"' if k in ('CT','USB') else '');text(1224,y,s,19)
rect(1165,1210,650,268,'#fff8e8','#dfca91',10)
for y,s in [(1241,'• Only 03 passes through CT; 14 / 15 are CT signal leads.'),(1274,'• White gaps at crossings mean NO electrical connection.'),(1307,'• RED 08 connects to neutral. Keep JN and JPE separate.'),(1340,'• 05 / 08 / 09 include adapters + full leads; slack omitted.'),(1373,'• Port symbols are expanded; not actual pin locations.'),(1406,'• Verify actual breaker IN / OUT and CT polarity.'),(1439,'• Verify USB insulation, cable supports and clearances.')]:text(1182,y,s,18)
draw_external(add,rect,text,line,circle,C)
text(65,2335,'DENT branch is upstream of CT: project adaptation pending review. Qualified lab electrical personnel must assemble and inspect.',20,color='#855c19')
text(65,2370,'Drawing connections checked; hardware, wire lengths, connector clearance and electrical acceptance remain unverified. | Rev. 2 · 2026-09-15',17,color='#63768a')
add('</svg>')
svg=''.join(parts)
(OUT/'wiring_routes.svg').write_text(svg)
(OUT/'routes.json').write_text(json.dumps({'anchors':A,'wires':wires},ensure_ascii=False,indent=2))
(OUT/'validation.json').write_text(json.dumps({'unique_connection_ids_01_to_16':True,'all_routes_end_at_named_anchors':True,'all_segments_axis_aligned':True,'only_wire_03_crosses_CT_aperture':True,'physical_build_validated':False},indent=2))
html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Single-printer monitor wiring</title><style>body{margin:0;background:#eef1f4;color:#172b40;font-family:"PingFang SC",sans-serif}header{padding:18px 24px;background:white;position:sticky;top:0;z-index:4;border-bottom:1px solid #cdd6df}h1{font-size:22px;margin:0 0 12px}.controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}button:disabled{opacity:.45;cursor:default}#zoom-level{min-width:4ch;text-align:center;font-size:14px}button,a{font:inherit;font-size:14px;color:#20394f;background:#f3f6f9;border:1px solid #c7d1dc;padding:8px 12px;border-radius:6px;cursor:pointer;text-decoration:none}button.active{background:#173f64;color:white}#status{font-size:14px;margin:12px 0 0;color:#586e83}.stage{overflow:auto;padding:14px}.stage svg{display:block;width:100%;height:auto;background:white;margin-inline:auto}footer{padding:18px 28px;font-size:14px;line-height:1.8;background:#fff}footer a{padding:0;border:0;color:#176ba7}@media print{header,.stage+footer{display:none}.stage{padding:0}.stage svg{width:100%!important}@page{size:A3 landscape;margin:6mm}}</style><header><h1>Single-printer monitor | Trace each wire</h1><div class="controls"><button data-mode="all" class="active">All wires</button><button data-mode="main">1. Printer line</button><button data-mode="voltage">2. DENT line branch</button><button data-mode="neutral">3. Neutral</button><button data-mode="earth">4. Protective earth</button><button data-mode="signal">5. CT / USB</button><button id="zoom-out" aria-label="Zoom out">− Zoom out</button><output id="zoom-level" aria-live="polite" aria-label="Zoom level">100%</output><button id="zoom-in" aria-label="Zoom in">+ Zoom in</button><button id="zoom-fit">Fit to screen</button><button id="zoom-reset">Reset 100%</button><a href="wiring_routes.png" download>Download PNG</a><a href="wiring_routes.svg" download>Download SVG</a><a href="references.html">References / evidence</a></div><p id="status">Click a numbered row to trace one wire, or select a circuit group above.</p></header><div class="stage">'''+svg+'''</div><footer>Candidate routing plan, not an approved construction drawing. Based on <a href="https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf">DENT manual (single-phase diagram: printed page 55)</a> and the existing 16-connection project list. Moving the DENT branch upstream of CT is a project adaptation pending review.<br>Purple is a diagram color, not a specified CT wire color. Verify sensor model and polarity. Port positions, spacing and bend radii are schematic. Disconnect mains and USB and verify absence of voltage before opening.</footer><script>
const groups={all:null,main:['01','02','03'],voltage:['02','04','05'],neutral:['06','07','08','09'],earth:['10','11','12','13'],signal:['14','15','16']};
function show(ids,label){document.querySelectorAll('.wire').forEach(e=>{e.classList.toggle('muted',ids&&!ids.includes(e.dataset.id));e.classList.toggle('selected',ids&&ids.length===1&&ids.includes(e.dataset.id))});document.querySelectorAll('.row').forEach(e=>e.classList.toggle('dimrow',ids&&!ids.includes(e.dataset.id)));document.querySelectorAll('.external').forEach(e=>e.classList.toggle('muted',ids&&!e.dataset.ids.split(' ').some(id=>ids.includes(id))));document.getElementById('status').textContent=label;}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));show(groups[b.dataset.mode],b.textContent+' | Faded wires remain present; crossings are not connections.')});
document.querySelectorAll('.row,.wire').forEach(e=>e.onclick=()=>{show([e.dataset.id],'Highlighted wire: '+e.dataset.id+' | See the matching row for its endpoints.');document.querySelectorAll('[data-mode]').forEach(x=>x.classList.remove('active'))});
const stage=document.querySelector('.stage'),diagram=stage.querySelector('svg');
const zoomOut=document.getElementById('zoom-out'),zoomIn=document.getElementById('zoom-in');
let zoom=1,fitMode=false;
function renderZoom(){
 diagram.style.width=(zoom*100)+'%';
 document.getElementById('zoom-level').textContent=Math.round(zoom*100)+'%';
 zoomOut.disabled=zoom<=0.1;zoomIn.disabled=zoom>=3;
 document.getElementById('zoom-fit').classList.toggle('active',fitMode);
}
function setZoom(value){fitMode=false;zoom=Math.max(0.1,Math.min(3,value));renderZoom()}
function fitToScreen(){
 const padding=getComputedStyle(stage),box=diagram.viewBox.baseVal;
 const width=stage.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight);
 const height=Math.max(1,innerHeight-document.querySelector('header').getBoundingClientRect().height-parseFloat(padding.paddingTop)-parseFloat(padding.paddingBottom));
 zoom=Math.min(1,height*box.width/box.height/width);fitMode=true;renderZoom();stage.scrollLeft=0;
}
zoomOut.onclick=()=>setZoom(zoom-0.25);
zoomIn.onclick=()=>setZoom(zoom+0.25);
document.getElementById('zoom-reset').onclick=()=>{setZoom(1);stage.scrollLeft=0};
document.getElementById('zoom-fit').onclick=()=>{fitToScreen();window.scrollTo(0,0)};
window.addEventListener('resize',()=>{if(fitMode)fitToScreen()});
</script></html>'''
(OUT/'index.html').write_text(html)
print('Created SVG, interactive HTML, routes.json and validation.json')
