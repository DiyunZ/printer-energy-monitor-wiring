// Millimetres. Cross-sections come from the same sampled curves as the rendered
// wires. The band profile stays a routing illustration, not a molded-part CAD.
export function supportFrame(support) {
  const [x,z] = support.holeXZ;
  return support.axis === 'x'
    ? { center:[x-8,0,z], lateral:2, along:0 }
    : { center:[x,0,z-8], lateral:0, along:2 };
}

export function crossingsAt(routes, support, offset=0) {
  const f=supportFrame(support), plane=f.center[f.along]+offset;
  const crossings=[];
  for(const route of routes.filter(r=>support.routes.includes(r.id))) {
    for(let i=1;i<route.samples.length;i++) {
      const a=route.samples[i-1], b=route.samples[i];
      const da=a[f.along]-plane, db=b[f.along]-plane;
      if(da*db>0 || da===db || db===0)continue;
      const t=-da/(db-da), p=a.map((v,k)=>v+(b[k]-v)*t);
      const u=p[f.lateral]-f.center[f.lateral];
      // A coiled lead crosses this plane on both sides of the coil.
      if(Math.abs(u)>support.captureHalfWidthMm)continue;
      crossings.push({id:route.id,u,y:p[1],radius:route.radius});
    }
  }
  return crossings;
}

export function fitSupport(routes,support) {
  const sections=[-2.4,0,2.4].map(offset=>({offset,wires:crossingsAt(routes,support,offset)}));
  if(sections.some(s=>!s.wires.length))throw Error(`Empty cable support: ${support.id}`);
  const wires=sections.flatMap(s=>s.wires);
  // The strap passes UNDER the saddle through its open transverse slot.
  const profile={left:Math.min(-6,...wires.map(w=>w.u-w.radius-.9)),
    right:Math.max(6,...wires.map(w=>w.u+w.radius+.9)),
    bottom:5.0, top:Math.max(...wires.map(w=>w.y+w.radius+.9)), corner:1.2};
  return {id:support.id,label:support.label,frame:supportFrame(support),sections,profile};
}

// Distance to the inner rounded-rectangle boundary; positive means outside.
function distanceToOpening(u,y,p) {
  const qx=Math.abs(u-(p.left+p.right)/2)-(p.right-p.left)/2+p.corner;
  const qy=Math.abs(y-(p.bottom+p.top)/2)-(p.top-p.bottom)/2+p.corner;
  return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-p.corner;
}

export function auditSupport(fit,requiredIds,profile=fit.profile) {
  const present=[...new Set(fit.sections.flatMap(s=>s.wires.map(w=>w.id)))];
  const clearance=Math.min(...fit.sections.flatMap(s=>s.wires.map(w=>-distanceToOpening(w.u,w.y,profile)-w.radius)));
  const width=profile.right-profile.left,height=profile.top-profile.bottom;
  const bandCenterPerimeter=2*(width+height)-8*profile.corner+2*Math.PI*(profile.corner+.5);
  return {id:fit.id,label:fit.label,crossings:fit.sections[1].wires.length,
    routeIds:present,missingRoutes:requiredIds.filter(id=>!present.includes(id)),
    minimumOpeningClearanceMm:clearance,bandWidthMm:4.8,
    loopWidthMm:width,loopHeightMm:height,
    lengthWithLockAllowanceMm:bandCenterPerimeter+20,
    pass:clearance>=.15&&requiredIds.every(id=>present.includes(id))&&bandCenterPerimeter+20<=188};
}

export function screenCableBodies(routes,bodies,ct) {
  const contacts={
    'internal-wire:q0-jl':['JL'], 'cord:printer-hot-in':['JL'],
    'cord:supply-neutral':['JN'], 'cord:printer-neutral':['JN'],
    'cord:supply-pe':['PE'], 'cord:printer-pe':['PE'],
    'internal-wire:jl-fv':['JL','fuse'], 'internal-wire:xa-hot':['JL'],
    'internal-wire:xa-neutral':['JN'], 'internal-wire:pe-bridge':['PE','PE+'],
    'internal-wire:xa-pe':['PE+'], 'internal-wire:rail-pe':['PE+'],
    'internal-wire:panel-pe':['PE+'], 'internal-wire:fv-jv':['fuse','JV'],
    'blue:A1':['JV'], 'blue:A2':['JN'], 'blue:A3':['JN']
  };
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  const hits=[];
  for(const [index,r] of routes.entries())for(const [id,b] of Object.entries(bodies)) {
    const inside=r.samples.filter(p=>{
      const surface=Math.hypot(...p.map((v,i)=>Math.max(b.min[i]-v,0,v-b.max[i])));
      if(surface>=r.radius-.1)return false;
      // The CT's through aperture is empty, unlike its outer bounding box.
      if(id==='ct'&&Math.hypot(p[1]-ct.position[1],p[2]-ct.position[2])+r.radius<=5.1)return false;
      // WAGO/fuse electrical terminations lack molded port cavities. Exempt only
      // the endpoint neighborhood of a named electrical connection (20 mm).
      if(contacts[r.id]?.includes(id)&&[r.samples[0],r.samples.at(-1)].some(e=>distance(p,e)<=20))return false;
      return true;
    });
    if(inside.length)hits.push({route:r.id||`route-${index}`,body:id,samples:inside.length});
  }
  return hits;
}
