"""User-authorized pixel finishing, offline only. Four fixed contact/passing drawings.
Copies the new authored costume/head intact; redraws the two boot/leg strips onto
explicit pixel key poses. This script is not imported or run by the game.
"""
from pathlib import Path
from PIL import Image, ImageEnhance
import json, math
s=Path(__file__).parent
cuts={'novice':70,'warrior':74,'archer':72,'rogue':74,'priest':81,'mage':76}
def segment(layer,fragment,start,end):
 dx=end[0]-start[0];dy=end[1]-start[1];length=math.hypot(dx,dy)
 if not length:return
 dx/=length;dy/=length;nx,ny=dy,-dx
 alpha=fragment.getchannel('A');bbox=alpha.getbbox()
 if not bbox:return
 def center(y):
  xs=[x for x in range(fragment.width) if alpha.getpixel((x,y))>100]
  return sum(xs)/len(xs) if xs else fragment.width/2
 sy0,sy1=bbox[1],bbox[3]-1;sx0,sx1=center(sy0),center(sy1)
 sx,sy=sx1-sx0,sy1-sy0+1;sl=math.hypot(sx,sy);snx,sny=sy/sl,-sx/sl
 a=nx*snx+dx*sx/length;b=ny*snx+dy*sx/length;c=sx0-a*start[0]-b*start[1]
 d=nx*sny+dx*sy/length;e=ny*sny+dy*sy/length;f=sy0-d*start[0]-e*start[1]
 transformed=fragment.transform((96,96),Image.Transform.AFFINE,(a,b,c,d,e,f),Image.Resampling.NEAREST)
 layer.alpha_composite(transformed)
def extent(im,y0,y1,x0,x1):
 a=im.getchannel('A');xs=[x for y in range(y0,y1) for x in range(x0,x1) if a.getpixel((x,y))>=128]
 return (min(xs)+max(xs))/2 if xs else (x0+x1)/2
report=[]
for cls,cut in cuts.items():
 for body in ['masculine','feminine']:
  name=f'{cls}-{body}';main=Image.open(s/'masters'/f'{name}-main.png').convert('RGBA')
  meta=json.loads((s/'masters'/f'{name}-main.png.json').read_text(encoding='utf-8'))
  atlas=Image.new('RGBA',(384,384));manifest={**meta,'columns':4,'width':meta['width']/2,'frames':[],'manualFinishing':True,'source':f'{name}-main.png; authorized manual contact/passing poses'}
  for direction in range(4):
   base=main.crop((0,direction*96,96,direction*96+96));upper=base.copy()
   upper.paste((0,0,0,0),(0,cut,96,96))
   centers=[extent(base,84,88,25,48),extent(base,84,88,48,72)]
   parts=[]
   for center in centers:
    limb=base.crop((round(center)-7,cut,round(center)+7,88));k=max(2,limb.height//2)
    parts.append((limb.crop((0,0,14,k)),limb.crop((0,k,14,limb.height))))
   for phase in range(4):
    cell=Image.new('RGBA',(96,96));bob=0 if phase%2==0 else -1
    if direction%2:
     sign=-1 if direction==1 else 1
     feet=[[(48+sign*7,88),(48-sign*7,85)],[(48,88),(48-sign*4,82)],[(48-sign*7,85),(48+sign*7,88)],[(48-sign*4,82),(48,88)]][phase]
     hips=[(47,cut-1+bob),(49,cut-1+bob)]
     knees=[]
     for leg in range(2):
      foot=feet[leg];lift=foot[1]==82
      knees.append((48+sign*4 if lift else (hips[leg][0]+foot[0])/2,(cut+foot[1])/2-1))
     order=[1,0] if direction==1 else [0,1]
    else:
     feet=[[(centers[0]-1,88),(centers[1]+1,85)],[(centers[0],88),(centers[1]-1,82)],[(centers[0]-1,85),(centers[1]+1,88)],[(centers[0]+1,82),(centers[1],88)]][phase]
     hips=[(centers[0]+1,cut-1+bob),(centers[1]-1,cut-1+bob)]
     knees=[((hips[i][0]+feet[i][0])/2,(cut+feet[i][1])/2) for i in range(2)]
     order=sorted(range(2),key=lambda i:feet[i][1])
    for leg in order:
     limbLayer=Image.new('RGBA',(96,96));segment(limbLayer,parts[leg][0],hips[leg],knees[leg]);segment(limbLayer,parts[leg][1],knees[leg],feet[leg]);
     if feet[leg][1]<88:limbLayer=ImageEnhance.Brightness(limbLayer).enhance(.84)
     cell.alpha_composite(limbLayer)
    torso=upper.copy();swing=[-2,0,2,0][phase]
    if direction%2==0:
     regions=[(27,57,38,70),(59,57,70,70)]
     for side,region in enumerate(regions):
      piece=upper.crop(region);torso.paste((0,0,0,0),region);dy=swing*(1 if side==0 else -1)
      # Shoulder remains untouched; overlapping sleeve pixels retain the join.
      if dy>0:torso.alpha_composite(piece.crop((0,0,piece.width,3)).resize((piece.width,dy+2),Image.Resampling.NEAREST),(region[0],region[1]))
      torso.alpha_composite(piece,(region[0],region[1]+dy))
    else:
     region=(34,60,44,70) if direction==1 else (53,60,64,70)
     piece=upper.crop(region);torso.paste((0,0,0,0),region);torso.alpha_composite(piece.crop((0,0,piece.width,3)),(region[0],region[1]));torso.alpha_composite(piece,(region[0]+(1 if phase==0 else -1 if phase==2 else 0),region[1]+(1 if phase==1 else 0)))
    cell.alpha_composite(torso,(0,bob))
    atlas.alpha_composite(cell,(phase*96,direction*96));bbox=cell.getbbox()
    manifest['frames'].append({'column':phase,'row':direction,'bounds':[bbox[0],bbox[1],bbox[2]-1,bbox[3]-1],'feet':feet,'bodyBob':bob})
  atlas.save(s/'masters'/f'{name}-walk.png')
  (s/'masters'/f'{name}-walk.png.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
  report.append({'id':name,'frames':16,'source':'new main poses','method':'offline fixed pixel contact/passing key poses'})
(s/'manual-walks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
