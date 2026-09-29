# Design and delivered-cost decision

**Select Phoenix Contact TMC 81C 15A / 2907571 from DigiKey direct stock.** This 15 A, one-pole, C-curve breaker has UL489 / cUL Listed evidence. The selected order uses **two sellers: DigiKey and Home Depot**, with no separate breaker retailer. Materials are **$233.54**; known estimated tariffs add **$5.72**. The mounting design uses the manufacturer STEP, a short DIN rail and proposed professor-supplied aluminum.

## Order and shipping budget

| Seller | Materials | Known estimated tariffs | Freight basis | Known pre-sales-tax sum |
|---|---:|---:|---|---:|
| DigiKey | $154.12 | $5.72 | $8.49 for one consolidated ground shipment | $168.33 |
| Home Depot | $79.42 | Not quoted | Delivery unquoted; $0 only for eligible pickup | $79.42 + delivery |
| **Total** | **$233.54** | **$5.72** | **$8.49 + unquoted costs** | **$247.75 + unquoted costs** |

Destination: Sidney Lu Mechanical Engineering Building, Urbana, IL 61801. September 28 DigiKey cart checks showed **$21.57 + $5.34 estimated tariff for the breaker** and **$4.79 + $0.38 for the rail**. Two CA802 stops cost $1.24 with no tariff displayed. The Q0 + rail + stops subtotal is **$33.32 including these tariffs**, before shared shipping, sales tax and bracket fabrication. [Breaker](https://www.digikey.com/en/products/detail/phoenix-contact/2907571/6109707), [rail](https://www.digikey.com/en/products/detail/phoenix-contact/1207639/10645207), [stops](https://www.digikey.com/en/products/detail/altech-corporation/CA802/8547037).

**$247.75 is a conditional budget, not a final checkout quote.** It includes one $8.49 DigiKey ground shipment; factory-stock glands could cause additional shipping. Add Home Depot delivery unless eligible pickup is used, tariffs on other items if shown at checkout, applicable sales tax and fabrication. No administrative fee per retailer is invented. [DigiKey delivery policy](https://www.digikey.com/en/help-support/delivery-information/delivery-time-and-cost).

School procurement must confirm sales-tax exemption and provide the appropriate certificate. Submitting a school purchase request does not establish exemption; exemption does not remove import tariffs. Until confirmed, sales tax remains unquoted rather than zero. [University purchasing guidance](https://www.busfin.uillinois.edu/buying_contracts/procurement_laws_and_regulations/tax_exempt_status).

<h2 id="breaker-options">Options without adding a retailer</h2>

| DigiKey direct-stock option | Breaker price | Estimated tariff | Incremental breaker cost before shared freight/tax | Decision |
|---|---:|---:|---:|---|
| **Phoenix 2907571 / TMC 81C 15A** | **$21.57** | **$5.34** | **$26.91** | Selected. Lowest verified viable option among these direct-stock candidates; 3,691 in stock at check. |
| [Altech 1C15UL](https://www.digikey.com/en/products/detail/altech-corporation/1C15UL/8547287) | $33.53 | None displayed | $33.53 | $6.62 more; its geometry and application would need a separate substitution review. |
| E-T-A 4230-T110-K0CU-15A | $30.62 | $6.68 | $37.30 | $10.39 more; different geometry, not interchangeable in these fabrication files. |

All three assume consolidation into the existing DigiKey shipment. These are checked candidates, not a claim of the cheapest breaker across the entire market. Do not substitute an inexpensive UL1077 supplementary protector for the selected UL489 branch-circuit breaker.

The prior NOARK proposal was $17.57 + $14.12 separate Wolf shipping = **$31.69 for Q0 before tax**. Phoenix's $26.91 price plus tariff saves **$4.78**, assuming the same rail/hardware/fabrication cost and no additional DigiKey shipment. Putting both plans on the same $0.38 rail-tariff basis gives **$252.53 versus $247.75**. Wolf is removed from the active order.

Against the earlier Carling material plan of **$246.94**, Phoenix materials plus the known new tariffs are **$239.26**: a **$7.68 reduction before avoided Master Electronics freight and additional bracket fabrication**. Actual net savings require the fabrication quote and final shipment/tax amounts. Offered aluminum stock does not imply free machining labor.

<h2 id="checkout">What is ready and what is unquoted</h2>

[Order quantities and links](materials.html#order-plan) include the full 250 mm rail, two stops, fastener packs and spares. Updated breaker/rail/stop prices are September 28 checks; unchanged September 23–24 lines remain dated snapshots. No order has been submitted. Reconfirm stock, tariffs, consolidated shipment and school tax treatment at checkout.

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
