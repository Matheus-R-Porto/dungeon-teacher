from pathlib import Path
from PIL import Image,ImageChops
import json
s=Path(__file__).parent;errors=[];cells=0;files=0
for folder,size,cols,frames in [('repaired',96,9,36),('professions',128,8,16)]:
 for f in (s/folder).glob('*-mask.png'):
  im=Image.open(f.with_name(f.name.replace('-mask',''))).convert('RGBA');m=Image.open(f).convert('RGBA');r,g,b,a=m.split();files+=1
  if ImageChops.multiply(r,g).getbbox():errors.append(f.name+': overlapping palette')
  if ImageChops.multiply(ImageChops.lighter(r,g),ImageChops.invert(im.getchannel('A'))).getbbox():errors.append(f.name+': palette outside silhouette')
  for i in range(frames*4):
   q=im.crop((i%cols*size,i//cols*size,i%cols*size+size,i//cols*size+size));bb=q.getbbox();cells+=1
   if not bb or min(bb[:2])==0 or bb[2]>=size or bb[3]>=size:errors.append(f'{f.name}: empty/clipped cell {i}')
  if folder=='professions':
   meta=json.loads(f.with_name(f.name.replace('-mask.png','.json')).read_text(encoding='utf-8'))
   for rec in meta['records']:
    i=rec['direction']*16+rec['frame'];q=im.crop((i%8*128,i//8*128,i%8*128+128,i//8*128+128))
    for xy in rec['hands']+[rec['tip']]:
     if q.getpixel(tuple(xy))[3]<128:errors.append(f'{f.name}: missing hand/tip {i}')
repairs=json.loads((s/'repairs.json').read_text(encoding='utf-8'))['repairs'];checked=0
cache={}
for rec in repairs:
 if rec['atlas'] not in cache:cache[rec['atlas']]=Image.open(s/'repaired'/(rec['atlas']+'.png')).convert('RGBA')
 im=cache[rec['atlas']];i=rec['direction']*36+rec['frame']
 for x,y in rec['garmentPixels']:
  checked+=1
  if im.getpixel((i%9*96+x,i//9*96+y))[3]<128:errors.append('Known repaired costume pixel remains transparent')
r={'ok':not errors,'atlasMaskPairs':files,'cells':cells,'targetedGarmentPixelsVerified':checked,'errors':errors};(s/'integrity-audit.json').write_text(json.dumps(r,indent=2),encoding='utf-8');print(json.dumps(r));raise SystemExit(bool(errors))
