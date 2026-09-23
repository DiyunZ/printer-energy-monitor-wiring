# Printer energy monitor wiring guide

[Interactive website](https://diyunz.github.io/printer-energy-monitor-wiring/) · [Materials](https://diyunz.github.io/printer-energy-monitor-wiring/#hardware) · [Build documents](https://diyunz.github.io/printer-energy-monitor-wiring/documents.html)

Revision C, September 23, 2026: one grounded 120 V printer, one operating breaker, an **internal** XA cord connector and original adapter, three sensing pigtails and one CT on printer hot. One printer is connected at a time.

[Revision C: costs, suppliers and approval evidence](Design_Revision_B.md) records the professor’s review and the resulting decisions. The proposed PCJ16148 opaque cover and offered aluminum sheet reduce the dated **box/raw-panel** allowance from $179.89 to $137.11 ($42.78), excluding fabrication, freight and tax. The active list has **18 purchase groups + 1 proposed fabrication group**, five owned groups and one kit-supplied group. Purchase sources reduce from 12 directly linked vendors plus Bolt Depot to five planned order sources, including fasteners. No order is placed or full-system saving claimed.

The complete [material order plan](materials.html#order-plan) is **$287.71 before freight, tax, fabrication and any required bonding changes**. It uses a UL/CSA-listed Gardner Bender 15-pack, ten individually sold cable ties, and four feet per color of internal wire; no 100-piece ring bottle or full wire rolls are selected.

The round DC extension, external coupling, KVT frame and insert are removed. The right wall has a USB service port for closed-lid offline export. XA uses a complete **Leviton 515CV** cord connector and 14/3 branch before CT; it shares the same SKU as the printer output (two total). The original adapter cable stays inside. Six cable anchors retain loose wiring; four straps retain logger, XA and adapter. The default 3D X-ray view is a viewing aid; closed mode renders the selected opaque lid.

The English site retains its rotatable 3D model, aligned wiring view, **21 traceable circuit paths**, illustrated material locations, six installation stages and machining downloads. **Design** switches views without losing camera or circuit selection. **Materials** lists purchases and proposed aluminum fabrication first, with owned equipment expandable below. Each item’s **Details** includes source-specific certification evidence or the remaining evidence check. The priced DIN-breaker comparison is separate from the active Carling selection; no protection downgrade is assumed.

Material **View in 3D** links highlight all or individual installation locations and support direct URLs, history, keyboard and mobile use. Wiring supports readable reset, pan, zoom, fit, selected endpoints and fullscreen. Standalone SVG/PNG drawings retain all connection IDs.

Five equipment groups remain confirmed owned. The CUI SMI6-9-V-P5 adapter is 9 V / 0.667 A, center positive; three original multicolor DENT LD-SKTSP-family pigtails remain. Mini HSC 50 A is probable; actual CT scale remains to be verified. Use the external kit USB only offline with mains unplugged; export through the new side USB-B port with the lid closed. A short internal A-to-B lead and 600 V sleeve remain installed. The material subtotal is $287.71; USB adds $26.45 without adding a seller. The user-selected **CA1-B0-24-615-121-DG** remains selected after the sourcing comparison: $40.32 from Master Electronics. Application checks remain physical acceptance items. A1 still uses upstream Q0 protection only.

**Engineering review package.** The offered aluminum has not been measured; CAD retains the 1.89738 mm panel template and common PCJ16148CC base geometry, with the opaque-lid silhouette illustrative. Verify stock, opaque lid, mounting pattern, aluminum bonding, internal plug restraint, original cable slack and closed-enclosure temperature. Q0/supply/startup suitability and voltage-lead protection remain open. No physical dry fit, fabrication or electrical release is claimed.

## Source files

- `layout_dimensions.json`: shared placement, dimensions and provenance for 3D and 2D.
- `layout3d.js`, `layout3d.css`, `assets/enclosure.*`: WebGL scene and machined common-base shell / proposed aluminum-panel template.
- `material-locator.js`, `installation-hardware.js`: material navigation/highlighting and secondary installation geometry. `installationHardware` in the shared dimension schedule retains the CAD anchor and bond datums.
- `site-navigation.js`: design tabs, bookmark routing and automatic expansion of owned materials.
- `build_routes.py`, `draw_external.py`, `page_template.html`: netlist, drawings and main-page generator.
- `wiring.js`, `wiring.css`: circuit tracing, readable SVG viewport, pan/zoom and fullscreen dialog.
- `procurement.json`: ownership, quantities, exact parts, pictures and buying links.
- `Build_Package.md`, `Wiring_References_EN.md`: build details and evidence.
- `installation_review.json`, `installation_checks.json`, `installation_cables.json`, `installation_supports.json`: material review and bounded digital checks.
- `cable-supports.js`: sampled wire cross-sections, fitted tie openings and component-body screening.
- `tools/cad/`: parametric machining and drawing generators; `fabrication/`: STEP, STL, DXF, PDF and exact cut checks. These are review templates for a purchased shell and proposed aluminum sheet; the actual stock and support pattern must be checked before machining.
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

Run `node tools/verify_usb_service.cjs` for the mains-connector links, closed-lid USB export preview, outside camera view, permanent internal sleeve and mobile layout. This checks the website workflow; actual USB export requires hardware validation.

Run `node --test tools/test_cable_supports.mjs` for negative controls (empty, misplaced, too-small and too-long ties), then `node tools/verify_cable_geometry.cjs` for all six rendered supports, coil separation, CT passage and cord breakouts. `EXPORT_AUDIT=1` refreshes `installation_supports.json`. These are geometry checks with assumed cable diameters and simplified terminal regions, not physical retention or electrical acceptance.

For machining regeneration, install Python 3.12 with `build123d==0.11.1`, `ezdxf` and `matplotlib`. Obtain the linked original Hammond STEP and run:

```sh
python tools/cad/enclosure_model.py --source-step /path/to/PCJ16148CC.step
python tools/cad/draw_fabrication.py
```

`tools/convert_enclosure.cjs` imports the original 38-part factory assembly; it overwrites the shell/panel meshes, so run the machining generator afterward. Numerically check and visually inspect regenerated artifacts before publication.

GitHub Pages publishes the repository root on `main`. The [installation audit](https://diyunz.github.io/printer-energy-monitor-wiring/installation.html) distinguishes software checks from physical acceptance.

[Protection review](Protection_Review.md) records Q0 and upstream voltage-lead protection, the JIS information gap and the offline data workflow.
