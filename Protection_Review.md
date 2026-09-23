# Protection and data review

September 20, 2026 · 120 V grounded supply · one printer at a time.

**Q0 and voltage-lead protection still need acceptance.** The checks below resolve published component ratings and fit. Actual outlet fault current, combined startup duty and protection of the existing voltage leads remain unverified. No hardware test or qualified acceptance has been recorded.

| Item | Verified | Decision |
|---|---|---|
| Q0, CA1-B0-24-615-121-DG | 15 A, delay 24, UL489 option; 10 kA interrupting rating at 120 V AC | Selected for purchase by the user on September 21, 2026, following the professor's confirmation of the 15 A design limit. Site and startup checks remain pre-use acceptance items; Master Electronics lists one at $40.32 and 16 in stock on September 23; delivery remains checkout-dependent. |
| Voltage tap | A1 connects to JL after Q0; no dedicated fuse | Confirm that upstream Q0 protection is suitable for the original DENT leads before energizing. |
| USB cable | Included in DENT kit; use the lid-pocket cable | Reuse outside the closed box. Add the listed service port, short internal lead and rated sleeve; use PC only after unplugging mains. |
| Internal adapter power | XA 515CV + original CUI cable, entirely inside | No DC extension or wall feedthrough. Verify plug retention and closed-enclosure temperature. |

