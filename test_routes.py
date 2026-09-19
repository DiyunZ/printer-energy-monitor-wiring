"""Regression checks reject dangerous changes to the illustrated connectivity."""
import copy
import unittest
from unittest.mock import patch
import build_routes as drawing


class RoutingChecks(unittest.TestCase):
    def setUp(self):
        self.wires = copy.deepcopy(drawing.wires)

    def assert_rejected(self):
        with patch.object(drawing, 'wires', self.wires), self.assertRaises(AssertionError):
            drawing.validate()

    def test_current_design(self):
        self.assertEqual(drawing.validate()['circuit_breaker_count'], 1)

    def test_outlet_box_cannot_be_bonded_to_neutral(self):
        wire = self.wires[23]
        wire['start'] = 'JN.5'
        wire['points'][0] = drawing.A['JN.5']
        self.assert_rejected()

    def test_l2_cannot_be_connected_to_pe(self):
        wire = self.wires[7]
        wire['start'] = 'JPE.3'
        wire['points'][0] = drawing.A['JPE.3']
        self.assert_rejected()

    def test_printer_neutral_cannot_share_the_ct_aperture(self):
        wire = self.wires[6]
        wire['points'] = [drawing.A['JN.2'], (800, 350), (800, 270),
                          (1200, 270), (1200, 350), drawing.A['OUT.N']]
        self.assert_rejected()

    def test_aux_hot_cannot_bypass_q0(self):
        wire = self.wires[16]
        wire['start'] = 'IN.L'
        wire['points'] = [drawing.A['IN.L'], (180, 770), drawing.A['AUX.L']]
        self.assert_rejected()

    def test_aux_tap_cannot_move_to_metered_output(self):
        wire = self.wires[16]
        wire['start'] = 'OUT.L'
        wire['points'] = [drawing.A['OUT.L'], (1390, 600), (300, 600),
                          (300, 770), drawing.A['AUX.L']]
        self.assert_rejected()

    def test_unrelated_terminal_dot_cannot_be_crossed(self):
        wire = self.wires[3]
        wire['points'] = [drawing.A['JL.3'], (630, 540), drawing.A['Fv.IN']]
        self.assert_rejected()

    def test_ct_plus_cannot_become_a_mains_input(self):
        wire = self.wires[13]
        wire['start'] = 'JL.1'
        wire['points'] = [drawing.A['JL.1'], (550, 665), (1260, 665), drawing.A['D.+']]
        self.assert_rejected()


if __name__ == '__main__':
    unittest.main()
