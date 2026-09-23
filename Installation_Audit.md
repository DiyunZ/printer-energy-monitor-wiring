# Installation audit

September 23, 2026 · professor review revision B. **ENGINEERING REVISION B — STOCK, FIT AND ELECTRICAL ACCEPTANCE OPEN.**

All **22 material groups** were reviewed: 2 catalog match · 17 conditional · 3 measure · 0 hold. A catalog match confirms the stated interface only; it is not approval of the complete item or assembly.

One grounded 120 V supply, one printer at a time. Revision B uses an opaque-cover enclosure, proposed reuse of the professor’s aluminum sheet and an internal adapter connection. Five owned equipment groups and the kit USB are retained. The selected 15 A Q0 and upstream-only voltage-lead protection still require application acceptance. No purchase, physical fit, thermal test or electrical release is claimed.

The box and major panel parts have nominal space, but the current design cannot be called a perfect or fully installable assembly. Machining geometry is supplied; Exact CT scaling, voltage-lead protection and physical/electrical acceptance remain open. XA and DC remain inside; the right wall has no openings. USB is temporary with mains unplugged. Do not treat a purchase link or an inventory tick as a release.

[Inspect the 3D installation stages](index.html#assembly-preview) · [Materials and buying links](materials.html) · [Machine-readable checks](installation_checks.json)

## Corrections from the audit

- Replaced the clear-cover box selection with the same-size opaque PCJ16148; CAD retains the common-base template and an illustrative lid silhouette.
- Proposed reuse of the professor’s aluminum sheet, with stock measurement and aluminum bonding held open.
- Moved XA and the original adapter inside. XA uses the same 515CV SKU as the printer output, with a continuous 14/3 cord branch.
- Removed the round DC extension, KVT frame and insert from the active BOM and model. Restored XA, DC and USB wall stock; the right wall has no cuts.
- Retained six cable anchor points and added separate straps for XA and adapter.
- Consolidated purchase sources and added exact-part approval evidence and a conditional DIN-breaker comparison.

## Printer compatibility

| Printer | Manufacturer information | Design assessment |
|---|---|---|
| UltiMaker S5 | 100–240 VAC, 50/60 Hz, maximum 500 W (S5 user manual, PDF p.10). [s5](https://um-support-files.ultimaker.com/manuals/user-manual/S3-%26-S5/Ultimaker%20S3-S5%20-%20User%20manual%20ENv2.4.pdf) | 500 W / 120 V = 4.17 A only at unity power factor. This is a power-based screen, not nameplate current or inrush. Check installed peripherals and actual US plug. |
| Bambu Lab P2S | Official regional quick-start guide, printed pp.36 and 38: low-voltage version 100–120 VAC, 50/60 Hz, 1000 W at 110 V. Initial bed heating can sustain maximum power for about 3–5 minutes. [p2s](https://csm.bblcdn.com/hub/0a3c3e8ab9554a5c9c91815e41540f42.pdf) | 1000 W / 110 V = 9.09 A only at unity power factor. Verify the actual label next to the inlet, inrush and any AMS/dryer power paths. This design does not support a 200–240 V regional unit. |
| Prusa CORE One+ | Published CORE One+ specifications report a 240 W PSU and typical PLA/ABS printing consumption of 90/110 W. The current product page has moved to Gen 2; confirm the actual unit. [prusa](https://www.prusa3d.com/product/prusa-core-one/), [prusa-psu](https://help.prusa3d.com/wp-content/uploads/generated/prusa-core-one-kit-assembly_2321_en_2026-05-18.pdf) | A PSU rating and typical print consumption do not establish maximum AC input current. Confirm the user’s generation, AC nameplate, US cord and accessories; no exact maximum-current claim is made. |

These watts-to-amps values assume unity power factor and are not current ratings. Q0 supplies the selected printer plus the logger adapter and voltage tap. A 15 A breaker / connector proposal is not approval for a 15 A continuous load. No simultaneous three-printer load or separately powered accessory is included.

<h2 id="simulation">Installation simulation</h2>

Axis-aligned body envelopes, continuous vertical swept volumes against the machined Hammond shell, nine lid rays per body and sourced interface arithmetic. Shell triangulation deflection is 0.3 mm; numerical seating-contact exclusion is 0.0001 mm. Neither is a manufacturing tolerance.

The analysis uses the checked-in component coordinates and actual shell triangles. It is not an FEA, tolerance study, collision-free cable-routing proof, thermal test, electrical clearance assessment or physical dry fit. The closed-lid check samples nine rays against the lid skin; it does not establish the smallest clearance to every lid fastener or operating part.

### 1. Verify stock and machine empty parts

Measure the offered aluminum and received enclosure. Close thickness, mounting and bonding decisions; use revision B CAD only. No right-wall openings. Deburr all eight strap slots and clear chips.

**Result:** Digital cut and restored-wall checks only; no material has been received or machined.

### 2. Fit underside hardware and panel

Fit the six cable mounts and carrier fasteners, thread four equipment straps and check underside projections. Seat the panel on its factory supports.

**Result:** Nominal vertical insertion screen; actual stock thickness and fastener stacks need measurement.

### 3. Restrain logger, CT and terminals

Fit the logger with two adjustable straps; retain three WAGO groups, one CT and a dedicated aluminum-panel PE connection. Confirm CT label and cable slack.

**Result:** Catalog envelopes and routed cable geometry only; no physical retention test.

### 4. Install Q0, glands and internal power

Install Q0 and two power glands. Restrain the internal 515CV XA connector and original adapter separately; verify full blade seating, cord clamp and support. Nothing mounts through the right wall.

**Result:** Internal layout proposal; actual plug engagement, anti-unplug retention and thermal suitability remain open.

### 5. Connect and dress the cables

Connect the XA 14/3 branch before CT. Route the intact original DC cable to the logger. Use six cable ties as needed to control slack; keep mains and low-voltage routes separated. Perform offline ELOG setup.

**Result:** Electrical topology and digital routing checks; not a qualified electrical acceptance.

### 6. Close and verify the pilot

Remove USB and install the opaque lid before mains operation. Qualified personnel complete electrical and closed-enclosure thermal checks. Verify recording by unplugging mains and downloading after a supervised pilot.

**Result:** No energized test, temperature test or finished-assembly certification recorded.

## Numerical checks

| Check | Result | Evidence and limit |
|---|---|---|
| Q0 catalog body | **PASS** | Model 19.18 × 63.5 × 47 mm; Carling p.11 body envelope 19.18 × 63.50 × 47.00 mm. Body includes the front step; studs, handle and terminal protection is supplied by the screw-fixed outer enclosure. |
| Q0 terminal and mounting pitches | **PASS** | Stud pitch 49.28 mm; mounting pitch 52.37 mm. Carling: 49.28 / 52.37 mm.  |
| Q0 ring size | **PASS** | Selected 15-104 rings accept #8–10 studs, including Q0 terminal code 1 (#10-32). A #8-only ring is not acceptable. Crimp qualification remains a physical check.  |
| Internal original DC connection | **PASS** | Original adapter cable stays inside; extension, external coupling and feedthrough purchasing are removed.  |
| Internal XA and adapter | **PASS** | Both complete component envelopes remain inside the case plan with a 10 mm screening margin. Not a creepage/clearance standard or a restraint/thermal check. |
| Proposed aluminum reuse | **PASS** | Offered aluminum is a fabrication proposal, not confirmed owned stock or a bought steel panel. Actual thickness, stiffness and aluminum bonding remain to be accepted. |
| Panel component body separation | **PASS** | 7 nominal body envelopes do not overlap. CT uses the matched Mini HSC family envelope; exact scale remains unconfirmed. No connectors, open levers, flexible wires, mounting tolerances or screw-tool envelopes are certified by this check. |
| Vertical insertion through open case | **PASS** | 8/8 swept bounding boxes clear the manufacturer shell. 300 mm vertical translation, fixed orientation, wall fittings absent. Panel/support contact at Y=0 is excluded with a 0.0001 mm numerical offset. This tests shell access, not brackets, wires or tool motions. |
| Internal power retention | **HOLD** | Separate XA and adapter straps replace the wall mount; physical plug retention and closed-enclosure temperature are untested.  |
| Machined wall geometry | **PASS** | Project openings in shell 0 and panel 33; build123d 0.11.1, 0.3 mm tessellation; other meshes retained. Carrier fixing holes transfer-drilled, not in mesh. Exact cut-through gauges are in fabrication/cad-checks.json. Axis-aligned wall-device illustrations do not model the 0.937 degree draft; body/shell triangle contacts here are not mounting proofs. Received-part fit and fastening remain physical checks. |
| Closed lid screen | **SCREEN ONLY** | meter: 159.012 mm (9/9 rays); ct: 168.315 mm (9/9 rays); outlet: 170.112 mm (9/9 rays); q0: 32.992 mm (9/9 rays) Nine upward rays per body against lid mesh 15. Not a minimum-distance proof; excludes lid hardware, guards, wire bundles and tolerances. |
| No XA wall opening | **PASS** | Former XA center has 2 wall-surface intersections; right wall stock restored. A cross-section screen; exact source-CAD stock gauges are also recorded. |
| No DC wall opening | **PASS** | Former DC center has 2 wall-surface intersections; right wall stock restored. A cross-section screen; exact source-CAD stock gauges are also recorded. |
| No permanent USB wall opening | **PASS** | At the former USB center Y/Z = 55/167 mm, the shell has 2 wall-surface intersections; no USB fitting is installed. Mesh cross-section check at the former opening center. USB is temporary with mains unplugged and the lid open. |
| Cord diameter interfaces | **PASS** | Southwire published nominal OD 9.17–9.27 mm lies within Hammond 6–12 mm gland and Leviton 0.245–0.655 in cord ranges. Published variants are not a manufacturing tolerance. Measure purchased cord; clamping, jacket preparation and pull resistance remain physical checks. |
| Ring barrel and internal wire | **REVIEW** | The selected 15-104 accepts 14–16 AWG. Its manufacturer does not publish an insulation-barrel limit on the cited page; do not reuse the former 3M value. Fit the actual 2.87 mm nominal-OD wire, use the specified crimp tooling and inspect/pull-test before accepting the termination. |
| Physical and electrical release | **HOLD** | No built assembly, nameplate verification, qualified acceptance or energized test has been recorded.  |

The right wall is restored solid at the former XA/DC/USB positions. Exact CAD booleans provide only the Q0 and two power-gland openings. Axis-aligned wall-device illustrations still do not model wall draft and cannot prove the mounted interface.

## Voltage-lead storage scenario

The old illustration had 4.5 turns rising only 6 mm, giving 1.33 mm pitch against its assumed 3 mm cable diameter. The new illustration separates turns and lead layers and adjusts turns for 2 m of flexible cable per lead. Connector body lengths are outside that flexible-length target. Actual leads have not been measured.

| Lead | Modeled flexible length | Turns | Pitch / assumed OD |
|---|---|---|
| A1 | 2000.0 mm | 5.90 | 4 / 3 mm |
| A2 | 2000.0 mm | 5.14 | 4 / 3 mm |
| A3 | 2000.0 mm | 4.97 | 4 / 3 mm |

Cable-to-meter screen: 301 points per curve; 0 sampled intrusions against the logger body expanded by wire radius. This does not check all other objects or wire-to-wire clearances.

The elliptical coil centerline uses 44 and 37 mm radii (minimum planar radius of curvature about 31.1 mm). No manufacturer bend limit is available for the actual leads. Transitions between coils, plugs, supports and other wires still need routing and physical inspection. [Rendered cable measurements](installation_cables.json).

## All materials and interfaces

**Hold** means essential identification, source resolution or custom engineering is missing. **Measure** needs the actual part. **Conditional** has a plausible catalog interface with unresolved installation conditions. **Catalog match** covers only the interface described. Ownership remains unchanged.

| Material | Result | Checked | Remaining work |
|---|---|---|---|
| [Power logger](index.html#material-meter)<br>DENT ELITEpro XC<br>✓ Owned | **Measure** | Current published case is 216 × 63 × 47 mm; older guide gives 203 × 69 × 58 mm. Existing unit has the right voltage / CT / USB connector families. [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf), [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Measure this unit including plugs and magnetic feet. Verify the restraint, clearances, firmware and ELOG configuration. |
| [Current sensor](index.html#material-ct)<br>DENT Mini HSC · probable CTHSC-050-U/B<br>✓ Owned | **Conditional** | The white hinged case, label layout and partially visible “DENT 50…” match the legacy Mini HSC 50 A / 333.3 mV product. This is a probable variant identification: wires obscure the complete model. DENT 20 A and 50 A Mini HSC versions share the body and 10 mm aperture; both accommodate one printer-hot conductor. Set ELOG from the uncovered label at commissioning, not from appearance. [ct](https://www.dentinstruments.com/wp-content/uploads/2022/08/20A_Mini_Hinged_CT_Specs.pdf), [ct-family](https://www.dentinstruments.com/shop/current-sensors/hinged-current-transformers-sensors-for-energy-metering/), [ct-current](https://www.dentinstruments.com/wp-content/uploads/CT-HSC-XXX-U_Datasheet_06132024.pdf), [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Uncover the existing label during assembly and enter its actual current/output in ELOG; validate positive watts against a reference load/meter. |
| [DENT voltage pigtails](index.html#material-blue-leads)<br>DENT LD-SKTSP series · 10 in / 254 mm nominal<br>✓ Owned | **Conditional** | User confirms three original DENT kit pigtails in different colors, all with the same voltage-sensing function. The connector, tinned end and ESIS card match the LD-SKTSP family. A1 feeds L1 hot; A2/A3 feed L2/N neutral. Colors identify connections; these leads do not carry printer load current or serve as PE. [blue](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/) | OEM kit identity is confirmed. Accept original pigtail termination and protection by the upstream 15 A Q0 before use; original-kit status alone does not establish suitability. |
| [Full voltage leads](index.html#material-voltage-leads)<br>Existing matching voltage lead set<br>✓ Owned | **Measure** | Three leads connect A1/L1, A2/L2 and A3/N. Plug family looks consistent with the photos. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf) | Measure actual complete and flexible lengths, mating engagement, cable OD and minimum bend radius. The revised 2 m / 3 mm coil scenario is an assumption, not evidence that the supplied leads fit. |
| [AC/DC adapter](index.html#material-adapter)<br>CUI SMI6-9-V-P5 · existing original adapter<br>✓ Owned | **Conditional** | Reuse the original CUI 9 V / 0.667 A center-positive adapter, with its P5 plug and flat cord intact. It plugs into the internal XA cord connector; its original cable runs directly to the logger. No DC extension, coupling or wall feedthrough. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), [cui](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf) | Owned. Verify full plug seating, restraint, cable slack and temperature during the closed-enclosure pilot. |
| [Enclosure](index.html#material-enclosure)<br>Hammond PCJ16148 · opaque screw cover<br>□ Buy / fabricate | **Conditional** | Same PCJ 16 × 14 × 8 in size class with an opaque gray cover. Supplier list price $137.11 versus $149.45 for the previous clear-cover PCJ16148CC, checked 2026-09-23. X-ray display is a website viewing aid; the purchased lid is opaque. [case](https://www.hammfg.com/files/parts/pdf/PCJ16148.pdf) | Proposed lower-cost selection. Common base/panel dimensions match the Hammond series drawing; the inherited clear-cover CAD remains a layout template, not a verified solid-cover lid model. |
| [Mounting panel](index.html#material-panel)<br>Professor-supplied aluminum · fabricate after measuring<br>□ Buy / fabricate | **Measure** | Use the scrap aluminum offered by Professor Clemon instead of buying 14R1513. Target outline 327.025 × 374.65 mm; modeled thickness 1.89738 mm is a provisional 1.90 mm template, not a measurement of his stock. Confirm thickness, flatness, stiffness and usable area before cutting. Retain a dedicated PE bond using hardware and a method suitable for aluminum. [panel](https://www.hammfg.com/electrical/products/accessories/pcjp), [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf) | Reuse proposed, not received or measured. Verify mounting pattern, bonding, screw stacks and stiffness before fabrication. |
| [Q0 operating breaker](index.html#material-breaker)<br>Carling CA1-B0-24-615-121-DG<br>□ Buy / fabricate | **Conditional** | 19.18 × 63.5 × 47 mm body; #10 studs; #6-32 mount. Direct wall rectangle and 52.37 mm fixing pitch supplied. Manufacturer UL489 table: 10 kA at 120 V AC. Delay 24: 12 × rated current for a 60 Hz half-cycle pulse (180 A, 8.33 ms at 15 A), under the stated test conditions. Master Electronics: $40.32 quantity one; 16 listed in stock, checked 2026-09-23. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [carling-delay](https://www.carlingtech.com/sites/default/files/documents/Carling-HM-CB-Time-Delays.pdf), [jis](https://mechse.illinois.edu/undergraduate/makerworks), [q0-buy](https://www.masterelectronics.com/en/productdetail/littelfuse-carling-technologies/ca1b024615121dg-16947583.html) | Manufacturer table confirms 10 kA interruption at 120 V AC for the selected UL489 configuration; delay 24 has specified half-cycle inrush tolerance. Actual JIS outlet fault current and combined startup waveform are not published. Check washer stack, body shoulder and terminal spacing on receipt. |
| [XA adapter receptacle](index.html#material-receptacle)<br>Leviton 515CV · internal NEMA 5-15R<br>□ Buy / fabricate | **Conditional** | Use a complete cord connector inside the box, matching the printer output connector SKU. A dedicated 14/3 SJOOW branch connects JL/JN/PE to XA upstream of CT. The connector body encloses its terminals and clamps the cord jacket. No wall outlet, custom bracket or wall cutout. [outlet](https://leviton.com/products/515cv), [outlet-drawing](https://leviton.com/content/dam/leviton/residential/product_documents/none/Document-31435-Dimensional%20Data.jpg), [outlet-install](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf), [cord](https://cabletechsupport.southwire.com/cablespec/download_spec/?country=US&spec=70126) | Catalog UL498 File E13393 / CSA LR-406. Verify the cord clamp and secure both XA and the adapter on the panel; plugs remain fully seated. |
| [Distribution connectors](index.html#material-connectors)<br>WAGO 221-415<br>□ Buy / fabricate | **Conditional** | One five-port connector each for JL, JN and PE. JL accepts Q0 output, printer hot, A1 and adapter hot; JN accepts supply, printer, A2, A3 and adapter neutrals; PE accepts supply, printer, panel and outlet earth. One accepted conductor per port. Confirm original DENT pigtail preparation and protective-bonding suitability. [wago](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415) | Verify allowed conductor preparation, one wire per port and protective-bonding use. |
| [Connector carriers](index.html#material-carriers)<br>WAGO 221-505<br>□ Buy / fabricate | **Conditional** | Three 221-505 carriers, each with two M3 fasteners. [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf) | Transfer-drill actual fixing holes and verify underside fastener clearance. |
| [Supply / printer / internal XA cord](index.html#material-cord)<br>Southwire 55808699 · 14/3 SJOOW<br>□ Buy / fabricate | **Conditional** | Use the same 14/3 SJOOW cord for all three runs. XA’s jacket enters its integral cord clamp; branch conductors terminate at JL/JN/PE before CT. Nominal OD approximately 9.17 mm is inside the 515CV 6.22–16.64 mm clamp range. Final route lengths are dry-fit allowances. [outlet](https://leviton.com/products/515cv), [outlet-drawing](https://leviton.com/content/dam/leviton/residential/product_documents/none/Document-31435-Dimensional%20Data.jpg), [outlet-install](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf), [cord](https://cabletechsupport.southwire.com/cablespec/download_spec/?country=US&spec=70126) | Selected length allowance; final ends trimmed only after dry routing. |
| [Supply plug](index.html#material-supply-plug)<br>Leviton 515PV · NEMA 5-15P<br>□ Buy / fabricate | **Catalog match** | 515PV is grounded NEMA 5-15P, 15 A / 125 V; 14 AWG and the 9.17–9.27 mm jacket fall within its listed acceptance ranges. [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Confirm the lab receptacle and complete the specified termination, torque, cord grip and polarity checks. This design remains 120 V only. |
| [Printer output connector](index.html#material-printer-connector)<br>Leviton 515CV · NEMA 5-15R<br>□ Buy / fabricate | **Conditional** | 515CV is grounded NEMA 5-15R and matches 515PV cable acceptance. It receives the printer’s original mains plug. [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Verify all three actual printer cords have the matching grounded US plug. No voltage-conversion adapters or simultaneous multi-printer outlet strip are assumed. |
| [Mains / printer strain relief](index.html#material-cord-glands)<br>Hammond 1427NCGPG13LB · long PG13.5 thread<br>□ Buy / fabricate | **Conditional** | Long-thread 1427NCGPG13LB has 15 mm thread, 6–12 mm clamp and Ø21 mm hole. This removes the earlier short-thread limitation. [gland](https://www.hammfg.com/electronics/small-case/accessories/1427ncg), [cord](https://cabletechsupport.southwire.com/cablespec/download_spec/?country=US&spec=70126) | Inspect locknut and seal seating on the ~4.775 mm drafted wall; pull-test each complete cord grip. |
| [USB data cable](index.html#material-usb)<br>DENT kit USB-A to USB-B cable · 1.8 m<br>✓ Kit included | **Catalog match** | Supplied with ELITEpro XC. Use temporarily for setup and batch downloads with the box mains unplugged and absence of mains voltage verified. Remove USB before closing and powering the enclosure. No USB wall opening, insert or permanent cable is required. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) | Locate the kit cable, check host USB compatibility and prove a sample export before the experiment. No permanent energized USB connection is provided. |
| [Internal L / N / PE wire](index.html#material-internal-wire)<br>Southwire 14 AWG, 19-strand Class C, THHN/THWN/MTW, 600 V<br>□ Buy / fabricate | **Conditional** | Separate 14 AWG conductors remain for Q0 OUT → JL and PE → panel. XA hot, neutral and PE are the conductors of its 14/3 cord; no separate white roll is required. Reuse suitable labeled lab stock first. [wire](https://www.southwire.com/wire-cable/building-wire/thhn-thwn-copper-silicone-free/p/22955984), [wago](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415), [ring](https://www.gardnerbender.com/en/p/15-104/-16-14-AWG-2-mm-sq-Bnes-%C3%A0-anneau) | Same 14 AWG stranded construction, sold by the foot; 4 ft of each color exceeds the 1 m cutting allowance. Confirm the received wire markings and crimp fit. |
| [Ring terminals](index.html#material-ring-lugs)<br>Gardner Bender 15-104 · #8–10 stud, 16–14 AWG<br>□ Buy / fabricate | **Conditional** | Exact Gardner Bender 15-104 manufacturer listing confirms UL/CSA Listed, 600 V, 75°C, 16–14 AWG and #8–10 stud compatibility. Overall published envelope 25.4 × 7.874 × 6.35 mm. Small-package source: 15 for $3.63. [ring](https://www.gardnerbender.com/en/p/15-104/-16-14-AWG-2-mm-sq-Bnes-%C3%A0-anneau), [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [wire](https://www.southwire.com/wire-cable/building-wire/thhn-thwn-copper-silicone-free/p/22955984) | Manufacturer: UL listed, CSA listed, 600 V building wire, 75°C. Use the specified insulated-terminal crimp tooling; inspect wire insertion, insulation fit and pull retention. No unpublished barrel diameter or crimp setting is assumed. |
| [Screw-fixed cable mounts](index.html#material-tie-mounts)<br>Panduit TM2S8-C<br>□ Buy / fabricate | **Conditional** | Six screw-fixed bases retain the mains bundle, XA branch conductors, CT pair, both sides of the voltage-lead coils, and the original internal DC cable. DigiKey lists individual pieces, avoiding the previous 100-piece purchase. [mount](https://www.panduit.com/content/dam/panduit/en/website/support/catalogs/pdf/iei-catalog-2023-web-cpcb294-sa-eng.pdf) | Six panel locations; M4 × 16 mm screws, underside washers and locknuts in the fastener schedule. |
| [Cable ties](index.html#material-cable-ties)<br>Panduit PLT2S-C · 188 × 4.8 mm<br>□ Buy / fabricate | **Conditional** | For small wire bundles and the screw-fixed bases. Keep allowed bend radii and avoid crushing insulation. This length is for cables, not a strap around the meter. [ties](https://www.panduit.com/content/dam/panduit/en/products/media/2/92/492/0492/30492.pdf), [mount](https://www.panduit.com/content/dam/panduit/en/website/support/catalogs/pdf/iei-catalog-2023-web-cpcb294-sa-eng.pdf) | DigiKey lists individual ties: ten cost $3.16 at the 10-piece tier. No 100-piece pack required. Check actual bundle retention and bend radii. |
| [Mounting and bonding hardware](index.html#material-fasteners)<br>Screw / nut / washer schedule in Build_Package.md<br>□ Buy / fabricate | **Conditional** | Q0, three WAGO carriers, six cable mounts and the dedicated aluminum-panel PE bond. XA no longer needs flange screws. Thread, length and actual stack checks are in the build package; aluminum bonding method must be accepted. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf), [outlet-install](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | No XA wall screws. Confirm stock, panel thickness and aluminum-compatible bonding hardware. |
| [Adjustable equipment straps](index.html#material-logger-restraint)<br>VELCRO ONE-WRAP 90340 · 19.05 mm (3/4 in) wide roll<br>□ Buy / fabricate | **Conditional** | Two straps retain the logger; one retains XA and one retains the adapter. Use eight smooth 21 × 4 mm slots, with each pair oriented to the illustrated strap. Fit, trim and verify retention without covering labels or overheating the adapter. No drilling into the equipment. [restraint](https://www.velcro.com/products/organization/heavy-duty-one-wrap-roll/), [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) | Four straps proposed; actual fit, plug retention and temperature remain physical checks. |

## Receiving and commissioning items

- CT commissioning: Mini HSC family is matched; 50 A is probable. Read the unobscured label during assembly and set that exact range/output in ELOG.
- Voltage-lead acceptance: the user confirms the original DENT kit pigtails; do not re-request OEM identity. Accept terminal preparation and upstream-only protection with responsible electrical personnel; original-kit status alone does not establish protection by the 15 A main breaker.
- Measure aluminum sheet size, thickness and stiffness; approve aluminum-compatible panel bonding and adjust machining/fasteners before fabrication.
- Verify internal XA/adapter seating, independent restraint, intact DC cable slack, separation and closed-enclosure temperature. Opaque lid prevents live viewing of logger LEDs; verify logging by offline export after the pilot.
- Commissioning: verify fastener stacks, CT latch and cable slack, supply conditions, PE/insulation/polarity, total load and restart/recording behavior before routine operation.

Record receiving checks, update any affected drawings if substitutions are needed, then conduct a documented dry fit and qualified electrical acceptance. There is no hardware test result or energizing approval in this audit.

## Reproduce the checks

Run `node tools/audit_installation.mjs` and `node --test tools/test_installation.mjs`. Run the browser checks after regenerating drawings; `EXPORT_AUDIT=1` refreshes the rendered cable measurements from the local model. Then run `node tools/render_documents.cjs`. Software passes describe only the tested geometry / website behavior.

[Review data and primary links](installation_review.json) · [Geometry check results](installation_checks.json) · [3D layout](index.html#layout)
