# Build documents

- [Design, sourcing and component evidence](revision.html)
- [Machining files and assembly guide](build.html) — drawings, fasteners and assembly order.
- [Interactive installation sequence](index.html#assembly-preview) — inspect the six stages in 3D.
- [Protection review](protection.html) — Q0, upstream voltage-lead protection and the remaining evidence.
- [Installation audit](installation.html) — checks completed and remaining acceptance items.
- [Full materials list](materials.html) · [Download BOM](Procurement_BOM.md)
- [Manufacturer sources and design limits](references.html)

## Drawings

[Wiring SVG](wiring_routes.svg) · [Wiring PNG](wiring_routes.png) · [Connector SVG](connector_detail.svg) · [Connector PNG](connector_detail.png)

<h2 id="operation">Operation</h2>

Daily use begins only after qualified electrical inspection and setup.

1. **Configure offline.** With mains unplugged and the lid closed, connect the free exterior USB-A end of the existing cable to the ELOG computer; use ELOG to set the clock, actual CT range and interval. Confirm logging is enabled and sufficient memory remains. Disconnect from the PC before reconnecting mains; the whole cable stays attached to the box.
2. **Run independently.** XA and the adapter stay secured inside. With Q0 OFF and the lid closed, connect one printer and the supply. Switch Q0 ON. The opaque lid hides the logger LEDs; verify recording by an offline export after the supervised pilot. Record each job's start, phase changes and finish times against the synchronized clock.
3. **Download in batches.** After the printer finishes its shutdown/cooldown, switch Q0 OFF, unplug mains and verify absence of mains voltage. Keep the lid closed, connect the same free USB-A end to the PC and export the records in ELOG. Preserve raw data before clearing memory. Disconnect from the PC and stow the free end before the next powered run.

**Q0 OFF is not isolation; its input remains live. Unplug SUPPLY IN from the wall before connecting a PC or opening the box. The complete USB cable stays attached to the box during printing; its exterior end is disconnected from the PC.**

The logger stores time-series data in non-volatile memory and can be powered by USB for readout ([DENT manual](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), printed pp. 7, 18, 119). The internal portion of the existing USB cable requires rated insulation even though the PC is connected only offline. The selected black FIT-221 sleeve has a manufacturer 600 V rating; its application, end coverage and restraint remain physical acceptance items. USB does not provide mains isolation. Validate one complete offline run and export before collecting the experiment series.

### Initial setup and electrical checks

Qualified electrical personnel verify terminations, polarity, PE continuity, insulation, protection and enclosure fit before releasing the assembly. Q0 opens hot only; PE stays continuous. Upstream Q0 protection for the original voltage leads and supply suitability must be accepted before energizing.

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

Amber marks the selected material; hidden housings become transparent. Top view matches the wiring plan. The selected case has gray walls and an opaque lid. X-ray mode is a visualization aid, not a transparent product cover. The lid silhouette comes from the manufacturer-linked common-base STEP; compare the actual opaque lid. Drag to rotate, scroll or pinch to zoom; keyboard controls are arrow keys, + / − and Home.

| Component | Model envelope (mm) | Evidence / limit |
|---|---|---|
| BUD NBF-32126 · opaque hinged cover | 318.5 × 164.3 × 411.1 | Manufacturer common-base STEP; opaque lid silhouette illustrative · [Source](https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/) |
| Reused aluminum panel · provisional 1.90 mm | 260.0 × 1.9 × 340.0 | Proposed fabrication template; stock not measured · [Source](https://www.budind.com/wp-content/uploads/2019/01/hbnbf32226.pdf) |
| DENT ELITEpro XC | 63.0 × 47.0 × 216.0 | Catalog dimensions; verify actual unit · [Source](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) |
| CT1 · printer hot only | 29.4 × 41.7 × 26.4 | Mini HSC family matched; 50 A variant probable · [Source](https://www.dentinstruments.com/shop/current-sensors/hinged-current-transformers-sensors-for-energy-metering/) |
| Q0 · single operating breaker | 19.2 × 63.5 × 47.0 | Catalog body; direct wall mount · [Source](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf) |
| JL / JN / JPE distribution | 29.8 × 8.2 × 18.3 | Manufacturer connector and carrier dimensions · [Source](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415) |
| XA · internal Leviton 515CV | 66.3 × 39.1 × 39.1 | Manufacturer dimensional envelope; strap installation proposed · [Source](https://leviton.com/content/dam/leviton/residential/product_documents/none/Document-31435-Dimensional%20Data.jpg) |
| CUI SMI6-9-V-P5 · existing adapter | 30.0 × 40.5 × 64.0 | Photo-identified; manufacturer body dimensions · [Source](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf) |
| Power glands and direct USB cable exit | 27.0 × 37.0 × 27.0 | Catalog power-gland envelopes · [Source](https://www.hammfg.com/electronics/small-case/accessories/1427ncg) |
| DENT adapters & retained lead slack | Routing only | Illustrative routing; length not validated · [Source](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/) |

[Dimensions JSON](layout_dimensions.json) · [Enclosure CAD provenance](assets/enclosure.json) · [Materials JSON](procurement.json) · [Cable-support checks](installation_supports.json)
