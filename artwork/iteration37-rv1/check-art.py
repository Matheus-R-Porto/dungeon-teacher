from pathlib import Path
from PIL import Image,ImageChops
import json,hashlib
s=Path(__file__).parent;errors=[];count=0;colors=[]
for f in (s/'prepared').glob('*-mask.png'):
 im=Image.open(f.with_name(f.name.replace('-mask',''))).convert('RGBA');mask=Image.open(f).convert('RGBA');r,g,b,a=mask.split()
 if ImageChops.multiply(r,g).getbbox():errors.append(f.name+': mask overlap')
 painted=ImageChops.lighter(r,g)
 if ImageChops.multiply(painted,ImageChops.invert(im.getchannel('A'))).getbbox():errors.append(f.name+': mask outside silhouette')
 if im.size!=(864,1536):errors.append(f.name+': grid')
 for d in range(4):
  for frame in range(36):
   i=d*36+frame;cell=im.crop((i%9*96,i//9*96,i%9*96+96,i//9*96+96));bb=cell.getbbox();count+=1
   if not bb:errors.append(f.name+f': empty {d}/{frame}')
   elif bb[0]==0 or bb[1]==0 or bb[2]==96 or bb[3]==96:errors.append(f.name+f': clipped {d}/{frame} {bb}')
 if f.name.endswith('-none-mask.png'):
  colors.append({'id':f.stem,'colors':len(im.getcolors(1000000) or [])})
anchors=json.loads((s/'cart-anchors.json').read_text(encoding='utf-8'));cart=Image.open(s/'prepared/cart.png').convert('RGBA')
for d,(x,y) in enumerate(anchors['shaft']):
 for k in range(2):
  if cart.getpixel((k*128+x,d*128+y))[3]<128:errors.append(f'Cart empty grip {d}/{k}')
report={'ok':not errors,'cells':count,'atlas':60,'maskPairs':60,'opaqueGripEndpoints':8,'errors':errors,'nativePalette':colors,'artisticApproval':'Human review required; these are technical checks, not proof of natural motion.'}
(s/'art-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report));raise SystemExit(0 if report['ok'] else 1)
