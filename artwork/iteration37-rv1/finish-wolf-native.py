from pathlib import Path
from PIL import Image,ImageEnhance,ImageDraw
import json
s=Path(__file__).parent;old=Image.open(s/'before/public/assets/characters-v37/white-wolf.png').convert('RGBA');atlas=Image.open(s/'prepared/white-wolf.png').convert('RGBA');record=[]
for d in range(4):
 base=old.crop((0,d*96,96,d*96+96));body=base.copy()
 if d%2:
  xs=[34,40,65,71] if d==1 else [62,56,31,25];ys=[70,70,71,71];cut=74;body.paste((0,0,0,0),(25,cut,76,89))
 else:xs=[35,57,39,54];ys=[74,74,73,73];cut=77;body.paste((0,0,0,0),(28,cut,67,89))
 for k,f in enumerate([1,2,3,9]):
  pose=Image.new('RGBA',(96,96));positions=[]
  for i in [2,3,0,1]:
   phase=(k+[0,2,1,3][i])%4;x,y=xs[i],ys[i];source=old.crop(((1 if phase==1 else 0)*96,d*96,(2 if phase==1 else 1)*96,d*96+96));leg=Image.new('RGBA',(96,96));leg.alpha_composite(source.crop((x-5,y,x+6,88)),(x-5,y));angle=[-18,0,18,0][phase]*(1 if d in [0,1] else -1);leg=leg.rotate(angle,resample=Image.Resampling.NEAREST,center=(x,y))
   if i>=2:leg=ImageEnhance.Brightness(leg).enhance(.78)
   if phase==1:
    lifted=Image.new('RGBA',(96,96));lifted.alpha_composite(leg,(0,-3));leg=lifted
   pose.alpha_composite(leg);positions.append({'limb':i,'phase':phase,'lifted':phase==1,'angle':angle})
  pose.alpha_composite(body);atlas.paste(pose,(f*96,d*96));record.append({'direction':d,'frame':f,'limbs':positions})
atlas.save(s/'prepared/white-wolf.png');(s/'wolf-native.json').write_text(json.dumps(record,indent=2),encoding='utf-8');print('Furred limb drawings preserved, four staggered quadruped tracks')
