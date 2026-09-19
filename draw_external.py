"""Detail view: connector roles and daily-use panel, never a mounting template."""
def draw_external(add,rect,text,line,circle,C):
    text(48,55,'Connector details | Match labels, not cable color',34,weight=700)
    text(48,91,'Based on the supplied ELITEpro XC photographs and DENT connector documentation. Not to scale.',20,color='#63768a')
    text(48,148,'A. Three existing blue pigtails → three full voltage leads',25,weight=700)
    text(48,180,'Bare ends stay fixed inside guarded terminals. Disconnect mains and verify absence of voltage before unplugging these leads.',18,color='#63768a')
    for y,name,source,lead,port,color in [
        (245,'A1 · HOT','Fv protected hot','Existing L1 lead','L1',C['L']),
        (330,'A2 · NEUTRAL','Neutral terminal JN','Existing L2 lead','L2','#b8343e'),
        (415,'A3 · NEUTRAL','Neutral terminal JN','Existing N lead','N',C['N'])]:
        rect(48,y-28,280,55,'#f3f6f9','#c6d0db',6);text(67,y+7,source,20,weight=600)
        line([(328,y),(398,y)],'#8f98a2',6);line([(398,y),(740,y)],C['V'],8)
        text(535,y-16,name,19,C['V'],700,anchor='middle')
        rect(718,y-15,72,30,'#1673c5','#0b4f90',5);line([(790,y),(829,y)],'#8995a0',3,extra='stroke-dasharray="4 4"')
        rect(829,y-15,65,30,'#dce2e8','#8393a1',5);line([(894,y),(1290,y)],color,7)
        if port=='N':line([(894,y),(1290,y)],'#fff',3)
        text(1085,y-18,lead+' (verify actual color)',17,color='#63768a',anchor='middle')
        rect(1290,y-20,250,40,'#e7f1fb','#99b5cc',5);text(1415,y+7,'ELITEpro '+port,21,weight=700,anchor='middle')
    text(340,474,'Tinned end → rated terminal',17,color='#63768a');text(716,474,'Shrouded mating pair',17,color='#63768a')
    text(1110,474,'Full voltage lead → meter socket',17,color='#63768a')
    text(48,522,'All three short adapters are blue. Label BOTH ends A1/HOT, A2/NEUTRAL and A3/NEUTRAL.',21,C['V'],700)
    text(48,553,'These are sensing accessories. Use rated power conductors for the printer and separate correctly identified PE bonding.',18,color='#63768a')
    text(48,620,'B. Meter end views',25,weight=700)
    rect(48,642,730,240,'#253642','#253642',12)
    for x,ch in [(105,'CH1'),(235,'CH2'),(365,'CH3'),(495,'CH4')]:
        for dx,label in [(0,'+'),(47,'−')]:
            rect(x+dx,665,31,31,'#dce3e8','#dce3e8',4);text(x+dx+15,687,label,20,weight=700,anchor='middle')
        text(x+39,725,ch,19,'#fff',600,'middle')
    rect(666,665,35,31,'#dce3e8','#dce3e8',4);text(683,725,'S',20,'#fff',600,'middle')
    for x,label,note in [(147,'N','NEUTRAL'),(317,'L3','UNUSED'),(487,'L2','NEUTRAL'),(657,'L1','HOT')]:
        circle(x,779,24,'#fff' if label=='N' else '#121d27','#94a6b5');circle(x,779,12,'#162533','#8497a8')
        text(x,830,label,25,'#fff',700,'middle');text(x,861,note,14,'#e3edf7',500,'middle')
    text(48,911,'CT input ≠ mains. S is a shield terminal, not an enclosure earth terminal.',17,color='#63768a')
    rect(824,642,480,240,'#edf3f8','#afbecb',12)
    for y,label,size in [(678,'Other end: power / USB / analog',20),(721,'POWER IN: 6–10 V DC, 500 mA',19),(755,'Verified DENT adapter; center positive.',17),(792,'USB Type B → ELOG computer',19),(829,'Analog CH1–CH4 ≠ CT CH1–CH4',19),(862,'No mains into DC, USB, analog or CT ports.',17)]:text(848,y,label,size)
    rect(1350,642,400,240,'#f3f6f8','#aebdca',12);text(1374,678,'Exterior controls · separate faces',19,weight=700)
    rect(1380,710,80,95,'#fff','#8c9ba8',6);rect(1400,735,40,45,'#273440','#273440',3);text(1420,832,'FRONT · Q0',15,weight=700,anchor='middle')
    rect(1510,710,200,135,'#fff','#8c9ba8',7)
    for x in [1570,1630]:rect(x,737,9,30,'#273440','#273440',1)
    circle(1605,796,9,'#273440','#273440');text(1610,835,'RIGHT · XA',15,weight=700,anchor='middle')
    text(1350,911,'Guard rear terminals; bond metal mounting parts.',16,color='#63768a')
    rect(48,961,1702,174,'#f5f8fb','#c8d5df',10);text(70,998,'After assembly release and ELOG setup',25,weight=700)
    for x,no,title,sub in [(75,'1','PLUG IN','Printer + adapter + supply; Q0 OFF'),(620,'2','Q0 ON','Printer, outlet and voltage tap powered'),(1170,'3','CHECK LOGGING','Confirm valid readings and recording')]:
        circle(x+20,1054,23,'#173f64','#173f64');text(x+20,1062,no,22,'#fff',700,'middle')
        text(x+60,1048,title,23,weight=700);text(x+60,1082,sub,17,color='#63768a')
    text(48,1180,'Voltage leads remain inside the closed enclosure during routine use. Q0 OFF does not isolate its incoming terminals.',18,color='#8b651e')
