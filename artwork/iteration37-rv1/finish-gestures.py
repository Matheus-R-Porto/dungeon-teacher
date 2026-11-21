from pathlib import Path
from PIL import Image,ImageDraw
import runpy,json
s=Path(__file__).parent;m=runpy.run_path(str(s/'refine-art.py'));cell,place,maskmat=m['cell'],m['place'],m['material']
def region_mask(im):
 import colorsys
 out=Image.new('RGBA',(96,96),(0,0,0,255));a=out.load()
 for y in range(96):
  for x in range(96):
   r,g,b,alpha=im.getpixel((x,y));h,ss,v=colorsys.rgb_to_hsv(r/255,g/255,b/255);h*=360
   if alpha>127:
    if 203<=h<255 and b>r*1.2:a[x,y]=(255,0,0,255)
    elif 255<=h<303 and b>g*1.2:a[x,y]=(0,255,0,255)
 return out
def gesture(base,d,kind):
 im=base.copy();regions=([(27,56,38,73),(58,56,69,73)] if d%2==0 else [(51,58,61,74)] if d==1 else [(35,58,45,74)])
 angles={'healPrepare':[55,-55],'healRelease':[-50,50],'support':[0,115],'area':[-80,80],'recover':[-22,22],'castRecover':[20,-20]}
 for i,(x0,y0,x1,y1) in enumerate(regions):
  arm=Image.new('RGBA',(96,96));ap=arm.load();px=im.load()
  for y in range(y0,y1):
   for x in range(x0,x1):
    r,g,b,a=px[x,y]
    if a and maskmat(r,g,b) not in ['blue','purple']:ap[x,y]=(r,g,b,a);px[x,y]=(0,0,0,0)
  angle=angles[kind][i] if d%2==0 else {'healPrepare':-45,'healRelease':-70,'support':-130,'area':-100,'recover':22,'castRecover':-25}[kind]*(1 if d==1 else -1)
  im.alpha_composite(arm.rotate(angle,resample=Image.Resampling.NEAREST,center=((x0+x1)//2,y0)))
 if kind in ['area','recover']:
  # Stable two-foot crouch: support legs do not advance as in walking.
  upper=im.crop((0,0,96,74));im.paste((0,0,0,0),(0,0,96,74));im.alpha_composite(upper,(0,2))
 return im
mapping={24:'castRecover',25:'healPrepare',26:'healRelease',27:'support',28:'area',31:'recover'}
for cls in m['classes']:
 for body in m['bodies']:
  ident=f'{cls}-{body}';baseAtlas=Image.open(s/'prepared'/f'{ident}-none.png').convert('RGBA');poses={(d,f):gesture(cell(baseAtlas,d,0),d,kind) for d in range(4) for f,kind in mapping.items()}
  for family in m['families']:
   p=s/'prepared'/f'{ident}-{family}.png';mp=s/'prepared'/f'{ident}-{family}-mask.png';atlas=Image.open(p).convert('RGBA');masks=Image.open(mp).convert('RGBA')
   for (d,f),pose in poses.items():place(atlas,pose,d,f);place(masks,region_mask(pose),d,f)
   atlas.save(p);masks.save(mp)
(s/'gesture-art.json').write_text(json.dumps({'frames':mapping,'method':'authored forearm silhouettes rotated offline without stretch; native costumes preserved; two-foot crouch recovery instead of a walk frame'},indent=2),encoding='utf-8');print('Distinct healing/support/area/recovery poses prepared for all 12 characters')
