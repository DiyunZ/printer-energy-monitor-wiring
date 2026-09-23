# Design, sourcing and component evidence

Prices and sources checked September 23, 2026. Design priorities: fewer suppliers, lower-cost enclosure and panel, a breaker comparison, cable restraints, documented component approvals and internal logger power.

## Selected design

- **Enclosure:** Hammond **PCJ16148**, opaque screw cover, in the same size class as the previous clear-cover PCJ16148CC. X-ray mode is a viewing aid; the real lid is opaque.
- **Panel:** fabricate from the aluminum offered by the professor. The 327.025 × 374.65 × 1.89738 mm CAD panel is a **provisional template**. Stock size, thickness, stiffness and aluminum bonding still need confirmation.
- **Internal power:** an internal **Leviton 515CV** cord connector supplies the original CUI adapter. A continuous 14/3 SJOOW branch connects to JL/JN/PE before CT. The original adapter cable connects directly to the logger. Buy **two 515CV connectors total**, including the printer output.
- **Fewer openings:** remove the XA wall outlet and the DC opening, extension, KVT frame and insert. The right wall has one protected opening for the existing USB cable. Q0 and two power cords remain the other interfaces; XA/DC remain inside.
- **Retention:** retain six screw-fixed cable anchors; provide four adjustable straps—two for the logger, one for XA and one for the adapter. Check full plug seating and that restraint prevents separation without loading the blades or blocking heat dissipation.
- **Breaker:** retain Carling CA1-B0-24-615-121-DG and buy one from Master Electronics at the checked $40.32 price. The priced DIN comparison below explains why the design uses the existing direct mount and trip curve.

The original 21 electrical paths and measurement boundary remain: only printer hot passes through CT; the adapter and voltage sensing branch before CT. Neutral and PE remain separate. No physical assembly, thermal test or electrical release has occurred.

## One-cable closed-lid export

After printer shutdown: **Q0 OFF → unplug SUPPLY IN from the wall → connect the existing cable's free USB-A end to the PC → export in ELOG**, with the lid closed. Disconnect from the PC and stow the free end before the next mains run. USB-B stays in DENT; the whole cable remains attached to the box. Q0 OFF alone leaves its input live.

