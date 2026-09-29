# Design, material costs and sellers

**Select Phoenix Contact TMC 81C 15A / 2907571 from DigiKey direct stock: $233.54 in materials from two sellers, DigiKey and Home Depot.** Compare material costs while minimizing the number of actual sellers. Shipping, tariffs, sales tax, fabrication and labor are excluded from all selection totals. Complete purchase packs and spare pieces remain included.

## Material total

| Seller | Materials |
|---|---:|
| DigiKey | $154.12 |
| Home Depot | $79.42 |
| **Total** | **$233.54** |

The September 28 material prices are **$21.57 for Q0**, **$4.79 for the complete 250 mm rail**, and **$1.24 for two CA802 stops**. These three items total **$27.60** and are included in the project total above. The purchased fastener packs are also included; proposed reuse of the professor's aluminum adds no purchased stock. [Breaker](https://www.digikey.com/en/products/detail/phoenix-contact/2907571/6109707), [rail](https://www.digikey.com/en/products/detail/phoenix-contact/1207639/10645207), [stops](https://www.digikey.com/en/products/detail/altech-corporation/CA802/8547037).

| Project version | Actual sellers | Material total |
|---|---|---:|
| Earlier Carling direct panel mount | 3: DigiKey, Home Depot, Master Electronics | $246.94 |
| **Current Phoenix DIN mount** | **2: DigiKey, Home Depot** | **$233.54** |

**Phoenix saves $13.40 in materials and removes one seller.** Installation work is considered separately: Carling mounts directly to the panel; Phoenix needs the short DIN rail, end stops and formed aluminum support. The material saving does not imply simpler installation.

<h2 id="breaker-options">Options without adding a retailer</h2>

| DigiKey direct-stock option | Breaker material price | With the same $6.03 rail / stops | Decision |
|---|---:|---:|---|
| **Phoenix 2907571 / TMC 81C 15A** | **$21.57** | **$27.60** | Selected. Lowest checked material price among these viable direct-stock candidates; 3,691 in stock at the September 28 check. |
| [E-T-A 4230-T110-K0CU-15A](https://www.digikey.com/en/products/detail/e-t-a/4230-T110-K0CU-15A/7930030) | $30.62 | $36.65 | $9.05 more in materials; different geometry, not interchangeable in these fabrication files. |
| [Altech 1C15UL](https://www.digikey.com/en/products/detail/altech-corporation/1C15UL/8547287) | $33.53 | $39.56 | $11.96 more in materials; its geometry and application need a separate substitution review. |

All three retain the same two sellers. The rail / stop figures compare the same purchase quantities; they do not establish mechanical interchangeability. These are checked candidates, not a claim of the cheapest breaker across the entire market. Do not substitute an inexpensive UL1077 supplementary protector for the selected UL489 branch-circuit breaker.

The earlier NOARK candidate cost **$17.57 from Wolf**, $4.00 less for the breaker than Phoenix. Holding other material quantities fixed, it saves $4.00 but introduces Wolf as a **third actual seller**. Phoenix is preferred for the two-seller plan. Shipping is not used to rank these options.

<h2 id="checkout">Price basis and purchase checks</h2>

[Order quantities and links](materials.html#order-plan) include the full 250 mm rail, two stops, fastener packs and spares. Updated breaker/rail/stop prices are September 28 checks; unchanged September 23–24 lines remain dated snapshots. No order has been submitted. Reconfirm material prices, stock and the offered aluminum before ordering. Shipping, tariffs, sales tax, fabrication and labor are outside this comparison; their exclusion does not mean they are free.

The mounting package uses an **18.6 × 46 mm operator window**, **88 × 40 × 66.30 mm formed aluminum bracket**, and **60 mm installed DIN rail**. Only the insulating nose and handle reach the opening. Guards remain 1.5 mm behind the nominal inner wall. Wire preparation is **11–12 mm strip, 2 N·m**, one 14 AWG copper conductor per clamp. The new C curve must be checked against actual startup; former Carling pulse-tolerance claims do not carry over. [Fabrication and receiving checks](build.html#q0-mount).

## Certification evidence

| Part | Evidence available | What remains |
|---|---|---|
| BUD NBF-32126 | [Manufacturer listing](https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/): UL508; NEMA 1, 2, 4, 4X for the unmodified enclosure; ABS/PC UL94-5VA, indoor use | Confirm received label and exact variant. Machining and custom assembly do not inherit a finished-product listing. |
| Phoenix Contact TMC 81C 15A / 2907571 | [Exact manufacturer product](https://www.phoenixcontact.com/en-us/products/thermomagnetic-device-circuit-breakers-tmc-81c-15a-2907571): UL489 / cUL Listed E320373; 15 A, 1 pole, C curve, 277 V AC, 10 kA | Verify receiving marks, startup suitability, available fault current and original voltage-lead protection. |
| Leviton 515PV / 515CV | [515PV manufacturer page](https://leviton.com/products/515pv) and [515CV](https://leviton.com/products/515cv): UL498 File E13393; CSA C22.2 No.42 File LR-406 | Confirm received markings, approved cord preparation and clamp. |
| Southwire internal wire | [UL/cUL product description](https://www.southwire.com/wire-cable/building-wire/thhn-thwn-copper-silicone-free/p/22955984) | Check markings on actual stock and accepted wiring method. |
| WAGO 221-415 | [Manufacturer datasheet, p.5, distributor-hosted](https://www.netxl.com/wago/docs/221-415-data-sheet.pdf): UL486C cULus Listed E69654; UL467 E201573 | Apply the exact conductor and installation conditions; confirm received marks. Carrier 221-505 is a mechanical accessory. |
| Hammond 1427NCGPG13LB glands | [Manufacturer series page](https://www.hammfg.com/electronics/small-case/accessories/1427ncg): UL Listed; IP68; exact long-thread part included in its table | Verify actual cord diameter, clamp and sealing. Component rating does not certify the machined box. |
| Southwire 558086 cord | [Manufacturer cable specification](https://cabletechsupport.southwire.com/en/tile/1/cable/7386/): UL62 / CSA C22.2 No.49; E46194 / LL90458 | Verify actual jacket marks and installation method. |
| Gardner Bender 15-104 rings | [Exact manufacturer product](https://www.gardnerbender.com/en/p/15-104/-16-14-AWG-2-mm-sq-Bnes-%C3%A0-anneau): UL Listed, CSA Listed, 600 V building wire, 75°C; #8–10 studs and 16–14 AWG | Certification wording is resolved for the replacement. Actual crimp tooling/fit and the aluminum bond still require acceptance; the manufacturer page does not publish a barrel-insulation diameter. |
| Custom aluminum and mechanical restraints | Material/interface review, not standalone equipment certification | Record stock and bonding method; verify retention, stiffness and temperature. Straps are not electrical insulation. |

UL Listed, UL Recognized, a material flammability rating and an IEC standard are different evidence. The website records the specific evidence instead of showing a blanket “certified” badge. No assembled-product certification is claimed.

## Before fabrication and use

The digital checks cover nominal solids, panel insertion, component placement and sampled cable routes. They do not verify actual scrap thickness, connector fit, plug retention, lid access protection or closed-box temperature. Record those checks and electrical acceptance in the [receiving record](build.html#receiving-record). The original voltage leads' protection and aluminum-compatible PE bond remain review items.

[Materials](materials.html) · [Machining and assembly](build.html) · [Protection review](protection.html) · [3D and wiring](index.html)
