import * as THREE from 'three';
import { fitSupport, auditSupport } from './cable-supports.js?v=26';

// Secondary hardware is an installation illustration, not a machining template.
// Panel datums come from the same schedule as the existing CAD openings.
export function addInstallationHardware({ dimensions, instances, parts, box, cylinder, mesh, material, decal, mark, capture, materialLocations, cableRoutes }) {
  const h = dimensions.installationHardware;
  function annulus(outer, inner, depth, position, color, part, axis = 'y', sides=0) {
    const shape = new THREE.Shape();
    if(sides){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides;shape[i?'lineTo':'moveTo'](outer*Math.cos(a),outer*Math.sin(a));}shape.closePath();}
    else shape.absarc(0,0,outer,0,Math.PI*2,false);
    const hole = new THREE.Path(); hole.absarc(0,0,inner,0,Math.PI*2,true); shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}); geo.translate(0,0,-depth/2);
    if(axis==='y')geo.rotateX(-Math.PI/2); if(axis==='x')geo.rotateY(Math.PI/2);
    return mesh(geo,material(color,.45),position,part);
  }
  // Representative washer/head/shank stacks; use the build package for threads,
  // lengths and torque. Carrier longitudinal hole datums require transfer drilling.
  function fixing(key,label,[x,y,z],part,diameter=4,axis='y',length=12,throughPanel=false) {
    capture('fasteners',key,label,()=>{
      const shift=(pos,t)=>pos.map((v,i)=>v+(i===({x:0,y:1,z:2}[axis])?t:0));
      cylinder(diameter/2,length,shift([x,y,z],-length/2),'#8c969a',part,axis);
      annulus(diameter,diameter/2+.2,.8,throughPanel?[x,-.4,z]:[x,y,z],'#acb5b7',part,axis);
      cylinder(throughPanel?4:diameter*.85,throughPanel?3:2,shift([x,y,z],throughPanel?1.5:1.4),'#89979c',part,axis,null,throughPanel?24:6);
      if(throughPanel)annulus(4,diameter/2+.2,4,[x,-2.8,z],'#89979c',part,'y',6);
    });
  }
  for(const y of [-1,1]) fixing(`q0-${y}`,`Q0 mounting screw ${y<0?1:2}`,[parts.q0.position[0],parts.q0.position[1]+y*parts.q0.mountPitch/2,208.5],'q0',3.5,'z',9.525);
  dimensions.instances.filter(p=>p.part==='terminals').forEach(p=>{
    for(const x of [-10,10]) fixing(`${p.id}-${x}`,`${p.id} carrier fixing ${x<0?1:2}`,[p.position[0]+x,6.3,p.position[2]+17],'terminals',3,'y',16);
  });
  const supportChecks=[];
  h.cableSupports.forEach((support,i)=>{
    const [x,z]=support.holeXZ, alongX=support.axis==='x';
    const local=(u,y,v)=>alongX?[x+v,y,z+u]:[x+u,y,z+v];
    const size=s=>alongX?[s[2],s[1],s[0]]:s;
    capture('tie-mounts',String(i),support.label,()=>{
      // Catalog envelope 16 × 10.8 × 7 mm; the molded saddle is simplified.
      // A real clearance hole and transverse slot replace the old solid blocks.
      const shape=new THREE.Shape();
      shape.moveTo(-5.4,-12);shape.lineTo(5.4,-12);shape.lineTo(5.4,4);shape.lineTo(-5.4,4);shape.closePath();
      const hole=new THREE.Path();hole.absarc(0,0,2.25,0,Math.PI*2,true);shape.holes.push(hole);
      const g=new THREE.ExtrudeGeometry(shape,{depth:2,bevelEnabled:false,curveSegments:24});
      g.rotateX(Math.PI/2);g.translate(0,3.89738,0);
      if(alongX)g.rotateY(Math.PI/2);
      mesh(g,material('#dbded5'),[x,0,z],'terminals');
      for(const side of [-1,1])box(size([10.8,3.8,1]),local(0,5.8,-8+side*2.95),'#dbded5','terminals');
      box(size([10.8,1.2,7]),local(0,8.3,-8),'#dbded5','terminals',.3);
    });
    fixing(`anchor-${i}`,`Cable anchor ${i+1} fixing`,[x,3.89738,z],'terminals',4,'y',16,true);
    const fit=fitSupport(cableRoutes,support),p=fit.profile;
    supportChecks.push(auditSupport(fit,support.routes));
    function roundedPath(path,l,b,r,t,c) {
      path.moveTo(l+c,b);path.lineTo(r-c,b);path.quadraticCurveTo(r,b,r,b+c);
      path.lineTo(r,t-c);path.quadraticCurveTo(r,t,r-c,t);
      path.lineTo(l+c,t);path.quadraticCurveTo(l,t,l,t-c);
      path.lineTo(l,b+c);path.quadraticCurveTo(l,b,l+c,b);path.closePath();
    }
    capture('cable-ties',String(i),support.label,()=>{
      const band=new THREE.Shape();roundedPath(band,p.left-1,p.bottom-1,p.right+1,p.top+1,p.corner+1);
      const opening=new THREE.Path();roundedPath(opening,p.left,p.bottom,p.right,p.top,p.corner);band.holes.push(opening);
      const g=new THREE.ExtrudeGeometry(band,{depth:4.8,bevelEnabled:false,curveSegments:12});g.translate(0,0,-2.4);
      if(alongX)g.rotateY(-Math.PI/2);
      mesh(g,material('#c5cabd'),fit.frame.center,'ties');
      const center=fit.frame.center;
      box(size([4,4,6]),alongX?[center[0],p.bottom+2,center[2]+p.right+2]:[center[0]+p.right+2,p.bottom+2,center[2]],'#aeb5a5','ties',.4);
    });
  });
  const q=parts.q0,terminalZ=q.position[2]-q.size[2]/2-q.studProjection;
  const lugPlaces=[
    ['q0-in','Q0 input stud',[q.position[0],q.position[1]+q.terminalPitch/2,terminalZ+8],'q0','z'],
    ['q0-out','Q0 output stud',[q.position[0],q.position[1]-q.terminalPitch/2,terminalZ+8],'q0','z'],
    ['panel-pe','Panel PE bond',[h.panelBondXZ[0],6.4,h.panelBondXZ[1]],'panel','y']
  ];
  for(const [key,label,[x,y,z],part,axis] of lugPlaces) {
    capture('ring-lugs',key,label,()=>{
      // 15-104 published overall envelope: 25.4 × 7.874 × 6.35 mm.
      // Tongue, hole and barrel details are illustrative, not crimp-tool dimensions.
      annulus(3.937,2.65,1,[x,y,z],'#b6b6a6',part,axis);
      const sleeve=axis==='y'?[x,y+1,z+15.963]:[x,y-15.963,z];
      box(axis==='y'?[4,1,12]:[4,12,1],axis==='y'?[x,y,z+8]:[x,y-8,z],'#babbb0',part);
      annulus(3.175,1.9,11,sleeve,'#3387bf',part,axis==='y'?'z':'y');
    });
    if(key.endsWith('pe'))capture('fasteners',key,label+' hardware',()=>{
      // The dedicated PE stud starts beneath the panel. Thread and tooth details
      // remain simplified.
      cylinder(2.413,19.05,[x,8.725,z],'#8c969a',part);
      cylinder(4.6,3.2,[x,-2.4,z],'#89979c',part,'y',null,24);
      annulus(5.3,2.65,.8,[x,-.4,z],'#acb5b7',part);
      annulus(5.3,2.65,.8,[x,y-4.1,z],'#8b9698',part);
      annulus(5.5,2.413,3.2,[x,y-2.1,z],'#89979c',part,'y',6);
      annulus(5.3,2.65,.8,[x,y+.9,z],'#8b9698',part);
      annulus(5.3,2.65,.8,[x,y+1.7,z],'#acb5b7',part);
      annulus(5.5,2.413,3.2,[x,y+3.7,z],'#89979c',part,'y',6);
    });
  }
  for(const [id,text,pos,facing] of [
    ['supply','SUPPLY IN',[-186.2,66,128],'right'],['printer','TO PRINTER',[0,62,-211.4],'front'],
    ['panel-pe','PE',[-125,2.1,77],'up']
  ]) decal(text,22,8,pos,'entries',facing);
  return supportChecks;
}
