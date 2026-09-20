import * as THREE from 'three';

// Secondary hardware is an installation illustration, not a machining template.
// Panel/rail datums come from the same schedule as the existing CAD openings.
export function addInstallationHardware({ dimensions, instances, parts, allMeshes, box, cylinder, mesh, material, decal, mark, capture, materialLocations }) {
  const h = dimensions.installationHardware;
  function annulus(outer, inner, depth, position, color, part, axis = 'y') {
    const shape = new THREE.Shape(); shape.absarc(0,0,outer,0,Math.PI*2,false);
    const hole = new THREE.Path(); hole.absarc(0,0,inner,0,Math.PI*2,true); shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}); geo.translate(0,0,-depth/2);
    if(axis==='y')geo.rotateX(-Math.PI/2); if(axis==='x')geo.rotateY(Math.PI/2);
    return mesh(geo,material(color,.45),position,part);
  }
  const holder = allMeshes.filter(m => m.userData.part === 'fuse' && !m.userData.materialId);
  const f = h.fuseCartridge;
  capture('fuse','cartridge','Inside Fv holder',()=>{
    cylinder(f.diameter/2,f.length-12,f.position,'#f0e7ce','fuse','z');
    for(const sign of [-1,1]) cylinder(f.diameter/2,6,[f.position[0],f.position[1],f.position[2]+sign*(f.length/2-3)],'#b5b7ac','fuse','z');
  },holder);
  h.railStops.positions.forEach((pos,i)=>capture('din-stops',String(i),`${i ? 'Right' : 'Left'} of Fv`,()=>{
    box(h.railStops.size,pos,'#a9afac','rail',.6);
    cylinder(2,2,[pos[0],pos[1]+18,pos[2]],'#747f82','rail');
  }));
  for(const id of ['dc-entry','usb-entry']) {
    const p=instances[id], shape=new THREE.Shape();
    shape.moveTo(-10.5,-10.5);shape.lineTo(10.5,-10.5);shape.lineTo(10.5,10.5);shape.lineTo(-10.5,10.5);shape.closePath();
    const hole=new THREE.Path();hole.absarc(0,0,id==='dc-entry'?2.6:2.4,0,Math.PI*2,true);shape.holes.push(hole);
    const geo=new THREE.ExtrudeGeometry(shape,{depth:19,bevelEnabled:false,curveSegments:24});geo.translate(0,0,-9.5);geo.rotateY(Math.PI/2);
    const frame=materialLocations['split-entries'].find(p=>p.key===id).objects;
    mark('kt-inserts',id,`${id==='dc-entry'?'DC':'USB'} insert inside KVT 32`,[mesh(geo,material('#babdb8'),p.position,'entries')],frame);
  }
  // Representative washer/head/shank stacks; use the build package for threads,
  // lengths and torque. Carrier longitudinal hole datums require transfer drilling.
  function fixing(key,label,[x,y,z],part,diameter=4,axis='y',length=12) {
    capture('fasteners',key,label,()=>{
      const shift=(pos,t)=>pos.map((v,i)=>v+(i===({x:0,y:1,z:2}[axis])?t:0));
      cylinder(diameter/2,length,shift([x,y,z],-length/2),'#8c969a',part,axis);
      annulus(diameter,diameter/2+.2,.8,[x,y,z],'#acb5b7',part,axis);
      cylinder(diameter*.85,2,shift([x,y,z],1.4),'#89979c',part,axis,null,6);
    });
  }
  for(const y of [-1,1]) fixing(`q0-${y}`,`Q0 mounting screw ${y<0?1:2}`,[parts.q0.position[0],parts.q0.position[1]+y*parts.q0.mountPitch/2,208.5],'q0',3.5,'z',9.525);
  for(const y of [-26.785,26.785]) fixing(`xa-${y}`,`XA flange screw ${y<0?1:2}`,[184.94,parts.outlet.position[1]+y,parts.outlet.position[2]],'outlet',3.5,'x',19.05);
  dimensions.instances.filter(p=>p.part==='terminals').forEach(p=>{
    for(const x of [-10,10]) fixing(`${p.id}-${x}`,`${p.id} carrier fixing ${x<0?1:2}`,[p.position[0]+x,6.3,p.position[2]+17],'terminals',3);
  });
  h.railFixingsXZ.forEach(([x,z],i)=>fixing(`rail-${i}`,`DIN rail fixing ${i+1}`,[x,3.9,z],'rail'));
  h.cableMountsXZ.forEach(([x,z],i)=>{
    capture('tie-mounts',String(i),`Panel cable anchor ${i+1}`,()=>{
      // TM2S8 nominal 16 × 10.8 × 7 mm; screw center is the shared anchor datum.
      box([10.8,2,16],[x,2.9,z-4],'#dbded5','terminals',.7);
      for(const side of [-1,1])box([2.4,5,7],[x+side*4.2,6.4,z-8],'#dbded5','terminals',.5);
      box([10.8,1.2,7],[x,8.3,z-8],'#dbded5','terminals',.5);
    });
    fixing(`anchor-${i}`,`Cable anchor ${i+1} fixing`,[x,4.1,z],'terminals');
    capture('cable-ties',String(i),`Tie at panel anchor ${i+1}`,()=>{
      // Rounded loop indicates the dressing position; exact slack is set on receipt.
      const curve=new THREE.CatmullRomCurve3([
        [x-6,6.5,z-8],[x-8,13,z-8],[x,20,z-8],[x+8,13,z-8],[x+6,6.5,z-8]
      ].map(p=>new THREE.Vector3(...p)),true,'centripetal');
      mesh(new THREE.TubeGeometry(curve,32,.8,6,true),material('#465153'),[0,0,0],'terminals');
      box([4,3,4],[x+7,9,z-8],'#465153','terminals',.4);
    });
  });
  const q=parts.q0,terminalZ=q.position[2]-q.size[2]/2-q.studProjection;
  const lugPlaces=[
    ['q0-in','Q0 input stud',[q.position[0],q.position[1]+q.terminalPitch/2,terminalZ+8],'q0','z'],
    ['q0-out','Q0 output stud',[q.position[0],q.position[1]-q.terminalPitch/2,terminalZ+8],'q0','z'],
    ['panel-pe','Panel PE bond',[h.panelBondXZ[0],5,h.panelBondXZ[1]],'panel','y'],
    ['rail-pe','DIN rail PE bond',[h.railBondXZ[0],6,h.railBondXZ[1]],'rail','y']
  ];
  for(const [key,label,[x,y,z],part,axis] of lugPlaces) {
    capture('ring-lugs',key,label,()=>{
      annulus(5.7,2.65,1,[x,y,z],'#b6b6a6',part,axis);
      const sleeve=axis==='y'?[x,y+1,z+11]:[x,y-11,z];
      box(axis==='y'?[4,1,8]:[4,8,1],axis==='y'?[x,y,z+6]:[x,y-6,z],'#babbb0',part);
      cylinder(3,9,sleeve,'#3387bf',part,axis==='y'?'z':'y');
    });
    if(key.endsWith('pe'))fixing(key,label+' hardware',[x,y+1.8,z],part,4.8,'y',15.875);
  }
  for(const [id,text,pos,facing] of [
    ['supply','SUPPLY IN',[-186.2,66,128],'right'],['printer','TO PRINTER',[0,62,-211.4],'front'],
    ['dc','DC',[186.85,107,106],'right'],['usb','USB',[186.5,84,167],'right'],
    ['panel-pe','PE',[-125,2.1,77],'up']
  ]) mark('labels',id,text,[decal(text,22,8,pos,'entries',facing)]);
}
