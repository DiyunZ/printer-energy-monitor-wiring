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


if __name__ == '__main__':
    unittest.main()
