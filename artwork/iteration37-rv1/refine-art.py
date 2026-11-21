"""RV1 editable pixel key drawings. Offline only; no limb solver in the game.
Original silhouettes/costumes are retained. Color ramps and hair clusters are
deliberate native-pixel paint; gait legs/boots/arms have explicit contact poses.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
from collections import Counter
import colorsys,json,math,sys
s=Path(__file__).parent;before=s/'before/public/assets/characters-v37';out=s/'prepared';out.mkdir(exist_ok=True)
classes=['novice','warrior','archer','rogue','priest','mage'];bodies=['masculine','feminine'];families=['none','sword','bow','staff','dagger']
ramps={
 'blue':['#151d31','#202d49','#2e4268','#435b82','#607b9c','#8fa5bd','#b8c9d8'],
 'purple':['#251d32','#392b4c','#503d66','#6d5282','#92719b','#b595b5','#d4baca'],
 'metal':['#202128','#383a40','#54585e','#7a8084','#a7b0ae','#cfd5c8','#ede8d8'],
 'brown':['#21191a','#33221e','#4b2f23','#66402b','#865639','#ad7750','#cc9969'],
 'gold':['#342922','#55412c','#7a5b36','#a77e46','#cfaa69','#ead293'],
 'skin':['#58372d','#8a5037','#b77550','#d99b69','#efbf8a','#f9d9aa'],
 'white':['#43404a','#67616a','#938c91','#beb5b2','#dfd5c5','#f5e8cf']}
rgb=lambda c:tuple(bytes.fromhex(c[1:]))
ramps={k:list(map(rgb,v)) for k,v in ramps.items()};ink=rgb('#26202a')
def cell(atlas,d,f):
 i=d*36+f;return atlas.crop((i%9*96,i//9*96,i%9*96+96,i//9*96+96)).convert('RGBA')
def place(atlas,im,d,f):
 i=d*36+f;atlas.paste(im,(i%9*96,i//9*96))
def material(r,g,b):
 h,ss,v=colorsys.rgb_to_hsv(r/255,g/255,b/255);h*=360
 if 195<h<255 and b>r*1.15:return 'blue'
 if 255<=h<310 and b>g*1.12:return 'purple'
 if ss<.19:return 'metal'
 if 27<h<59 and ss>.24:return 'gold'
 if r>g*1.18 and g>b*1.12:return 'skin' if r>157 and g>82 else 'brown'
 return 'white' if v>.56 and ss<.32 else 'brown'
cache={}
def clean(im,hair=False):
 result=Image.new('RGBA',im.size);pixels=result.load();src=im.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=src[x,y]
   if a<128:continue
   key=(r,g,b)
   if key not in cache:
    pal=ramps[material(r,g,b)];cache[key]=min(pal,key=lambda c:sum((c[i]-key[i])**2 for i in range(3)))+(255,)
   pixels[x,y]=cache[key]
 if hair:paint_hair(result,im)
 return result
def paint_hair(im,source):
 # Preserve the exact approved haircut silhouette. Repaint broad stepped locks,
 # not hundreds of unrelated sampled highlights from the large source.
 mask=Image.new('L',im.size);m=mask.load();src=source.load();points=[]
 for y in range(6,48):
  for x in range(18,78):
   r,g,b,a=src[x,y]
   if a>127 and r>g*1.22 and g>b*1.08 and 24<r<169:
    m[x,y]=255;points.append((x,y))
 if len(points)<70:return
 box=mask.getbbox();x0,y0,x1,y1=box;ww=x1-x0;hh=y1-y0
 paint=Image.new('RGBA',im.size,ramps['brown'][2]+(255,));d=ImageDraw.Draw(paint)
 def poly(pts,col):d.polygon([(round(x0+x*ww),round(y0+y*hh)) for x,y in pts],fill=ramps['brown'][col]+(255,))
 poly([(0,0),(.75,0),(.62,.16),(.35,.22),(.23,.5),(0,.73)],3)
 poly([(.18,.12),(.60,.05),(.43,.22),(.35,.30),(.28,.37),(.23,.35),(.27,.21)],4)
 poly([(.43,.29),(.77,.13),(.64,.33),(.57,.46),(.46,.55),(.39,.54)],3)
 poly([(.7,.32),(.93,.26),(.89,.53),(.79,.67),(.68,.76)],1)
 poly([(0,.75),(.18,.62),(.15,.86),(.28,.75),(.29,1),(0,1)],1)
 poly([(.34,.68),(.45,.54),(.44,.83),(.55,.73),(.52,1),(.31,1)],1)
 im.paste(paint,(0,0),mask)
def leg(layer,hip,knee,foot,cls,far=False,direction=0,lift=False):
 draw=ImageDraw.Draw(layer);metal=cls=='warrior';pal=ramps['metal' if metal else 'brown'];shade=1 if far else 2
 draw.line([hip,knee,foot],fill=ink+(255,),width=8 if metal else 7)
 draw.line([hip,knee,foot],fill=pal[shade]+(255,),width=5)
 # Deliberate knee plate / cloth fold and shin highlight, then sole and toe.
 draw.line([(knee[0]-2,knee[1]),(knee[0]+1,knee[1])],fill=pal[min(5,shade+2)]+(255,),width=2)
 draw.line([(knee[0]-1,knee[1]+2),(foot[0]-1,foot[1]-3)],fill=pal[shade+1]+(255,),width=2)
 x,y=foot;toe=-3 if direction==1 else 3 if direction==3 else (-1 if x<48 else 1)
 draw.polygon([(x-3,y-5),(x+2,y-5),(x+3+max(0,toe),y-2),(x+3+max(0,toe),y),(x-3+min(0,toe),y),(x-3+min(0,toe),y-2)],fill=ink+(255,))
 draw.polygon([(x-2,y-4),(x+1,y-4),(x+2+max(0,toe),y-2),(x+2+max(0,toe),y-1),(x-2+min(0,toe),y-1)],fill=pal[shade+1]+(255,))
 draw.line([(x-1,y-3),(x+1,y-3)],fill=pal[min(5,shade+3)]+(255,))
def arm(im,cls,shoulder,elbow,hand,far=False):
 d=ImageDraw.Draw(im);pal=ramps['metal' if cls=='warrior' else 'white' if cls in ['priest','novice'] else 'blue'];a=2 if far else 3
 d.line([shoulder,elbow,hand],fill=ink+(255,),width=7)
 d.line([shoulder,elbow],fill=pal[a]+(255,),width=5);d.line([(shoulder[0]-1,shoulder[1]),(elbow[0]-1,elbow[1])],fill=pal[a+1]+(255,),width=2)
 cuff=ramps['metal' if cls=='warrior' else 'brown'];d.line([elbow,hand],fill=cuff[3]+(255,),width=5)
 d.rectangle((hand[0]-2,hand[1]-1,hand[0]+2,hand[1]+2),fill=ramps['brown'][2]+(255,));d.line([(hand[0]-1,hand[1]),(hand[0]+1,hand[1])],fill=ramps['gold'][3]+(255,))
def gait(base,cls,direction,phase,cart=False):
 cut={'novice':72,'warrior':74,'archer':73,'rogue':73,'priest':80,'mage':76}[cls]
 upper=base.copy();upper.paste((0,0,0,0),(0,cut,96,96));bob=0 if phase%2==0 else -1
 if direction%2:
  sign=-1 if direction==1 else 1
  feet=[[(48+sign*9,87),(48-sign*8,84)],[(48,87),(48-sign*3,80)],[(48-sign*8,84),(48+sign*9,87)],[(48-sign*3,80),(48,87)]][phase]
  hips=[(46,cut-2+bob),(50,cut-2+bob)]
  knees=[((hips[i][0]+feet[i][0])//2+(sign*3 if feet[i][1]==80 else 0),(cut+feet[i][1])//2) for i in range(2)]
  order=[1,0] if direction==1 else [0,1]
 else:
  feet=[[(41,87),(55,83)],[(42,87),(54,80)],[(41,83),(55,87)],[(42,80),(54,87)]][phase]
  hips=[(43,cut-2+bob),(53,cut-2+bob)];knees=[(hips[i][0]+(-2 if i==0 else 2),(cut+feet[i][1])//2) for i in range(2)];order=sorted(range(2),key=lambda i:feet[i][1])
 im=Image.new('RGBA',(96,96))
 for i in order:leg(im,hips[i],knees[i],feet[i],cls,far=(i==order[0]),direction=direction,lift=feet[i][1]<87)
 # Preserve costume hems, belts and capes, while replacing exposed limb pixels.
 swing=[-3,0,3,0][phase]
 if direction%2==0:
  for side,x in enumerate([33,63]):
   for yy in range(57,72):
    for xx in range(x-4,x+5):
     r,g,b,a=upper.getpixel((xx,yy))
     if a and material(r,g,b) not in ['blue','purple']:upper.putpixel((xx,yy),(0,0,0,0))
  arm(upper,cls,(35,53),(33,61+swing//2),(33,68+swing));arm(upper,cls,(61,53),(63,61-swing//2),(63,68-swing))
 else:
  x=48
  # Near arm silhouette redrawn over the old glove/sleeve footprint.
  for yy in range(55,71):
   for xx in range(42,55):
    r,g,b,a=upper.getpixel((xx,yy))
    if a and material(r,g,b) not in ['blue','purple']:upper.putpixel((xx,yy),(0,0,0,0))
  sign=-1 if direction==1 else 1;arm(upper,cls,(48,53),(48+sign*swing//2,61),(48+sign*swing,68))
 if cart:
  grip=[(33,66),(58,66),(63,66),(38,66)][direction]
  shoulder=[(35,53),(49,53),(61,53),(47,53)][direction]
  arm(upper,cls,shoulder,((shoulder[0]+grip[0])//2,60),grip)
 im.alpha_composite(upper,(0,bob));return im,{'hips':hips,'knees':knees,'feet':feet,'bob':bob,'order':order,'grip':list(grip) if cart else None}
def sample():
 board=Image.new('RGB',(6*192,4*192),'#26333b');records=[]
 for row,(cls,body,d) in enumerate([('warrior','masculine',0),('warrior','masculine',1),('priest','feminine',0),('mage','masculine',2)]):
  old=cell(Image.open(before/f'{cls}-{body}-none.png'),d,0);ref=clean(old,False)
  seq=[old,ref]+[native_gait(ref,cls,d,k)[0] for k in range(4)]
  for col,im in enumerate(seq):q=im.resize((192,192),Image.Resampling.NEAREST);board.paste(q,(col*192,row*192),q)
  for k in range(4):records.append({'class':cls,'body':body,'dir':d,'phase':k,**native_gait(ref,cls,d,k)[1]})
 board.save(s/'sample-native-paint.png');(s/'sample-poses.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
def native_gait(base,cls,direction,phase,cart=False):
 if direction==0:phase=(phase+2)%4 # Front screen-left is anatomical right.
 cut={'novice':72,'warrior':74,'archer':73,'rogue':73,'priest':80,'mage':76}[cls]
 upper=base.copy();upper.paste((0,0,0,0),(0,cut,96,96));bob=-1 if phase%2 else 0
 if direction%2:
  sign=-1 if direction==1 else 1;hips=[(46,cut-1),(52,cut-1)]
  feet=[[(48+sign*9,87),(48-sign*7,84)],[(47,87),(51+sign*3,81)],[(48-sign*7,84),(48+sign*9,87)],[(47+sign*3,81),(51,87)]][phase]
  order=[0,1] if direction==1 else [1,0]
 else:
  hips=[(42,cut-1),(54,cut-1)];feet=[[(41,87),(55,84)],[(42,87),(54,81)],[(41,84),(55,87)],[(42,81),(54,87)]][phase];order=sorted(range(2),key=lambda i:feet[i][1])
 knees=[((hips[i][0]+feet[i][0])//2,(cut+feet[i][1]-4)//2) for i in range(2)]
 im=Image.new('RGBA',(96,96));draw=ImageDraw.Draw(im)
 warm=[rgb(c) for c in ['#2a2221','#4a3b31','#73604c','#a49373','#d5c9a6','#f0e4c5']]
 boots=[]
 for x0,x1 in [(33,47),(49,63)]:
  b=base.crop((x0,81,x1,88));bb=b.getbbox();boots.append(b.crop(bb) if bb else b)
 for i in order:
  hip,knee,foot=hips[i],knees[i],feet[i];far=i==order[0];pal=warm if cls=='warrior' else ramps['brown']
  draw.line([hip,knee,(foot[0],foot[1]-4)],fill=pal[0]+(255,),width=7)
  draw.line([hip,knee,(foot[0],foot[1]-4)],fill=pal[1 if far else 2]+(255,),width=5)
  draw.line([(knee[0]-1,knee[1]),(foot[0]-1,foot[1]-4)],fill=pal[2 if far else 3]+(255,),width=2)
  if cls=='warrior':
   draw.polygon([(knee[0]-3,knee[1]-2),(knee[0],knee[1]-3),(knee[0]+2,knee[1]-1),(knee[0]+1,knee[1]+1),(knee[0]-2,knee[1]+1)],fill=pal[3 if far else 4]+(255,));draw.point((knee[0]-1,knee[1]-2),fill=pal[5]+(255,))
  boot=boots[i].copy()
  if far:
   pix=boot.load()
   for yy in range(boot.height):
    for xx in range(boot.width):
     r,g,b,a=pix[xx,yy];pix[xx,yy]=(round(r*.85),round(g*.85),round(b*.85),a)
  im.alpha_composite(boot,(round(foot[0]-boot.width/2),foot[1]-boot.height+1))
 # Native arm islands rotate as rigid authored pieces offline; no stretching.
 regions=([(27,56,38,72),(58,56,69,72)] if direction%2==0 else [(51,58,61,74)] if direction==1 else [(35,58,45,74)])
 for i,(x0,y0,x1,y1) in enumerate(regions):
  piece=Image.new('RGBA',(96,96));pp=piece.load();up=upper.load()
  for yy in range(y0,y1):
   for xx in range(x0,x1):
    r,g,b,a=up[xx,yy]
    if a and material(r,g,b) not in ['blue','purple']:
     pp[xx,yy]=(r,g,b,a);up[xx,yy]=(0,0,0,0)
  angle=[-14,0,14,0][phase]*(1 if i==0 else -1)
  pivot=((x0+x1)//2,y0)
  if cart:
   # Rear arm extends to the common hand/shaft point; kept as a single piece.
   angle= -20 if direction==1 else 20 if direction==3 else 0
  rotated=piece.rotate(angle,resample=Image.Resampling.NEAREST,center=pivot)
  upper.alpha_composite(rotated)
 im.alpha_composite(upper,(0,bob))
 return im,{'hips':hips,'knees':knees,'feet':feet,'bob':bob,'order':order,'armDegrees':[ -14,0,14,0][phase]}
if __name__=='__main__':sample()