The [completed sourcing comparison](revision.html#breaker-options) retains the exact Carling at $40.32. Altech 1C15UL plus one compatible rail and two CA802 stops totals $39.39 before fasteners, operator access, fabrication and freight. Its different trip curve and mounting do not justify an unreviewed substitution for that small component-price difference. The remaining protection decisions concern the physical application, not an unresolved supplier quote.

## Q0: what the rating proves

The selected Carling ordering code specifies a 15 A, single-pole, 50/60 Hz medium-delay breaker with UL489/CSA approval. The manufacturer's UL489 table lists **10,000 A at 120 V AC** for this configuration. Its published half-cycle pulse tolerance is **12 times rated current at 60 Hz**: calculated as **180 A for 8.33 ms** for this 15 A selection. These are the stated unloaded test conditions; an arbitrary startup pulse cannot be compared using peak current alone. [Carling C-Series datasheet, pp. 2, 4, 8](https://www.carlingtech.com/sites/default/files/documents/C-Series_datasheet.pdf), [time-delay curves](https://www.carlingtech.com/sites/default/files/documents/Carling-HM-CB-Time-Delays.pdf).

The application check still needs the **available RMS symmetrical fault current at the actual receptacle** and the combined startup waveform of the selected printer, adapter and logger. An upstream breaker's marked interrupting rating is not a measurement of available fault current. The breaker rating is also not the short-circuit rating of this complete custom enclosure.

### Jackson Innovation Studio

UIUC identifies JIS as **Room 0100, lower level of Sidney Lu Mechanical Engineering Building**. The F&S building list identifies the building as **0112, 1206 W Green St, Urbana**. [MakerWorks location](https://mechse.illinois.edu/undergraduate/makerworks), [F&S building register](https://fs.illinois.edu/building-list-a-z).

The public pages and renovation summaries inspected do not supply the chosen outlet's circuit number, panel schedule or fault-current calculation. That absence is a limit of this public search, not evidence of a safe numerical value. The studio's published contact is **mechse-makerworks@illinois.edu**; it can route a request to the responsible building/facilities staff. [JIS contact page](https://mechse.illinois.edu/undergraduate/makerworks/jackson-innovation-studio).

**Request to pass to JIS / Facilities — draft, not sent:**

> For a proposed 120 V printer-energy measurement box in JIS, Room 0100, could the responsible electrical staff identify the intended receptacle and its panel/circuit, and confirm the maximum available RMS symmetrical fault current there? The proposed breaker is Carling CA1-B0-24-615-121-DG, 15 A UL489, rated 10 kA at 120 V AC. Please review the complete assembly's protection and supply suitability; the breaker rating alone is not an assembly SCCR. If a current study is unavailable, please advise the appropriate engineering assessment. We do not need to access or open energized panels ourselves.

### Printer startup evidence

| Printer | Published operating information | Limit of the check |
|---|---|---|
| UltiMaker S5 | 100–240 V AC, 50/60 Hz, 500 W maximum | About 4.17 A at 120 V **only at unity power factor**; this is not a nameplate current or startup waveform. [S5 manual](https://um-support-files.ultimaker.com/manuals/user-manual/S3-%26-S5/Ultimaker%20S3-S5%20-%20User%20manual%20ENv2.4.pdf). |
| Bambu Lab P2S | LV version: 100–120 V AC; 1000 W at 110 V during preheating | About 9.09 A at 110 V **only at unity power factor**. Minutes of heating load do not specify millisecond inrush. [P2S quick-start guide](https://csm.bblcdn.com/hub/0a3c3e8ab9554a5c9c91815e41540f42.pdf). |
| Prusa CORE One+ | The listed compatible Gen1 PSU is 24 V DC / 240 W | Its 10 A output is **DC output**, not AC input. Match the actual PSU version; no complete printer inrush waveform was found. [Prusa PSU listing](https://www.prusa3d.com/product/psu-24v-240w/). |

Manufacturer data for startup amplitude, duration, repetitions, input voltage and temperature—or a suitably captured waveform reviewed against the breaker curve—is needed to close the startup comparison. Ordinary logged averages and a single successful power-on do not establish that comparison. Request the actual printer/PSU startup specification; do not increase the breaker rating merely to avoid trips.

## Voltage tap: upstream protection review

The revised design omits Fv, its holder, DIN rail, stops and JV. The hot sensing path is **Q0 → JL → original DENT A1 pigtail → full voltage lead → ELITEpro L1**. L2 and N remain connected to neutral. The adapter and voltage tap branch off before CT; only printer hot passes through CT. The sensing leads do not carry printer load current.

The user confirms the three differently colored pigtails as original DENT kit components, matched to the LD-SKTSP family. DENT lists these leads for hard-wiring and also offers standard non-fused and optional fused clips. That does not establish that this custom enclosure and its 15 A breaker adequately protect the original lead set. [DENT pigtails](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/), [DENT clip options](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-fused-crocodile-clip/).

**Before energizing:** the responsible electrical reviewer must accept the upstream-only protection scheme, original lead terminations and installation conditions. No such acceptance or physical test is recorded. The ELITEpro's internal fuse cannot clear a short in an external lead that bypasses the instrument. Removing Fv does not validate Q0 or establish the assembly's short-circuit rating.

**Manufacturer question — draft, not sent:**

> For our proposed 120 V measurement enclosure, may original DENT LD-SKTSP pigtails and voltage leads connect to a circuit protected by a Carling CA1-B0-24-615-121-DG 15 A breaker without a dedicated voltage-tap fuse? A1 feeds L1 from switched hot; L2 and N connect to neutral. Please confirm the permitted upstream protection and terminal preparation, or identify any additional protection required. The original 9 V adapter is also powered from the switched circuit.

The [Q0 purchase link](https://www.masterelectronics.com/en/productdetail/littelfuse-carling-technologies/ca1b024615121dg-16947583.html) identifies the selected product. Exact-SKU stock, site fault-current suitability and startup behavior remain to be confirmed.

## Experiment data workflow

Use **standalone logging during prints, then offline batch downloads**. Synchronize the logger clock and job/phase timestamps before the series. Keep the same validated interval for comparisons and check memory capacity. Preserve raw exports before clearing memory.

The DENT manual identifies non-volatile memory, included USB and USB-powered readout. It also requires rated insulation for the supplied USB cable inside a powered electrical panel. The user selected closed-lid offline export. The external kit cable is removed before mains operation, but the short internal cable stays installed. It therefore requires the selected black FIT-221 600 V sleeve and accepted end protection, restraint and application process. The NAUSB-W is a passive feedthrough, not a mains isolation barrier. See [USB construction and acceptance](build.html). [DENT manual, printed pp. 7, 18, 29, 119](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf).

Prove the setup with one supervised print cycle and offline export, including startup, phase timestamps, final records and restart behavior, before collecting the experimental series. The website does not claim that physical validation has happened. [Operating sequence](documents.html#operation).
