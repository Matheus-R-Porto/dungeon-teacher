from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
import runpy,json,math,colorsys
S=Path(__file__).parent;m=runpy.run_path(str(S/'refine-art.py'));globals().update({k:m[k] for k in ['cell','place','clean','native_gait','classes','bodies','families']})
before=S/'before/public/assets/characters-v37';out=S/'prepared';out.mkdir(exist_ok=True)
grips=[(33,70),(59,71),(63,70),(35,71)]
def mask(im):
 out=Image.new('RGBA',im.size,(0,0,0,255));px=out.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=im.getpixel((x,y));h,ss,v=colorsys.rgb_to_hsv(r/255,g/255,b/255);h*=360
   if a<128:continue
   if 203<=h<255 and b>r*1.2:px[x,y]=(255,0,0,255)
   elif 255<=h<303 and b>g*1.2:px[x,y]=(0,255,0,255)
 return out
eq=Image.open(S/'authoring-before/masters/equipment.png').convert('RGBA');meta=json.loads((S/'authoring-before/masters/equipment.png.json').read_text(encoding='utf-8'))
def weapon(family,d,held,phase=None):
 layer=Image.new('RGBA',(96,96))
 if family=='none':return layer
 i={'sword':0,'dagger':2,'bow':4,'staff':6}[family]+int(held);b=meta['frames'][d*8+i]['bounds'];obj=clean(eq.crop((i*96+b[0],d*96+b[1],i*96+b[2]+1,d*96+b[3]+1)))
 length=({'sword':29,'dagger':17,'bow':31,'staff':37} if held else {'sword':23,'dagger':16,'bow':29,'staff':37})[family]
 obj=obj.resize((max(1,round(obj.width/obj.height*length)),length),Image.Resampling.NEAREST)
 def draw(hand,angle,grip):
  piece=Image.new('RGBA',(96,96));piece.alpha_composite(obj,(round(hand[0]-obj.width/2),round(hand[1]-length*grip)));piece=piece.rotate(angle,resample=Image.Resampling.NEAREST,center=hand);layer.alpha_composite(piece)
 if held:
  hand=[(33,70),(54,72),(63,70),(42,72)][d];a=[-20,-40,20,40][d];swing=[-14,0,14,0][phase] if phase is not None else 0
  if phase is not None:
   pivot=[(33,56),(56,58),(63,56),(40,58)][d];rad=math.radians(swing);dx=hand[0]-pivot[0];dy=hand[1]-pivot[1];hand=(round(pivot[0]+dx*math.cos(rad)+dy*math.sin(rad)),round(pivot[1]-dx*math.sin(rad)+dy*math.cos(rad))-(phase%2))
  draw(hand,a+swing,.5 if family=='bow' else .65 if family=='staff' else .84)
  if family=='dagger':draw((96-hand[0],hand[1]),-a-swing,.84)
 else:draw(([35,57,61,39][d],65),-15 if d==3 else 15,.22 if family in ['sword','dagger'] else .57)
 return layer
def equip(base,family,d,held,phase=None):
 result=base.copy();region=mask(base);gear=weapon(family,d,held,phase)
 if not held and family in ['bow','staff'] and d!=2:
  result=gear.copy();result.alpha_composite(base)
 else:
  result.alpha_composite(gear);region.paste((0,0,0,255),(0,0),gear.getchannel('A'))
 return result,region
def kneel(base):
 top=base.crop((0,0,96,75));im=Image.new('RGBA',(96,96));im.alpha_composite(top,(0,7));d=ImageDraw.Draw(im)
 for x in [41,54]:
  d.polygon([(x-4,79),(x+2,79),(x+5,84),(x+4,87),(x-4,87)],fill='#332820');d.line([(x-2,81),(x+2,83),(x+2,85)],fill='#a8916d',width=2)
 return im
