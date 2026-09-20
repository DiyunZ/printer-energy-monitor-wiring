# Printer energy monitor wiring guide

[Open the interactive website](https://diyunz.github.io/printer-energy-monitor-wiring/)

Rev. 6, September 19, 2026: a dimensioned, interactive 3D layout and wiring guide for one 120 V printer and a DENT ELITEpro XC. It uses **one operating breaker**, a **dedicated enclosure receptacle for the existing two-pin adapter**, **three labeled blue voltage pigtails**, and **one CT around printer hot only**.

Drag the 3D model to orbit, scroll / pinch to zoom, or use the top, front and right-side views. Inspect the closed enclosure through transparent walls, show solid walls, lift the lid or remove the shell. Select a part for dimensions and its source. Keyboard controls and a PNG export are included.

The Hammond PCJ16148CC enclosure comes from manufacturer CAD. The meter has the published long **216 × 63 × 47 mm** body proportions. All parts share one millimetre scale; estimated parts are identified in the inspector. [Materials and buying links](https://diyunz.github.io/printer-energy-monitor-wiring/materials.html) include the enclosure/panel, panel-mounted Q0, outlet/box/faceplate, fuse holder, terminals, cords and entries. Exact fuse value and unresolved hardware measurements remain pending.

The blue pigtails are **L1 / hot, L2 / neutral, and N / neutral**. Protective earth has its own rated wiring, including the added metal outlet-box bond. A passive voltage-tap fuse Fv is proposed; final protection ratings require qualified review. Adapter and voltage-tap branches are before CT.

The wiring plan uses the **same X/Z component positions and body proportions as the 3D model**, with the rear printer exit at the top and the front breaker at the bottom. Use “Compare 3D” to match the orientation. `layout_dimensions.json` supplies both views; wire bends and terminal symbols are simplified for legibility.

The circuit has **24 individually traceable paths**, group highlighting, keyboard selection, zoom and SVG / PNG downloads. Paths 20–23 describe the existing adapter's factory contacts and cable; they are not parts to rewire.

The main page has four sections: 3D layout, wiring, materials and operation. Connector details, dimension sources, connection schedules and full specifications expand on demand. All 36 material groups retain their images, inventory status, quantities and purchase links; pending checks remain visible before expanding specifications.

## Installation audit

[Read the 36-part audit](https://diyunz.github.io/printer-energy-monitor-wiring/installation.html). Corrected Q0 body / stud / mounting dimensions, #10 ring selection, KVT flange envelopes and spacing, and the voltage-lead coil scenario. The model offers six installation stages and a panel-insertion slider. The panel must enter before the side outlet box. Nine nominal swept body envelopes clear the empty shell; this does not validate the full build.

Wall cutouts / supports, the Q0 guard, actual CT / adapter / lead dimensions, gland stacks and protection remain unresolved. Eaton holder SKU data conflict with its technical sheet. The audit explicitly does not release fabrication or energizing. User-confirmed printer alternatives are S5, P2S and CORE One+, one at a time on the verified 120 V supply.

## Design status

This is a design-review candidate, not an approved construction drawing. CT model/range, adapter label, pigtail ratings, breaker/fuse coordination, physical fit and electrical acceptance remain unverified. No hardware has been energized or tested by this update. The upstream voltage tap is a project adaptation; downstream cable losses still affect the measurement boundary.

See [sources and design decisions](Wiring_References_EN.md). The enclosure is selected for this proposed layout; installed fit is not certified. The user confirmed that the proposed outlet is for the black two-pin AC/DC adapter.

## Files and editing

- `build_routes.py`: circuit endpoints, paths, SVG generator and connectivity checks (Python standard library).
- `draw_external.py`: blue-adapter chain, actual meter end view and panel / operating detail.
- `page_template.html`: English page content, responsive styles and interaction code.
- `index.html`: generated website; `wiring_routes.html` redirects here.
- `layout3d.js` / `.css`: local WebGL model and camera/component controls.
- `layout_dimensions.json`: shared component and repeated-part positions, plan projection, dimension provenance and evidence limits.
- `procurement.json`: the inventory source for the website and downloadable BOM. Five equipment groups are confirmed on hand; all other enclosure materials, including USB, are to buy or fabricate. Rows distinguish direct purchase, size/rating selection, fabrication quotes and references.
- `assets/materials/` / `material-images.css`: images displayed below each material name. Image metadata and source credits live in `procurement.json`. Supplied equipment photos are unmodified; CSS selects the relevant area. Supplier family references and the three custom-part concepts are labeled, and gallery images do not share the 3D model's millimetre scale.
- `assets/enclosure.bin` / `.json`: triangulated manufacturer enclosure geometry and provenance.
- `vendor/`: Three.js 0.186.0 browser modules and license.
- `Procurement_BOM.md` / `materials.html`: generated checklist with ownership ticks, quantities, shopping links and fit notes. “Owned” records inventory only; unresolved electrical and dimensional checks remain explicit.
- `tools/render_documents.cjs`: generates the BOM and readable reference pages (requires `marked`).
- `tools/convert_enclosure.cjs`: optional STEP-to-mesh regeneration (requires `occt-import-js` 0.0.23).
- `installation_review.json` / `Installation_Audit.md` / `installation.html`: all-material review, primary sources, printer assessment, assembly sequence and release blockers.
- `tools/audit_installation.mjs` / `tools/test_installation.mjs`: nominal CAD shell intersection / insertion checks and regressions; outputs `installation_checks.json`.
- `installation_cables.json`: measured rendered path lengths for the assumed 2 m / 3 mm coil scenario; regenerated by local browser QA with `EXPORT_AUDIT=1`.
- `tools/verify_site.cjs`: actual browser checks for 3D gestures, views, real 3D-to-SVG body placement/scale agreement, circuit traces and responsive layout (requires Playwright).
- `wiring_routes.svg` / `.png`: main schematic.
- `connector_detail.svg` / `.png`: connector detail drawing.
- `routes.json` / `validation.json`: generated endpoint list and drawing checks, not hardware validation.
- `test_routes.py`: regression cases that reject CT, PE and breaker-bypass miswiring in the drawing.
- `Wiring_References_EN.md` / `references.html`: matching references and evidence limits.

Run `node tools/audit_installation.mjs` and `node --test tools/test_installation.mjs` for the mechanical screen. Run `python3 build_routes.py` and `python3 -m unittest -v test_routes.py`, then `python3 -m http.server 8000` to preview. Export both SVGs to PNG after a drawing change. Run `node tools/render_documents.cjs` after editing the procurement data or reference Markdown. Run `node tools/verify_site.cjs` against the preview (`CHECK_URL` overrides its default local URL). The checked-in page needs no external runtime or build service; the 3D view requires a browser with WebGL2/import-map support. The circuit and tables remain readable without 3D.

GitHub Pages publishes the repository root on `main`. Pushing reviewed website changes updates [the public site](https://diyunz.github.io/printer-energy-monitor-wiring/).
