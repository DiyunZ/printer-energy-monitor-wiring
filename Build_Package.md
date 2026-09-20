# Build package A

September 20, 2026 · one grounded 120 V supply · one printer at a time.

**Engineering review package. Complete-order, machining and energizing release remain open.** The drawings and part selections below replace the earlier outlet-box concept. They do not represent a physically assembled or certified product.

[Materials with pictures and purchase links](materials.html) · [3D installation sequence](index.html#assembly-preview) · [Installation audit](installation.html)

## Downloads

| File | Use |
|---|---|
| [Five-page machining drawing](fabrication/Machining_Drawings.pdf) | Hole coordinates, viewing directions, dimensions and tolerances. Print for reference, not as a scale template. |
| [Machined case STEP](fabrication/case-machined.step) · [Machined panel STEP](fabrication/panel-machined.step) | Exact solid geometry for shop review and fixturing. Modify the purchased Hammond parts; do not print a substitute mains enclosure. |
| [Front DXF](fabrication/front.dxf) · [Right DXF](fabrication/right.dxf) · [Left DXF](fabrication/left.dxf) · [Rear DXF](fabrication/rear.dxf) · [Panel DXF](fabrication/panel.dxf) | Millimetres, 1:1. Machine only the `CUT` layer. `REFERENCE` and `TEXT` layers are non-cutting. |
| [Cut and clearance results](fabrication/cad-checks.json) · [Wall opening coordinates](fabrication/wall-openings.json) | Reproducible digital checks and shared datums. |
| [Wiring drawing](wiring_routes.svg) · [Connector detail](connector_detail.svg) · [Connection schedule](routes.json) | Electrical topology. These drawings are not machining templates. |

## What is fixed, and what is still needed

| Interface | Current decision | Release evidence still needed |
|---|---|---|
| Existing black adapter | Photo identifies **CUI SMI6-9-V-P5**, **9 V DC, 0.667 A, center positive**. Retain it and its original cable. The CUI P5 drawing specifies a 5.5/2.1 mm plug. | Check condition and delivered voltage before connecting the logger; do not buy a replacement merely because the earlier label was unread. |
| Existing CT | Use one split-core CT on printer hot only. The photograph shows the CTHSC family, but wires cover the current/output digits. | Record the actual model, rated A and mV output. The illustrated 20 A body is an example; do not enter 20 A in ELOG from the model. If the original cannot be identified, [DENT CT-HSC-020-U](https://www.dentinstruments.com/shop/current-sensors/hinged-current-transformers-sensors-for-energy-metering/) is a separately purchasable 20 A / 333 mV alternative; select the exact 20 A variant and retain its documentation. It is not included as a mandatory duplicate purchase. |
| Three existing blue pigtails | Assign A1 = hot/L1; A2 = neutral/L2; A3 = neutral/N. They carry sensing current, not printer current or PE. | The blue-wire photograph has no readable conductor/current specification. Establish identity, ratings and terminal preparation. **Do not order the proposed 0.5 A fuse until this is resolved.** |
| DC entry | KVT 32 frame location is drawn. CUI's SMI6 cord specification is UL2468, a flat cord construction. | A round KT insert is not established as suitable for this cord. Match its actual cross-section to a documented insert or revise this interface before drilling its opening. Do not cut the adapter cable or pack a gap with tape. |
| USB entry | StarTech USB2HAB6; KVT 32 frame location is drawn. | Select its KT insert from measured jacket OD; confirm the factory plug passes the empty opening. Frame and insert are separate purchases. |
| Q0 / supply | Carling CA1-B0-24-615-121-DG, 15 A, single pole; 5-15 power interfaces. | Exact-SKU availability, available fault current, startup behavior and application acceptance by the responsible electrical professional. The 15 A component rating does not approve a 15 A continuous load. |

These are specific outstanding interfaces, not permission requests. The supplied photographs support the adapter identification but do not expose the hidden CT digits or establish the blue conductors' ratings. [CUI original SMI6 datasheet](https://in.ftcelectronics.com/datasheets-55/SMI6-12-V-P5.pdf), [DENT accessory description](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/).

## Selected construction

Hammond **PCJ16148CC** with **14R1513** steel panel. Q0 mounts directly through the front wall. **Leviton 5279-C** mounts through the right wall and provides an enclosed rear body, eliminating the separate metal outlet box, faceplate and custom wall supports. Its exterior socket is dedicated to the original adapter; label it **LOGGER ADAPTER ONLY**.

**Littelfuse LPSC0001Z** clips onto a 100 mm DIN rail. Its input and output use compatible **14 AWG Class C copper**. Output terminates at the added **JV** connector before the small A1 pigtail. Five WAGO 221-415 / 221-505 pairs provide JL, JN, PE, PE+ and JV. One wire per port. PE and PE+ are bridged; neutral and PE remain separate.

The existing meter uses two adjustable **19.05 mm** ONE-WRAP straps. Four **21 × 4 mm** smooth slots allow the straps to pass through the panel. Reserve the larger **216 × 69 × 58 mm** meter envelope when fitting the actual older unit. Do not drill the instrument or use its magnetic feet as the only restraint.

## Machining datums

The 3D and wiring plan share X/Z locations. X is across the panel; Y is upward from the **panel underside**; Z is forward toward Q0. Negative Z is the printer exit. The real case walls have approximately **0.937° draft**. The wall DXFs are local flat-face setups, not projections to a vertical plane.

For outside views: front U = X; rear U = −X; right U = −Z; left U = Z. V runs up along the wall. Its origin is the intersection of that face with Y = 0 and the case centerline. Use the STEP model and the physical panel support datum to fixture the case; the bottom outside edge is **not** Y = 0. Panel drawing: view from the lid, U = X, V = −Z, origin at the blank center.

| Feature | Cut geometry | Datum in assembly coordinates |
|---|---|---|
| Q0 handle | 10.97 × 36.78 mm rectangle; two Ø3.96 mm holes at 52.37 mm vertical pitch | Front wall; X = −112, Y = 120 mm |
| XA | Ø44.00 ±0.15 mm; two Ø4.00 mm fixings at 53.57 mm vertical pitch | Right wall; Y = 121, Z = 13 mm |
| Supply gland | Ø21.00 mm | Left wall; Y = 43, Z = 128 mm |
| Printer gland | Ø21.00 mm | Rear wall; X = 0, Y = 36 mm |
| DC / USB frames | Ø32.30 mm, both conditional on entry acceptance above | Right wall; DC Y/Z = 78/106, USB = 55/167 mm |
| Rail | Two Ø4.50 mm panel holes, 80 mm apart | X/Z = −95/−28 and −15/−28 mm |
| Panel bond | Ø5.30 mm, dedicated to PE | X/Z = −125/60 mm |
| Meter straps | Four 21 × 4 mm slots, long axis Z | X = 50 and 132; Z = −70 and 50 mm |
| Cable mounts | Twelve Ø4.50 mm holes | Individual coordinates in the panel drawing |
| Five WAGO carriers | Two Ø3.30 mm fixing holes per carrier | Place within the dashed locator envelope, orient the carrier as shown, then transfer-drill from the actual part. The unlocated longitudinal fixing datum is not invented. |

Retain all factory panel and lid features. Transfer-drill the rail's two fixing holes to match the panel; add a separate Ø5.30 mm rail-web PE hole at X/Z = −27/−28 mm, clear of the holder and end stops. Deburr every cut, remove chips and protect the gasket. Smooth strap slots on both faces without enlarging their functional opening. Machining does not preserve or confer an IP/NEMA certification on the completed assembly.

<h2 id="fasteners">Fasteners and purchase quantities</h2>

Counts below are **installed**, followed by suggested purchase counts including spares. Supplier packaging may be larger. Metric and US threads are deliberately distinguished.

| Assembly | Installed hardware | Exact purchase links |
|---|---|---|
| Q0 | 2 × #6-32 × 3/8 in screws; 2 × #6 flat washers | Buy 4 [screws, 1335](https://boltdepot.com/Product-Details?product=1335); washers included in the 10-piece allowance below. No nut on Q0's threaded inserts. |
| XA | 2 × #6-32 × 5/8 in screws; 4 × #6 flat washers; 2 × #6-32 nylon locknuts | Buy 4 [screws, 1438](https://boltdepot.com/Product-Details?product=1438), 10 total [washers, 2942](https://boltdepot.com/Product-Details?product=2942), 4 [nuts, 2550](https://boltdepot.com/Product-Details?product=2550). |
| Five WAGO carriers | 10 × M3 × 16 mm pan screws; 10 × M3 washers; 10 × M3 locknuts | Buy 12 each: [screws, 6835](https://boltdepot.com/Product-Details?product=6835), [washers, 4513](https://boltdepot.com/Product-Details?product=4513), [nuts, 4792](https://boltdepot.com/Product-Details?product=4792). |
| Twelve tie anchors | 12 × M4 × 20 mm pan screws; 12 × M4 washers; 12 × M4 locknuts | Buy 14 each: [screws, 17888](https://boltdepot.com/Product-Details?product=17888), [washers, 4525](https://boltdepot.com/Product-Details?product=4525), [nuts, 4802](https://boltdepot.com/Product-Details?product=4802). |
| DIN rail mounting | 2 × M4 × 12 mm pan screws; 2 × M4 washers; 2 × M4 locknuts | Buy 4 each: [screws, 19249](https://boltdepot.com/Product-Details?product=19249), [washers, 4514](https://boltdepot.com/Product-Details?product=4514), [nuts, 4793](https://boltdepot.com/Product-Details?product=4793). |
| Panel and rail PE studs | 2 × #10-32 × 3/4 in screws; 4 plain nuts; 4 external-tooth washers; 4 flat washers; 2 ring lugs | Buy 4 [screws, 1368](https://boltdepot.com/Product-Details?product=1368), 6 [nuts, 2561](https://boltdepot.com/Product-Details?product=2561), 6 [tooth washers, 4078](https://boltdepot.com/Product-Details?product=4078), 6 [flat washers, 2946](https://boltdepot.com/Product-Details?product=2946). Rings come from the 3M row in the main BOM. |

Use the supplied Hammond screws for the backpanel and all four cover fixings. Q0 power studs use the manufacturer's supplied terminal hardware and two #10 ring lugs. Do not substitute #8 lugs or metric nuts on these studs.

**Stack checks:** the nominal case wall is 4.775 mm. For Q0, measure/select washers 0.8–1.0 mm thick: 9.525 − 4.775 − washer = **3.75–3.95 mm** nominal insert engagement, below the 4.95 mm insert depth. Reject a stack that bottoms out before clamping. The general #6 washer listing does not guarantee thickness; this is a receiving check. XA's fixing stack must leave the locking element fully engaged. Do not crush or distort its flange or the polycarbonate wall.

Fit carrier/anchor fasteners while the panel is out. There is about **16.66 mm** between the panel underside and the inner case floor in the source CAD. Check actual screw projections and washers against this space and the molded supports. The longer 20 mm tie screws accommodate the anchor's recessed seat; verify each full locking-nut engagement and floor clearance before installing the panel.

For each PE stud, put the screw head and flat washer underneath. On the conductive side, use an external-tooth washer and first nut to secure the dedicated stud, then the ring lug, flat washer, external-tooth washer and second nut. Establish a clean metal contact under the bonding hardware; do not rely on paint, straps or rail mounting screws for bonding. Final bonding method, tightening and continuity acceptance belong to the qualified assembler. The website does not assign an unsupported universal bonding torque.

## Wire and length schedule

Buy **10 ft of 14/3 SJOOW** and start with 2.0 m supply and 1.0 m printer-output blanks. Their internal conductors extend directly to the specified terminals. Keep sufficient PE slack so that jacket displacement does not pull PE free first. Measure the desired exterior reach before cutting.

Use the selected 14 AWG black / white / green internal wire. The following are conservative **cutting blanks**, not proved finished lengths; final routing, bends and stripping are done with the assembly de-energized. Buy at least 3 m black, 2 m white and 3 m green (linked retail rolls exceed these needs).

| Connection | Starting blank | Termination |
|---|---|---|
| 02 Q0 OUT → JL | Black, 500 mm | #10 ring at Q0; bare prepared copper at JL |
| 04 JL → Fv IN | Black, 250 mm | WAGO to fuse-holder pressure terminal |
| 24 Fv OUT → JV | Black, 150 mm | Fuse-holder pressure terminal to WAGO; **14 AWG throughout** |
| 17 JL → XA hot | Black, 700 mm | WAGO to brass/hot outlet terminal |
| 18 JN → XA neutral | White, 650 mm | WAGO to silver/neutral outlet terminal |
| 25 PE port 5 → PE+ port 5 | Green, 200 mm | WAGO bridge |
| 12 PE+ → panel bond | Green, 200 mm | WAGO to #10 ring |
| 13 PE+ → rail bond | Green, 250 mm | WAGO to #10 ring |
| 19 PE+ → XA ground | Green, 700 mm | WAGO to green ground terminal |

Connections 01/03/06/07/10/11 use the supply/output cord conductors. Connections 05/08/09 use the three existing pigtail + full-lead chains; retain their full factory length. Connections 14/15 use the CT pair; 16 is the factory USB cable. Connections 20–23 illustrate factory adapter contacts and DC wiring, **not** instructions to open or modify the adapter. The site provides the full 25-path schedule.

Label both ends of every conductor. A1 is hot, A2 and A3 are neutral despite all three jackets being blue. Grounding uses the separate green conductors. The full voltage-lead storage model assumes 2 m of flexible cable per lead and 3 mm OD; real cable lengths, connector bodies and minimum bends must fit without loading meter sockets.

## Assembly and acceptance sequence

1. Close the identification/entry/protection items above, obtain the exact parts and compare them with the machining setups. Keep the case and all cords disconnected while machining or wiring.
2. Machine the **empty** case and removable panel. Transfer-drill carrier and rail fixings, deburr, clean, and inspect for cracks. Complete underside nuts, PE studs, carrier/anchor fixings and thread the straps before lowering the panel.
3. Install and secure the panel **before XA**. The digital insertion sweep shows that the installed right-side outlet obstructs the straight panel path. Fit rail/end stops/Fv, carriers, meter and CT. Leave access to the CT latch, fuse door and WAGO levers.
4. Install Q0, XA and the accepted cord entries. Route the supply and output jackets through their glands before fitting plug/connector ends. Fit the adapter and USB cables without cutting factory plugs. Do not force round inserts onto the flat DC cable.
5. Bond panel, rail, output and XA; then complete neutral, protected hot, voltage sensing, CT and low-voltage wiring. Only the printer hot conductor goes through CT once, arrow toward the printer. Keep voltage taps and adapter consumption upstream of CT.
6. Check every termination, strain relief, bend, clearance and fastener. Verify actual fuse-door travel and plug removal access. Confirm that all four cover screws close the lid without pressing on cables or components. This dry fit is still outstanding.
7. Qualified personnel document PE continuity, polarity, insulation/isolation, protection and supply suitability using the applicable test procedure. Disconnect sensitive electronics where the manufacturer requires it for insulation testing. Q0 OFF leaves incoming terminals live while the supply is plugged in.
8. Configure ELOG for single-phase/two-wire measurement and the **identified** CT. Verify positive real power and reasonable readings with an independent reference. Test start/stop and power-return recording behavior, then check each printer's cold start and sustained load. Do not release daily use from a browser simulation alone.

| Manufacturer termination | Published preparation / torque |
|---|---|
| WAGO 221-415 | Strip 11 mm; one accepted conductor per port, lever fully closed. Identify the factory-tinned blue ends before selecting preparation; do not add solder. |
| LPSC0001Z | Selected 14 AWG Class C copper; terminal torque 2.0 N·m. Use the holder's strip gauge/instructions. |
| Carling Q0 | Mounting screws 0.8–1.0 N·m; #10-32 terminal hardware 1.7–2.3 N·m. Check the received device's instructions. |
| Leviton 5279-C | Strip 9/16 in (14.3 mm); terminal screws 10–14 in·lbf (1.13–1.58 N·m); do not tin conductors. |
| 515PV / 515CV, glands, end stops and enclosure | Follow the exact supplied instructions. The Q0 or outlet torque must not be reused for unrelated parts. |

Manufacturer sources and per-material limits are linked in the [installation audit](installation.html) and [reference schedule](references.html). The public project records digital geometry and circuit checks; it does not yet record a built, tested or approved assembly.