| USB connection | Purchase cost | Purpose |
|---|---|---|
| Existing USB-A to USB-B cable | Already owned | One continuous data connection; no coupler or extra cable. |
| One [Heyco 3104 bushing](https://www.digikey.com/en/products/detail/heyco-products-corporation/3104/15907204) | $0.14 | Cable-edge protection; UL Recognized E15331 / CSA 8919 component evidence. |
| [Alpha Wire F2213/4 BK105 sleeve](https://www.digikey.com/en/products/detail/alpha-wire/F2213-4-BK105/3718418) | $9.39 | Rated insulation for the cable inside the electrical panel; selected black sleeve is specified to 600 V. |

Both purchased USB accessories are included in the **$270.43** material subtotal, before freight, tax and fabrication.

The single Ø22.2 mm opening replaces the former USB bore and two screw holes. Published standard-B overmold dimensions fit the selected 17.5 mm bushing passage before sleeving. Reuse the existing front/right cable support; no extra support or connector is added. Confirm actual passage, full insulation coverage and restraint during assembly. [Sources and construction](build.html).

## Dated price comparison

USD, single-unit displayed prices checked September 23, 2026. These are web listings, not accepted quotations. Stock, tax, shipping, machining, finishing and labor are excluded.

| Item | Alternative | Selected design | Price evidence |
|---|---|---|---|
| Box | PCJ16148CC clear lid: **$149.45** | PCJ16148 opaque lid: **$137.11** | [Previous supplier listing](https://www.solutionsdirectonline.com/hammond-16x14x8-polycarbonate-electrical-enclosure-with-clear-cover-pcj16148cc) · [New supplier listing](https://www.solutionsdirectonline.com/hammond-16x14x8-polycarbonate-electrical-enclosure-with-solid-cover-pcj16148) |
| Panel stock | Hammond 14R1513: **$30.44** | Offered aluminum: **$0 incremental raw-stock allowance**, conditional on suitability | [14R1513 listing](https://www.digikey.com/en/products/detail/hammond-manufacturing/14R1513/2359585) · professor’s offer; machining is not free |
| **Box + raw panel only** | **$179.89** | **$137.11** | **$42.78 less**, before fabrication, delivery and tax |
| Internal XA | Prior 5279-C wall receptacle | 515CV: **$6.99** | [Home Depot](https://www.homedepot.com/p/301304939); two total 515CV units cost $13.98 before tax, including printer output |
| Six cable mounts | Previously linked 100-piece pack | Six individually listed TM2S8-C at **$0.68 each**, $4.08 | [DigiKey](https://www.digikey.com/en/products/detail/panduit-corp/TM2S8-C/1306625); stock and unit pricing can change |
| DC accessories | Tensility 10-02228, icotek 45026 and 41380 | **Removed from active BOM** | No saving assigned because a comparable complete prior order was not priced |

The selected purchase quantities now have a **$270.43 material subtotal**, including the internal XA branch, all four strap blanks, the actual retail packs and fastener spares. The [28-line order plan](materials.html#order-plan) records each seller, quantity, pack size, price and stock note. It excludes freight, tax, machining, tools, labor and any bonding changes required after inspecting the aluminum. The $42.78 remains a **box/raw-panel-only** comparison; it is not the difference between two fully priced systems. No purchase has been made.

The previous 3M 100-piece bottle was [$105.36](https://www.digikey.com/en/products/detail/3m/MV14-10R-LX-BOTTLE/2670218). The selected [Gardner Bender 15-104 15-pack is $3.63](https://www.homedepot.com/p/202522492), a **$101.73 reduction for that purchase line**, with three installed and twelve spare. Buy ten PLT2S-C ties for $3.16, rather than a 100-piece pack. Buy four feet each of [black](https://www.homedepot.com/p/204632031) and [green](https://www.homedepot.com/p/204632154) stranded wire: $1.68 per color, rather than full rolls.

## Consolidated purchasing

The previous BOM linked to 12 order-site domains, plus Bolt Depot through the fastener schedule: **13 sources**. The design uses **five planned order sources**, including fasteners. This counts ordering websites, not manufacturer references, photo credits or orders already placed. The former Marketplace ring-lug link is removed from the active order; Home Depot supplies the small pack. The order plan identifies the DigiKey -ND offers and selects no partner listing. Factory-stock glands may still have a separate lead time. Five sellers does not guarantee five parcels or fixed freight.

| Supplier | Groups to source |
|---|---|
| **Solutions Direct** | PCJ16148 enclosure |
| **DigiKey** | WAGO connectors/carriers, two glands, six individual cable mounts, ten individual cable ties, one USB cable bushing and rated sleeve |
| **Home Depot** | 14/3 cord, supply plug, two 515CV connectors, four feet each of black/green wire if absent from stock, 15-104 rings, one 90340 strap roll |
| **Master Electronics** | One exact Carling Q0; quantity-one price and stock verified |
| **Bolt Depot** | Remaining exact fasteners after checking lab stock; no XA flange hardware |
| **Lab reuse / fabrication** | Professor’s aluminum; six owned equipment groups including the USB cable |

There are **17 purchase groups, one proposed fabrication group and six owned groups**. Counts refer to material groups, not pieces or supplier packs. The two 515CV rows intentionally describe different installation locations but the combined order quantity is two.

<h2 id="breaker-options">Breaker and DIN alternatives</h2>

| Option | Evidence / price | Decision and tradeoff |
|---|---|---|
| **Carling CA1-B0-24-615-121-DG** | **$40.32, quantity one; 16 listed in stock** at [Master Electronics](https://www.masterelectronics.com/en/productdetail/littelfuse-carling-technologies/ca1b024615121dg-16947583.html), checked September 23. Use the [manufacturer C-Series table](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf) for ratings; the seller's prose contains inconsistent current wording. | **Selected.** Same 15 A UL489/CSA configuration, 10 kA at 120 V, direct wall mount and external operator. No electrical or hole-pattern substitution. |
| **Altech 1C15UL with rail and stops** | [Breaker $33.53](https://www.digikey.com/en/products/detail/altech-corporation/1C15UL/8547287) + one [2511120/1M 35 × 7.5 mm rail $4.62](https://www.digikey.com/en/products/detail/altech-corporation/2511120-1M/8546913) + two [CA802 stops at $0.62](https://www.digikey.com/en/products/detail/altech-corporation/CA802/8547037) = **$39.39**. Each offer permits individual quantities. CA802 fits this rail in the [manufacturer selection table](https://legacy.altechcorp.com/Blocks/Block-Accessories.pdf). | **Not selected.** Only $0.93 lower for these parts, before rail fasteners, an externally accessible operator/guard, fabrication and freight. C characteristic differs from Carling delay 24; its 17.5 × 105.3 × 68.4 mm body also requires a new arrangement. This is a priced component comparison, not a claim that every possible DIN installation costs more. |
| **Eaton FAZ-C15/1-NA-SP** | 15 A C curve, DIN mount, $40.00 at [AutomationDirect](https://www.automationdirect.com/adc/shopping/catalog/circuit_protection_-z-_fuses_-z-_disconnects/circuit_breakers_-a-_circuit_protectors/miniature_circuit_breakers_%28mcb%29/faz-c15-1-na-sp), before rail/supports. | No sufficient component-price advantage here; adds a seller. Not selected. |

**Decision:** use the offered plate and the $40.32 direct-mount Carling. A DIN rebuild could become economical with existing rail stock or a larger multi-device panel, but it is not needed for this single-printer enclosure. The logger and adapter still need a plate or other support. An inexpensive switch-only device or UL1077 protector is not an equivalent replacement for the selected UL489 breaker. Application acceptance remains separate from this sourcing decision.

**Consolidation tradeoff:** the same PCJ16148 is [$160.56 at Master Electronics](https://www.masterelectronics.com/en/productdetail/hammond-manufacturing/pcj16148-49489596.html), $23.45 above Solutions Direct. Retain the lower material-price source unless its extra delivered cost exceeds $23.45. Master lists a **25-piece minimum** for [1427NCGPG13LB](https://www.masterelectronics.com/en/productdetail/hammond-manufacturing/1427ncgpg13lb-50893024.html): $52 at $2.08 each, versus **two at $2.97 = $5.94** from DigiKey. Do not combine suppliers by purchasing unnecessary quantities.

<h2 id="checkout">Delivered-cost comparison and lab-stock check</h2>

Compare the final carts before placing orders; freight and taxes are not known. A lower advertised component price alone is not a lower delivered cost.

| Enclosure source / same PCJ16148 | Listed part price | Decision rule |
|---|---|---|
| [Solutions Direct](https://www.solutionsdirectonline.com/hammond-16x14x8-polycarbonate-electrical-enclosure-with-solid-cover-pcj16148) | $137.11 · active plan | Record delivered quote $___ and lead time ___. |
| [Wistex](https://www.wistexllc.com/enclosures/pcj16148-16-x-14-x-8-junction-box-4-screw-lift-off-cover.html) | $133.06 · alternative listing | Only $4.05 lower before freight/tax. Verify exact new part, seller terms and available stock; substitute the seller only if its delivered quote and timing are better. Not included as a sixth seller. |
| [Master Electronics](https://www.masterelectronics.com/en/productdetail/hammond-manufacturing/pcj16148-49489596.html) | $160.56 · consolidation alternative | Combining with Q0 costs $23.45 more in parts. It reduces sellers from five to four only if accepted and its delivery savings justify the difference. |

| Check before ordering | Required / record | Budget treatment |
|---|---|---|
| Lab fasteners | 2 Q0 screws/washers; 6 M3 screw/washer/locknut sets; 6 M4 sets; accepted PE hardware. Suitable stock: ___; shortage: ___ | Baseline still includes the full $4.50 Bolt Depot allowance. If every required item is verified suitable in lab stock, omit that order: $265.93 and four sellers. Do not mark stock owned without inspection. |
| Aluminum | Usable dimensions, thickness, finish/alloy, stiffness and bonding method: ___ | $0 raw-stock allowance remains conditional; update CAD to measured stock before cutting. |
| Existing kit | Logger, CT, three pigtails, full voltage leads, original adapter and existing USB cable | All six groups are confirmed owned. Reuse them; check condition and fit during assembly. |
| Final five carts | Materials $270.43 + freight $___ + tax $___ + fabrication/other approved costs $___ | Record total $___, quoted date ___ and required arrival date ___. Recheck all quantities and exact seller offers. |

## Certification evidence

| Part | Evidence available | What remains |
|---|---|---|
| Hammond PCJ16148 | [Manufacturer series standards](https://www.hammfg.com/electrical/products/non-metallic/pcj-sc): UL508A/cUL enclosure types; IEC60529 IP66 for the original enclosure | Confirm received label and exact variant. Machining and custom assembly do not inherit a finished-product listing. |
| Carling Q0 | Manufacturer ordering code and UL489 table for the selected DG configuration | Confirm exact SKU, receiving marks and application suitability. |
| Leviton 515PV / 515CV | [515PV manufacturer page](https://leviton.com/products/515pv) and [515CV](https://leviton.com/products/515cv): UL498 File E13393; CSA C22.2 No.42 File LR-406 | Confirm received markings, approved cord preparation and clamp. |
| Southwire internal wire | [UL/cUL product description](https://www.southwire.com/wire-cable/building-wire/thhn-thwn-copper-silicone-free/p/22955984) | Check markings on actual stock and accepted wiring method. |
| WAGO 221-415 | [Manufacturer datasheet, p.5, distributor-hosted](https://www.netxl.com/wago/docs/221-415-data-sheet.pdf): UL486C cULus Listed E69654; UL467 E201573 | Apply the exact conductor and installation conditions; confirm received marks. Carrier 221-505 is a mechanical accessory. |
| Hammond 1427NCGPG13LB glands | [Manufacturer series page](https://www.hammfg.com/electronics/small-case/accessories/1427ncg): UL Listed; IP68; exact long-thread part included in its table | Verify actual cord diameter, clamp and sealing. Component rating does not certify the machined box. |
| Southwire 558086 cord | [Manufacturer cable specification](https://cabletechsupport.southwire.com/en/tile/1/cable/7386/): UL62 / CSA C22.2 No.49; E46194 / LL90458 | Verify actual jacket marks and installation method. |
| Gardner Bender 15-104 rings | [Exact manufacturer product](https://www.gardnerbender.com/en/p/15-104/-16-14-AWG-2-mm-sq-Bnes-%C3%A0-anneau): UL Listed, CSA Listed, 600 V building wire, 75°C; #8–10 studs and 16–14 AWG | Certification wording is resolved for the replacement. Actual crimp tooling/fit and the aluminum bond still require acceptance; the manufacturer page does not publish a barrel-insulation diameter. |
| Custom aluminum and mechanical restraints | Material/interface review, not standalone equipment certification | Record stock and bonding method; verify retention, stiffness and temperature. Straps are not electrical insulation. |

UL Listed, UL Recognized, a material flammability rating and an IEC standard are different evidence. The website records the specific evidence instead of showing a blanket “certified” badge. No assembled-product certification is claimed.

## Professor feedback: disposition

| Requested change | Current result |
|---|---|
| Fewer suppliers | Five selected sellers, versus thirteen prior ordering sources; actual order quantities documented. |
| Cheaper box, plate and switch | Opaque box and offered plate selected; exact-SKU Q0 sourcing priced; DIN hardware comparison complete. |
| Plate or DIN mounting | Plate-based design selected. Offered stock must first meet the receiving requirements below. |
| Tie-down locations | Six screw-fixed cable mounts and four equipment straps appear in CAD, BOM and 3D. |
| Recognized certification evidence | Source-specific evidence for purchased electrical parts; new UL/CSA-listed ring selection. No blanket assembly certification claim. |
| No round DC extension; adapter inside | Original cable, XA and adapter are internal. No XA/DC wall opening or DC extension purchase. The existing USB cable exits through one protected opening for closed-lid offline export. |

These design and sourcing actions are implemented. Fabrication and energized-use acceptance remain **uncompleted physical work**, with an explicit [receiving and release record](build.html#receiving-record); they are not counted as passed requirements.

## Review before fabrication

Measure the offered aluminum, verify the shared PCJ base and actual opaque lid, dry-fit both internal power parts with original connectors, and review aluminum-compatible bonding. The current source model uses the previously verified PCJ16148CC base/panel geometry and an illustrative opaque lid; it is not an independently verified PCJ16148 factory assembly.

Moving the adapter inside requires a closed-enclosure temperature check and restraint that prevents the AC plug loosening. The opaque lid hides the logger indicators: configure offline, close the lid before mains operation, then verify saved records after unplugging and exporting the pilot. Never open the box while energized to inspect an LED.

[Current BOM](materials.html) · [Machining and assembly guide](build.html) · [Protection review](protection.html) · [3D and wiring](index.html)
