# Printer energy monitor wiring guide

[Interactive website](https://diyunz.github.io/printer-energy-monitor-wiring/) · [Materials](https://diyunz.github.io/printer-energy-monitor-wiring/materials.html) · [Build package](https://diyunz.github.io/printer-energy-monitor-wiring/build.html)

Build package A, September 20, 2026: one grounded 120 V printer, one operating breaker, a dedicated outlet for the existing adapter, three sensing pigtails and one CT on printer hot. The user's printer alternatives are UltiMaker S5, Bambu P2S and Prusa CORE One+; only one is connected at a time.

The English site provides a rotatable 3D model, matching 2D component positions, 25 traceable circuit paths, a 30-group illustrated checklist (5 owned / 25 to buy or fabricate), six installation stages and machining downloads. The meter retains its long 216 × 63 × 47 mm catalog proportions. Real component dimensions and estimates are distinguished.

Each material has a **View in 3D** link on both checklist pages. It frames and highlights the installed parts, with an occurrence selector for materials used in several places. Hidden cartridges and sealing inserts can be seen through their housings. Direct links such as `?material=ring-lugs#layout` survive reloads; **Back to material** returns to the relevant checklist row. Spares and leftover stock are excluded. Small fittings and cable dressing are illustrative; this feature does not add physical assembly validation or new drilling dimensions.

The revised design uses a directly mounted **Leviton 5279-C**, **Littelfuse LPSC0001Z**, a **JV** transition connector for the fuse-holder's 14 AWG output, long-thread glands, and adjustable **19.05 mm straps through 21 × 4 mm slots**. The build package includes exact fastener links and counts, wire blanks and assembly order. Install the panel before the side outlet.

The original photo identifies the adapter as **CUI SMI6-9-V-P5, 9 V, 0.667 A, center positive**. The blue pigtail matches **DENT LD-SKTSP-BLU (254 mm)**; the CT matches **Mini HSC**, probably the legacy 50 A variant. Two **icotek 41380** split inserts accept the **4.8 mm USB2HAB6** and new **5.2 mm Tensility 10-02228** extension; the original flat cord stays outside. CT scaling and sensing-lead protection/termination still need acceptance. **This is an engineering review package, not complete-order, machining or energizing release.** No physical build or electrical acceptance is claimed.

## Source files

- `layout_dimensions.json`: shared placement, dimensions and provenance for 3D and 2D.
- `layout3d.js`, `layout3d.css`, `assets/enclosure.*`: WebGL scene and machined manufacturer shell/panel.
- `material-locator.js`, `installation-hardware.js`: material navigation/highlighting and secondary installation geometry. `installationHardware` in the shared dimension schedule retains the CAD anchor and bond datums.
- `build_routes.py`, `draw_external.py`, `page_template.html`: netlist, drawings and main-page generator.
- `procurement.json`: ownership, quantities, exact parts, pictures and buying links.
- `Build_Package.md`, `Wiring_References_EN.md`: build details and evidence.
- `installation_review.json`, `installation_checks.json`, `installation_cables.json`: material review and bounded digital checks.
- `tools/cad/`: parametric machining and drawing generators; `fabrication/`: STEP, STL, DXF, PDF and exact cut checks. These modify purchased parts, not a 3D-printed replacement mains enclosure.
- `tools/render_documents.cjs`: generates materials, references, audit and build HTML using `marked`.
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

For machining regeneration, install Python 3.12 with `build123d==0.11.1`, `ezdxf` and `matplotlib`. Obtain the linked original Hammond STEP and run:

```sh
python tools/cad/enclosure_model.py --source-step /path/to/PCJ16148CC.step
python tools/cad/draw_fabrication.py
```

`tools/convert_enclosure.cjs` imports the original 38-part factory assembly; it overwrites the shell/panel meshes, so run the machining generator afterward. Numerically check and visually inspect regenerated artifacts before publication.

GitHub Pages publishes the repository root on `main`. The [installation audit](https://diyunz.github.io/printer-energy-monitor-wiring/installation.html) distinguishes software checks from physical acceptance.
