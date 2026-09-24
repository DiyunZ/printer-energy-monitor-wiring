# Design and sourcing decisions

The selected plan uses **three sellers and $246.94 in materials**, including all retail packs and fastener spares. It saves **$68.29 (21.7%)** against the preceding $315.23 three-seller plan. Freight, tax, machining, tools, labor and any required bonding changes are excluded. Prices checked September 23–24, 2026; no order has been placed.

## Selected purchasing plan

| Seller | Purchase scope | Subtotal |
|---|---|---|
| **DigiKey** | BUD enclosure, WAGO connectors/carriers, glands, cable supports, USB protection and individual hardware | **$127.20** |
| **Master Electronics** | Exact Carling Q0 breaker | **$40.32** |
| **Home Depot** | Cord, plugs/connectors, internal wire, rings, straps and packaged hardware | **$79.42** |
| **Total** | 17 purchase groups; 29 order lines | **$246.94** |

[Exact purchase quantities, prices and links](materials.html#order-plan). Six owned equipment groups and the professor's offered aluminum remain separate. No lab fastener stock is assumed. Count the actual seller, not manufacturer references or image credits. Choose new distributor/retailer stock; no open-box or DigiKey Marketplace partner offers are selected.

The **BUD NBF-32126 is $90.81, with one unit listed in DigiKey stock** at the quantity-one tier on September 24. [Selected enclosure](https://www.digikey.com/en/products/detail/bud-industries/NBF-32126/2328550). Replacing the delayed $160.56 Hammond box saves $69.75; the complete revised fastener budget adds $1.46 net, giving the $68.29 system saving. Stock is a snapshot, not a delivery commitment.

The smaller **400 × 300 × 160 mm** box requires a **260 × 340 mm chamfered aluminum panel**, repositioned components, new wall machining and shorter Q0/M3/M4 screws. Four M5 panel screws are purchased separately. These changes are included in the CAD, drawings and order plan. The manufacturer-linked STEP provides the common base; the opaque cover silhouette is illustrative. The new cover uses two latches, so actual fit and access protection must be accepted before use.

<h2 id="breaker-options">Why keep three sellers</h2>

Retain the **$40.32 Carling CA1-B0-24-615-121-DG** from [Master Electronics](https://www.masterelectronics.com/en/productdetail/littelfuse-carling-technologies/ca1b024615121dg-16947583.html). This preserves the selected 15 A UL489/CSA configuration, external handle and existing delay curve. A switch-only device or UL1077 protector is not an equivalent substitute.

The previously priced Altech DIN breaker, rail and two stops totaled $39.39 before rail fasteners and an external operator arrangement—only $0.93 below Q0. That does not justify changing the operating arrangement merely to remove one seller. Home Depot supplies short wire/cord lengths and small packs; DigiKey supplies individual electronic and installation parts. Three sellers is the balanced plan among the reviewed offers, not a claim of a globally cheapest solution.

<h2 id="checkout">Cost and delivery boundaries</h2>

- Recheck the enclosure's single-unit stock before ordering. Do not substitute the old delayed box or a different size without updating the design.
- The glands remain listed as factory stock; confirm their ship date. Home Depot fulfillment and prices depend on location. The website does not claim that every line is immediately available.
- Compare the **delivered total**: $246.94 materials plus the three sellers' freight and tax, then fabrication and any accepted bonding changes. These costs are not yet quoted.
- Buy the full listed packs, including four M5 panel screws. Measure the offered aluminum and verify the new enclosure before machining.

## Professor's requested changes

| Request | Current design |
|---|---|
| Fewer suppliers and lower cost | Three actual sellers; $68.29 below the preceding plan. |
| Cheaper box, plate and switch | Lower-cost stocked BUD box; offered aluminum; retain economical direct-mount Q0 after the DIN comparison. |
| Mounting and wire restraints | Fabricated plate, six screw-fixed cable mounts and four equipment straps. |
| Certification evidence | Exact manufacturer evidence below; complete assembly acceptance remains open. |
| Internal adapter and fewer penetrations | XA and original DC cable stay inside. No DC extension. One existing USB cable exits through a protected hole for export with the lid closed and mains unplugged. |

## Certification evidence

| Part | Evidence available | What remains |
|---|---|---|
| BUD NBF-32126 | [Manufacturer listing](https://www.budind.com/product/nema-ip-rated-boxes/nbf-series-fiberglass-enclosure/nbf-32126/): UL508; NEMA 1, 2, 4, 4X for the unmodified enclosure; ABS/PC UL94-5VA, indoor use | Confirm received label and exact variant. Machining and custom assembly do not inherit a finished-product listing. |
| Carling Q0 | Manufacturer ordering code and UL489 table for the selected DG configuration | Confirm exact SKU, receiving marks and application suitability. |
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
