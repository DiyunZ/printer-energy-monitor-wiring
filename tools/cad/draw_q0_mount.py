"""Provisional development for the four-bend Q0 rail bracket; units mm.
K=0.4 is a shop trial assumption, not a material property or released flat pattern.
"""
import json, math
from pathlib import Path
import ezdxf
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle,Circle

def drawing(out):
    root=Path(__file__).resolve().parents[2]
    p=json.loads((root/'layout_dimensions.json').read_text())['q0Mount']
    t=p['stockThicknessMm'];r=p['insideBendRadiusMm'];k=.4
    a=p['armInnerHalfWidthMm'];b=p['outerHalfWidthMm'];d=p['webFrontDepthMm'];h=p['heightMm']
    ba=math.pi/2*(r+k*t)
    flange=b-a-r-t;leg=d-t-2*r;web=2*a-2*r
    length=2*flange+2*leg+web+4*ba
    bends=[flange+ba/2,flange+1.5*ba+leg,length/2+web/2+ba/2,length-flange-ba/2]
    holes=[('Wall datum',b-p['wallScrewHalfPitchMm'],3.3,None),('PE stud',length/2-24,5.3,None),('Rail M4',length/2+24,4.5,7),('Wall slot',length-b+p['wallScrewHalfPitchMm'],3.3,6)]
    doc=ezdxf.new('R2010');doc.units=4
    for layer,col in [('CUT',7),('BEND_REFERENCE',4),('TEXT',2)]:doc.layers.new(layer,dxfattribs={'color':col})
    ms=doc.modelspace();ms.add_lwpolyline([(0,0),(length,0),(length,h),(0,h)],close=True,dxfattribs={'layer':'CUT'})
    fig,ax=plt.subplots(figsize=(11.7,8.3));ax.add_patch(Rectangle((0,0),length,h,fill=False))
    for label,x,dia,slot in holes:
        rad=dia/2
        if slot:
            s=(slot-dia)/2
            for y in [h/2-rad,h/2+rad]:ms.add_line((x-s,y),(x+s,y),dxfattribs={'layer':'CUT'});ax.plot([x-s,x+s],[y,y],color='black')
            for c,start,end in [(x+s,270,90),(x-s,90,270)]:ms.add_arc((c,h/2),rad,start,end,dxfattribs={'layer':'CUT'})
            from matplotlib.patches import Arc
            ax.add_patch(Arc((x+s,h/2),dia,dia,theta1=270,theta2=90));ax.add_patch(Arc((x-s,h/2),dia,dia,theta1=90,theta2=270))
        else:ms.add_circle((x,h/2),rad,dxfattribs={'layer':'CUT'});ax.add_patch(Circle((x,h/2),rad,fill=False))
        ax.annotate(label,(x,h/2),(x,53),ha='center',fontsize=8,arrowprops={'arrowstyle':'-','lw':.5})
    for i,x in enumerate(bends,1):
        ms.add_line((x,0),(x,h),dxfattribs={'layer':'BEND_REFERENCE'})
        ax.plot([x,x],[0,h],ls='--',lw=.8,color='#147885');ax.text(x,-5,f'B{i}\n{x:.2f}',ha='center',va='top',fontsize=8)
    ax.set(xlim=(-10,length+10),ylim=(-23,66),aspect='equal',xlabel='Flat X from left edge (mm)',ylabel='Y (mm)')
    fig.suptitle('Q0 METAL BRACKET / PROVISIONAL FLAT DEVELOPMENT',x=.06,ha='left',weight='bold')
    fig.text(.06,.89,f'Blank {length:.2f} × {h:g} mm; t={t:.5f} mm; inside R{r:g}; K={k:g}. Four 90° bends; B1/B4 oppose B2/B3.',fontsize=10)
    fig.subplots_adjust(left=.08,right=.94,top=.84,bottom=.45)
    rows=[[label,f'{x:.2f}',f'{h/2:.2f}',f'{slot:g} × {dia:g} slot' if slot else f'Ø{dia:g}'] for label,x,dia,slot in holes]
    tableax=fig.add_axes([.12,.20,.76,.16]);tableax.axis('off');table=tableax.table(cellText=rows,colLabels=['Feature','Flat X','Y','Cut'],loc='center',cellLoc='left');table.auto_set_font_size(False);table.set_fontsize(9);table.scale(1,1.3)
    fig.text(.06,.06,f'SHOP TRIAL REQUIRED: measure stock and make a bend coupon; adjust the flat pattern for actual tooling/springback.\nForm to STEP: {2*b:g} mm overall width, {2*a:g} mm arm opening, {d:.2f} mm inner web depth, {h:g} mm height; wall holes {2*p["wallScrewHalfPitchMm"]:g} mm apart.\nRail holes are 48 mm apart on the web. Cut 60 mm of purchased 250 mm rail; deburr and transfer-drill away from Q0/stops.\nCUT contains only outline and holes; BEND_REFERENCE/TEXT must not be cut. Accept both metal bonds and operator fit.',fontsize=8)
    doc.saveas(out/'q0-mount-flat.dxf');fig.savefig(out/'q0-mount-flat.svg')
    (out/'q0-mount-development.json').write_text(json.dumps(dict(blank_mm=[length,h],thickness_mm=t,inside_radius_mm=r,assumed_K=k,bend_centers_mm=bends,status='Provisional: measure stock and bend coupon before release'),indent=2)+'\n')
    return fig
