"""Targeted offline garment/limb repairs. Never fill arbitrary alpha holes.
The reference is the same character's intact rest costume. Repair regions are
explicit authored polygons and transformed with the original motion.
"""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math,colorsys,runpy,sys
s=Path(__file__).parent;p=Path('C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536');src=s/'before/public/assets/characters-v37-rv1';out=s/'repaired';out.mkdir(exist_ok=True)
classes=['novice','warrior','archer','rogue','priest','mage'] if '--all' in sys.argv else ['mage','priest'];bodies=['masculine','feminine'];families=['none','sword','bow','staff','dagger'] if '--all' in sys.argv else ['none']
def cell(im,d,f):
 i=d*36+f;return im.crop((i%9*96,i//9*96,i%9*96+96,i//9*96+96)).convert('RGBA')
def place(im,q,d,f):i=d*36+f;im.paste(q,(i%9*96,i//9*96))
# Garment regions exclude hands, exposed legs and intentional exterior space.
polygons=[[(36,51),(60,51),(64,74),(57,78),(39,78),(32,74)],[(49,51),(59,54),(66,74),(55,78),(48,69)],[(32,51),(64,51),(68,75),(56,79),(40,79),(28,75)],[(47,51),(37,54),(30,74),(41,78),(48,69)]]
def garment(d):
 m=Image.new('L',(96,96));ImageDraw.Draw(m).polygon(polygons[d],fill=255);return m
def palette(im):
 out=Image.new('RGBA',im.size,(0,0,0,255));px=out.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=im.getpixel((x,y));h,_,_=colorsys.rgb_to_hsv(r/255,g/255,b/255);h*=360
   if a>127:
    if 203<=h<255 and b>r*1.2:px[x,y]=(255,0,0,255)
    elif 255<=h<303 and b>g*1.2:px[x,y]=(0,255,0,255)
 return out
mapping={24:'castRecover',25:'healPrepare',26:'healRelease',27:'support',28:'area',31:'recover'}
angles={'healPrepare':[55,-55],'healRelease':[-50,50],'support':[0,115],'area':[-80,80],'recover':[-22,22],'castRecover':[20,-20]}
def limb_underlay(cls,d,f):
 layer=Image.new('RGBA',(96,96));draw=ImageDraw.Draw(layer);kind=mapping[f];regions=([(27,56,38,73),(58,56,69,73)] if d%2==0 else [(51,58,61,74)] if d==1 else [(35,58,45,74)])
 shades={'mage':['#202d49','#435b82','#a77e46'],'priest':['#67616a','#dfd5c5','#a77e46'],'warrior':['#383a40','#a7b0ae','#cfaa69'],'novice':['#67616a','#beb5b2','#a77e46'],'archer':['#202d49','#435b82','#a77e46'],'rogue':['#392b4c','#6d5282','#a77e46']}[cls]
 for i,(x0,y0,x1,y1) in enumerate(regions):
  angle=angles[kind][i] if d%2==0 else {'healPrepare':-45,'healRelease':-70,'support':-130,'area':-100,'recover':22,'castRecover':-25}[kind]*(1 if d==1 else -1)
  x=(x0+x1)//2;rad=math.radians(angle);dy=y1-y0-3;offset=2 if f in [28,31] else 0;shoulder=(x,y0+offset);elbow=(round(x+dy*.5*math.sin(rad)),round(y0+dy*.5*math.cos(rad))+offset);hand=(round(x+dy*math.sin(rad)),round(y0+dy*math.cos(rad))+offset)
  draw.line([shoulder,elbow,hand],fill='#26202a',width=6);draw.line([shoulder,elbow,hand],fill=shades[0],width=4);draw.line([shoulder,elbow],fill=shades[1],width=2);draw.line([(hand[0]-1,hand[1]),(hand[0]+1,hand[1])],fill=shades[2],width=2)
 return layer
report=[]
for cls in classes:
 for body in bodies:
  base=Image.open(src/f'{cls}-{body}-none.png').convert('RGBA')
  for family in families:
   old=Image.open(src/f'{cls}-{body}-{family}.png').convert('RGBA');atlas=old.copy();masks=Image.open(src/f'{cls}-{body}-{family}-mask.png').convert('RGBA')
   for d in range(4):
    reference=cell(base,d,0);region=garment(d)
    for f in list(range(2,12))+[12,14,16]+list(mapping):
     if f in [13,15,17]:continue
     q=cell(old,d,f);ref=reference.copy();mask=region.copy();offset=2 if f in [28,31] else (-1 if f in [4,8,5,9,12,16] else 0)
     if offset:
      ref=Image.new('RGBA',(96,96));ref.alpha_composite(reference,(0,offset));mask=Image.new('L',(96,96));mask.paste(region,(0,offset))
     fixes=[]
     for y in range(49,80):
      for x in range(26,70):
       if mask.getpixel((x,y)) and ref.getpixel((x,y))[3]>127 and q.getpixel((x,y))[3]==0:
        q.putpixel((x,y),ref.getpixel((x,y)));fixes.append([x,y])
     if f in mapping:
      under=limb_underlay(cls,d,f);under.alpha_composite(q);q=under
     if q.tobytes()!=cell(old,d,f).tobytes():
      oldpose=cell(old,d,f);oldmask=cell(masks,d,f);addedmask=palette(q)
      for yy in range(96):
       for xx in range(96):
        if oldpose.getpixel((xx,yy))[3]==0 and q.getpixel((xx,yy))[3]>0:oldmask.putpixel((xx,yy),addedmask.getpixel((xx,yy)))
      place(atlas,q,d,f);place(masks,oldmask,d,f);report.append({'atlas':f'{cls}-{body}-{family}','direction':d,'frame':f,'garmentPixels':fixes,'limbSupport':f in mapping,'referenceFrame':0,'referenceOffsetY':offset,'region':polygons[d]})
   atlas.save(out/f'{cls}-{body}-{family}.png');masks.save(out/f'{cls}-{body}-{family}-mask.png')
(s/'repairs.json').write_text(json.dumps({'method':'Explicit costume polygons restore missing pixels only where the intact same-character reference is opaque; authored limb support under fragmented extraction in six gesture frames. No global hole filling.','repairs':report},indent=2),encoding='utf-8')
# Profession preparation uses the original timing, tools and grip coordinates.
# Preserve garment pixels before the old color-based arm extraction occurs.
code=(p/'artwork/iteration37-rv2/profession-art.py').read_text(encoding='utf-8');code=code.replace("src=s/'before/public/assets/characters-v37-rv1'","src=s/'repaired'")
code=code.replace("if a and not (b>r*1.2 and b>g*.85):", "if a and not protected.getpixel((x,y)) and not (b>r*1.2 and b>g*.85):")
code=code.replace('im=base.copy();px=im.load();regions=', 'protected=garment(d);im=base.copy();px=im.load();regions=')
(s/'profession38.py').write_text(code,encoding='utf-8')
namespace={'__file__':str(s/'profession38.py'),'__name__':'profession38','garment':garment};exec(compile(code,str(s/'profession38.py'),'exec'),namespace)
for c in classes:
 for b in bodies:namespace['build'](c,b)
print(json.dumps({'changedFrames':len(report),'garmentPixels':sum(len(r['garmentPixels']) for r in report),'atlas':60,'professionAtlas':12}))
