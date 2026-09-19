# Three.js browser dependency

Vendored browser modules from **three 0.186.0** (MIT), from the official npm package:
https://registry.npmjs.org/three/-/three-0.186.0.tgz

- `build/three.module.js` → `three.module.js`
- `build/three.core.js` → `three.core.js`
- `examples/jsm/controls/OrbitControls.js` → `OrbitControls.js`
- `examples/jsm/geometries/RoundedBoxGeometry.js` → `RoundedBoxGeometry.js`
- `LICENSE` → `THREE-LICENSE.txt`

The native import map in `page_template.html` resolves `three` locally. No CDN, account, API key or runtime npm install is required. A browser with WebGL2 and import-map support is needed for the 3D view; the HTML schedules and SVG circuit are available independently.
