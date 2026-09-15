# Printer energy monitor wiring guide

[Open the interactive website](https://DiyunZ.github.io/printer-energy-monitor-wiring/)

An English-language interactive diagram of a candidate DENT ELITEpro XC measurement enclosure for one 3D printer. Trace all 16 connections individually or by circuit group. The drawing includes the wall outlet and input plug, printer connection, and USB connection to a computer.

Use the website buttons to highlight a circuit, click a numbered row to trace one wire, and select **Zoom 150%** for a closer view. PNG and SVG downloads and an 11-source reference matrix are available from the page.

## Design status

This is an educational candidate routing plan, not an approved construction drawing. It assumes a 120 V single-phase L/N/PE supply. Actual outlet and printer connections, CT compatibility, breaker ratings, clearances and assembly must be verified by qualified lab electrical personnel. No physical assembly or electrical acceptance testing has been performed. The upstream DENT branch is a project adaptation pending review.

See [the reference matrix](Wiring_References_EN.md) for supporting manufacturer documentation and remaining design questions.

## Files

- `index.html`: self-contained interactive page; no external runtime dependencies.
- `wiring_routes.svg` / `wiring_routes.png`: vector drawing and high-resolution raster export.
- `routes.json`: named endpoints and drawing coordinates for the 16 connections.
- `references.html` / `Wiring_References_EN.md`: reference matrix and evidence limits.
- `build_routes.py` / `draw_external.py`: editable diagram generators.
- `validation.json`: generator assertions about the drawing only, not electrical testing.
- `wiring_routes.html`: compatibility redirect to the homepage.

## Edit and preview

Run `python3 build_routes.py` to regenerate the interactive page, SVG, routes and drawing checks. If the drawing changes, re-export `wiring_routes.svg` to `wiring_routes.png` with an SVG-capable image editor. Keep the Markdown and HTML reference tables in sync when editing sources.

Run `python3 -m http.server 8000` from this folder to preview locally. No build is required to view the checked-in website.

GitHub Pages publishes the root of the `main` branch. Pushing website updates to that branch updates the public site.
