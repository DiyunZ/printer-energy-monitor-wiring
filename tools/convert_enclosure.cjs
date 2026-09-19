// Rebuild the mesh asset from Hammond's PCJ16148CC STEP assembly.
// Usage: node tools/convert_enclosure.cjs /path/to/PCJ16148CC.step [output-directory]
// Requires occt-import-js 0.0.23. The original manufacturer's STEP is not bundled.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
(async () => {
  if (!process.argv[2]) throw Error('Provide the original Hammond PCJ16148CC.step file.');
  const source = fs.readFileSync(process.argv[2]);
  const occt = await require('occt-import-js')();
  const cad = occt.ReadStepFile(source, {linearUnit:'millimeter', linearDeflectionType:'absolute_value', linearDeflection:0.45, angularDeflection:0.35});
  if (!cad.success || cad.meshes.length !== 38 || cad.meshes[0].name !== 'CAD-001621_Long_Snap') throw Error('Unexpected source assembly: inspect the changed CAD before assigning part roles.');
  const metadata = {
    source:'https://www.hammfg.com/files/parts/stp/PCJ16148CC.zip',
    drawing:'https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf',
    units:'mm',
    conversion:'occt-import-js 0.0.23; 0.45 mm linear deflection; no dimensional rescaling; Y-up with mounting-panel underside at 0',
    sourceStepSha256:crypto.createHash('sha256').update(source).digest('hex'),
    meshes:[]
  };
  const chunks=[], min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  let offset=0;
  cad.meshes.forEach((mesh, i) => {
    const input=mesh.attributes.position.array, positions=Buffer.alloc(input.length*4);
    for(let j=0;j<input.length;j+=3) {
      const v=[input[j],input[j+2]+181.7624,-input[j+1]];
      for(let k=0;k<3;k++){positions.writeFloatLE(v[k],(j+k)*4);min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k]);}
    }
    const indices=Buffer.alloc(mesh.index.array.length*4);
    mesh.index.array.forEach((value,j)=>indices.writeUInt32LE(value,j*4));
    metadata.meshes.push({name:mesh.name,role:i===0?'shell':i>=15&&i<=24?'lid':i>=33?'panel':'hardware',positionOffset:offset,positionCount:input.length,indexOffset:offset+positions.length,indexCount:mesh.index.array.length});
    chunks.push(positions,indices);offset+=positions.length+indices.length;
  });
  metadata.bounds={min,max,size:max.map((v,i)=>v-min[i])};
  const output=process.argv[3] || path.join(root,'assets');fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'enclosure.bin'),Buffer.concat(chunks));
  fs.writeFileSync(path.join(output,'enclosure.json'),JSON.stringify(metadata,null,2)+'\n');
  console.log(JSON.stringify({meshCount:cad.meshes.length,bytes:offset,bounds:metadata.bounds,output}));
})().catch(error=>{console.error(error);process.exitCode=1});
