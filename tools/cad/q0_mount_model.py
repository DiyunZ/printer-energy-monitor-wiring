"""Phoenix 2907571 formed aluminum rail bracket, millimetres.

Cut/drill and brake-form the measured professor-supplied aluminum; no printed
plastic load-bearing mount. Nominal stock 1.89738 mm, inside bend R2, K=0.4
is a first-article assumption. Check an offcut before developing a production
flat blank. Vendor dimensions are outside the skill's standards database.
Local X is across, Y is up, Z=0 contacts the inside front wall. Negative Z
points into the enclosure. Source dimensions live in layout_dimensions.json.
"""
import json
from pathlib import Path
from build123d import (BuildPart, BuildSketch, Plane, Polygon, Locations,
                      Circle, SlotOverall, extrude, Mode, fillet)

root = Path(__file__).resolve().parents[2]

def parameters():
    return json.loads((root / 'layout_dimensions.json').read_text())['q0Mount']

def interfaces():
    return []

def build():
    p = parameters()
    t, depth, height = p['stockThicknessMm'], p['webFrontDepthMm'], p['heightMm']
    a, b = p['armInnerHalfWidthMm'], p['outerHalfWidthMm']
    # Uniform-thickness omega section. Four R2 inside bends, matching outer R+t.
    pts = [(-b,0),(-a,0),(-a,-depth),(a,-depth),(a,0),(b,0),
           (b,-t),(a+t,-t),(a+t,-depth-t),(-a-t,-depth-t),(-a-t,-t),(-b,-t)]
    inner = [(-a,-depth),(a,-depth),(a+t,-t),(-a-t,-t)]
    outer = [(-a,0),(a,0),(a+t,-depth-t),(-a-t,-depth-t)]
    plane = Plane((0,height/2,0), x_dir=(1,0,0), z_dir=(0,-1,0))
    with BuildPart() as part:
        with BuildSketch(plane) as section:
            Polygon(*pts, align=None)
            # Coordinates on this plane are X / Z.
            def at(points):
                return [v for v in section.vertices() if any(abs(v.X-x)<1e-5 and abs(v.Z-z)<1e-5 for x,z in points)]
            fillet(at(inner), p['insideBendRadiusMm'])
            fillet(at(outer), p['insideBendRadiusMm']+t)
        extrude(amount=height)
        for x in [-p['wallScrewHalfPitchMm'],p['wallScrewHalfPitchMm']]:
            with BuildSketch(Plane.XY):
                with Locations((x,0)):
                    if x < 0: Circle(1.65)
                    else: SlotOverall(6,3.3)
            extrude(amount=5,both=True,mode=Mode.SUBTRACT)
        with BuildSketch(Plane((0,0,-depth), x_dir=(1,0,0), z_dir=(0,0,1))):
            with Locations((-24,0)): Circle(2.65)  # dedicated #10 rail/bracket bond
            with Locations((24,0)): SlotOverall(7,4.5)
        extrude(amount=5,both=True,mode=Mode.SUBTRACT)
    return part.part

def checks():
    p=parameters();d=p['webFrontDepthMm']
    return [
        {'feature':'Both M3 wall shafts clear', 'clear':{'cylinder':3,'axis':'z','at':[[-38,0],[38,0]],'span':[-4,1]}},
        {'feature':'Dedicated #10 bonding shaft clears web', 'clear':{'cylinder':4.83,'axis':'z','at':[[-24,0]],'span':[-d-3,-d+1]}},
        {'feature':'Rail M4 shaft clears web', 'clear':{'cylinder':4,'axis':'z','at':[[24,0]],'span':[-d-3,-d+1]}},
        {'feature':'Body clearance between arms', 'clear':{'box':[20,35,50],'at':[[0,0,-28]]}},
    ]
