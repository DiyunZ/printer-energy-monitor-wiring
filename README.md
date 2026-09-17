# Printer energy monitor wiring guide

[Open the interactive website](https://diyunz.github.io/printer-energy-monitor-wiring/)

Rev. 3, September 17, 2026: an English-language design for one 120 V printer and a DENT ELITEpro XC. It uses **one operating breaker**, a **dedicated enclosure receptacle for the existing two-pin adapter**, **three labeled blue voltage pigtails**, and **one CT around printer hot only**.

The blue pigtails are **L1 / hot, L2 / neutral, and N / neutral**. Protective earth has its own rated wiring. A passive voltage-tap fuse Fv is proposed in place of the old Qv breaker; final protection ratings require qualified review. Adapter and voltage-tap branches are before CT.

The site contains the full schematic, a connector / meter-port detail drawing, a hardware list with an outlet candidate, routine operating steps and 23 individually traceable paths. Circuit highlighting, keyboard selection, zoom, fit-to-screen and SVG / PNG downloads are available. The adapter plug and barrel cable are factory connections, not parts to rewire.

## Design status

This is a design-review candidate, not an approved construction drawing. CT model/range, adapter label, pigtail ratings, breaker/fuse coordination, physical fit and electrical acceptance remain unverified. No hardware has been energized or tested by this update. The upstream voltage tap is a project adaptation; downstream cable losses still affect the measurement boundary.

See [sources and design decisions](Wiring_References_EN.md). The existing enclosure remains a candidate only. The user confirmed that the proposed outlet is for the black two-pin AC/DC adapter.

## Files and editing

- `build_routes.py`: circuit endpoints, paths, SVG generator and connectivity checks (Python standard library).
- `draw_external.py`: blue-adapter chain, actual meter end view and panel / operating detail.
- `page_template.html`: English page content, responsive styles and interaction code.
- `index.html`: generated self-contained website; `wiring_routes.html` redirects here.
- `wiring_routes.svg` / `.png`: main schematic.
- `connector_detail.svg` / `.png`: connector detail drawing.
- `routes.json` / `validation.json`: generated endpoint list and drawing checks, not hardware validation.
- `test_routes.py`: regression cases that reject CT, PE and breaker-bypass miswiring in the drawing.
- `Wiring_References_EN.md` / `references.html`: matching references and evidence limits.

Run `python3 build_routes.py` and `python3 -m unittest -v test_routes.py`, then `python3 -m http.server 8000` to preview. Export both SVGs to PNG after a drawing change. Regenerate `references.html` from the Markdown reference text when editing it. The checked-in page needs no external runtime or build service.

GitHub Pages publishes the repository root on `main`. Pushing reviewed website changes updates [the public site](https://diyunz.github.io/printer-energy-monitor-wiring/).
