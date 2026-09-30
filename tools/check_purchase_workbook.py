"""Read-only verification of the exported Excel against the purchasing source."""
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
data = json.loads((ROOT / 'procurement.json').read_text())['purchasing']
with ZipFile(ROOT / 'downloads/purchase-request.xlsx') as archive:
    workbook = ET.fromstring(archive.read('xl/workbook.xml'))
    names = [s.attrib['name'] for s in workbook.findall('m:sheets/m:sheet', NS)]
    assert names == ['DigiKey', 'Home Depot'], names
    strings = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        strings = [''.join(si.itertext()) for si in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
    all_total = 0
    for n, seller in enumerate(names, 1):
        sheet = ET.fromstring(archive.read(f'xl/worksheets/sheet{n}.xml'))
        cells = {c.attrib['r']: c for c in sheet.findall('.//m:sheetData/m:row/m:c', NS)}
        def value(address):
            c = cells[address]
            if c.attrib.get('t') == 'inlineStr':
                return ''.join(c.find('m:is', NS).itertext())
            v = c.find('m:v', NS).text
            if c.attrib.get('t') == 's':
                return strings[int(v)]
            return v if c.attrib.get('t') in ('str', 'b') else float(v)
        rows = [r for r in data['rows'] if r['seller'] == seller]
        assert sheet.find('.//m:pane', NS).attrib == {
            'xSplit': '4', 'ySplit': '7', 'topLeftCell': 'E8',
            'activePane': 'bottomRight', 'state': 'frozen'}
        assert len(sheet.findall('m:dataValidations/m:dataValidation', NS)) == 2
        for i, row in enumerate(rows, 8):
            fields = row['request']
            expected = {'A': row['quantity'], 'B': 'feet' if row['unit'] == 'ft' else 'each',
                        'C': row['unit_price_usd'], 'D': fields['catalog_number'],
                        'E': fields['description'], 'F': row['url'], 'G': 'Professor to confirm',
                        'H': 'No', 'I': 'Unchecked', 'M': fields['manufacturer_part_number']}
            for col, wanted in expected.items():
                assert value(f'{col}{i}') == wanted, (seller, i, col, value(f'{col}{i}'), wanted)
            assert cells[f'D{i}'].attrib.get('t') in ('str', 's', 'inlineStr'), 'Catalog numbers must stay text'
            assert cells[f'C{i}'].attrib.get('t') == 'n', 'Prices must stay numeric'
            assert cells[f'J{i}'].find('m:f', NS).text == f'ROUND(A{i}*C{i},2)'
            assert round(value(f'J{i}') * 100) == round(row['extended_usd'] * 100)
        assert f'A{8+len(rows)}' not in cells, 'Unexpected extra purchase row'
        subtotal = sum(round(row['extended_usd'] * 100) for row in rows)
        assert round(value('E3') * 100) == subtotal
        assert cells['E3'].find('m:f', NS).text == f'SUM(J8:J{7+len(rows)})'
        assert not [c for c in cells.values() if c.attrib.get('t') == 'e'], 'Excel formula errors'
        all_total += subtotal
        print(f'{seller}: {len(rows)} exact field sets, cached formulas, numeric prices and frozen panes verified')
    assert all_total == round(data['material_subtotal_usd'] * 100)
    print(f'Total: ${all_total / 100:.2f}; workbook matches current procurement data')
