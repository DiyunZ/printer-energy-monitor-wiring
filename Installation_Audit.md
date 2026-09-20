# Installation audit

September 20, 2026 · upstream protection review. **ENGINEERING PACKAGE A — RECEIVING AND ELECTRICAL RELEASE ITEMS OPEN.**

All **25 material groups** were reviewed: 8 catalog match · 15 conditional · 2 measure · 0 hold. A catalog match confirms the stated interface only; it is not approval of the complete item or assembly.

One grounded 120 V supply, one printer at a time. Five equipment groups are confirmed on hand; the USB cable is kit supplied. Log independently during printing and download only with mains unplugged. The voltage tap uses upstream Q0 protection only. Its suitability for the original DENT leads, Q0 site/startup suitability, CT scaling and physical acceptance remain open; this is not an energizing release.

The box and major panel parts have nominal space, but the current design cannot be called a perfect or fully installable assembly. Machining geometry is supplied; Exact CT scaling, voltage-lead protection and physical/electrical acceptance remain open. One DC entry insert is specified; USB is temporary with mains unplugged. Do not treat a purchase link or an inventory tick as a release.

[Inspect the 3D installation stages](index.html#assembly-preview) · [Materials and buying links](materials.html) · [Machine-readable checks](installation_checks.json)

## Corrections from the audit

- Identified the existing CUI SMI6-9-V-P5 adapter from the original photo: 9 V, 0.667 A, center positive.
- User confirms three original DENT kit pigtails in different colors; LD-SKTSP is the matched family, with 10 in nominal length. The CT remains identified as Mini HSC, with the legacy 50 A variant probable but obscured digits not treated as confirmed.
- Replaced the outlet/metal box/support/cover assembly with directly mounted Leviton 5279-C. Removed seven obsolete material groups.
- Use one KVT 32 frame and one 41380 insert for the round Tensility DC extension. Reuse the kit USB cable temporarily with mains unplugged; no USB penetration or energized USB routing remains.
- Removed the dedicated voltage fuse, holder, DIN rail, end stops and JV transition. A1 now connects to JL after Q0. Upstream-only lead protection requires acceptance before energizing.
- Consolidated PE into one five-port connector after removing the rail bond. Three connectors/carriers, three installed ring lugs and one panel PE stud remain.
- Removed two rail mounting holes and the rail PE hole from the panel CAD. Eleven panel cut features and six carrier transfer-drill holes remain.

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

### 1. Machine and clean empty parts

Receive the exact parts and close release items in build.html. Machine the empty shell and panel from the PDF/STEP/DXF; transfer-drill carriers from actual parts. Deburr and remove all chips.

**Result:** Exact CAD cut/through gauges checked; no physical machining has occurred.

### 2. Install the backpanel first

Complete underside hardware on the removable panel, then lower it into the case. Keep the side outlet absent until the panel is secured with Hammond fasteners.

**Result:** Vertical insertion is tested digitally; side outlet must follow the panel.

### 3. Fit panel components

Fit three WAGO carriers, two meter straps, CT and six cable anchors. Place CT on printer hot only; set the arrow toward output.

**Result:** Nominal body separation and shell access checked. Verify the actual CT latch and retained cable slack.

### 4. Install wall fittings

Install Q0 directly in its front-wall pattern; install 5279-C, two long-thread glands and one DC split entry. Use the fastener/torque schedule.

**Result:** Machined shell openings modeled. Actual threads, wall draft, seal seating and plug retention need receiving checks.

### 5. Wire and retain

Unplug all sources. Bond the panel, printer and outlet; complete permanent wiring. A1 starts at switched hot JL; A2/A3 start at neutral JN. Path 16 is temporary offline USB. Keep the original adapter cord outside and pass only the round DC extension through its insert. Retain cable slack.

**Result:** Topology and the DC jacket-to-insert range checked. Upstream-only voltage-lead protection, terminations and CT scale remain acceptance items.

### 6. Inspect and close

Perform documented qualified polarity/PE/insulation/protection checks, verify lid closure with all four screws, then validate logging with a reference meter.

**Result:** No physical assembly, energizing or thermal qualification has been performed.

## Numerical checks

| Check | Result | Evidence and limit |
|---|---|---|
| Q0 catalog body | **PASS** | Model 19.18 × 63.5 × 47 mm; Carling p.11 body envelope 19.18 × 63.50 × 47.00 mm. Body includes the front step; studs, handle and terminal protection is supplied by the screw-fixed outer enclosure. |
| Q0 terminal and mounting pitches | **PASS** | Stud pitch 49.28 mm; mounting pitch 52.37 mm. Carling: 49.28 / 52.37 mm.  |
| Q0 ring size | **PASS** | Selected Q0 terminal code 1 is #10-32; its two ring lugs must have #10 holes. Crimp tool and pull test remain required.  |
| dc-entry envelope | **PASS** | Model 37 × 40 × 40 mm; KVT 32 overall envelope 37 mm axial × Ø40 mm flange. Conservative cylinder; the threaded shank is M32, not Ø40. |
| dc-entry cable / insert | **PASS** | dc-extension: round jacket 4.9–5.5 mm; KTMBS 41380 accepts 4–7 mm. Catalog interface check only. Original flat adapter cord is excluded; verify received jackets, connector passage, seals and strain relief. |
| Panel component body separation | **PASS** | 5 nominal body envelopes do not overlap. CT uses the matched Mini HSC family envelope; exact scale remains unconfirmed. No connectors, open levers, flexible wires, mounting tolerances or screw-tool envelopes are certified by this check. |
| Vertical insertion through open case | **PASS** | 6/6 swept bounding boxes clear the manufacturer shell. 300 mm vertical translation, fixed orientation, wall fittings absent. Panel/support contact at Y=0 is excluded with a 0.0001 mm numerical offset. This tests shell access, not brackets, wires or tool motions. |
| Panel before flanged outlet | **SEQUENCE REQUIRED** | The panel insertion sweep intersects the flanged-outlet envelope. Install the panel first; removal requires removing the outlet or a separately verified tilted path.  |
| Machined wall geometry | **PASS** | Project openings in shell 0 and panel 33; build123d 0.11.1, 0.3 mm tessellation; other meshes retained. Carrier fixing holes transfer-drilled, not in mesh. Exact cut-through gauges are in fabrication/cad-checks.json. Axis-aligned wall-device illustrations do not model the 0.937 degree draft; body/shell triangle contacts here are not mounting proofs. Received-part fit and fastening remain physical checks. |
| Closed lid screen | **SCREEN ONLY** | meter: 159.012 mm (9/9 rays); ct: 168.315 mm (9/9 rays); outlet: 33.747 mm (9/9 rays); q0: 32.992 mm (9/9 rays) Nine upward rays per body against lid mesh 15. Not a minimum-distance proof; excludes lid hardware, guards, wire bundles and tolerances. |
| No permanent USB wall opening | **PASS** | At the former USB center Y/Z = 55/167 mm, the shell has 2 wall-surface intersections; no USB fitting is installed. Mesh cross-section check at the former opening center. USB is temporary with mains unplugged and the lid open. |
| Cord diameter interfaces | **PASS** | Southwire published nominal OD 9.17–9.27 mm lies within Hammond 6–12 mm gland and Leviton 0.245–0.655 in cord ranges. Published variants are not a manufacturing tolerance. Measure purchased cord; clamping, jacket preparation and pull resistance remain physical checks. |
| Ring barrel and internal wire | **PASS** | Southwire nominal 2.87 mm insulation OD < 3M 4.318 mm ring maximum; 14 AWG is within 16–14 AWG ring range. Does not qualify the crimp or approve the wiring method for this assembly. |
| Physical and electrical release | **HOLD** | No built assembly, nameplate verification, qualified acceptance or energized test has been recorded.  |

Only one DC KVT frame remains; the former two-frame spacing check no longer applies. Exact CAD booleans now provide the specified openings. Axis-aligned wall-device illustrations still do not model wall draft and cannot prove the mounted interface.

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
| [AC/DC adapter](index.html#material-adapter)<br>CUI SMI6-9-V-P5 · existing original adapter<br>✓ Owned | **Catalog match** | Original label identifies CUI SMI6-9-V-P5: 9 V DC, 0.667 A, center positive; compatible with the meter’s 6–10 V / 500 mA input. Official SMI6 drawing: 64 × 40.5 × 30 mm ±1 mm, excluding blades; P5 plug 5.5/2.1 × 9.5 mm. Keep its flat UL2468 cord outside the enclosure and mate it to the specified round DC extension. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), [cui](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf) | Check condition, blade and barrel seating, 9 V polarity and external cord restraint; no replacement adapter is required. |
| [Enclosure](index.html#material-enclosure)<br>Hammond PCJ16148CC<br>□ Buy / fabricate | **Conditional** | Factory STEP has now been Boolean-cut with the coordinated wall openings; four screw-fixed cover fasteners isolate normal use from terminals. [case](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf) | Compare received parts with drawings; obtain qualified approval of the modified dry-indoor assembly. |
| [Mounting panel](index.html#material-panel)<br>Hammond 14R1513<br>□ Buy / fabricate | **Conditional** | Factory panel plus 11 cut features: six tie-anchor holes, one PE bond and four strap slots; three carrier locator envelopes. [panel](https://www.hammfg.com/electrical/products/accessories/pcjp), [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf) | Transfer-drill six carrier holes; inspect underside hardware clearance before mounting the panel. |
| [Q0 operating breaker](index.html#material-breaker)<br>Carling CA1-B0-24-615-121-DG<br>□ Buy / fabricate | **Conditional** | 19.18 × 63.5 × 47 mm body; #10 studs; #6-32 mount. Direct wall rectangle and 52.37 mm fixing pitch supplied. Manufacturer UL489 table: 10 kA at 120 V AC. Delay 24: 12 × rated current for a 60 Hz half-cycle pulse (180 A, 8.33 ms at 15 A), under the stated test conditions. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [carling-delay](https://www.carlingtech.com/sites/default/files/documents/Carling-HM-CB-Time-Delays.pdf), [jis](https://mechse.illinois.edu/undergraduate/makerworks) | Manufacturer table confirms 10 kA interruption at 120 V AC for the selected UL489 configuration; delay 24 has specified half-cycle inrush tolerance. Actual JIS outlet fault current and combined startup waveform are not published. Exact-SKU stock/lead time still needs a supplier quote. Check washer stack, body shoulder and terminal spacing on receipt. |
| [XA adapter receptacle](index.html#material-receptacle)<br>Leviton 5279-C · NEMA 5-15R flanged outlet<br>□ Buy / fabricate | **Conditional** | 5279-C replaces the metal-box assembly. Ø44.00±0.15 bore falls inside Leviton 43.66–44.45 range; fixing pitch 53.57 mm. [outlet](https://leviton.com/products/5279-c), [outlet-drawing](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/dimensional_drawing/CATSTD-05279-00C-M01.pdf), [outlet-install](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/instruction_sheet/PK-93763-10-02-0C-W.pdf) | Verify rear terminal clearance and screw/washer stack. Use the specified conductor torque and keep XA ground connected. |
| [Distribution connectors](index.html#material-connectors)<br>WAGO 221-415<br>□ Buy / fabricate | **Conditional** | One five-port connector each for JL, JN and PE. JL accepts Q0 output, printer hot, A1 and adapter hot; JN accepts supply, printer, A2, A3 and adapter neutrals; PE accepts supply, printer, panel and outlet earth. One accepted conductor per port. Confirm original DENT pigtail preparation and protective-bonding suitability. [wago](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415) | Verify allowed conductor preparation, one wire per port and protective-bonding use. |
| [Connector carriers](index.html#material-carriers)<br>WAGO 221-505<br>□ Buy / fabricate | **Conditional** | Three 221-505 carriers, each with two M3 fasteners. [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf) | Transfer-drill actual fixing holes and verify underside fastener clearance. |
| [Mains / printer cord](index.html#material-cord)<br>Southwire 55808699 · 14/3 SJOOW<br>□ Buy / fabricate | **Conditional** | 14/3 SJOOW catalog OD 9.17–9.27 mm fits the proposed entry and plug clamp ranges. Jacket is 300 V rated. [cord](https://cabletechsupport.southwire.com/cablespec/download_spec/?country=US&spec=70126) | Confirm exact delivered OD and ampacity / temperature / routing conditions, total length and voltage drop. Keep the outer jacket under each cord clamp. |
| [Supply plug](index.html#material-supply-plug)<br>Leviton 515PV · NEMA 5-15P<br>□ Buy / fabricate | **Catalog match** | 515PV is grounded NEMA 5-15P, 15 A / 125 V; 14 AWG and the 9.17–9.27 mm jacket fall within its listed acceptance ranges. [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Confirm the lab receptacle and complete the specified termination, torque, cord grip and polarity checks. This design remains 120 V only. |
| [Printer output connector](index.html#material-printer-connector)<br>Leviton 515CV · NEMA 5-15R<br>□ Buy / fabricate | **Conditional** | 515CV is grounded NEMA 5-15R and matches 515PV cable acceptance. It receives the printer’s original mains plug. [plug](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Verify all three actual printer cords have the matching grounded US plug. No voltage-conversion adapters or simultaneous multi-printer outlet strip are assumed. |
| [Mains / printer strain relief](index.html#material-cord-glands)<br>Hammond 1427NCGPG13LB · long PG13.5 thread<br>□ Buy / fabricate | **Conditional** | Long-thread 1427NCGPG13LB has 15 mm thread, 6–12 mm clamp and Ø21 mm hole. This removes the earlier short-thread limitation. [gland](https://www.hammfg.com/electronics/small-case/accessories/1427ncg), [cord](https://cabletechsupport.southwire.com/cablespec/download_spec/?country=US&spec=70126) | Inspect locknut and seal seating on the ~4.775 mm drafted wall; pull-test each complete cord grip. |
| [DC split cable entry](index.html#material-split-entries)<br>icotek KVT 32 black · 45026<br>□ Buy / fabricate | **Conditional** | One KVT 32 frame for the round factory-terminated Tensility DC extension. Takes one separately ordered KTMBS 4–7 gray insert, 41380. M32 × 1.5, 14 mm thread; Ø32.3 wall opening. Retain the included sealing ring and locknut. [kvt](https://pim.icotek.com/Produkte/PG02%20Kabelverschraubungen/KVT/KVT%2032/Datenbl%C3%A4tter/45026_KVT%2032_bk.PDF), [kt](https://www.icotek.com/Produkte/PDFs/en_US/KTMBS%20gy.pdf) | Dry-fit plugs through empty opening and locknut; check full thread engagement and the seal against the drafted wall. |
| [USB data cable](index.html#material-usb)<br>DENT kit USB-A to USB-B cable · 1.8 m<br>✓ Kit included | **Catalog match** | Supplied with ELITEpro XC. Use temporarily for setup and batch downloads with the box mains unplugged and absence of mains voltage verified. Remove USB before closing and powering the enclosure. No USB wall opening, insert or permanent cable is required. [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) | Locate the kit cable, check host USB compatibility and prove a sample export before the experiment. No permanent energized USB connection is provided. |
| [Round DC extension cable](index.html#material-dc-extension)<br>Tensility 10-02228 · 5.5/2.1 mm plug to jack<br>□ Buy / fabricate | **Catalog match** | Factory round cable, 18 AWG, OD 5.2 ±0.3 mm, 7 A / 48 V; preserves center-to-center polarity. Adapter plugs into the female end outside; route the round cable through 41380/KVT 32 and plug the male end into the logger. Reserve 0.35 m inside and 0.565 m outside, adjusted at dry fit; retain slack with bends ≥35 mm radius (published minimum 31.2 mm). No cut or splice. Male barrel is 12 mm long; do not force its shoulder flush into the logger. [dc-extension](https://www.tensility.com/products/10-02228), [dc-extension-drawing](https://tensility.s3.us-west-2.amazonaws.com/imports/product_spec_sheets/10-02228.pdf), [cui](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf), [dent](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), [kt](https://www.icotek.com/Produkte/PDFs/en_US/KTMBS%20gy.pdf) | Inspect factory continuity/polarity and contact engagement, secure the external joint without tension and retain both slack loops. Full flexible routing is not certified by the body model. |
| [DC sealing insert](index.html#material-kt-inserts)<br>icotek KTMBS 4–7 gray · 41380<br>□ Buy / fabricate | **Catalog match** | Split 21 × 21 × 19 mm insert for KVT, rated for round cables 4–7 mm. Accepts Tensility DC OD 5.2 ±0.3 mm. Select KTMBS (split), not unsplit KTMB. The original CUI flat cord stays outside. [kt](https://www.icotek.com/Produkte/PDFs/en_US/KTMBS%20gy.pdf), [dc-extension](https://www.tensility.com/products/10-02228) | Check the received round DC jacket and KVT nut/seal seating; assembly IP rating is not claimed. |
| [Internal L / N / PE wire](index.html#material-internal-wire)<br>Southwire 14 AWG, 19-strand Class C, THHN/THWN/MTW, 600 V<br>□ Buy / fabricate | **Conditional** | Selected Southwire 14 AWG 19-strand Class C THHN/THWN/MTW, nominal OD 2.87 mm. Matches connector and ring-terminal ranges. [wire](https://www.southwire.com/wire-cable/building-wire/thhn-thwn-copper-silicone-free/p/22955984), [wago](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415), [ring](https://multimedia.3m.com/mws/media/61020O/ring-tongues-vinyl-insulated-brazed-seam-16-14-awg.pdf) | Qualified assembler verifies wiring method, ampacity, routing, bends and strip/torque; no AWM-only assumption. |
| [Ring terminals](index.html#material-ring-lugs)<br>3M MV14-10R/LX-BOTTLE · #10 stud, 16–14 AWG<br>□ Buy / fabricate | **Catalog match** | Corrected Q0 selection to MV14-10R (#10 hole, 16–14 AWG). Wire OD 2.87 mm is below the ring’s 4.318 mm maximum insulation OD. [ring](https://multimedia.3m.com/mws/media/61020O/ring-tongues-vinyl-insulated-brazed-seam-16-14-awg.pdf), [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [wire](https://www.southwire.com/wire-cable/building-wire/thhn-thwn-copper-silicone-free/p/22955984) | Use the specified crimp tool and inspection / pull procedure. Select other PE lugs by their own stud; do not use #10 rings indiscriminately. |
| [Screw-fixed cable mounts](index.html#material-tie-mounts)<br>Panduit TM2S8-C<br>□ Buy / fabricate | **Catalog match** | Six screw-fixed bases retain the mains bundle, outlet supply, CT pair, two sides of the voltage-lead coils, and DC extension. The linked package contains 100; only six are installed. [mount](https://www.panduit.com/content/dam/panduit/en/website/support/catalogs/pdf/iei-catalog-2023-web-cpcb294-sa-eng.pdf) | Verify received saddle/slot dimensions and dry-fit each bundle before fastening. Six mounting screws use underside washers and locknuts. |
| [Cable ties](index.html#material-cable-ties)<br>Panduit PLT2S-C · 188 × 4.8 mm<br>□ Buy / fabricate | **Catalog match** | For small wire bundles and the screw-fixed bases. Keep allowed bend radii and avoid crushing insulation. This length is for cables, not a strap around the meter. [ties](https://www.panduit.com/content/dam/panduit/en/products/media/2/92/492/0492/30492.pdf), [mount](https://www.panduit.com/content/dam/panduit/en/website/support/catalogs/pdf/iei-catalog-2023-web-cpcb294-sa-eng.pdf) | Six ties installed, six spares allowed. Confirm actual lead length, diameter, bend radius and retention; modeled band thickness/lock are illustrative. |
| [Mounting and bonding hardware](index.html#material-fasteners)<br>Screw / nut / washer schedule in Build_Package.md<br>□ Buy / fabricate | **Conditional** | Five assembly groups specify purchase links and counts. Three carriers use six M3 fixings; six anchors use M4 × 16 mm fixings. One dedicated panel PE bolt has its head beneath the panel. [carling](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [carrier](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf), [outlet-install](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/instruction_sheet/PK-93763-10-02-0C-W.pdf) | Measure actual washers/carrier feet/anchor recesses before tightening; qualified PE bond inspection remains required. |
| [Adjustable logger straps](index.html#material-logger-restraint)<br>VELCRO ONE-WRAP 90340 · 19.05 mm (3/4 in) wide roll<br>□ Buy / fabricate | **Conditional** | Selected 19.05 mm wide roll fits the 21 × 4 mm rounded slot design; slot pairs are 82 mm apart. Adjustable restraint reserves the larger meter envelope. [restraint](https://www.velcro.com/products/organization/heavy-duty-one-wrap-roll/), [dent-size](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) | Dry-fit strap overlap, slot edge smoothness and instrument retention. |

## Receiving and commissioning items

- CT commissioning: Mini HSC family is matched; 50 A is probable. Read the unobscured label during assembly and set that exact range/output in ELOG.
- Voltage-lead acceptance: the user confirms the original DENT kit pigtails; do not re-request OEM identity. Accept terminal preparation and upstream-only protection with responsible electrical personnel; original-kit status alone does not establish protection by the 15 A main breaker.
- Use one KVT 32 frame and one 41380 insert for the round Tensility DC extension. Reuse the kit USB cable temporarily with mains unplugged; no USB penetration or energized USB routing remains.
- Commissioning: verify fastener stacks, CT latch and cable slack, supply conditions, PE/insulation/polarity, total load and restart/recording behavior before routine operation.

Record receiving checks, update any affected drawings if substitutions are needed, then conduct a documented dry fit and qualified electrical acceptance. There is no hardware test result or energizing approval in this audit.

## Reproduce the checks

Run `node tools/audit_installation.mjs` and `node --test tools/test_installation.mjs`. Run the browser checks after regenerating drawings; `EXPORT_AUDIT=1` refreshes the rendered cable measurements from the local model. Then run `node tools/render_documents.cjs`. Software passes describe only the tested geometry / website behavior.

[Review data and primary links](installation_review.json) · [Geometry check results](installation_checks.json) · [3D layout](index.html#layout)
