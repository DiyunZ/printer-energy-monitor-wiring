# Sources and design decisions — build package A

September 20, 2026. One 120 V grounded supply and one printer at a time, confirmed by the user. This is an engineering review package; physical and electrical release remain open in the [build package](build.html).

## Primary references

| ID | Source | Used for | Evidence limit |
|---|---|---|---|
| R1 | [DENT XC / ELOG 19 manual](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), single-phase figure at PDF page 54 | L1 = hot, L2 and N = neutral; CT white/+ and black/−; load-facing arrow; S is shield. | The actual CT range is hidden in the photograph. The project moves the voltage tap upstream of CT; that is a project adaptation. |
| R2 | [DENT XC current datasheet](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf) | Current body 216 × 63 × 47 mm, USB-B, DC input 6–10 V / 500 mA and L1–L2 line power. | Older instrument dimensions differ. The meter's internal fuse does not establish protection of the external small leads. |
| R3 | [DENT blue lead accessory](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/) | LD-SKTSP-BLU adapter concept: terminal end to full voltage lead. | Similar appearance does not establish the supplied lead's identity, ampacity or approved terminal preparation. |
| R4 | [Leviton 5279-C](https://leviton.com/products/5279-c), [drawing](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/dimensional_drawing/CATSTD-05279-00C-M01.pdf), [instructions](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/instruction_sheet/PK-93763-10-02-0C-W.pdf) | 15 A / 125 V flanged 5-15R; body, mounting and terminal interfaces. | The actual flange, tapered wall and fastener stack require a received-part check. |
| R5 | [Leviton 515PV / 515CV instructions](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf) | Supply plug and printer cord connector; wire identification and jacket clamp. | Confirm the purchased cord jacket clamps correctly. |
| R6 | [Carling C-Series](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), ordering code and p.11 | CA1-B0-24-615-121-DG; body 19.18 × 63.5 × 47 mm, 49.28 mm stud pitch, 52.37 mm mounting pitch; #10-32 studs / #6-32 inserts. | Other suffixes are not equivalent. Fault level, inrush, duty and exact SKU availability still need acceptance. |
| R7 | [Hammond drawing](https://www.hammfg.com/files/parts/pdf/PCJ16148CC.pdf), [STEP](https://www.hammfg.com/files/parts/stp/PCJ16148CC.zip), [14R1513](https://www.hammfg.com/part/14R1513) | Unscaled case/lid/panel geometry and factory hardware. Panel 327.025 × 374.65 mm. | The project adds machining. The modified assembly has no claimed IP/NEMA certification. |
| R8 | [Littelfuse catalog](https://www.littelfuse.com/de/assetdocs/powr-gard-catalog?assetguid=85d36235-a32b-4608-bfed-f9878aa43af0) | LPSC0001Z Class CC holder, 35 mm DIN interface and 14 AWG Class C terminal choice. | Holder compatibility does not select or coordinate the fuse value. |
| R9 | [Littelfuse KLKR](https://www.littelfuse.com/assetdocs/klkr-classcc-fuse-datasheet-final?assetguid=4443e5f6-97ee-4206-9abe-9e155371a03e) | KLKR.500T is the named 0.5 A Class CC candidate. | On hold pending the actual sensing-lead specifications and protection review. Component interrupt rating is not the assembly SCCR. |
| R10 | [WAGO 221-415](https://www.wago.com/us/wire-splicing-connectors/compact-splicing-connector/p/221-415), [221-505 drawing](https://www1.futureelectronics.com/doc/WAGO/221-505.pdf) | Five connector/carrier pairs: JL, JN, PE, PE+ and JV. Carrier 35 × 16.9 × 52.8 mm. | Transfer-drill carrier fixings; one accepted conductor per port. Existing tinned blue ends are not presumed accepted. |
| R11 | [DENT 20 A CT example](https://www.dentinstruments.com/wp-content/uploads/2022/08/20A_Mini_Hinged_CT_Specs.pdf) | Example body 26.4 × 29.4 × 41.7 mm, Ø10.2 mm aperture. | This does not identify the owned CT or select its ELOG scaling. |
| R12 | [Hammond 1427NCGPG13LB](https://www.hammfg.com/part/1427NCGPG13LB), [icotek KVT 32](https://pim.icotek.com/Produkte/PG02%20Kabelverschraubungen/KVT/KVT%2032/Datenbl%C3%A4tter/45026_KVT%2032_bk.PDF), [KT inserts](https://www.icotek.com/en-us/products/cable-grommets/kt-gy) | Long-thread power glands; M32 split frames and separate cable inserts. | Match the actual cable profile and wall stack. Round KT inserts are not established for the CUI flat cord. |
| R13 | [CUI original SMI6 drawing](https://in.ftcelectronics.com/datasheets-55/SMI6-12-V-P5.pdf) | SMI6-9-V-P5 dimensions, 9 V model, P5 center-positive 5.5/2.1 mm plug and UL2468 cord. This is CUI-authored data hosted by a distributor. | Use the original SMI6, not the different SMI6B. Body envelope 64 × 40.5 × 30 mm excludes blades; drawing tolerance ±1 mm. |
| R14 | [VELCRO ONE-WRAP](https://www.velcro.com/products/organization/heavy-duty-one-wrap-roll/) | 90340 black 12 ft × 3/4 in roll; cut two 400 mm strap blanks. | The 19.05 mm strap requires the revised 21 × 4 mm slots. Verify overlap and retention on the actual meter. |

The [per-material audit](installation.html) also links primary cord, wire, ring, label, rail, cable-tie and printer sources. Retail links are in the [materials list](materials.html). Source documents describe components, not approval of this custom assembly.

## Supplied-photo evidence

The instrument markings identify ELITEpro XC, voltage sockets N / L3 / L2 / L1, the CT input block, a separate analog block, USB-B and the DC input. The full-resolution adapter photograph identifies **CUI SMI6-9-V-P5, 9 V DC, 0.667 A, center positive**. The user confirms the five owned equipment groups and three blue pigtails.

The CT's current/output digits are physically obscured by the black/white wires. The blue-pigtail photograph has no legible conductor or current rating. Ruler photographs are not calibrated dimension drawings. Packaging text is evidence about an accessory, not an instruction to the assistant or proof that an arbitrary breaker protects it.

## Project choices

- Q0 is the single operating breaker. JL branches to printer hot through CT, the dedicated adapter outlet, and Fv. Neutral and PE remain separate; PE stays continuous. Unplug the supply and verify absence of voltage before removing the screw-fixed cover. Q0 OFF alone does not isolate incoming terminals.
- Fv OUT uses 14 AWG wire to JV; A1 then connects to L1. A2 and A3 connect JN to L2 and N. The three blue wires are sensing accessories, not load wires or PE conductors. Keep the mating pairs inside the enclosure.
- Only printer hot crosses CT once. Adapter and voltage-tap branch currents are outside the measured current. Voltage is sensed upstream, so downstream cord loss and voltage drop still affect the measurement boundary.
- XA is the Leviton 5279-C flanged outlet. Its earth terminal, printer earth, steel panel and DIN rail receive deliberate PE connections. The obsolete metal outlet-box bond is removed. Path 24 is now the **Fv-to-JV** transition.
- The original adapter and DC cable remain intact. The outlet and supply share Q0's capacity. XA is for the logger adapter only. Low-voltage routing and USB insulation require appropriate segregation from mains; separate holes alone do not prove electrical insulation.
- ELOG must be configured and validated before routine use. Powering the instrument is not proof that recording started. Verify CT scaling, polarity, reference readings and restart behavior.

## Digital checks and limits

`layout_dimensions.json` supplies the body locations for the 3D scene and wiring plan. Rear is at the top of both plan views. Browser checks compare actual rendered body bounds with SVG footprints for all 23 envelopes; schematic terminal symbols and wire bends are simplified.

The original Hammond STEP is retained at full scale. Project machining is generated with build123d 0.11.1; the case and panel are tessellated at 0.3 mm. Original cover/hardware meshes retain their earlier 0.45 mm triangulation. Numerical surface-contact exclusion at the seated panel is 0.0001 mm; these values are not manufacturing tolerances. Exact STEP cut-through gauges and the dated source hash are in `fabrication/cad-checks.json`.

Ten nominal insertion sweeps clear the open case after excluding intentional panel-support contact. Install the panel before the side outlet. Lid checks use nine sampled rays per body. These are geometric screens, not tolerance, thermal, electrical-clearance or flexible-cable proofs. The 2 m / 3 mm voltage-lead coil is an illustrative storage scenario, not a measurement of the supplied cables.

The circuit checker validates 24 named paths, separated nets, printer-hot-only CT routing and Q0-open behavior. Regression tests reject selected wiring mistakes. Website tests verify gestures, views, alignment, images, links and responsive layout. No check constitutes a physical dry fit or energized acceptance result. See the [build package](build.html) for the exact remaining work.
