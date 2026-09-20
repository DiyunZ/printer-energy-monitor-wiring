"""Regression checks reject dangerous changes to the illustrated connectivity."""
import copy
import unittest
from unittest.mock import patch
import build_routes as drawing


class RoutingChecks(unittest.TestCase):
    def setUp(self):
        self.wires = copy.deepcopy(drawing.wires)

    def assert_rejected(self, reason):
        with patch.object(drawing, 'wires', self.wires), self.assertRaisesRegex(AssertionError, reason):
            drawing.validate()

    def reconnect(self, index, start):
        wire = self.wires[index]
        wire['start'] = start
        a, b = drawing.A[start], drawing.A[wire['end']]
        wire['points'] = [a, (b[0], a[1]), b]

    def test_current_design(self):
        self.assertEqual(drawing.validate()['circuit_breaker_count'], 1)

    def test_fused_transition_cannot_connect_to_neutral(self):
        self.reconnect(23, 'JN.5')
        self.assert_rejected('D.L1')

    def test_voltage_tap_cannot_bypass_fuse(self):
        self.reconnect(4, 'JL.3')
        self.assert_rejected('L1 sensing must not bypass Fv')

    def test_pe_connectors_require_the_physical_bridge(self):
        self.reconnect(24, 'JPE.B2')
        self.assert_rejected('must remain on protective earth')

    def test_l2_cannot_be_connected_to_pe(self):
        self.reconnect(7, 'JPE.3')
        self.assert_rejected('D.L2 must remain on neutral')

    def test_printer_neutral_cannot_share_the_ct_aperture(self):
        wire = self.wires[6]
        left, top, right, bottom = drawing.CT_WINDOW
        a, b = drawing.A['JN.2'], drawing.A['OUT.N']
        y = (top + bottom) / 2
        wire['points'] = [a, (left-20,a[1]), (left-20,y), (right+20,y), (right+20,b[1]), b]
        self.assert_rejected('Only printer hot may cross the CT aperture')

    def test_aux_hot_cannot_bypass_q0(self):
        self.reconnect(16, 'IN.L')
        self.assert_rejected('Hot branches must start at JL after Q0, before CT')

    def test_aux_tap_cannot_move_to_metered_output(self):
        self.reconnect(16, 'OUT.L')
        self.assert_rejected('Hot branches must start at JL after Q0, before CT')

    def test_unrelated_terminal_dot_cannot_be_crossed(self):
        wire = self.wires[3]
        a, n, b = drawing.A['JL.3'], drawing.A['JN.3'], drawing.A['Fv.IN']
        wire['points'] = [a, n, (b[0],n[1]), b]
        self.assert_rejected('crosses an unrelated terminal dot: JN.3')

    def test_ct_plus_cannot_become_a_mains_input(self):
        self.reconnect(13, 'JL.1')
        self.assert_rejected('Mains, PE, CT, DC and USB nets must remain separate')

    def test_distinct_signal_wires_cannot_share_a_drawn_segment(self):
        wire = self.wires[14]
        a, b = drawing.A['CT.-'], drawing.A['D.-']
        y = drawing.wires[13]['points'][1][1]
        x = drawing.project((140,0))[0]
        wire['points'] = [a, (a[0],y), (x,y), (x,b[1]), b]
        self.assert_rejected('Wire segments overlap: 14 / 15')


if __name__ == '__main__':
    unittest.main()
