from pathlib import Path
from PIL import Image
import json,colorsys
s=Path(__file__).parent;p=Path('C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536');out=s/'prototype';out.mkdir(exist_ok=True)
ident='mage-masculine';metas={k:json.loads((p/f'artwork/iteration37/masters/{ident}-{k}.png.json').read_text(encoding='utf-8')) for k in ['main','actions']};images={k:Image.open(p/f'artwork/iteration37/originals/{ident}-{k}.png').convert('RGBA') for k in metas}
mapping=[]
for d in range(4):
 for f in range(36):
  kind='main';col=0
  if 2<=f<18:col=[1,2,3,0][((f-(10 if f>=10 else 2))//2)%4]
  if f in [18,19,20]:kind='actions';col=6 if f==18 else 7
  if f in [22,23,24,25,26,27,28]:kind='actions';col=6 if f in [22,24,25] else 7
  if f==30:col=6
  if f in [13,15,32]:col=7
  mapping.append({'direction':d,'frame':f,'source':kind,'sourceColumn':col})
records=[]
for size in [96,128,192,256,320]:
 atlas=Image.new('RGBA',(9*size,16*size));mask=Image.new('RGBA',atlas.size,(0,0,0,255));frames=[]
 for i,m in enumerate(mapping):
  meta=metas[m['source']];ref=meta['frames'][m['direction']*8+m['sourceColumn']];x0,y0,x1,y1=ref['sourceBounds'];crop=images[m['source']].crop((x0,y0,x1+1,y1+1));ratio=size/96;scale=metas['main']['scale']*ratio
  # Preserve source aspect ratio and a stable floor pivot. Source coordinates
  # come from the original production packing manifest, never a guessed grid.
  ww,hh=round(crop.width*scale),round(crop.height*scale);q=crop.resize((ww,hh),Image.Resampling.LANCZOS);x=round(size/2-ww/2);y=round(size*88/96)-hh;assert x>=2 and y>=2 and x+ww<size-1
  frame=Image.new('RGBA',(size,size));frame.alpha_composite(q,(x,y));atlas.alpha_composite(frame,(i%9*size,i//9*size));fm=Image.new('RGBA',(size,size),(0,0,0,255));px=fm.load()
  for yy in range(size):
   for xx in range(size):
    r,g,b,a=frame.getpixel((xx,yy));h,_,_=colorsys.rgb_to_hsv(r/255,g/255,b/255);h*=360
    if a>127:
     if 203<=h<255 and b>r*1.2:px[xx,yy]=(255,0,0,255)
     elif 255<=h<303 and b>g*1.2:px[xx,yy]=(0,255,0,255)
  mask.paste(fm,(i%9*size,i//9*size));frames.append({**m,'sourceBounds':ref['sourceBounds'],'bounds':[x,y,x+ww,y+hh]})
 atlas.save(out/f'mage-{size}.png');mask.save(out/f'mage-{size}-mask.png');records.append({'cell':size,'columns':9,'rows':16,'feetY':size*88/96,'frames':frames,'note':'Experimental original walk and actions; not the RV1 repaired gait. Source defects and repeated poses are deliberately recorded, not accepted for production.'})
(out/'metadata.json').write_text(json.dumps(records,indent=2),encoding='utf-8');print('Five original-source resolutions prepared without changing production.')
