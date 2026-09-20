# Protection and data review

September 20, 2026 · 120 V grounded supply · one printer at a time.

**Q0 and Fv are not fully released for ordering.** The checks below resolve published component ratings and fit. Actual outlet fault current, combined startup duty and protection of the existing voltage leads remain unverified. No hardware test or qualified acceptance has been recorded.

| Item | Verified | Decision |
|---|---|---|
| Q0, CA1-B0-24-615-121-DG | 15 A, delay 24, UL489 option; 10 kA interrupting rating at 120 V AC | Keep selected model on hold for site and startup confirmation; exact-SKU stock needs a quote. |
| Fv, KLKR.500T / LPSC0001Z | 0.5 A, Class CC, 600 V AC; cartridge/holder match | Keep the fuse on hold for external-lead protection and startup coordination. |
| USB cable | Included in DENT kit; use the lid-pocket cable | No routine purchase. Confirm it is present; use only for offline service. |
| DC entry | Tensility round extension with KVT 32 / 41380 | Quantity reduced to one frame and one insert; USB opening removed. |

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

## Fv: fit is verified, lead protection is still open

KLKR.500T is a **0.5 A fast-acting Class CC** fuse, **600 V AC**, nominal **10.3 × 38.1 mm**, with **200 kA AC interrupting rating**. Littelfuse lists LPSC as a compatible holder family. This confirms the selected cartridge/holder interface; it does not rate the whole enclosure for 200 kA. The datasheet's tabulated clearing-energy values do not include the 0.5 A version, so no smaller-lead withstand calculation has been inferred from a different rating. [Littelfuse KLKR datasheet](https://www.littelfuse.com/assetdocs/klkr-classcc-fuse-datasheet-final?assetguid=4443e5f6-97ee-4206-9abe-9e155371a03e).

DENT specifies up to **125 mA line input** and an internal 0.5 A fuse. The separate OEM fused crocodile accessory uses a 500 mA fuse. That supports an OEM protected measurement connection, but matching the ampere number does not establish equivalent protection for an external KLKR fuse with LD-SKTSP-BLU pigtails. The internal meter fuse cannot protect a lead fault upstream of the meter. [DENT XC specification](https://www.dentinstruments.com/wp-content/uploads/ELITEproXC_Datasheet_01272026.pdf), [DENT fused accessory](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-fused-crocodile-clip/).

The blue pigtail listing does not state conductor size, short-circuit withstand or an approved external protective device. That missing information cannot be recovered reliably from its blue jacket or apparent thickness. [DENT LD-SKTSP-BLU](https://www.dentinstruments.com/shop/elitepro-accessories-replacement-parts/replacement-unterminated-voltage-leads-10-for-elitepro-series/).

**Manufacturer confirmation request — draft, not sent:**

> Can DENT approve a Littelfuse KLKR.500T (0.5 A fast-acting Class CC) in LPSC0001Z ahead of an LD-SKTSP-BLU pigtail plus the original voltage lead feeding ELITEpro XC L1 at 120 V? L2 and N connect to neutral; the supplied 9 V adapter is also powered from the switched circuit. Please provide the supported lead conductor/termination data, short-circuit protection requirements and logger energization/inrush compatibility, or specify an approved protective accessory and installation method. The proposed hot path is Q0 → JL → Fv → 14 AWG → JV → pigtail → original lead → L1.

The existing buy links identify exact products; they are not approval to bypass these checks. [Q0 supplier / quote](https://www.mouser.com/ProductDetail/Carling-Technologies/CA1-B0-24-615-121-DG?qs=vln4JGBFwFoweMB2W4WfRg%3D%3D), [Fv supplier](https://www.digikey.com/en/products/detail/littelfuse-ibu/KLKR-500T/2518128). Verify live stock and lead time at checkout.

## Experiment data workflow

Use **standalone logging during prints, then offline batch downloads**. Synchronize the logger clock and job/phase timestamps before the series. Keep the same validated interval for comparisons and check memory capacity. Preserve raw exports before clearing memory.

The DENT manual identifies non-volatile memory, included USB and USB-powered readout. It also requires rated insulation for the supplied USB cable inside a powered electrical panel. Here the cable is removed before mains operation, so no permanent USB entry or additional energized-USB sleeve is selected. [DENT manual, printed pp. 7, 18, 29, 119](https://www.dentinstruments.com/wp-content/uploads/EXC_ELOG19_11-15-24.pdf).

Prove the setup with one supervised print cycle and offline export, including startup, phase timestamps, final records and restart behavior, before collecting the experimental series. The website does not claim that physical validation has happened. [Operating sequence](documents.html#operation).
