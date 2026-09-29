# Machining and assembly guide

September 28, 2026 · one grounded 120 V supply · one printer at a time.

**Engineering review package. Complete-order, machining and energizing release remain open.** The design uses internal adapter power and proposed aluminum reuse. [Cost, sourcing and certification review](revision.html). The drawings do not represent a physically assembled or certified product.

[Materials with pictures and purchase links](materials.html) · [3D installation sequence](index.html#assembly-preview) · [Installation audit](installation.html) · [Protection review](protection.html)

## Downloads

| File | Use |
|---|---|
| [Six-page machining drawing](fabrication/Machining_Drawings.pdf) | Hole coordinates, viewing directions, dimensions and tolerances. Print for reference, not as a scale template. |
| [Machined case STEP](fabrication/case-machined.step) · [Machined panel STEP](fabrication/panel-machined.step) | Exact solid geometry for shop review and fixturing. Use the BUD common-base template and proposed aluminum plate; actual stock and opaque lid remain to be checked. Do not print a substitute mains enclosure. |
| [Front DXF](fabrication/front.dxf) · [Right DXF](fabrication/right.dxf) · [Left DXF](fabrication/left.dxf) · [Rear DXF](fabrication/rear.dxf) · [Panel DXF](fabrication/panel.dxf) | Millimetres, 1:1. The chamfered outline and internal features are on `CUT`; verify stock and the support pattern before using them. `REFERENCE` and `TEXT` are non-cutting. The right-wall file contains one Ø22.2 mm USB cable-exit bore; no USB fixing holes. |
| [Q0 bracket STEP](fabrication/q0_mount.step) · [Provisional flat DXF](fabrication/q0-mount-flat.dxf) | Four-bend aluminum bracket; requires measured stock and a bend coupon before shop release. |
| [Cut and clearance results](fabrication/cad-checks.json) · [Wall opening coordinates](fabrication/wall-openings.json) | Reproducible digital checks and shared datums. |
| [Wiring drawing](wiring_routes.svg) · [Connector detail](connector_detail.svg) · [Connection schedule](routes.json) | Electrical topology. These drawings are not machining templates. |

## Photo identification and remaining checks

The existing photos were compared with manufacturer product pictures, original datasheets and a legacy CT product photo. No concealed label characters were reconstructed.

| Item | Identification and design decision | Evidence / remaining check |
|---|---|---|
| Black adapter | **CUI SMI6-9-V-P5**, 9 V DC, 0.667 A, center positive. Retain it. Body 64 × 40.5 × 30 mm ±1 mm; 5.5/2.1 mm P5 plug. | Label readable in the original photo; [official CUI SMI6 datasheet](https://www.belfuse.com/media/datasheets/products/power-supplies/SMI6.pdf). Check condition, output and seating at assembly. |
| White CT | **DENT Mini HSC** family; **CTHSC-050-U/B, 50 A / 333.3 mV is probable** from the partial “DENT 50…” label and legacy appearance. | [DENT family specifications](https://www.dentinstruments.com/shop/current-sensors/hinged-current-transformers-sensors-for-energy-metering/), [legacy label comparison](http://siscoinc.net/cthsc-050-ubdentcurrenttransformer.aspx). 20 A and 50 A versions share the body. Wires conceal the full variant: read the label during assembly before setting ELOG. No duplicate CT is in the purchase list. |
| Three OEM voltage pigtails | User confirms three original DENT kit pigtails in different colors. Matched family: **DENT LD-SKTSP**, **10 in / 254 mm nominal**, female safety connector to factory-tinned end. A1 = hot/L1; A2 = neutral/L2; A3 = neutral/N. | [DENT original accessory](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/). Photo connector, tinned end and ESIS card agree. Online data does not publish AWG/ampacity. Qualified acceptance of termination and upstream Q0 protection remains necessary. |
| Internal DC | Original CUI adapter and intact flat cord connect directly to the logger inside. | No extension, external coupling, KVT frame or insert. Check original plug seating, restraint, slack and closed-enclosure temperature. |
| Existing USB cable | One intact owned A-to-B cable: B stays in DENT, cable passes through Heyco 3104, free A end connects to the PC. Sleeve the internal portion. | [DENT manual](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), printed pp. 16, 18, 29: USB power and insulation requirements. Export with mains unplugged and the lid closed. |
| Q0 / supply | Phoenix TMC 81C 15A / 2907571, 15 A, single pole, C curve; UL489 / cUL Listed E320373, 277 V AC, 10 kA. | Actual JIS receptacle fault current and combined startup waveform remain unknown. [Detailed protection review](protection.html). |

**Voltage-lead protection:** A1 now connects directly to JL after Q0; no dedicated voltage-tap fuse is installed. Suitability of the upstream 15 A Q0 for the original DENT lead set remains unverified. Accept that protection scheme before energizing. The meter's internal fuse cannot clear an external lead short that bypasses the meter. See the [protection review](protection.html).

These checks use the photos already supplied. The hidden CT characters and unpublished conductor ratings remain explicit limits, rather than requests for more images.

## Internal power and offline USB

XA is now **Leviton 515CV**, the same SKU as the printer output. Buy **two total**. Its complete molded body encloses its terminals; its integral cord clamp retains a continuous **14/3 SJOOW** branch from JL/JN/PE, upstream of CT. One adjustable strap supports XA, another independently retains the original adapter. Fully seat the adapter and verify the restraints prevent loosening without loading the blades. Do not modify either factory DC connector.

The original adapter cable stays entirely inside and plugs directly into the logger. Dress its slack using the reserved DC tie location; do not crush the flat jacket. Cable curves are illustrative: actual length, bend allowance, mains separation and lid clearance need dry fitting. No XA or DC wall opening remains. One protected USB cable exit remains on the right wall.

USB configuration/download uses the free USB-A end with mains unplugged and verified absent. The lid stays closed. Disconnect from the PC before reconnecting mains; the complete cable stays attached to the box, with its internal portion sleeved. Validate saved records with an offline download after a supervised pilot; the opaque cover hides the logger LEDs. Check adapter/enclosure temperature in that pilot.

### Closed-lid USB construction

Reuse the **one existing USB-A to USB-B cable intact**. USB-B stays in DENT; the same cable exits through a **Heyco 3104 (SBT 875-11)** snap bushing and ends in USB-A for the PC. No coupler, short internal data cable or USB mounting screws are required. The existing front/right cable support restrains the sleeved cable beside the DC lead. The bushing only protects the edge: accept the restraint only if external pull cannot move the sleeve or load the DENT socket. The 3D exterior length is abbreviated; retain the full cable and check usable reach.

**Published sizing:** [USB 2.0](https://www.usb.org/document-library/usb-20-specification), Figure 6-10, limits a standard-B overmold to **11.5 × 10.5 mm** (diagonal **15.57 mm**); Table 6-5 gives nominal cable ODs **4.06–5.21 mm**. The [Heyco drawing](https://www.heyco.com/products/bushings-grommets-heycaps-plugs/tubing-caps-and-plugs/heyco-thick-panel-snap-bushings/) gives a **17.5 mm passage**, leaving **1.93 mm nominal diametral margin** for the unsleeved standard plug. The mounting hole is **22.2 mm**, and the 6.4 mm maximum wall thickness covers the modeled 3 mm wall. These are published design dimensions, not measurements of the owned cable. DENT's kit datasheet lists 1.8 m; its [current replacement](https://www.dentinstruments.com/shop/powerscout-accessories/replacement-usb-a-to-b-communications-cable/) lists 2 m, so retain the actual cable rather than cutting to either nominal length.

Dry-fit the intact USB-B end through the **loose bushing before adding the sleeve**. Apply accepted insulation while the cable is disconnected from the logger and PC. Pass the protected end through the empty wall hole, then snap the bushing into the wall; confirm full seating and pull restraint. Do not force a plug or cut/splice the USB cable to make it fit.

Retain **black Alpha Wire F2213/4 BK105**, specified to **UL224 / CSA198, 600 V** ([manufacturer](https://www.alphawire.com/products/accessories/fit-heat-shrink-tubing/shrink-tubing/fit2213_4)). One 4 ft stick covers the internal run, the DENT termination and the wall crossing. Supplied minimum ID is 19.05 mm; recovered maximum ID is 9.53 mm. Accept complete coverage and retention against sliding. Alpha lists 90°C minimum shrink and 121°C full recovery; the original cable's permitted application process is unpublished. Have the assembler approve that process for the actual cable and protect the connectors. The illustrated end coverage is not a separately qualified boot.

The bushing and sleeve provide no USB galvanic isolation or claimed IP/NEMA seal. Review shell/shield treatment with the electrical assembler; do not add an undocumented PE-to-USB connection. Use the accepted assembly indoors in its dry environment. Connect to the PC only after unplugging mains.

<h2 id="panel-stock">Selected construction and aluminum stock</h2>

Select **BUD NBF-32126**, 400 × 300 × 160 mm, with an opaque hinged cover and two latches. The [manufacturer product page](https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/) links the shared NBF-32226 STEP; its base is used at full scale. The opaque-lid silhouette is illustrative. Verify the received cover, gasket, latches and access protection before use; the latch cover is not a tool-fastened or locked cover.

Fabricate the professor's offered aluminum as a **260 × 340 mm panel with four 10 mm corner chamfers**. The provisional **1.89738 mm (approximately 1.90 mm) thickness** is not a stock measurement. Record alloy, thickness, flatness and stiffness; update the CAD and every screw stack before fabrication. The [BUD drawing](https://www.budind.com/wp-content/uploads/2019/01/hbnbf32226.pdf) gives four M5 inserts at **229.8 × 325.3 mm**; the linked STEP centers span 229.75 × 325.25 mm, within its ±1 mm tolerance. One Ø6 mm locating hole and three 8 × 6 mm slots are in the template. Verify/transfer the actual pattern before cutting. **Four M5 × 10 mm machine screws are not included with the box and are budgeted separately.** Do not substitute its supplied wall-bracket self-tapping screws.

Provide a dedicated PE bond with a reviewed method and hardware suitable for the actual aluminum. Do not assume the former steel-panel bonding stack is qualified for aluminum, or rely on ordinary mounting screws for electrical continuity. The existing #10 hardware is a dimensional proposal pending that review.

Q0 uses the new metal DIN support behind the front wall, with its operator accessible outside. Three WAGO **221-415 / 221-505** connector/carrier pairs provide JL, JN and PE. A1 feeds from JL; A2/A3 from JN. PE joins supply earth, printer earth, internal XA earth, panel bond and Q0 rail/bracket bond. One accepted conductor per port.

The logger retains two **19.05 mm ONE-WRAP** straps, with a **216 × 69 × 58 mm** receiving envelope. Add two straps for XA and adapter. Eight **21 × 4 mm** smooth panel slots support all four straps. Fit and trim the flexible straps; do not drill equipment housings or cover required adapter markings/heat-dissipation surfaces.

<h2 id="q0-mount">Q0 metal support and protective bond</h2>

The **Phoenix 2907571** catalog envelope is **17.6 × 116 × 75.9 mm including the 7.5 mm DIN rail**. The [manufacturer STEP reference](fabrication/phoenix-2907571-reference.step) includes its 73.8788 mm body/handle depth. The 18.6 × 46 mm window clears the 17.6 × 45 mm nose nominally. The protruding terminal guards remain **1.5 mm behind the inner wall**, with the nose face about 1.1 mm beyond the outer wall in the local wall frame. Do not use the old NOARK or Carling mounting depth. Check the received part, full handle travel and access protection before cutting.

The top and bottom wire entries are retained in the factory model. Each uses one **14 AWG Cu** conductor, **11–12 mm strip length** and **2 N·m terminal torque**. The model provides a straight 24 mm entry approach before the routing bends; it does not certify bend radius or tool access. No power ring terminals are used. [Manufacturer terminal and rating data](https://www.phoenixcontact.com/en-us/products/thermomagnetic-device-circuit-breakers-tmc-81c-15a-2907571).

The parametric bracket is **88 × 40 × 66.30 mm** at the provisional 1.89738 mm stock thickness: 60 mm between the arms, 64.40 mm inner web depth, four R2 bends. Wall fixing centers are 76 mm apart; rail fixing centers are 48 mm apart. Cut **60 mm** from the purchased **250 mm 35 × 7.5 mm rail**, deburr and transfer-drill the mounting holes. Rail center is 0.4 mm above the operator-window center in the local wall frame, derived from the STEP retaining lips. Two 8 mm CA802 end stops flank the breaker. Their fasteners must not obstruct the breaker latch. The nominal 0.8 mm spacer at the ordinary M4 rail fixing must match the accepted bonding-contact stack at the other end.

Use two M3 × 12 wall screws/nuts from the already purchased eight-piece totals and four additional washers. Use one spare M4 × 10 screw/nut and three washers from the anchor purchase packs for one rail fixing. Use the second already purchased #10 × 3/4 in stud with two nuts, two flat washers and three external-tooth washers for the dedicated rail/bracket bond; keep the original panel bond separate. These are two complete bond stacks, not one shared stud. Add **connection 24, PE.5 → rail/bracket**, with 350 mm green 14 AWG starting blank. No extra WAGO connector or green-wire roll is needed.

Have the electrical reviewer approve a contact method that bonds **both steel rail and aluminum support**, including surface preparation and material compatibility; ordinary mounting screws are not the PE path. The displayed stud stack is a proposal and may require a listed aluminum-compatible lug/contact change. No electrical continuity or mechanical load test has been performed.

The manufacturer STEP has no solid overlap with the machined shell, closed lid, panel, bracket or nominal rail. Its minimum modeled gap to the closed factory lid is **2.30 mm** and to the window edge is **0.50 mm**; these are nominal CAD results, not tolerance allowances. Accept the received part and the full ON/OFF/TRIP handle travel before fabrication.

The flat pattern assumes **K = 0.4** only to produce a reviewable starting blank. Make a bend coupon in the measured offered stock, correct for tooling and springback, then form to the STEP dimensions. Check bracket deflection while operating the breaker and locknut retention. Record fabrication cost separately; offered stock does not imply free shop labor.

## Machining datums

The 3D and wiring plan share X/Z locations. X is across the panel; Y is upward from the **panel underside**; Z is forward toward Q0. Negative Z is the printer exit. The real case walls have approximately **1° draft**. The wall DXFs are local flat-face setups, not projections to a vertical plane.

For outside views: front U = X; rear U = −X; right U = −Z; left U = Z. V runs up along the wall. Its origin is the intersection of that face with Y = 0 and the case centerline. Use the STEP model and the physical panel support datum to fixture the case; the bottom outside edge is **not** Y = 0. Panel drawing: view from the lid, U = X, V = −Z, origin at the blank center.

| Feature | Cut geometry | Datum in assembly coordinates |
|---|---|---|
| Q0 operator / bracket | 18.60 × 46.00 mm rectangle; two Ø3.30 mm holes at 76 mm horizontal pitch | Front wall; X = −93, Y = 75 mm; local drafted-wall frame |
| Supply gland | Ø21.00 mm | Left wall; Y = 43, Z = 128 mm |
| Printer gland | Ø21.00 mm | Rear wall; X = 0, Y = 36 mm |
| USB cable exit | One Ø22.20 mm mounting hole; no fixing holes | Right wall; Y/Z = 55/167 mm. [Heyco 3104 dimensions](https://www.heyco.com/products/bushings-grommets-heycaps-plugs/tubing-caps-and-plugs/heyco-thick-panel-snap-bushings/): 17.5 mm passage, 24.2 mm head, 14.3 mm overall height; wall up to 6.4 mm. Dry-fit before machining. |
| Panel bond | Ø5.30 mm, dedicated to PE | X/Z = −110/60 mm |
| Meter straps | Four 21 × 4 mm slots, long axis Z | X = 40 and 122; Z = −70 and 50 mm |
| Internal-power straps | Four 21 × 4 mm slots, long axis X | X/Z = −56/−65, −56/−15, −4.85/−77, −4.85/−3 mm |
| Cable mounts | Six Ø4.50 mm holes | Individual coordinates in the panel drawing |
| Three WAGO carriers | Two Ø3.30 mm fixing holes per carrier | Place within the dashed locator envelope, orient the carrier as shown, then transfer-drill from the actual part. The unlocated longitudinal fixing datum is not invented. |

The six anchor positions support the mains bundle, outlet supply, CT pair, two sides of the voltage-lead coils and the original internal DC cable together with the sleeved USB lead. Each tie passes through its mounting-base slot and encloses that bundle. The same coordinates drive the panel CAD and 3D view.

Retain the verified enclosure support pattern and original lid features. The panel template has 19 internal cut features: six cable-anchor holes, one panel PE hole, eight strap slots and four panel mounting features. Transfer-drill six additional holes for the three carriers. Deburr every cut, remove chips and protect the gasket. Smooth strap slots on both faces without enlarging their functional opening. Machining does not confer an IP/NEMA certification on the completed assembly.

<h2 id="fasteners">Fasteners and purchase quantities</h2>

Buy all required hardware from **DigiKey and Home Depot**. Counts below distinguish **installed pieces** from the actual **purchase packs**, including unused pieces. No lab fastener stock is assumed. The complete hardware purchase is **$26.63**, before freight and tax. Metric and US threads are deliberately distinguished.

| Assembly | Installed hardware | Exact purchase links |
|---|---|---|
| Q0 wall bracket | 2 × M3 × 12 screws; 4 × M3 washers; 2 × M3 locknuts | Use the two spare screws/nuts in the carrier packs below. Buy four additional 4692 washers: ten total including carriers. |
| Three WAGO carriers | 6 × M3-0.5 × 12 mm pan screws; 6 × M3 washers; 6 × M3-0.5 locknuts | Home Depot: 2 four-piece packs of [837761 zinc pan screws](https://www.homedepot.com/p/321071719), 2 four-piece packs of [837221 stainless locknuts](https://www.homedepot.com/p/321071866). DigiKey: 10 total (6 here + 4 Q0) [Keystone 4692 M3 / #4 zinc-plated steel washers](https://www.digikey.com/en/products/detail/keystone-electronics/4692/316261). |
| Six tie anchors | 6 × M4-0.7 × 10 mm pan screws; 6 × M4 washers; 6 × M4-0.7 locknuts | Home Depot: 2 four-piece packs of [836351 zinc pan screws](https://www.homedepot.com/p/321071623), 2 four-piece packs of [837171 stainless locknuts](https://www.homedepot.com/p/321071795), 1 fifty-piece pack of [Hillman 4118 M4 stainless flat washers](https://www.homedepot.com/p/204801237). Six screws/nuts here; one spare screw/nut plus three spare washers serve the rail fixing. Eight screw/nut pieces and fifty washers cover the total. |
| Panel to case | 4 × M5-0.8 × 10 mm pan screws | Home Depot: 2 two-piece packs of [863468 stainless pan screws](https://www.homedepot.com/p/323370995). Fit directly through the panel into the factory M5 inserts; check head coverage and engagement. |
| Two PE studs: panel and rail/bracket | 2 × #10-32 × 3/4 in screws; 4 plain nuts; 5 external-tooth washers; 4 flat washers; 2 ring lugs total | DigiKey: 2 [Keystone 9911 stainless pan screws](https://www.digikey.com/en/products/detail/keystone-electronics/9911/317331), 4 [4705 zinc-plated steel nuts](https://www.digikey.com/en/products/detail/keystone-electronics/4705/316276), 4 [4703 zinc-plated steel flat washers](https://www.digikey.com/en/products/detail/keystone-electronics/4703/316274). Home Depot: 1 eighteen-piece pack of [827311 zinc-plated external-tooth washers](https://www.homedepot.com/p/317479556). Rings come from the 15-104 pack in the main BOM. |

Check separately purchased panel screws against actual stock. Keep both latches and gasket intact. Q0 has box lugs: use bare prepared copper, one wire per selected terminal; rings are used only at the two dedicated #10 bond studs.

Each anchor uses an M4 × 10 mm pan screw with its head directly on the base, then an underside washer and locknut. The illustrated stack leaves about 3.4 mm to the case floor. Confirm actual base thickness, nut engagement and floor clearance on receipt; small molded details are illustrative.

**Stack checks:** each M3 wall stack is nominally 3.0 mm wall + 1.897 mm bracket + two approximately 0.8 mm washers + approximately 4 mm locknut = 10.50 mm, leaving about 1.50 mm of a 12 mm screw. The 10 mm rail screw crosses 1 mm rail + 0.8 mm spacer + 1.897 mm bracket + 0.8 mm washer + approximately 4 mm locknut, leaving about 1.50 mm. Measure actual washers/nuts and verify complete locking engagement without deforming the plastic wall. These stack estimates do not prove wall or bracket strength. XA has no wall screws; the USB bushing snaps in.

Fit carrier/anchor fasteners while the panel is out. There is about **9.50 mm** between the panel underside and the inner case floor in the source CAD. Check actual screw projections and washers against this space and the molded supports. For the six revised M4 × 10 mm anchor screws, verify full locking-nut engagement and at least 3 mm clearance to the actual case floor before installing the panel.

For the proposed panel PE stud, first approve the hardware/contact method for the actual aluminum. The geometric arrangement puts the screw head and flat washer underneath. On the conductive side, use an external-tooth washer and first nut to secure the dedicated stud, then the ring lug, flat washer, external-tooth washer and second nut. Establish a clean metal contact under the bonding hardware; do not rely on paint, straps or ordinary mounting screws for bonding. Final bonding method, tightening and continuity acceptance belong to the qualified assembler. The website does not assign an unsupported universal bonding torque.

## Wire and length schedule

Buy **13 ft of 14/3 SJOOW** and start with 2.0 m supply, 1.0 m printer-output and 0.8 m internal-XA blanks. Their internal conductors extend directly to the specified terminals. Keep sufficient PE slack so that jacket displacement does not pull PE free first. Measure the desired exterior reach before cutting.

Use the selected 14 AWG black and green internal wire for Q0 output and both metal bonds. XA uses conductors from its continuous 14/3 cord. The following are conservative **cutting blanks**, not proved finished lengths; final routing, bends and stripping are done with the assembly de-energized. Allow 1 m black and 1 m green including spare wire. Buy 4 ft (1.2192 m) of each color by the foot; both lengths are budgeted. No separate white-wire roll is required.

| Connection | Starting blank | Termination |
|---|---|---|
| 02 Q0 OUT → JL | Black, 500 mm | Bare prepared copper in Q0 box lug and WAGO port |
| 17/18/19 distribution → XA | One 800 mm 14/3 cord blank | JL hot, JN neutral, PE earth → corresponding 515CV terminals; jacket in clamp |
| 12 PE → panel bond | Green, 200 mm | WAGO to #10 ring |
| 24 PE.5 → rail/bracket bond | Green, 350 mm | WAGO to dedicated #10 ring; accepted conductive contact to both metals |

Connections 01/03/06/07/10/11 use the supply/output cord conductors. Connections 05/08/09 use the three existing pigtail + full-lead chains; retain their full factory length. Connections 14/15 use the CT pair; 16 is one existing USB cable, sleeved inside and passed directly through the wall, used with mains unplugged and the lid closed. Connections 20–23 illustrate factory adapter contacts and DC wiring, **not** instructions to open or modify the adapter. The site provides the full 22-path schedule; retained connection IDs stay unchanged.

Label both ends of every conductor. A1 is hot; A2 and A3 are neutral. The three original pigtails have different colors; drawing colors are schematic, so follow connection IDs. Grounding uses the separate green conductors. The full voltage-lead storage model assumes 2 m of flexible cable per lead and 3 mm OD; real cable lengths, connector bodies and minimum bends must fit without loading meter sockets.

## Assembly and acceptance sequence

1. Close the identification/entry/protection items above, obtain the exact parts and compare them with the machining setups. Keep the case and all cords disconnected while machining or wiring.
2. Machine the **empty** case and removable panel. Transfer-drill carrier fixings, deburr, clean, and inspect for cracks. Complete underside nuts, PE studs, carrier/anchor fixings and thread the straps before lowering the panel.
3. Install and secure the panel, then fit the three carriers, logger, CT and internal XA/adapter assembly. Leave access to the CT latch and WAGO levers; verify the four adjustable straps.
4. Fit Q0 to the supported DIN rail, install both end stops, verify full latch engagement and free operator travel through the new opening. Install two power glands. Route intact supply/output jackets through the glands. Clamp the internal XA cord jacket in the 515CV body, fully seat and independently restrain the original adapter, and route its original DC cable inside. Fit the direct USB cable exit as described above, with accepted 600 V sleeve/end protection and restraint at the existing front/right support. Disconnect only the PC end before mains operation; leave the intact cable attached to the box. XA/DC stay inside.
5. Bond panel, Q0 rail/bracket, output and XA; then complete neutral, protected hot, voltage sensing, CT and low-voltage wiring. Only the printer hot conductor goes through CT once, arrow toward the printer. Keep voltage taps and adapter consumption upstream of CT.
6. Check every termination, strain relief, bend, clearance and fastener. Verify CT latch travel and plug removal access. Confirm that both latches close the lid without pressing on cables or components; accept the access protection for this enclosure. This dry fit is still outstanding.
7. Qualified personnel document PE continuity, polarity, insulation/isolation, protection and supply suitability using the applicable test procedure. Disconnect sensitive electronics where the manufacturer requires it for insulation testing. Q0 OFF leaves incoming terminals live while the supply is plugged in.
8. Check closed-enclosure adapter temperature and restrained plug seating in a supervised pilot. The opaque lid hides indicators; confirm logging by an offline export after unplugging mains. Configure ELOG for single-phase/two-wire measurement and the **identified** CT. Verify positive real power and reasonable readings with an independent reference. Test start/stop and power-return recording behavior, then check each printer's cold start and sustained load. Do not release daily use from a browser simulation alone.

| Manufacturer termination | Published preparation / torque |
|---|---|
| WAGO 221-415 | Strip 11 mm; one accepted conductor per port, lever fully closed. Identify the factory-tinned pigtail ends before selecting preparation; do not add solder. |
| Phoenix 2907571 Q0 | One 14 AWG Cu conductor per screw clamp, within the published 18–2 AWG range; strip 11–12 mm, tighten to 2 N·m. Follow received instructions. Custom bracket and aluminum-bond torques require their own acceptance. |
| 515PV / 515CV, glands and enclosure | Follow the exact supplied instructions. The Q0 or outlet torque must not be reused for unrelated parts. |

Manufacturer sources and per-material limits are linked in the [installation audit](installation.html) and [reference schedule](references.html). The public project records digital geometry and circuit checks; it does not yet record a built, tested or approved assembly.


<h2 id="receiving-record">Receiving and release record</h2>

No measurements, acceptance signatures or live tests are recorded yet. Use this record to close the physical items; document actual values rather than changing a status to “pass” without evidence.

| Stage / owner | Record | Acceptance or next action |
|---|---|---|
| Aluminum / fabricator | Usable length ___ mm × width ___ mm; thickness ___ mm; alloy/finish ___; flatness/support assessment ___ | Finished outline is 260 × 340 mm with 10 mm corner chamfers. Stock must cover it plus the shop's trimming allowance. The current 1.89738 mm thickness is a template only. Measure and update the solid, support heights and every screw stack for the actual thickness; do not approve strength from thickness alone. |
| Stock unavailable / designer | Reuse result ___; fallback decision ___ | Source a suitable blank for the verified BUD mounting pattern and revise the budget if the offered stock fails. No replacement panel is included in the active $229.54 material subtotal. |
| Purchased case / fabricator | NBF-32126 label ___; four M5 inserts ___; actual opaque-lid clearance ___ | Match the support pattern and lid before machining. Verify both latches, gasket, screw engagement and accepted access protection. |
| Aluminum PE bond / electrical reviewer | Accepted lug/contact stack ___; aluminum surface treatment ___; anti-rotation method ___; torque basis ___; measured bond result ___ | The generic #10 stud/ring arrangement is a proposal, not a listed aluminum-bond system. Accept an aluminum-compatible contact method and any required replacement hardware before fabrication or energizing. No unsupported bonding torque is assigned. |
| Terminations / assembler | Received 15-104 markings ___; tool/die and manufacturer instruction ___; sample crimp/pull result ___; all terminal torques ___ | #8–10 is compatible with #10 studs; #8-only is not. Validate the actual 14 AWG insulation fit. Preserve the 75°C terminal rating and the lower applicable temperature limit of every component. |
| Closed-box fit / assembler | Four restraints ___; full AC/DC plug seating ___; gland grip ___; wire/lid clearance ___; measured screw-floor clearance ___ | No connector blade load, pinched insulation or restrained heat-dissipation surface. Anchor screws need full locknut engagement and at least 3 mm actual floor clearance. |
| Supply and protection / responsible electrical staff | Outlet/circuit ___; supply/fault-current assessment ___; combined startup assessment ___; original DENT lead protection decision ___ | Accept the complete assembly for the intended 120 V supply and 15 A design. Q0's 10 kA rating is not an assembly SCCR. Upstream-only voltage-lead protection requires acceptance; see [protection review](protection.html) and its prepared information requests. |
| USB assembly / assembler | Intact USB-B passage ___; bushing fit ___; approved sleeve process ___; internal/end coverage ___; external-pull restraint ___; separation/shield treatment ___ | DENT requires rated insulation for cable inside the electrical panel. Black FIT-221 is specified to UL224/CSA198, 600 V; the assembled cable has not been qualified. No PC connection during mains operation. |
| Offline configuration / operator | Actual CT model/range/output ___; ELOG configuration file ___; existing USB export verified ___ | Read the uncovered CT label. Do not assume 50 A from the photograph. Configure and download only with mains disconnected. |
| Release / responsible reviewer | PE/polarity/insulation results ___; closed-box pilot temperature ___; sample log/export ___; reference-meter comparison ___; reviewer/date ___ | Apply the accepted test procedure and actual manufacturer limits. Close and inspect the assembly before any supervised pilot. Routine use begins only after release; software/CAD tests do not substitute for these measurements. |

The current [priced order plan](materials.html#order-plan) includes every selected material order increment and spare quantity. Verify delivered price and lead time at checkout; no order or message has been sent.
