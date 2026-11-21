from pathlib import Path
from PIL import Image,ImageDraw
import json,copy,xml.etree.ElementTree as ET
s=Path(__file__).parent;out=s/'prepared';old=Image.open(s/'before/public/assets/characters-v37/white-wolf.png').convert('RGBA');atlas=Image.new('RGBA',(1152,384));records=[]
def get(d,c):return old.crop((c*96,d*96,c*96+96,d*96+96))
for d in range(4):
 for c in range(9):atlas.alpha_composite(get(d,c),(c*96,d*96))
 base=get(d,0)
 for k,frame in enumerate([1,2,3,9]):
  body=base.copy();paws=Image.new('RGBA',(96,96));g=ImageDraw.Draw(paws);feet=[]
  # Four limb tracks, with staggered hind/fore phase: a quadruped walk.
  if d%2:
   sign=-1 if d==1 else 1;hips=[(34,69),(38,70),(65,69),(69,69)];offsets=[0,2,1,3]
   if d==3:hips=[(96-x,y) for x,y in hips]
   for yy in range(72,89):
    for xx in range(24,77):body.putpixel((xx,yy),(0,0,0,0))
  else:
   hips=[(35,73),(58,73),(39,70),(54,70)];offsets=[0,2,1,3]
   body.paste((0,0,0,0),(27,76,68,89));sign=1
  for i in [2,3,0,1]:
   phase=(k+offsets[i])%4;hx,hy=hips[i];stride=[-5,0,5,0][phase] if d%2 else [-1,0,1,0][phase];fy=82 if phase==1 else 87;fx=hx+stride*sign;feet.append({'limb':i,'x':fx,'y':fy,'support':fy==87})
   knee=(round((hx+fx)/2)+(2*sign if phase==1 else 0),78 if phase==1 else 79);dark=i>=2
   g.line([(hx,hy),knee,(fx,fy-2)],fill='#48434a',width=7);g.line([(hx,hy),knee,(fx,fy-2)],fill='#a5a1a4' if dark else '#d5d2cf',width=5);g.line([(hx-1,hy), (knee[0]-1,knee[1]),(fx-1,fy-3)],fill='#c9c8c5' if dark else '#f5eee0',width=2)
   g.polygon([(fx-3,fy-4),(fx+2,fy-4),(fx+4,fy-1),(fx+3,fy),(fx-4,fy),(fx-4,fy-1)],fill='#7b7376' if dark else '#d1c7bf');g.line([(fx-2,fy-1),(fx+2,fy-1)],fill='#aca5a1' if dark else '#f0e5d3');g.point((fx,fy),fill='#575059')
  paws.alpha_composite(body);atlas.paste(paws,(frame*96,d*96));records.append({'direction':d,'frame':frame,'feet':feet})
 # A knee/chest collapse precedes the already authored resting death silhouette.
 collapse=get(d,6);chest=collapse.crop((0,0,96,75));collapse.paste((0,0,0,0),(0,0,96,76));collapse.alpha_composite(chest,(0,6));atlas.alpha_composite(collapse,(10*96,d*96))
 atlas.alpha_composite(get(d,0),(11*96,d*96))
atlas.save(out/'white-wolf.png')
ns='{http://www.w3.org/2000/svg}';ET.register_namespace('',ns[1:-1]);root=ET.parse(s/'before/public/assets/monsters/oath-knight-v060.svg').getroot();original=[e for e in root if e.tag==ns+'g'];new=ET.Element(root.tag,{**root.attrib,'width':'1920','viewBox':'0 0 1920 640'})
for child in root:
 if child.tag!=ns+'g':new.append(copy.deepcopy(child))
for d in range(4):
 for f in range(12):
  g=copy.deepcopy(original[d*8+(f if f<8 else 0)]);g.set('transform',f'translate({f*160} {d*160})')
  if f in [1,8,2,9,10,11]:
   phase={1:0,8:1,2:2,9:3}.get(f,1)
   for node in g.iter(ns+'path'):
    text=node.get('d','')
    for i,start in enumerate(['M60 94','M85 94']):
     if text.startswith(start):
      hip=67+i*25;lift=(phase==1 and i==1) or (phase==3 and i==0);fy=132 if lift else 143;fx=hip+([-7,0,7,0][phase]*(1 if i==0 else -1));ky=112 if lift else 119
      if f in [10,11]:fx=hip+(-5 if i==0 else 5);ky=124;fy=143
      node.set('d',f'M{hip-7} 94 L{hip+7} 94 L{fx+6} {ky} L{fx+5} {fy-8} L{fx+11} {fy} L{fx-10} {fy} L{fx-7} {fy-10} L{fx-7} {ky} Z')
    if f==10 and text.startswith('M37 79'):node.set('d','M37 79l13 3 13 11-5 9-14-8-13-7Z')
    if f==10 and text.startswith('M102 82'):node.set('d','M102 82l14-3-7 20-17 8-5-9Z')
   if f==11:
    # Authored bent-knee collapse; move torso/head together while feet stay down.
    for node in g.iter(ns+'path'):
     if not node.get('d','').startswith(('M60 94','M85 94','M60 110','M85 110')):node.set('transform','translate(0 9)')
  new.append(g)
ET.ElementTree(new).write(out/'oath-knight.svg',encoding='utf-8',xml_declaration=True)
(s/'enemy-art.json').write_text(json.dumps({'wolf':records,'knightFrames':12,'commonWolf':'existing drawings retained; preparation/confirmation/death sequencing corrected','slimes':'three species retain squash/extend/land art; attack/death sequencing corrected'},indent=2),encoding='utf-8');print('Enemy artwork prepared')
