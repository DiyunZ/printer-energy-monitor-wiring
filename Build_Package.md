# Build package A

September 20, 2026 · one grounded 120 V supply · one printer at a time.

**Engineering review package. Complete-order, machining and energizing release remain open.** The drawings and part selections below replace the earlier outlet-box concept. They do not represent a physically assembled or certified product.

[Materials with pictures and purchase links](materials.html) · [3D installation sequence](index.html#assembly-preview) · [Installation audit](installation.html) · [Protection review](protection.html)

## Downloads

| File | Use |
|---|---|
| [Five-page machining drawing](fabrication/Machining_Drawings.pdf) | Hole coordinates, viewing directions, dimensions and tolerances. Print for reference, not as a scale template. |
| [Machined case STEP](fabrication/case-machined.step) · [Machined panel STEP](fabrication/panel-machined.step) | Exact solid geometry for shop review and fixturing. Modify the purchased Hammond parts; do not print a substitute mains enclosure. |
| [Front DXF](fabrication/front.dxf) · [Right DXF](fabrication/right.dxf) · [Left DXF](fabrication/left.dxf) · [Rear DXF](fabrication/rear.dxf) · [Panel DXF](fabrication/panel.dxf) | Millimetres, 1:1. Machine only the `CUT` layer. `REFERENCE` and `TEXT` layers are non-cutting. |
| [Cut and clearance results](fabrication/cad-checks.json) · [Wall opening coordinates](fabrication/wall-openings.json) | Reproducible digital checks and shared datums. |
| [Wiring drawing](wiring_routes.svg) · [Connector detail](connector_detail.svg) · [Connection schedule](routes.json) | Electrical topology. These drawings are not machining templates. |

## Photo identification and remaining checks

The existing photos were compared with manufacturer product pictures, original datasheets and a legacy CT product photo. No concealed label characters were reconstructed.

| Item | Identification and design decision | Evidence / remaining check |
|---|---|---|
| Black adapter | **CUI SMI6-9-V-P5**, 9 V DC, 0.667 A, center positive. Retain it. Body 64 × 40.5 × 30 mm ±1 mm; 5.5/2.1 mm P5 plug. | Label readable in the original photo; [official CUI SMI6 datasheet](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf). Check condition, output and seating at assembly. |
| White CT | **DENT Mini HSC** family; **CTHSC-050-U/B, 50 A / 333.3 mV is probable** from the partial “DENT 50…” label and legacy appearance. | [DENT family specifications](https://www.dentinstruments.com/shop/current-sensors/hinged-current-transformers-sensors-for-energy-metering/), [legacy label comparison](http://siscoinc.net/cthsc-050-ubdentcurrenttransformer.aspx). 20 A and 50 A versions share the body. Wires conceal the full variant: read the label during assembly before setting ELOG. No duplicate CT is in the purchase list. |
| Three blue pigtails | Product match: **DENT LD-SKTSP-BLU**, **10 in / 254 mm**, female safety connector to factory-tinned end. A1 = hot/L1; A2 = neutral/L2; A3 = neutral/N. | [DENT original accessory](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/). Photo connector, tinned end and ESIS card agree. Online data does not publish AWG/ampacity. Qualified acceptance of termination and Fv remains necessary. |
| DC entry | Add **Tensility 10-02228**, 0.915 m round extension, OD **5.2 ±0.3 mm**. Use **icotek KTMBS 4–7 gray, 41380** in the KVT 32. Original flat CUI cord stays outside. | [Cable drawing](https://tensility.s3.us-west-2.amazonaws.com/imports/product_spec_sheets/10-02228.pdf), [insert range](https://www.icotek.com/Produkte/PDFs/en_US/KTMBS%20gy.pdf). The entire 4.9–5.5 mm interval is inside 4–7 mm. Connector bodies are under 12 mm OD and clear the Ø32.3 wall bore. Verify the locknut passage and seals on receipt. |
| USB service connection | Reuse the DENT kit USB-A to B cable, 1.8 m. No permanent entry. | [DENT manual](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), printed pp. 16, 29, 119: included cable, USB power and insulation requirements. Connect only with mains unplugged and the lid open; remove before power-up. |
| Q0 / supply | Carling CA1-B0-24-615-121-DG, 15 A, single pole; manufacturer confirms 10 kA at 120 V. | Actual JIS receptacle fault current and combined startup waveform remain unknown. [Detailed protection review](protection.html). |

**Protection evidence:** [DENT's fused clip](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-fused-crocodile-clip/) uses a 500 mA fuse. This supports the OEM accessory protection level, but does not prove the proposed KLKR.500T coordinates with the existing pigtail and installation. Keep that fuse selection conditional until the responsible electrical professional accepts it. The meter's internal fuse does not protect an external lead fault upstream of the instrument.

These checks use the photos already supplied. The hidden CT characters and unpublished conductor ratings remain explicit limits, rather than requests for more images.

## DC installation and offline USB

1. Keep Q0 OFF and unplug all sources. Insert the **male end of 10-02228** through the empty DC opening and locknut toward the logger. Do not cut either factory connector.
2. Place **41380** around the round jacket, assemble the KVT 32 and its seals, and plug the 5.5/2.1 mm male into the logger. A 12 mm barrel may not seat its shoulder flush; never force it. Confirm firm electrical engagement without exposed contact access.
3. Outside the case, plug the original adapter's P5 connector into the extension's female jack. Secure the joint and excess original cord to the adjacent bench support without tension on the adapter or gland. Keep the flat cord entirely outside the insert.
4. Start with about **0.35 m of extension inside / 0.565 m outside**, adjusting at dry fit. Retain the full cord, with **≥35 mm bend radius** (Tensility minimum 31.2 mm). Use spare ties from the BOM, without crushing either cable. The 3D curves show the path and joint, not the complete slack length or bend-radius proof.
5. For configuration or downloads, unplug the box mains, verify absence of mains voltage and remove the lid. Connect the kit USB cable directly to the logger and ELOG host. Disconnect USB before closing and energizing. The cable is absent during printing; no permanent energized USB route is provided.

Only the **DC Ø32.30 mm** opening remains, at Y/Z = 78/106 mm. The former USB opening at 55/167 mm is removed from STEP, mesh, DXF and drawings. Buy **one KVT 32 and one 41380 insert**, subject to seller pack quantities. Confirm supplier lead time.

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
| DC frame | One Ø32.30 mm hole; KVT 32 + split 41380 insert | Right wall; Y/Z = 78/106 mm. No USB hole. |
| Rail | Two Ø4.50 mm panel holes, 80 mm apart | X/Z = −95/−28 and −15/−28 mm |
| Panel bond | Ø5.30 mm, dedicated to PE | X/Z = −125/60 mm |
| Rail bond through panel | Ø5.30 mm through panel and rail web, dedicated to PE | X/Z = −27/−28 mm; bolt head and washer beneath panel |
| Meter straps | Four 21 × 4 mm slots, long axis Z | X = 50 and 132; Z = −70 and 50 mm |
| Cable mounts | Six Ø4.50 mm holes | Individual coordinates in the panel drawing |
| Five WAGO carriers | Two Ø3.30 mm fixing holes per carrier | Place within the dashed locator envelope, orient the carrier as shown, then transfer-drill from the actual part. The unlocated longitudinal fixing datum is not invented. |

The six anchor positions support the mains bundle, outlet supply, CT pair, two sides of the voltage-lead coils and the DC extension. Each tie passes through its mounting-base slot and encloses that bundle. The same coordinates drive the panel CAD and 3D view.

Retain all factory panel and lid features. Transfer-drill the rail's two fixing holes to match the panel; align its separate Ø5.30 mm PE hole with the new panel hole at X/Z = −27/−28 mm, clear of the holder and end stops. The rail PE bolt passes through both parts: its head/washer belongs beneath the panel, not trapped between the rail and panel. The revision removes six anchor holes and adds this bond hole, reducing the total panel machining features by five. Deburr every cut, remove chips and protect the gasket. Smooth strap slots on both faces without enlarging their functional opening. Machining does not preserve or confer an IP/NEMA certification on the completed assembly.

<h2 id="fasteners">Fasteners and purchase quantities</h2>

Counts below are **installed**, followed by suggested purchase counts including spares. Supplier packaging may be larger. Metric and US threads are deliberately distinguished.

| Assembly | Installed hardware | Exact purchase links |
|---|---|---|
| Q0 | 2 × #6-32 × 3/8 in screws; 2 × #6 flat washers | Buy 4 [screws, 1335](https://boltdepot.com/Product-Details?product=1335); washers included in the 10-piece allowance below. No nut on Q0's threaded inserts. |
| XA | 2 × #6-32 × 5/8 in screws; 4 × #6 flat washers; 2 × #6-32 nylon locknuts | Buy 4 [screws, 1438](https://boltdepot.com/Product-Details?product=1438), 10 total [washers, 2942](https://boltdepot.com/Product-Details?product=2942), 4 [nuts, 2550](https://boltdepot.com/Product-Details?product=2550). |
| Five WAGO carriers | 10 × M3 × 16 mm pan screws; 10 × M3 washers; 10 × M3 locknuts | Buy 12 each: [screws, 6835](https://boltdepot.com/Product-Details?product=6835), [washers, 4513](https://boltdepot.com/Product-Details?product=4513), [nuts, 4792](https://boltdepot.com/Product-Details?product=4792). |
| Six tie anchors | 6 × M4 × 16 mm pan screws; 6 × M4 washers; 6 × M4 locknuts | Buy 8 each: [screws, 17887](https://boltdepot.com/Product-Details?product=17887), [washers, 4525](https://boltdepot.com/Product-Details?product=4525), [nuts, 4802](https://boltdepot.com/Product-Details?product=4802). |
| DIN rail mounting | 2 × M4 × 12 mm pan screws; 2 × M4 washers; 2 × M4 locknuts | Buy 4 each: [screws, 19249](https://boltdepot.com/Product-Details?product=19249), [washers, 4514](https://boltdepot.com/Product-Details?product=4514), [nuts, 4793](https://boltdepot.com/Product-Details?product=4793). |
| Panel and rail PE studs | 2 × #10-32 × 3/4 in screws; 4 plain nuts; 4 external-tooth washers; 4 flat washers; 2 ring lugs | Buy 4 [screws, 1368](https://boltdepot.com/Product-Details?product=1368), 6 [nuts, 2561](https://boltdepot.com/Product-Details?product=2561), 6 [tooth washers, 4078](https://boltdepot.com/Product-Details?product=4078), 6 [flat washers, 2946](https://boltdepot.com/Product-Details?product=2946). Rings come from the 3M row in the main BOM. |

Use the supplied Hammond screws for the backpanel and all four cover fixings. Q0 power studs use the manufacturer's supplied terminal hardware and two #10 ring lugs. Do not substitute #8 lugs or metric nuts on these studs.

Each anchor uses an M4 × 16 mm pan screw with its head directly on the base, then an underside washer and locknut. The illustrated stack leaves about 4.6 mm to the case floor, versus only 0.6 mm with the previous 20 mm screw. Confirm actual base thickness, nut engagement and floor clearance on receipt; small molded details are illustrative.

**Stack checks:** the nominal case wall is 4.775 mm. For Q0, measure/select washers 0.8–1.0 mm thick: 9.525 − 4.775 − washer = **3.75–3.95 mm** nominal insert engagement, below the 4.95 mm insert depth. Reject a stack that bottoms out before clamping. The general #6 washer listing does not guarantee thickness; this is a receiving check. XA's fixing stack must leave the locking element fully engaged. Do not crush or distort its flange or the polycarbonate wall.

Fit carrier/anchor fasteners while the panel is out. There is about **16.66 mm** between the panel underside and the inner case floor in the source CAD. Check actual screw projections and washers against this space and the molded supports. For the six revised M4 × 16 mm anchor screws, verify full locking-nut engagement and at least 3 mm clearance to the actual case floor before installing the panel.

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

Connections 01/03/06/07/10/11 use the supply/output cord conductors. Connections 05/08/09 use the three existing pigtail + full-lead chains; retain their full factory length. Connections 14/15 use the CT pair; 16 is a temporary USB service connection with mains unplugged. Connections 20–23 illustrate factory adapter contacts and DC wiring, **not** instructions to open or modify the adapter. The site provides the full 25-path schedule.

Label both ends of every conductor. A1 is hot, A2 and A3 are neutral despite all three jackets being blue. Grounding uses the separate green conductors. The full voltage-lead storage model assumes 2 m of flexible cable per lead and 3 mm OD; real cable lengths, connector bodies and minimum bends must fit without loading meter sockets.

## Assembly and acceptance sequence

1. Close the identification/entry/protection items above, obtain the exact parts and compare them with the machining setups. Keep the case and all cords disconnected while machining or wiring.
2. Machine the **empty** case and removable panel. Transfer-drill carrier and rail fixings, deburr, clean, and inspect for cracks. Complete underside nuts, PE studs, carrier/anchor fixings and thread the straps before lowering the panel.
3. Install and secure the panel **before XA**. The digital insertion sweep shows that the installed right-side outlet obstructs the straight panel path. Fit rail/end stops/Fv, carriers, meter and CT. Leave access to the CT latch, fuse door and WAGO levers.
4. Install Q0, XA and the accepted cord entries. Route the supply and output jackets through their glands before fitting plug/connector ends. Fit the round DC extension through one 41380 split insert without cutting factory plugs. Keep USB disconnected during operation. Keep the original flat adapter cord and DC mating joint outside.
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
