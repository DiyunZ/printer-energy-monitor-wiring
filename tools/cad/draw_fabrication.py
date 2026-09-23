"""Generate dimensioned setup drawings and 1:1 DXF cut layers from CAD parameters.
No carrier fixing-hole positions are invented: locator outlines are on REFERENCE.
"""
import json, math
from pathlib import Path
import ezdxf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, FancyBboxPatch
from matplotlib.backends.backend_pdf import PdfPages
import enclosure_model as model
root=Path(__file__).resolve().parents[2]
out=root/'fabrication'
dim=json.loads((root/'layout_dimensions.json').read_text())
slope=model.wall_slope
c=1/math.sqrt(1+slope*slope)


def drawing(name, features, width, height, note):
    doc=ezdxf.new('R2010');doc.units=4
    for layer,color in [('CUT',7),('REFERENCE',4),('TEXT',2)]: doc.layers.new(layer,dxfattribs={'color':color})
    ms=doc.modelspace()
    fig,ax=plt.subplots(figsize=(11.7,8.3))
    rows=[]
    for i,f in enumerate(features,1):
        u,v=f['uv']; style={'layer':'CUT'}
        if 'rect' in f:
            w,h=f['rect'];ms.add_lwpolyline([(u-w/2,v-h/2),(u+w/2,v-h/2),(u+w/2,v+h/2),(u-w/2,v+h/2)],close=True,dxfattribs=style)
            ax.add_patch(Rectangle((u-w/2,v-h/2),w,h,fill=False,lw=1.2));size=f'{w:.2f} x {h:.2f}'
        elif 'slot' in f:
            length,diameter=f['slot'];r=diameter/2;straight=length-diameter
            if f.get('rotation',90)==0:
                ms.add_line((u-straight/2,v-r),(u+straight/2,v-r),dxfattribs=style);ms.add_line((u-straight/2,v+r),(u+straight/2,v+r),dxfattribs=style)
                ms.add_arc((u+straight/2,v),r,270,90,dxfattribs=style);ms.add_arc((u-straight/2,v),r,90,270,dxfattribs=style)
                w,h=length,diameter
            else:
                ms.add_line((u-r,v-straight/2),(u-r,v+straight/2),dxfattribs=style);ms.add_line((u+r,v-straight/2),(u+r,v+straight/2),dxfattribs=style)
                ms.add_arc((u,v+straight/2),r,0,180,dxfattribs=style);ms.add_arc((u,v-straight/2),r,180,360,dxfattribs=style)
                w,h=diameter,length
            ax.add_patch(FancyBboxPatch((u-w/2,v-h/2),w,h,boxstyle=f'round,pad=0,rounding_size={r}',fill=False,lw=1.2));size=f'{length:g} x {diameter:g} slot R{r:g}'
        else:
            r=f['diameter']/2;ms.add_circle((u,v),r,dxfattribs=style);ax.add_patch(Circle((u,v),r,fill=False,lw=1.2));size=f'D{2*r:.2f}'
        ax.plot([u-2,u+2],[v,v],color='#617989',lw=.6);ax.plot([u,u],[v-2,v+2],color='#617989',lw=.6)
        ax.annotate(str(i),(u+3,v+3),fontsize=8,color='#145987')
        ms.add_text(str(i),dxfattribs={'height':2.5,'layer':'TEXT','insert':(u+3,v+3)})
        rows.append([str(i),f['id'],f'{u:.2f}',f'{v:.2f}',size])
    if name=='panel':
        for p in dim['instances']:
            if p['part']!='terminals':continue
            x,_,z=p['position'];w,_,h=p['size'];v=-z
            coords=[(x-w/2,v-h/2),(x+w/2,v-h/2),(x+w/2,v+h/2),(x-w/2,v+h/2)]
            ms.add_lwpolyline(coords,close=True,dxfattribs={'layer':'REFERENCE'})
            ax.add_patch(Rectangle((x-w/2,v-h/2),w,h,fill=False,ec='#258283',ls='--',lw=.8));ax.text(x,v,p['id'],fontsize=8,ha='center',color='#258283')
        ax.add_patch(Rectangle((-width/2,-height/2),width,height,fill=False,ec='#80939d'))
        ax.set_xlim(-width/2-18,width/2+18);ax.set_ylim(-height/2-10,height/2+10)
    else:
        ax.set_xlim(-width/2,width/2);ax.set_ylim(0,height)
    ax.set_aspect('equal');ax.grid(alpha=.12);ax.axhline(0,c='#617989',lw=.8);ax.axvline(0,c='#617989',lw=.8)
    ax.set_xlabel('U (mm)');ax.set_ylabel('V (mm)');ax.set_title(name.upper()+' / Build package D',loc='left',fontsize=13,weight='bold')
    fig.subplots_adjust(left=.07,right=.58,bottom=.22 if name=='panel' else .14,top=.88)
    fig.text(.06,.95,'ENGINEERING REVIEW — release conditions in Build_Package.md',fontsize=9,color='#8c4d13')
    tableax=fig.add_axes([.62,.2,.36,.63]);tableax.axis('off')
    if not rows:
        rows=[['—','NO CUTS','—','—','Solid wall']]
        ms.add_text('NO CUTS - RIGHT WALL REMAINS SOLID',dxfattribs={'height':5,'layer':'TEXT','insert':(-160,100)})
        ax.text(0,100,'NO CUTS\nXA + DC remain inside',ha='center',va='center',color='#256853',fontsize=13)
    tab=tableax.table(cellText=rows,colLabels=['#','Feature','U','V','Cut size'],cellLoc='left',loc='upper left',colWidths=[.08,.34,.15,.15,.28]);tab.auto_set_font_size(False);tab.set_fontsize(7);tab.scale(1,1.5)
    fig.text(.06,.055,note+'\nCUT layer only. REFERENCE/TEXT are not cuts. Drawing not to scale; DXF units = mm.\nPosition tolerance +/-0.5 mm; Q0 relative pattern +/-0.12 mm; other bores +/-0.1 mm.\nReview against received parts before machining. Do not machine with equipment or supply connected.',fontsize=8)
    doc.saveas(out/(name+'.dxf'));fig.savefig(out/(name+'.svg'));return fig

with PdfPages(out/'Machining_Drawings.pdf') as pdf:
    for wall in ['front','right','left','rear']:
        features=[]
        for f in model.wall_features():
            if f['wall']!=wall:continue
            p=f['plane'].from_local_coords((*f.get('at',(0,0)),0));x,y,z=tuple(p)
            u={'front':x,'rear':-x,'right':-z,'left':z}[wall]
            features.append(f|{'uv':(u,y/c)})
        axes={'front':'U = X','rear':'U = -X','right':'U = -Z','left':'U = Z'}[wall]
        fig=drawing(wall,features,420 if wall in ['right','left'] else 365,200,
          f'Outside face view. {axes}; V = Y / cos(0.937 deg), measured up along wall.\nOrigin: wall plane at Y=0 and case centerline. Y=0 is the mounting-panel underside plane; use STEP datums to fixture.')
        pdf.savefig(fig);plt.close(fig)
    features=[f|{'uv':(f['at'][0],-f['at'][1])} for f in model.panel_features()]
    fig=drawing('panel',features,327.025,374.65,
        'View from lid. U = X; V = -Z. Origin: center of aluminum template. Rear = +V. Measure stock; transfer enclosure-support pattern.\nDashed WAGO carrier envelopes: locate as shown, then transfer-drill two D3.3 holes per actual carrier; do not cut outlines.')
    pdf.savefig(fig);plt.close(fig)
print('Generated five DXFs, five SVGs and five-page machining drawing PDF.')
