# Wiring and assembly references — Rev. 3

September 17, 2026. Applies to `index.html`, `wiring_routes.svg` and `connector_detail.svg`.

The design now has one operating breaker (Q0), a dedicated adapter receptacle (XA), and a proposed passive voltage-tap fuse (Fv). The user confirmed that the receptacle is for the existing black two-pin AC/DC adapter. This is a reviewable design, not an approved construction drawing.

## Primary sources

| ID | Source | Supported facts | Limit |
|---|---|---|---|
| R1 | [DENT ELITEpro XC / ELOG 19 Operator’s Guide, 2024-11-15](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf), printed pp. 9, 19–23, 29, 55; single-phase figure is PDF page 54 | Single phase: hot to L1; neutral to L2 and N. Split-core CT white +, black −; load-facing arrow. S is a CT shield terminal. Shunted 333 mV CT selection; voltage-lead adapters; USB insulation. | Photo confirmation of the actual CT model/range is still needed. The factory figure has its hot voltage tap after CT; this project moves it before CT. |
| R2 | [DENT ELITEpro XC datasheet, rev01272026](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf), final page | Line power uses L1–L2; optional power input is 6–10 V DC, 500 mA. USB is Type B. Internal 0.5 A fuse is part of the instrument. | Internal instrument protection does not establish protection of the entire external pigtail run. DC power does not replace voltage sensing. |
| R3 | [DENT replacement unterminated voltage leads](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/), Description / Part Numbers | Blue LD-SKTSP-BLU is a voltage-lead adapter: tinned end at a terminal, socket mating with the full 2 m voltage lead. | The photographed blue item resembles this accessory. Its exact part number, conductor rating and mating compatibility are not proven by appearance. It is not a printer load wire or a PE bonding conductor. |
| R4 | [Leviton 5261 single receptacle](https://leviton.com/products/5261) | Grounded NEMA 5-15R, 15 A / 125 V, industrial-grade single outlet: a candidate for the existing adapter. | Requires a compatible mounting box / cover / guarded rear terminals and verified fit. This is not a snap-in connector or an approval of the modified enclosure. |
| R5 | [Leviton grounded plug / connector instructions](https://leviton.com/content/dam/leviton/residential/product_documents/instruction_sheet/515_Instruction_Sheet.pdf), 515PV / 515CV section | Existing input plug and printer-output concept use hot/brass, neutral/silver and earth/green identification with jacket strain relief. | Apply the exact device’s instructions, conductor acceptance and torque. Confirm the actual printer plug and lab outlet. |
| R6 | [Eaton UL 489 / UL 1077 DIN-rail breaker guide](https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/industrial-miniature-circuit-breakers/FAZ-product-guide-pg01101009e.pdf) | Distinguishes branch-circuit breakers from supplementary protectors. | Does not choose Q0’s current rating, trip curve, operating duty or interrupt rating for this project. |
| R7 | [Hammond PCJ16148CC enclosure](https://www.hammfg.com/part/PCJ16148CC) and [PCJ series panel table](https://www.hammfg.com/electrical/products/non-metallic/pcj-sc) | Retains the previous enclosure / optional 14R1513 panel as a candidate only. | This revision does not establish fit. Receptacle backing box, adapter body, connector engagement, full lead slack and lid clearance must be included in a dry fit. |

R1–R4 were reopened for this revision. R5–R7 retain the earlier project’s manufacturer references; their applicability to final purchased parts must be checked. No manufacturer source above approves the full custom assembly.

## What the supplied photographs establish

- The instrument is marked ELITEpro XC. Its measurement end has CT CH1–CH4 and S, with voltage sockets ordered N / L3 / L2 / L1 in the illustrated front-facing orientation.
- The opposite end has a different analog-input CH1–CH4 block, USB Type B, and POWER IN / OUT. The case shows 6–10 V DC, 500 mA input and center-positive polarity.
- Split-core DENT current sensors, long voltage leads, an AC/DC adapter and a blue unterminated pigtail are visible. The user reports three blue pigtails available.
- Exact CT model, rated current, output, adapter output label, pigtail ampacity and measured installed dimensions are not established here. Ruler photographs are not treated as dimensioned engineering drawings.

The attached packaging note is evidence about the lead kit, not authorization or proof that any chosen breaker protects it.

## Project design decisions

1. **One breaker, three hot branches.** Q0 feeds the printer, XA adapter outlet and Fv voltage tap. It opens hot only; neutral and PE are not independently switched or fused. Q0 OFF leaves input terminals live while plugged in. USB may keep the meter powered.
2. **Three blue adapters.** A1 connects the protected hot voltage tap to L1. A2 and A3 connect neutral separately to L2 and N. Mark both ends. Keep the shrouded mating pairs guarded inside the enclosure; disconnect only after full de-energization. Use separate power conductors and PE bonds.
3. **Proposed Fv fuse.** Fv replaces the previous Qv breaker as the proposed small-lead protection method. Its current, voltage, interrupt rating and holder are deliberately unspecified pending coordination with the actual pigtails and supply. The pigtail’s tinned end must be accepted by the chosen terminal. A larger load breaker is not automatically adequate for it. A qualified designer must also assess the complete neutral-return paths and supply polarity. This is a project protection proposal, not a manufacturer-specified AC fuse value or a requirement inferred from DENT’s unrelated high-voltage DC fuse note.
4. **Measurement boundary.** Only the printer’s hot conductor crosses CT once. The adapter and logger voltage/power taps are before CT, so their branch currents are outside the measured current. The measured voltage is at the distribution point; downstream cord voltage drop and energy loss are not automatically excluded. Validate against a reference meter at the agreed boundary.
5. **Dedicated outlet.** XA is a single grounded receptacle for the two-pin adapter. The unused earth contact and accessible metal mounting parts remain bonded. It is not the measured printer outlet. No additional appliance is intended at XA. Both outlets share Q0’s total allowed load.
6. **Power and data routing.** Retain the verified manufacturer adapter and factory barrel cable intact. Secure the exterior adapter if mounted outside; route its DC cable through a suitable entry, with segregation / insulation appropriate to adjacent mains. Protect the USB route as required by DENT. A physically separate entry alone is not electrical insulation.
7. **Terminal capacity and bonding.** JL needs four connections; JN and JPE need at least five each. Use distinct secured, guarded groups. Additional outlet-box or chassis bonds may require extra PE capacity. Drawn metal plate / rail bonds are deliberate; ordinary mounting screws are not presumed to make a reliable earth bond.
8. **Simple operation needs prior setup.** Confirm ELOG channel mapping, CT scaling, recording status and restart behavior. Daily use can then be plug in with Q0 OFF, turn Q0 ON, and confirm logging. No claim is made that powering the meter alone starts data recording.

## Drawing and software checks

`python3 build_routes.py` verifies 23 named paths, separate electrical nets, no unrelated terminal dot lying on a route, only the printer hot through the illustrated CT aperture, and Q0-open behavior. It does not model current through appliances, adapter isolation construction, terminal torque, real fault currents or hardware quality.

Browser checks and visual review validate the published drawing and controls only. Physical assembly, protection coordination, lead ratings, actual CT identification, clearances and electrical acceptance remain unverified.
