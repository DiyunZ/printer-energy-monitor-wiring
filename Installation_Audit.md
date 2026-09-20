# Installation audit

2026-09-19 installation audit. **NOT RELEASED FOR FABRICATION OR ENERGIZING.**

All **36 material groups** were reviewed: 10 catalog match · 10 conditional · 4 measure · 12 hold. A catalog match confirms the stated interface only; it is not approval of the complete item or assembly.

One 120 V grounded US supply and one printer at a time. S5, Bambu Lab P2S and Prusa CORE One+ are alternatives, not concurrent loads.

The box and major panel parts have nominal space, but the current design cannot be called a perfect or fully installable assembly. Wall supports/cutouts, several actual part measurements and electrical coordination are unresolved. Do not treat a purchase link or an inventory tick as a release.

[Inspect the 3D installation stages](index.html#assembly-preview) · [Materials and buying links](materials.html) · [Machine-readable checks](installation_checks.json)

## Corrections from the audit

- Q0 body depth: 49.28 → 47.00 mm. 49.28 mm is the terminal pitch; mounting pitch is 52.37 mm.
- Q0 ring terminals: removed the #8 option and selected #10. Mounting screws are separately #6-32.
- KVT 20 envelopes: Ø20/24 × 28 mm → Ø40 × 37 mm. USB moved from Z=139 to Z=167 mm; flange edge gap increased from 0.224 to 25.192 mm.
- WAGO carrier fixing clarified as M3 or ST2.9; generic M4 is not the carrier screw.
- Eaton holder purchase placed on hold because manufacturer sources conflict. Custom wall supports, terminal guards and cable inserts remain unreleased.
- Cable audit found only about 1.64–1.68 m of flexible path in each old lead illustration, with helix pitch 1.33 mm below its assumed 3 mm diameter. Rebuilt the coil illustration for a 2 m flexible-length scenario, with 4 mm pitch and separated layers; actual lead dimensions remain to measure.
- Two illustrated PE routes crossed the logger body. They now pass around its power/USB end; the electrical endpoints are unchanged.

## Printer compatibility

| Printer | Manufacturer information | Design assessment |
|---|---|---|
| UltiMaker S5 | 100–240 VAC, 50/60 Hz, maximum 500 W (S5 user manual, PDF p.10). [s5](https://um-support-files.ultimaker.com/manuals/user-manual/S3-%26-S5/Ultimaker%20S3-S5%20-%20User%20manual%20ENv2.4.pdf) | 500 W / 120 V = 4.17 A only at unity power factor. This is a power-based screen, not nameplate current or inrush. Check installed peripherals and actual US plug. |
| Bambu Lab P2S | Official regional quick-start guide, printed pp.36 and 38: low-voltage version 100–120 VAC, 50/60 Hz, 1000 W at 110 V. Initial bed heating can sustain maximum power for about 3–5 minutes. [p2s](https://csm.bblcdn.com/hub/0a3c3e8ab9554a5c9c91815e41540f42.pdf) | 1000 W / 110 V = 9.09 A only at unity power factor. Verify the actual label next to the inlet, inrush and any AMS/dryer power paths. This design does not support a 200–240 V regional unit. |
| Prusa CORE One+ | Published CORE One+ specifications report a 240 W PSU and typical PLA/ABS printing consumption of 90/110 W. The current product page has moved to Gen 2; confirm the actual unit. [prusa](https://www.prusa3d.com/product/prusa-core-one/), [prusa-psu](https://help.prusa3d.com/wp-content/uploads/generated/prusa-core-one-kit-assembly_2321_en_2026-05-18.pdf) | A PSU rating and typical print consumption do not establish maximum AC input current. Confirm the user’s generation, AC nameplate, US cord and accessories; no exact maximum-current claim is made. |

These watts-to-amps values assume unity power factor and are not current ratings. Q0 supplies the selected printer plus the logger adapter and voltage tap. A 15 A breaker / connector proposal is not approval for a 15 A continuous load. No simultaneous three-printer load or separately powered accessory is included.

<h2 id="simulation">Installation simulation</h2>

Axis-aligned body envelopes, continuous vertical swept volumes against triangulated Hammond shell, nine lid rays per body and sourced interface arithmetic. The shell uses 0.45 mm triangulation deflection, not manufacturing tolerances.

The analysis uses the checked-in component coordinates and actual shell triangles. It is not an FEA, tolerance study, collision-free cable-routing proof, thermal test, electrical clearance assessment or physical dry fit. The closed-lid check samples nine rays against the lid skin; it does not establish the smallest clearance to every lid fastener or operating part.

### 1. Prepare the empty enclosure

With all supplies disconnected, establish approved opening and fastener drawings, remove equipment, machine and deburr, then clean. No cutting dimensions are released by the current layout.

**Result:** Hold: wall interfaces, glands and custom hardware are unfinished.

### 2. Insert and secure the backpanel

Lower the panel into the open case before installing the side outlet box. The audit checks a continuous 300 mm vertical insertion of its bounding box against the factory shell.

**Result:** Nominal path passes with wall fittings absent. Installing the outlet box first blocks this path.

### 3. Fit the panel equipment

Mount rail, stops and carriers; install the measured logger restraint and CT. Route nothing through a live or connected supply.

**Result:** Nominal body / shell envelopes clear. Final screw lengths, CT latch motion, restraint and fuse-door service motion remain unverified.

### 4. Fit wall hardware

Install the coordinated Q0 support, outlet / rear box / cover and cable-entry assemblies using the final drawings. Maintain the corrected split-entry spacing.

**Result:** Hold: manufacturer shell is still uncut; Q0 and outlet-box envelopes intersect it. The modeled locations are not approved wall assemblies.

### 5. Terminate and retain the cables

Qualified personnel complete PE bonds and the circuit schedule; only printer hot goes through CT. Fit the original adapter and USB cables without cutting factory ends, and retain the full measured voltage-lead lengths.

**Result:** Hold: KT sizes, plug transit, small-lead protection, tinned-end acceptance, cable slack and terminal guard are unresolved.

### 6. Close, inspect and release

Check closure without trapping wires, strain relief, all bonds, polarity, insulation and protection under the responsible lab procedure; then validate logging and measured energy against a reference.

**Result:** No hardware has been built or energized. The lid ray screen is not a closure / insulation / thermal qualification.

## Numerical checks

| Check | Result | Evidence and limit |
|---|---|---|
| Q0 catalog body | **PASS** | Model 19.18 × 63.5 × 47 mm; Carling p.11 body envelope 19.18 × 63.50 × 47.00 mm. Body includes the front step; studs, handle and terminal guard are separate. |
| Q0 terminal and mounting pitches | **PASS** | Stud pitch 49.28 mm; mounting pitch 52.37 mm. Carling: 49.28 / 52.37 mm.  |
| Q0 ring size | **PASS** | Selected Q0 terminal code 1 is #10-32; its two ring lugs must have #10 holes. Crimp tool and pull test remain required.  |
| Split-entry flange spacing | **PASS** | Two actual Ø40 mm flanges: 25.192 mm edge gap. 10 mm is a project layout allowance, not a code or manufacturer requirement. Wrench access, tolerance, bore and wall stack still need checking. |
| dc-entry envelope | **PASS** | Model 37 × 40 × 40 mm; KVT 20 overall envelope 37 mm axial × Ø40 mm flange. Conservative cylinder; the threaded shank is M20, not Ø40. |
| usb-entry envelope | **PASS** | Model 37 × 40 × 40 mm; KVT 20 overall envelope 37 mm axial × Ø40 mm flange. Conservative cylinder; the threaded shank is M20, not Ø40. |
| Panel component body separation | **PASS** | 8 nominal body envelopes do not overlap (rail/holder mating excluded). CT is an unidentified example. No connectors, open levers, flexible wires, mounting tolerances or screw-tool envelopes are certified by this check. |
| Vertical insertion through open case | **PASS** | 9/9 swept bounding boxes clear the manufacturer shell. 300 mm vertical translation, fixed orientation, wall fittings absent. This tests shell access, not the full sequence of brackets, wires or tool motions. |
| Panel before side outlet box | **SEQUENCE REQUIRED** | The panel insertion sweep intersects the side outlet-box envelope. Install the panel first; removal requires removing the box or a separately verified tilted path.  |
| Wall hardware mounting interfaces | **HOLD** | outletguard: 6 intersecting shell triangles; q0: 4 intersecting shell triangles Uncut factory CAD intersects proposed wall fittings. The support inserts, apertures, wall taper and body-front offsets are not fabrication drawings. Do not interpret overlap as an approved cutout. |
| Closed lid screen | **SCREEN ONLY** | meter: 159.012 mm (9/9 rays); ct: 164.312 mm (9/9 rays); fuse: 128.362 mm (9/9 rays); outletguard: 9.962 mm (9/9 rays); q0: 34.788 mm (9/9 rays) Nine upward rays per body against lid mesh 15. Not a minimum-distance proof; excludes lid hardware, guards, open fuse door, wire bundles and tolerances. |
| Cord diameter interfaces | **PASS** | Southwire published nominal OD 9.17–9.27 mm lies within Hammond 6–12 mm gland and Leviton 0.245–0.655 in cord ranges. Published variants are not a manufacturing tolerance. Measure purchased cord; clamping, jacket preparation and pull resistance remain physical checks. |
| Ring barrel and internal wire | **PASS** | 3.581 mm wire insulation OD < 4.318 mm ring maximum; 14 AWG is within 16–14 AWG ring range. Does not qualify the crimp or approve the AWM wire for this assembly. |
| DIN rail capacity | **PASS** | 100 − 17.5 − 2 × 6 = 70.5 mm remains after holder and two end stops. Fasteners, PE bond and fuse-door service motion still need final placement. |
| Physical and electrical release | **HOLD** | No built assembly, nameplate verification, qualified acceptance or energized test has been recorded.  |

The flange check uses a **10 mm project layout allowance**, not a mandated clearance. The new nominal 25.2 mm gap leaves more room, but actual tool / sealing / tolerance acceptance remains outstanding. Wall hardware intersections are intentionally unresolved findings, not successful openings.

## Voltage-lead storage scenario

The old illustration had 4.5 turns rising only 6 mm, giving 1.33 mm pitch against its assumed 3 mm cable diameter. The new illustration separates turns and lead layers and adjusts turns for 2 m of flexible cable per lead. Connector body lengths are outside that flexible-length target. Actual leads have not been measured.

| Lead | Modeled flexible length | Turns | Pitch / assumed OD |
|---|---|---|
| A1 | 2000.0 mm | 5.74 | 4 / 3 mm |
| A2 | 2000.0 mm | 5.78 | 4 / 3 mm |
| A3 | 2000.0 mm | 5.75 | 4 / 3 mm |

Cable-to-meter screen: 301 points per curve; 0 sampled intrusions against the logger body expanded by wire radius. This does not check all other objects or wire-to-wire clearances.

The elliptical coil centerline uses 44 and 37 mm radii (minimum planar radius of curvature about 31.1 mm). No manufacturer bend limit is available for the actual leads. Transitions between coils, plugs, supports and other wires still need routing and physical inspection. [Rendered cable measurements](installation_cables.json).

## All materials and interfaces

**Hold** means essential identification, source resolution or custom engineering is missing. **Measure** needs the actual part. **Conditional** has a plausible catalog interface with unresolved installation conditions. **Catalog match** covers only the interface described. Ownership remains unchanged.

| Material | Result | Checked | Remaining work |
|---|---|---|---|
| [Power logger](index.html#material-meter)<br>DENT ELITEpro XC<br>✓ Owned | **Measure** | Current published case is 216 × 63 × 47 mm; older guide gives 203 × 69 × 58 mm. Existing unit has the right voltage / CT / USB connector families. [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf), [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Measure this unit including plugs and magnetic feet. Verify the restraint, clearances, firmware and ELOG configuration. |
| [Current sensor](index.html#material-ct)<br>Existing DENT split-core CT<br>✓ Owned | **Hold** | The model uses a 29.4 × 41.7 × 26.4 mm example with a 10.2 mm bore, not an identification of the photographed CT. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), [ct](https://www.dentinstruments.com/wp-content/uploads/2022/08/20A_Mini_Hinged_CT_Specs.pdf) | Record exact model, rated primary current, mV output, polarity, closed size, latch travel and lead length. Select ELOG scaling from that CT. Never substitute a 1 A / 5 A CT output. |
| [Blue voltage pigtails](index.html#material-blue-leads)<br>Existing detachable blue pigtails<br>✓ Owned | **Hold** | Three existing pigtails are voltage-tap adapters. Their shrouded mating style is separate from load wiring. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Confirm exact part number, voltage / current rating, cross section, tinned-end acceptance, insertion length and Fv protection. Do not use any as printer power or PE. |
| [Full voltage leads](index.html#material-voltage-leads)<br>Existing matching voltage lead set<br>✓ Owned | **Measure** | Three leads connect A1/L1, A2/L2 and A3/N. Plug family looks consistent with the photos. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Measure actual complete and flexible lengths, mating engagement, cable OD and minimum bend radius. The revised 2 m / 3 mm coil scenario is an assumption, not evidence that the supplied leads fit. |
| [AC/DC adapter](index.html#material-adapter)<br>Existing two-pin AC/DC adapter<br>✓ Owned | **Hold** | The meter input label calls for 6–10 V DC, 500 mA, center positive; the existing two-pin adapter remains intact and outside. [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) | Read the adapter Output label, verify voltage/polarity/current and barrel size. Measure its housing, strain relief and molded plug; define an exterior restraint if needed. |
| [Enclosure](index.html#material-enclosure)<br>Hammond PCJ16148CC<br>□ Buy / fabricate | **Conditional** | Hammond PCJ16148CC factory CAD and matching panel were checked. Nominal wall thickness is 4.8 mm. [case](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf) | Resolve custom wall interfaces and cutouts, sealing, field-modification acceptance and working temperature. Factory enclosure rating is not automatically retained. |
| [Mounting panel](index.html#material-panel)<br>Hammond 14R1513<br>□ Buy / fabricate | **Catalog match** | 14R1513 is the specified panel for this enclosure. CAD body 327.025 × 374.65 × 1.897 mm; drawing rounded dimensions agree. Vertical insertion into the empty case clears the CAD shell. [panel](https://www.hammfg.com/electrical/products/accessories/pcjp), [case](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf) | Install before the side outlet box. Lay out all fasteners / bonds, account for under-panel screw ends and deburr before installing equipment. |
| [Q0 operating breaker](index.html#material-breaker)<br>Carling CA1-B0-24-615-121-DG<br>□ Buy / fabricate | **Hold** | Carling ordering code resolves to one pole, 15 A, #10-32 studs and #6-32 mounting inserts. Body depth and pitches corrected in both views. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf) | Approve inrush, fault interruption and repeated switching duty for the actual supply / printer. Finalize stepped-body wall interface, screw engagement and guarded line/load terminations. |
| [XA adapter receptacle](index.html#material-receptacle)<br>Leviton 5261 / 5261-W<br>□ Buy / fabricate | **Conditional** | 5261 is 15 A / 125 V NEMA 5-15R; 14 AWG is within its terminal range. Published yoke is 103.2 × 33.3 mm with 27 mm device depth. [outlet](https://leviton.com/products/5261), [outlet-drawing](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/none/Document-32236-Dimensional%20Data.jpg) | Verify yoke-to-box and cover screw centers, terminal clearance, supported mounting stack and adapter plug retention. Do not rely on polycarbonate alone to clamp the device. |
| [XA rear device box](index.html#material-outlet-box)<br>RACO 670RAC / retail 8670<br>□ Buy / fabricate | **Hold** | 670RAC: 101.6 × 53.975 × 55.575 mm and 16.5 in³; 1/2 in trade knockouts. Dedicated PE bond is present in the circuit. [box](https://hubbellcdn.com/specsheet/RACO-670RAC-SPEC-EN.pdf) | Proposed box intersects the uncut tapered shell; supply a coordinated aperture / support drawing. Confirm grounding thread, terminal space, entry method, fill and installation access. |
| [XA faceplate](index.html#material-faceplate)<br>Leviton 84004-40<br>□ Buy / fabricate | **Conditional** | 84004-40 is a single-receptacle plate with a 1.406 in / 35.712 mm opening; device-mount family matches the intended outlet style. [plate](https://leviton.com/products/84004-40) | This is a cover, not a structural bracket. Dry-fit the actual device face, screws, rear box and insulating support together. |
| [Fv fuse holder](index.html#material-fuse-holder)<br>Eaton Bussmann CHCC1DU<br>□ Buy / fabricate | **Hold** | Technical data 10430 lists CHCC1DU as a 600 V / 30 A Class CC holder on 35 mm DIN rail. Its rating is not the selected fuse value. [eaton](https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/fuses/data-sheets/bus-ele-ds-10430-chcc-chm-chpv.pdf), [eaton-conflict](https://www.eaton.com/us/en-us/skuPage.CHCC1DU.html) | Eaton SKU page instead lists 48 Vdc and 87 × 73 × 17.5 mm; technical drawing differs. Resolve the supplied revision and obtain the closed/open-door envelope. Confirm pigtail terminal acceptance. |
| [Fv fuse](index.html#material-fuse)<br>Compatible Class CC fuse · value pending<br>□ Buy / fabricate | **Hold** | The holder takes Class CC rejection fuses; compatible series are listed in Eaton technical data. [eaton](https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/fuses/data-sheets/bus-ele-ds-10430-chcc-chm-chpv.pdf) | No ampere value or SKU can be released without actual lead ampacity, fault level and coordination. A generic 10 × 38 mm fuse is not automatically a Class CC substitute. |
| [Distribution connectors](index.html#material-connectors)<br>WAGO 221-415<br>□ Buy / fabricate | **Conditional** | Four 221-415 five-port connectors supply 20 ports: JL 4, JN 5 and two bridged PE groups using 8 combined ports. 14 AWG fits the catalog conductor range. [wago](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415) | Confirm actual stranded-wire preparation, pigtail tinned ends and use as a secured PE distribution arrangement. A spare port is not spare current capacity. |
| [Connector carriers](index.html#material-carriers)<br>WAGO 221-505<br>□ Buy / fabricate | **Catalog match** | 221-505 is the five-port 4 mm² carrier for 221-415: 35 × 16.9 × 52.8 mm. WAGO specifies M3 DIN 1207 or ST2.9 DIN 7049 mounting. [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf) | Use four carriers. Choose screw length for the 1.9 mm plate and access beneath it; check lever and screwdriver access with wires installed. |
| [Short DIN rail](index.html#material-din-rail)<br>DINnector DN-R35S1-2<br>□ Buy / fabricate | **Catalog match** | DN-R35S1-2 has the 35 × 7.5 mm rail profile for the CH holder. Proposed cut length is 100 mm. [din](https://cdn.automationdirect.com/static/specs/screwlessdinnectors.pdf), [eaton](https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/fuses/data-sheets/bus-ele-ds-10430-chcc-chm-chpv.pdf) | Deburr the cut ends, define fixing holes and a deliberate bond; verify holder release-tab and tool access. |
| [Mains / printer cord](index.html#material-cord)<br>Southwire 55808699 · 14/3 SJOOW<br>□ Buy / fabricate | **Conditional** | 14/3 SJOOW catalog OD 9.17–9.27 mm fits the proposed entry and plug clamp ranges. Jacket is 300 V rated. [cord](https://cabletechsupport.southwire.com/cablespec/download_spec/?country=US&spec=70126) | Confirm exact delivered OD and ampacity / temperature / routing conditions, total length and voltage drop. Keep the outer jacket under each cord clamp. |
| [Supply plug](index.html#material-supply-plug)<br>Leviton 515PV · NEMA 5-15P<br>□ Buy / fabricate | **Catalog match** | 515PV is grounded NEMA 5-15P, 15 A / 125 V; 14 AWG and the 9.17–9.27 mm jacket fall within its listed acceptance ranges. [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Confirm the lab receptacle and complete the specified termination, torque, cord grip and polarity checks. This design remains 120 V only. |
| [Printer output connector](index.html#material-printer-connector)<br>Leviton 515CV · NEMA 5-15R<br>□ Buy / fabricate | **Conditional** | 515CV is grounded NEMA 5-15R and matches 515PV cable acceptance. It receives the printer’s original mains plug. [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Verify all three actual printer cords have the matching grounded US plug. No voltage-conversion adapters or simultaneous multi-printer outlet strip are assumed. |
| [Mains / printer strain relief](index.html#material-cord-glands)<br>Hammond 1427NCGM20B<br>□ Buy / fabricate | **Measure** | 1427NCGM20B clamp range is 6–12 mm, matching the selected cord OD. M20 thread length is 9 mm. [gland](https://www.hammfg.com/electronics/small-case/accessories/1427ncg), [case](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf) | At a nominal 4.8 mm wall, only 4.2 mm remains for the inner nut plus any seal allowance. Obtain nut/washer dimensions and required engagement; do not approve by cable OD alone. |
| [DC / USB split cable entry](index.html#material-split-entries)<br>icotek KVT 20 · 45024<br>□ Buy / fabricate | **Conditional** | KVT 20 / 45024 drawing: Ø40 flange, 37 mm overall, M20 × 1.5, 14 mm thread and 7 mm nut. Corrected spacing leaves 25.2 mm nominal flange gap. [kvt](https://pim.icotek.com/Produkte/PG02%20Kabelverschraubungen/KVT/KVT%2020/Datenbl%C3%A4tter/45024_KVT%2020_bk.PDF), [kvt-product](https://www.icotek.com/en-us/products/cable-glands/kvt-45024) | Confirm flat sealing seat, thread engagement, tool access and preterminated-connector passage. The KVT product rating is IP54 / UL Type 12, not the factory case’s higher rating. |
| [USB data cable](index.html#material-usb)<br>StarTech USB2HAB6 · USB-A to USB-B, 6 ft / 1.8 m<br>□ Buy / fabricate | **Measure** | USB2HAB6 is a 1.8 m USB-A to USB-B data cable; Type B matches ELITEpro. [usb](https://www.startech.com/en-us/cables/usb2hab6), [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Check host port, exact cable OD, molded connector clearance and final reach. A split entry still needs the connector to pass the bare wall opening / unsplit locknut. |
| [DIN rail end stops](index.html#material-din-stops)<br>DINnector DN-EB35-A-10<br>□ Buy / fabricate | **Catalog match** | Two DN-EB35-A-10 end brackets, 6 mm wide each, plus a 17.5 mm holder occupy 29.5 mm of the 100 mm rail. [din](https://cdn.automationdirect.com/static/specs/screwlessdinnectors.pdf) | Mount stops on both sides, leave release / fastener access; the pack contains more than the two required. |
| [DC / USB sealing inserts](index.html#material-kt-inserts)<br>icotek KT small · bore sizes pending<br>□ Buy / fabricate | **Hold** | KT small inserts mate with KVT 20; one sealed cable bore is needed per entry. [kt](https://www.icotek.com/en-us/products/cable-grommets/kt-gy), [kvt](https://pim.icotek.com/Produkte/PG02%20Kabelverschraubungen/KVT/KVT%2020/Datenbl%C3%A4tter/45024_KVT%2020_bk.PDF) | Measure DC and USB cable ODs and select the exact two KT bore SKUs. No guessed universal bore is released. |
| [Internal L / N / PE wire](index.html#material-internal-wire)<br>Remington 14UL1015STRKITS · 14 AWG stranded, 600 V UL1015<br>□ Buy / fabricate | **Conditional** | 14 AWG UL1015 stranded wire has a published 0.141 in / 3.581 mm insulation OD. Its conductor size fits the proposed power terminals. [wire](https://www.remingtonindustries.com/content/UL1015%20Hook%20Up%20Wire%20Data%20Sheet.pdf), [wago](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415), [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | AWM style and voltage rating alone do not approve this assembly’s wiring method. Confirm required insulation, routing, ampacity, bend radii and each terminal’s preparation. |
| [Ring terminals](index.html#material-ring-lugs)<br>3M MV14-10R/LX-BOTTLE · #10 stud, 16–14 AWG<br>□ Buy / fabricate | **Catalog match** | Corrected Q0 selection to MV14-10R (#10 hole, 16–14 AWG). Wire OD 3.581 mm is below the ring’s 4.318 mm maximum insulation OD. [ring](https://multimedia.3m.com/mws/media/61020O/ring-tongues-vinyl-insulated-brazed-seam-16-14-awg.pdf), [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [wire](https://www.remingtonindustries.com/content/UL1015%20Hook%20Up%20Wire%20Data%20Sheet.pdf) | Use the specified crimp tool and inspection / pull procedure. Select other PE lugs by their own stud; do not use #10 rings indiscriminately. |
| [Device-box grounding screw](index.html#material-box-ground-screw)<br>IDEAL 30-3194<br>□ Buy / fabricate | **Conditional** | IDEAL 30-3194 is #10-32 × 3/8 in. [ground](https://www.idealind.com/content/dam/electrical/support/P-070%20FullLineCatalog2018.pdf), [box](https://hubbellcdn.com/specsheet/RACO-670RAC-SPEC-EN.pdf) | Confirm the 670RAC dedicated ground-hole thread, metal engagement and any projecting tip clearance. Do not substitute an ordinary mounting screw for a verified bonding joint. |
| [Rear-box wire-entry protection](index.html#material-box-entry)<br>Heyco G1508 / TG 875 · internal-entry candidate<br>□ Buy / fabricate | **Conditional** | G1508 / TG875: 22.2 mm hole, 19.6 mm ID, 30.2 mm head; accepts 0.8–2.0 mm sheet. It is a thin-metal-box grommet candidate. [grommet](https://www.heyco.com/pdf/Heyco_Cat_115.pdf) | It does not fit a 4.8 mm enclosure wall and does not provide cable strain relief. Approve the internal box wiring-entry method, or replace it with the required clamp/fitting. |
| [Unused-opening closures](index.html#material-knockout-seals)<br>RACO 1042<br>□ Buy / fabricate | **Catalog match** | RACO 1042 seals opened, unused 1/2 in trade knockouts; 670RAC uses that trade size. [seal](https://hubbellcdn.com/specsheet/RACO_CA-1042-SPEC-EN.pdf), [box](https://hubbellcdn.com/specsheet/RACO-670RAC-SPEC-EN.pdf) | Do not confuse trade size with a 12.7 mm physical hole. Buy only the number required; retain unopened knockouts. |
| [Screw-fixed cable mounts](index.html#material-tie-mounts)<br>Panduit TM2S8-C<br>□ Buy / fabricate | **Catalog match** | TM2S8-C is 16 × 10.8 × 7 mm with #8/M4 screw attachment and supports standard cable ties. [mount](https://www.panduit.com/content/dam/panduit/en/products/media/9/29/929/8929/98528929.pdf) | Final hole pattern, screw projection and tie positions must clear the panel and avoid crushing voltage / CT leads. |
| [Cable ties](index.html#material-cable-ties)<br>Panduit PLT2S-C · 188 × 4.8 mm<br>□ Buy / fabricate | **Catalog match** | PLT2S-C standard ties are 188 × 4.8 mm; their width fits the selected mount family. [ties](https://www.panduit.com/content/dam/panduit/en/products/media/2/92/492/0492/30492.pdf), [mount](https://www.panduit.com/content/dam/panduit/en/products/media/9/29/929/8929/98528929.pdf) | 12–20 is a routing allowance, not an installed count. Confirm material temperature and maintain permitted cable bend radius. |
| [Wire and component labels](index.html#material-labels)<br>3M ScotchCode SWD + SLW<br>□ Buy / fabricate | **Catalog match** | SWD recommended OD 2.3–7.9 mm covers the 3.58 mm internal wire; SLW 5.8–33.5 mm covers the roughly 9.2 mm cords. [labels](https://multimedia.3m.com/mws/media/1854486O/ft-scotchcode-slw-us-pdf.pdf) | Measure blue leads before choosing wrap size. Confirm adhesion and use durable exterior legends sized for the finished device. |
| [Mounting and bonding hardware](index.html#material-fasteners)<br>Machine screws, nuts, flat/locking washers and approved bonding hardware<br>□ Buy / fabricate | **Hold** | Different joints need different threads: Q0 #6-32 mount / #10-32 terminals; carriers M3 or ST2.9; tie mounts #8/M4. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf), [mount](https://www.panduit.com/content/dam/panduit/en/products/media/9/29/929/8929/98528929.pdf) | No complete fastener schedule exists. Define each material, hole, screw length, washer/nut, thread engagement, underside clearance and torque from the final stack. |
| [Q0 / XA wall supports](index.html#material-wall-inserts)<br>Fabricate to approved measurements<br>□ Buy / fabricate | **Hold** | Two support concepts are allocated for Q0 and the outlet. [case](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf), [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [outlet-drawing](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/none/Document-32236-Dimensional%20Data.jpg), [box](https://hubbellcdn.com/specsheet/RACO-670RAC-SPEC-EN.pdf) | No released material, thickness, section, aperture, screw pattern or tolerance drawing. Resolve both CAD wall intersections and mechanical loading before fabrication. |
| [Q0 terminal guard](index.html#material-terminal-guard)<br>Custom guard or manufacturer-approved terminal covers<br>□ Buy / fabricate | **Hold** | Both Q0 studs remain inside the enclosure. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf) | No approved guard geometry or material has been defined. Cover the incoming live stud as well as outgoing stud and account for rings, insulation, tools and required spacings. |
| [Logger cradle and straps](index.html#material-logger-restraint)<br>Custom cradle + VELCRO ONE-WRAP 91808 roll candidate<br>□ Buy / fabricate | **Hold** | One custom cradle and two straps are listed. The meter body has space on the nominal panel.  | Cradle and strap fit are not drawn. Measure actual meter, feet, port exits and strap path; restrain without blocking connectors, venting or removable plugs. No load or drop test has been performed. |

## Inputs needed to finish the build design

- Actual ELITEpro body and feet; CT model, current/output rating, aperture, latch opening and cable length; adapter Output voltage/current/polarity and connector size.
- Actual printer AC labels and plugs (including P2S regional voltage and the CORE One+ generation); lab supply / available fault current and accessory load boundary.
- Blue pigtail part number, cross section and ratings; all voltage-lead lengths and bend limits; DC/USB cable ODs and largest plug cross sections.
- Eaton exact holder revision / drawing, final fuse SKU and approved wire / terminal preparation.
- Coordinated wall cutout, insert, outlet-box and guard drawings; gland wall/nut/seal stacks, complete fastener schedule, bonds, restraint and cable-routing dry fit.

After those inputs are resolved, update the fabrication drawings and repeat the affected checks, then conduct a documented dry fit and qualified electrical acceptance. There is no hardware test result or energizing approval in this audit.

## Reproduce the checks

Run `node tools/audit_installation.mjs` and `node --test tools/test_installation.mjs`. Run the browser checks after regenerating drawings; `EXPORT_AUDIT=1` refreshes the rendered cable measurements from the local model. Then run `node tools/render_documents.cjs`. Software passes describe only the tested geometry / website behavior.

[Review data and primary links](installation_review.json) · [Geometry check results](installation_checks.json) · [3D layout](index.html#layout)
