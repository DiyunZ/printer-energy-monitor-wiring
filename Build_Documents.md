# Build documents

- [Machining files and assembly guide](build.html) — drawings, fasteners and assembly order.
- [Interactive installation sequence](index.html#assembly-preview) — inspect the six stages in 3D.
- [Installation audit](installation.html) — checks completed and remaining acceptance items.
- [Full materials list](materials.html) · [Download BOM](Procurement_BOM.md)
- [Manufacturer sources and design limits](references.html)

## Drawings

[Wiring SVG](wiring_routes.svg) · [Wiring PNG](wiring_routes.png) · [Connector SVG](connector_detail.svg) · [Connector PNG](connector_detail.png)

<h2 id="operation">Operation</h2>

Daily use begins only after qualified electrical inspection and setup.

1. **Connect with Q0 OFF.** Printer → measured output. Verified adapter → XA, with its DC cable connected. Connect the box supply.
2. **Switch Q0 ON.** The printer, adapter outlet and voltage tap receive power together.
3. **Confirm logging.** Check readings and the recording indicator. Run the print and record start/stop times.

**Keep the lid closed. Q0 OFF is not isolation: unplug mains and USB, then verify absence of voltage before opening or changing sensing leads.**

### Initial setup and electrical checks

Qualified electrical personnel verify terminations, polarity, PE continuity, insulation, protection and enclosure fit before releasing the assembly. Q0 opens hot only; PE stays continuous. Fv selection and breaker coordination must be resolved before energizing.

Configure ELOG for single phase / two wire, CH1 voltage high L1 and low N, the actual CT type/range and logging interval. Disable unused channels. Verify sensible readings and positive real power against an independent reference meter; prove recording and restart behavior with a supervised power cycle.

## Software and lab equipment

Arrange access separately; these resources are not marked as owned.

- **ELOG software — Download / install; no separate software purchase.** Use DENT ELOG for configuration, recording and data retrieval. Installation on the lab computer has not been verified. [DENT download](https://www.dentinstruments.com/software-downloads/elog-software-elitepro-xc-sp-power-meters/)
- **ELOG computer and printer under test — Arrange lab equipment.** Need a supported Windows computer with a matching USB port and the printer with its original grounded cord. These are setup resources, not checked as owned or counted as enclosure purchases; no replacement printer or computer has been selected.
- **Assembly and acceptance equipment — Arrange qualified assembly / lab tools.** Calipers, wire stripper, terminal-matched crimper, torque tools, machining/deburring tools, PE/polarity/insulation test equipment and an independent power reference. Arrange access before assembly; tool ratings and procedures belong to the approved build process.

## Purchasing notes

Quantities are for one enclosure; supplier pack sizes may be larger. Check stock and lead times. “Select / Configure” needs a size or rating choice; “Quote / Fabrication” needs supplier follow-up. Owned means on hand, not approved for use. Purchase holds remain marked beside the relevant materials.

Click photos to enlarge them. Reference images and design concepts are labeled; photos are not to scale. Image credits are in each material's Details and the full BOM.

<h2 id="dimensions">Dimensions and model notes</h2>

**Concept layout; use the build package for machining.** Manufacturer CAD, published sizes and estimates share one scale. Small hardware and cable dressing are simplified; spare stock is excluded. Received parts still need a physical fit check.

Amber marks the selected material; hidden housings become transparent. Top view matches the wiring plan. The real case has gray walls and a clear lid. Drag to rotate, scroll or pinch to zoom; keyboard controls are arrow keys, + / − and Home.

| Component | Model envelope (mm) | Evidence / limit |
|---|---|---|
| Hammond PCJ16148CC | 393.8 × 240.2 × 479.4 | Manufacturer CAD · [Source](https://www.hammfg.com/files/parts/stp/PCJ16148CC.zip) |
| 14R1513 mounting panel | 327.0 × 1.9 × 374.6 | Manufacturer CAD · [Source](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf) |
| DENT ELITEpro XC | 63.0 × 47.0 × 216.0 | Catalog dimensions; verify actual unit · [Source](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) |
| CT1 · printer hot only | 29.4 × 41.7 × 26.4 | Mini HSC family matched; 50 A variant probable · [Source](https://www.dentinstruments.com/shop/current-sensors/hinged-current-transformers-sensors-for-energy-metering/) |
| Q0 · single operating breaker | 19.2 × 63.5 × 47.0 | Catalog body; direct wall mount · [Source](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf) |
| Fv · Littelfuse LPSC0001Z | 17.8 × 61.0 × 78.5 | Manufacturer maximum envelope · [Source](https://www.littelfuse.com/de/assetdocs/powr-gard-catalog?assetguid=85d36235-a32b-4608-bfed-f9878aa43af0) |
| JL / JN / JPE distribution | 29.8 × 8.2 × 18.3 | Manufacturer connector and carrier dimensions · [Source](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415) |
| XA · Leviton 5279-C flanged outlet | 48.4 × 63.5 × 63.5 | Manufacturer drawing and mounting instructions · [Source](https://leviton.com/products/5279-c) |
| CUI SMI6-9-V-P5 · existing adapter | 30.0 × 64.0 × 40.5 | Photo-identified; manufacturer body dimensions · [Source](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf) |
| Short DIN rail · Fv only | 100.0 × 7.5 × 35.0 | Standard profile; proposed cut length |
| Long-thread power glands / KVT 32 split entries | 27.0 × 37.0 × 27.0 | Catalog envelopes; 41380 inserts selected · [Source](https://www.hammfg.com/electronics/small-case/accessories/1427ncg) |
| Blue adapters & retained lead slack | Routing only | Illustrative routing; length not validated · [Source](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/) |

[Dimensions JSON](layout_dimensions.json) · [Enclosure CAD provenance](assets/enclosure.json) · [Materials JSON](procurement.json)
