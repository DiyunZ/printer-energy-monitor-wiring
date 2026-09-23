"""Prevent UI hardware locations from drifting away from the machining datums."""
import ast
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class InstallationDatums(unittest.TestCase):
    def test_panel_datums_match_machining_source(self):
        source = ast.parse((ROOT / 'tools/cad/enclosure_model.py').read_text())
        constants = {}
        for node in source.body:
            if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
                try:
                    constants[node.targets[0].id] = ast.literal_eval(node.value)
                except (ValueError, TypeError):
                    pass
        hardware = json.loads((ROOT / 'layout_dimensions.json').read_text())['installationHardware']
        self.assertEqual(hardware['cableMountsXZ'], [s['holeXZ'] for s in hardware['cableSupports']])
        self.assertEqual(len(hardware['cableSupports']), 6)
        for modeled, machined in [('cableMountsXZ', 'anchor_holes_xz_mm'),
                                   ('panelBondXZ', 'panel_bond_xz_mm')]:
            # JSON normalizes CAD tuples to arrays, retaining every coordinate.
            self.assertEqual(hardware[modeled], json.loads(json.dumps(constants[machined])), modeled)
        power_slots = [[strap['x'], z] for strap in hardware['equipmentStraps'] for z in strap['slotZ']]
        self.assertEqual(power_slots, json.loads(json.dumps(constants['equipment_slots_xz_mm'])))
        self.assertEqual({s['part'] for s in hardware['equipmentStraps']}, {'outlet', 'adapter'})
        dimensions = json.loads((ROOT / 'layout_dimensions.json').read_text())
        usb = dimensions['usbService']
        port = next(p for p in dimensions['instances'] if p['id'] == 'usb-entry')
        self.assertEqual(usb['wallCenterYZ'], list(constants['usb_yz_mm']))
        self.assertEqual(port['position'][1:], usb['wallCenterYZ'])
        self.assertEqual(usb['fixingLocalUV'], json.loads(json.dumps(constants['usb_fixing_uv_mm'])))
        self.assertEqual(port['boreDiameterMm'], constants['usb_bore_d_mm'])
        self.assertEqual(port['fixingHoleDiameterMm'], constants['usb_fixing_d_mm'])


if __name__ == '__main__':
    unittest.main()
