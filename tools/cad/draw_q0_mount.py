"""Cut-and-drill drawing for the flat Q0 bridge; no bend allowance. Units mm."""
import json
from pathlib import Path
import ezdxf
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Arc

def drawing(out):
    root=Path(__file__).resolve().parents[2]
    p=json.loads((root/'layout_dimensions.json').read_text())['q0Mount']
    w,h,t=2*p['outerHalfWidthMm'],p['heightMm'],p['stockThicknessMm']
    holes=[('Left M5 post',6,5.5,None),('Dedicated PE stud',20,5.3,None),
           ('Rail M4 fixing',68,4.5,None),('Right M5 post',82,5.5,8)]
    doc=ezdxf.new('R2010');doc.units=4
    for layer,col in [('CUT',7),('TEXT',2)]:doc.layers.new(layer,dxfattribs={'color':col})
    ms=doc.modelspace();cut={'layer':'CUT'}
    ms.add_lwpolyline([(0,0),(w,0),(w,h),(0,h)],close=True,dxfattribs=cut)
    fig,ax=plt.subplots(figsize=(11.7,8.3));ax.add_patch(Rectangle((0,0),w,h,fill=False))
    for label,x,dia,slot in holes:
        r=dia/2
        if slot:
            a=(slot-dia)/2
            for y in [h/2-r,h/2+r]:
                ms.add_line((x-a,y),(x+a,y),dxfattribs=cut);ax.plot([x-a,x+a],[y,y],color='black')
            for c,start,end in [(x+a,270,90),(x-a,90,270)]:
                ms.add_arc((c,h/2),r,start,end,dxfattribs=cut)
                ax.add_patch(Arc((c,h/2),dia,dia,theta1=start,theta2=end))
        else:
            ms.add_circle((x,h/2),r,dxfattribs=cut);ax.add_patch(Circle((x,h/2),r,fill=False))
        ax.annotate(label,(x,h/2),(x,49),ha='center',fontsize=8,arrowprops={'arrowstyle':'-','lw':.5})
    ax.set(xlim=(-8,w+8),ylim=(-8,58),aspect='equal',xlabel='X from left edge (mm)',ylabel='Y from bottom edge (mm)')
    fig.suptitle('Q0 FLAT ALUMINUM BRIDGE / CUT AND DRILL',x=.06,ha='left',weight='bold')
    fig.text(.06,.89,f'Blank {w:g} × {h:g} mm; nominal t={t:.5f} mm. Two purchased 65 mm M5 posts. No bends or tapped holes.',fontsize=10)
    fig.subplots_adjust(left=.08,right=.94,top=.83,bottom=.42)
    rows=[[label,f'{x:.2f}',f'{h/2:.2f}',f'{slot:g} × {dia:g} slot' if slot else f'Ø{dia:g}'] for label,x,dia,slot in holes]
    ta=fig.add_axes([.12,.20,.76,.16]);ta.axis('off')
    table=ta.table(cellText=rows,colLabels=['Feature','X','Y','Cut'],loc='center',cellLoc='left');table.auto_set_font_size(False);table.set_fontsize(9);table.scale(1,1.3)
    fig.text(.06,.055,'Measure offered aluminum before cutting; update sheet thickness and screw engagement if needed. Deburr all edges.\nRight slot: drill two Ø5.5 bores 2.5 mm apart and join; final centers span 76 mm. Hole position ±0.12 mm.\nCut 60 mm from purchased 250 mm rail; transfer-drill at ±24 mm away from Q0 and end stops.\nCUT layer contains only the outline and holes. Confirm operator travel, post retention and accepted PE contact stack.',fontsize=8)
    doc.saveas(out/'q0-mount-flat.dxf');fig.savefig(out/'q0-mount-flat.svg')
    (out/'q0-mount-development.json').write_text(json.dumps(dict(blank_mm=[w,h],thickness_mm=t,process='Cut, drill, slot and deburr; no bends',post_length_mm=65,status='Nominal design; measure stock and dry-fit before machining'),indent=2)+'\n')
    return fig
