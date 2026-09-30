"""Flat Phoenix DIN support; millimetres. Cut, drill and deburr, no bending.

Vendor interfaces: two Wurth 970650581 M5 posts at the project 76 mm pitch;
Phoenix 1207639 rail and a dedicated #10 bond at the project 48 mm pitch.
These vendor interfaces are outside the skill's bundled standards database.
Sheet thickness is a provisional design value; measure the offered aluminum.
Local Z=0 is the rail-facing surface, with stock extending toward negative Z.
"""
import json
from pathlib import Path
from build123d import (BuildPart, BuildSketch, Plane, Locations, Rectangle,
                      Circle, SlotOverall, extrude, Mode)

root = Path(__file__).resolve().parents[2]

def parameters():
    return json.loads((root / 'layout_dimensions.json').read_text())['q0Mount']

def interfaces():
    return []

def build():
    p = parameters()
    with BuildPart() as plate:
        with BuildSketch(Plane.XY):
            Rectangle(2*p['outerHalfWidthMm'], p['heightMm'])
        extrude(amount=-p['stockThicknessMm'])
        with BuildSketch(Plane.XY):
            with Locations((-p['wallScrewHalfPitchMm'], 0)):
                Circle(p['wallHoleDiameterMm']/2)
            with Locations((p['wallScrewHalfPitchMm'], 0)):
                SlotOverall(8, p['wallHoleDiameterMm'])
            with Locations((-24, 0)): Circle(2.65)
            with Locations((24, 0)): Circle(2.25)
        extrude(amount=-p['stockThicknessMm']-1, mode=Mode.SUBTRACT)
    return plate.part

def checks():
    return [
        {'feature':'Both M5 support screws clear', 'clear':{'cylinder':5,'axis':'z','at':[[-38,0],[38,0]],'span':[-3,1]}},
        {'feature':'Dedicated #10 bond shaft clears', 'clear':{'cylinder':4.83,'axis':'z','at':[[-24,0]],'span':[-3,1]}},
        {'feature':'Rail M4 shaft clears', 'clear':{'cylinder':4,'axis':'z','at':[[24,0]],'span':[-3,1]}},
        {'feature':'Central web remains', 'material':{'box':[12,12,1],'at':[[0,0,-.95]]}},
        {'feature':'88 mm blank width', 'bbox_x':{'max':88.1}},
        {'feature':'40 mm blank height', 'bbox_y':{'max':40.1}},
        {'feature':'Flat sheet, no formed depth', 'bbox_z':{'max':2.0}},
    ]
