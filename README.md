# Printer energy monitor wiring guide

[Interactive website](https://diyunz.github.io/printer-energy-monitor-wiring/) · [Materials](https://diyunz.github.io/printer-energy-monitor-wiring/#hardware) · [Build documents](https://diyunz.github.io/printer-energy-monitor-wiring/documents.html)

Build package A, September 20, 2026: one grounded 120 V printer, one operating breaker, a dedicated outlet for the existing adapter, three sensing pigtails and one CT on printer hot. The user's printer alternatives are UltiMaker S5, Bambu P2S and Prusa CORE One+; only one is connected at a time.

The English site provides a rotatable 3D model, matching 2D component positions, 21 traceable circuit paths, a 25-group illustrated checklist (5 owned / 1 kit supplied / 19 to buy or fabricate), six installation stages and machining downloads. The meter retains its long 216 × 63 × 47 mm catalog proportions. Real component dimensions and estimates are distinguished.

Each material has a **View in 3D** link on both checklist pages. It frames and highlights the installed parts, with an occurrence selector for materials used in several places. Hidden sealing inserts can be seen through their housings. Direct links such as `?material=ring-lugs#layout` survive reloads; **Back to material** returns to the relevant checklist row. Spares and leftover stock are excluded. Small fittings and cable dressing are illustrative; this feature does not add physical assembly validation or new drilling dimensions.

The revised layout uses **six cable mounts and six ties**, with matching panel machining datums. Flat tie bands wrap the rendered wire cross-sections; two restrain the concentric voltage-lead coils. Power-cord jackets pass through the glands and break out inside the case. CT hot is a straight through-aperture segment, and the CT body rests on the panel. Anchor screws are M4 × 16 mm with underside washers and locknuts. The dedicated panel PE bolt has its head below the panel. Label dispensers are removed from purchasing; drawing identifiers remain.

The main page is organized for project review and purchasing. **Design** switches between 3D and wiring while retaining the camera and circuit selection. **Materials** shows the 19 purchase groups first, with the 5 owned groups and kit-supplied USB cable expandable below; material links open that group when needed. **To confirm** lists the remaining CT, sensing-lead protection and breaker decisions. **Details** retains full specifications, receiving checks, pack quantities and image credits; purchasing holds remain visible. **More** contains additional views, enclosure modes, display toggles and PNG export.

**Wiring** opens at a readable scale centered on the enclosure. Drag or use arrow keys to pan; **Reset** restores this view. **Fit all** is an overview including external connectors, while **Fullscreen** uses the browser viewport (Escape returns). Color-coded circuit buttons replace the separate legend. Wire numbers appear only on the selected connection, alongside its endpoints; **Focus selection** frames a wire or circuit group. Explanations remain under **Wiring details**, and all 21 paths remain in the expandable connection schedule. Shared component coordinates keep the wiring plan and 3D layout aligned. Standalone SVG/PNG drawings retain every wire number.

**Build documents** collects the machining package, six-stage interactive installation sequence, operation and setup instructions, dimensions, sources, audit and full BOM. Existing material, wiring and operation bookmarks remain supported. The main page omits routine photo captions but still identifies reference images and design concepts.

The revised design uses a directly mounted **Leviton 5279-C**, three WAGO connector/carrier pairs (JL, JN and PE), long-thread glands, and adjustable **19.05 mm straps through 21 × 4 mm slots**. A1 connects to JL after Q0; no dedicated voltage fuse is installed. Upstream-only lead protection requires electrical acceptance before use. The build package includes fastener links and counts, wire blanks and assembly order. Install the panel before the side outlet.

The original photo identifies the adapter as **CUI SMI6-9-V-P5, 9 V, 0.667 A, center positive**. The user confirms three original DENT kit voltage pigtails in different colors, matched to the **LD-SKTSP family (254 mm nominal)**; the CT matches **Mini HSC**, probably the legacy 50 A variant. One **icotek 41380** insert accepts the **5.2 mm Tensility 10-02228** DC extension; the original flat cord stays outside. Reuse the DENT kit USB cable only with mains unplugged and the lid open. USB has no wall opening and is absent during printing. CT scaling and sensing-lead protection/termination still need acceptance. **This is an engineering review package, not complete-order, machining or energizing release.** No physical build or electrical acceptance is claimed.

## Source files

- `layout_dimensions.json`: shared placement, dimensions and provenance for 3D and 2D.
- `layout3d.js`, `layout3d.css`, `assets/enclosure.*`: WebGL scene and machined manufacturer shell/panel.
- `material-locator.js`, `installation-hardware.js`: material navigation/highlighting and secondary installation geometry. `installationHardware` in the shared dimension schedule retains the CAD anchor and bond datums.
- `site-navigation.js`: design tabs, bookmark routing and automatic expansion of owned materials.
- `build_routes.py`, `draw_external.py`, `page_template.html`: netlist, drawings and main-page generator.
- `wiring.js`, `wiring.css`: circuit tracing, readable SVG viewport, pan/zoom and fullscreen dialog.
- `procurement.json`: ownership, quantities, exact parts, pictures and buying links.
- `Build_Package.md`, `Wiring_References_EN.md`: build details and evidence.
- `installation_review.json`, `installation_checks.json`, `installation_cables.json`, `installation_supports.json`: material review and bounded digital checks.
- `cable-supports.js`: sampled wire cross-sections, fitted tie openings and component-body screening.
- `tools/cad/`: parametric machining and drawing generators; `fabrication/`: STEP, STL, DXF, PDF and exact cut checks. These modify purchased parts, not a 3D-printed replacement mains enclosure.
- `tools/render_documents.cjs`: generates materials, references, audit, build HTML and the `Build_Documents.md` / `documents.html` hub using `marked`.
- `tools/verify_site.cjs`: Playwright behavior/alignment/asset checks. Three.js is vendored with its license; the deployed site needs no CDN.
- `tools/verify_material_locator.cjs`: every BOM link, distinct mesh ownership, installed counts, individual positions, direct links, history, keyboard and mobile behavior.

## Reproduce

```sh
python3 build_routes.py
python3 -m unittest -v test_routes.py
node tools/audit_installation.mjs
node --test tools/test_installation.mjs
node tools/render_documents.cjs
python3 -m http.server 8770
```

With the local server running, use `CHECK_URL=http://127.0.0.1:8770/ node tools/verify_site.cjs`. `EXPORT_AUDIT=1` refreshes the illustrative cable report; `EXPORT_DRAWINGS=1` refreshes PNG drawings. After updating audit data, rerun the document generator. The checks require Node with Playwright and `marked`; the public static site does not.

Run `node tools/verify_material_locator.cjs` for the material-to-model behavior and `python3 -m unittest -v test_material_locations.py` for installation-datum consistency with the machining source. `QA_OUTPUT=/path/out` saves screenshots and browser check reports outside the source tree.

Run `node tools/verify_wiring.cjs` for default label readability, selected-wire endpoints, panning, fit/focus, fullscreen restoration and 320–1440 px viewport coverage.

Run `node --test tools/test_cable_supports.mjs` for negative controls (empty, misplaced, too-small and too-long ties), then `node tools/verify_cable_geometry.cjs` for all six rendered supports, coil separation, CT passage and cord breakouts. `EXPORT_AUDIT=1` refreshes `installation_supports.json`. These are geometry checks with assumed cable diameters and simplified terminal regions, not physical retention or electrical acceptance.

For machining regeneration, install Python 3.12 with `build123d==0.11.1`, `ezdxf` and `matplotlib`. Obtain the linked original Hammond STEP and run:

```sh
python tools/cad/enclosure_model.py --source-step /path/to/PCJ16148CC.step
python tools/cad/draw_fabrication.py
```

`tools/convert_enclosure.cjs` imports the original 38-part factory assembly; it overwrites the shell/panel meshes, so run the machining generator afterward. Numerically check and visually inspect regenerated artifacts before publication.

GitHub Pages publishes the repository root on `main`. The [installation audit](https://diyunz.github.io/printer-energy-monitor-wiring/installation.html) distinguishes software checks from physical acceptance.

[Protection review](Protection_Review.md) records Q0 and upstream voltage-lead protection, the JIS information gap and the offline data workflow.