report=[]
for cls in classes:
 for body in bodies:
  ident=f'{cls}-{body}';source=Image.open(before/f'{ident}-none.png').convert('RGBA');bases=[clean(cell(source,d,0)) for d in range(4)]
  walks=[[native_gait(bases[d],cls,d,k) for k in range(4)] for d in range(4)]
  contact=Image.new('RGBA',(384,384))
  for d in range(4):
   for k in range(4):contact.alpha_composite(walks[d][k][0],(k*96,d*96))
  (S/'native-walks').mkdir(exist_ok=True);contact.save(S/'native-walks'/f'{ident}.png')
  for family in families:
   original=Image.open(before/f'{ident}-{family}.png').convert('RGBA');oldmask=Image.open(before/f'{ident}-{family}-mask.png').convert('RGBA');atlas=Image.new('RGBA',original.size);regions=Image.new('RGBA',original.size,(0,0,0,255))
   for d in range(4):
    for f in range(36):
     pose=clean(cell(original,d,f));region=cell(oldmask,d,f)
     if f in [0,1]:pose,region=equip(bases[d],family,d,f==1)
     elif f in [2,4,6,8,10,12,14,16]:
      k=([2,4,6,8] if f<10 else [10,12,14,16]).index(f);pose,region=equip(walks[d][k][0],family,d,f>=10,k)
     elif f in [3,5,7,9,11]:
      k=[3,5,7,9].index(f) if f!=11 else 0;pose,_=native_gait(bases[d],cls,d,k,cart=True)
      if f==11:
       # Same grip drawing, original stationary legs.
       pose.paste(bases[d].crop((0,76,96,96)),(0,76))
      # Hand is explicitly drawn around the cart's common grip point.
      g=ImageDraw.Draw(pose);x,y=grips[d];y-=k%2 if f!=11 else 0
      g.line([(x-2,y),(x+2,y)],fill='#33241f',width=4);g.line([(x-1,y-1),(x+1,y-1)],fill='#b68d60',width=1)
      pose,region=equip(pose,family,d,False)
     elif f in [13,15]:
      pose=kneel(bases[d])
      if f==15:
       pose=pose.rotate(36 if d in [0,1] else -36,resample=Image.Resampling.NEAREST,center=(48,73));bb=pose.getbbox();shift=88-bb[3];new=Image.new('RGBA',(96,96));new.alpha_composite(pose,(0,shift));pose=new
      region=mask(pose)
     elif f==20:
      # Follow-through: full impact pose settles into a lower stance, with the
      # upper arm/weapon advancing together as an authored pixel island.
      pose=clean(cell(original,d,19));region=cell(oldmask,d,19)
      for layer in [pose,region]:
       upper=layer.crop((0,0,96,73));layer.paste((0,0,0,0) if layer is pose else (0,0,0,255),(0,0,96,73));layer.paste(upper,(1 if d==3 else -1 if d==1 else 0,1))
     elif f in [21,31]:
      # Weight on one bent leg during recovery, not the standing rest frame.
      pose,region=equip(walks[d][3 if f==21 else 1][0],family,d,True)
     elif f in [33,34,35]:
      pose,region=equip(bases[d],family,d,f==35)
      # A short, explicit forearm reach to the belt, then draw-out.
      shoulder=[(35,56),(55,58),(61,56),(41,58)][d];hand=[(40,65),(48,65),(56,65),(48,65)][d]
      if f==34:hand=(hand[0]+(-4 if d in [0,1] else 4),hand[1]-4)
      painter=ImageDraw.Draw(pose);painter.line([shoulder,hand],fill='#2a2222',width=5);painter.line([shoulder,hand],fill='#9b8060',width=3)
      region=mask(pose)
     place(atlas,pose,d,f);place(regions,region,d,f)
   atlas.save(out/f'{ident}-{family}.png');regions.save(out/f'{ident}-{family}-mask.png')
  report.append({'id':ident,'poses':[{'dir':d,'phase':k,**walks[d][k][1]} for d in range(4) for k in range(4)],'source':'0.6.11 native drawings, repainted ramps, authored joints and intact boots/arms','generatedStudiesUsed':False})
# Neutral accessories use the same small ramps; no texture resize is introduced.
for name in ['backpack']:
 clean(Image.open(before/f'{name}.png').convert('RGBA')).save(out/f'{name}.png')
(S/'art-build.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'atlas':60,'masks':60,'characters':len(report)}))
