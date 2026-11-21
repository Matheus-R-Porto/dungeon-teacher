from pathlib import Path
from PIL import Image,ImageDraw
import runpy,json
s=Path(__file__).parent;m=runpy.run_path(str(s/'refine-art.py'));old=Image.open(s/'before/public/assets/characters-v37/cart.png').convert('RGBA');atlas=Image.new('RGBA',(256,512));endpoints=[(53,69),(15,55),(78,49),(113,55)]
def shaft(d,a,b):
 d.line([a,b],fill='#30231c',width=5);d.line([a,b],fill='#975a2c',width=3);d.line([(a[0],a[1]-1),(b[0],b[1]-1)],fill='#dfae66',width=1)
for direction in range(4):
 for wheel in range(2):
  original=m['clean'](old.crop((wheel*96,direction*96,wheel*96+96,direction*96+96)));im=Image.new('RGBA',(128,128));d=ImageDraw.Draw(im)
  if direction==0:
   im.alpha_composite(original.crop((21,27,76,73)),(43,29));shaft(d,(53,69),(58,60));shaft(d,(80,69),(84,60));shaft(d,(52,69),(56,69))
  elif direction==1:
   shaft(d,(15,55),(66,44));shaft(d,(18,60),(67,54));im.alpha_composite(original.crop((38,43,89,89)),(60,31));shaft(d,(14,55),(18,60))
  elif direction==2:
   im.alpha_composite(original,(16,20));shaft(d,(48,49),(48,71));shaft(d,(78,49),(78,71));shaft(d,(47,49),(79,49))
  else:
   shaft(d,(113,55),(62,44));shaft(d,(110,60),(61,54));im.alpha_composite(original.crop((7,43,59,89)),(17,31));shaft(d,(114,55),(110,60))
  atlas.alpha_composite(im,(wheel*128,direction*128))
atlas.save(s/'prepared/cart.png');(s/'cart-anchors.json').write_text(json.dumps({'cell':128,'scale':.66,'hand':[[33,70],[59,71],[63,70],[35,71]],'shaft':endpoints,'ground':'same scale as 0.6.11; front behind body, back/side foreground','assembly':'reused cart box and wheels; separately redrawn shafts/grips, no gameplay offset'},indent=2),encoding='utf-8');print('cart prepared')
