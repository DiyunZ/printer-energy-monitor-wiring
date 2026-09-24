# Development

Run commands from the repository root. The checked-in site can be served with Python alone; Node dependencies are only needed to regenerate documents or run browser checks.

## File map

| Location | Purpose |
|---|---|
| `procurement.json` | Materials, ownership, prices, photos and purchase links |
| `layout_dimensions.json` | Shared dimensions, placement and provenance |
| `installation_review.json` | Review evidence and outstanding hardware checks |
| `build_routes.py`, `draw_external.py`, `page_template.html` | Generate the main page, circuit drawings, `routes.json` and `validation.json` |
| Root `.js` / `.css` files | Website interactions, 3D geometry and styling |
| Root `.md` files | Engineering documents; BOM, audit and document index are generated |
| `tools/` | Document generators and verification scripts |
| `tools/cad/` | Parametric machining and drawing generators |
| `assets/`, `vendor/` | Model meshes, current material images and licensed Three.js modules |
| `fabrication/` | Published STEP, STL, DXF, SVG and PDF downloads |

Root HTML files and generated artifacts are committed because GitHub Pages serves them directly. Edit their source files and regenerate them. Keep existing page and download URLs working.

## Setup and rebuild

Verified Node dependencies: Node 24, `marked` 17.0.5 and Playwright 1.62.1.

```sh
npm install --no-save --package-lock=false marked@17.0.5 playwright@1.62.1
npx playwright install chromium
python3 build_routes.py
node tools/render_documents.cjs
```

`render_documents.cjs` regenerates `Procurement_BOM.md`, `Installation_Audit.md`, `Build_Documents.md` and all supporting HTML pages. Other engineering Markdown files are maintained directly.

## Checks

```sh
python3 -m unittest -v test_routes.py test_material_locations.py
node --test tools/test_installation.mjs tools/test_cable_supports.mjs
python3 -m http.server 8770
```

With the server running, use a second terminal:

```sh
export CHECK_URL=http://127.0.0.1:8770/
export QA_OUTPUT=../outputs/website-checks
node tools/verify_site.cjs
```

Run focused browser checks when their features change:

| Script | Coverage |
|---|---|
| `tools/verify_material_locator.cjs` | Material links, mesh ownership, locations and navigation |
| `tools/verify_wiring.cjs` | Circuit labels, endpoints, pan, zoom and fullscreen |
| `tools/verify_usb_service.cjs` | Closed-lid USB export workflow and connector links |
| `tools/verify_cable_geometry.cjs` | Supports, cable separation, CT passage and cord breakouts |

After geometry changes, `node tools/audit_installation.mjs` refreshes `installation_checks.json`. On the local server, `EXPORT_AUDIT=1` with `verify_site.cjs` or `verify_cable_geometry.cjs` refreshes the corresponding cable report; `EXPORT_DRAWINGS=1` with `verify_site.cjs` refreshes the two PNG drawings. Rerun `render_documents.cjs` after updating audit data. Review generated diffs before committing.

## CAD regeneration

Use Python 3.12 with `build123d==0.11.1`, `ezdxf` and `matplotlib` in a separate environment. Obtain the factory STEP linked on the [BUD NBF-32126 page](https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/). It supplies the NBF-32226 common base and an illustrative cover silhouette.

```sh
python tools/cad/enclosure_model.py --source-step /path/to/NBF-32126.step
python tools/cad/draw_fabrication.py
```

The generator writes the machined solids, five assembly meshes, exact clearance checks and `fabrication/cad-manifest.json` with source/generator/output hashes.

Inspect regenerated CAD and drawings before publication. Software checks do not replace the receiving, fit and electrical checks in the [installation audit](../Installation_Audit.md).
