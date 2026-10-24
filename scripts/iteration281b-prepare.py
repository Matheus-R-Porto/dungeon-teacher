from PIL import Image,ImageDraw
from pathlib import Path
import json
masters=Path('docs/art/iteration281-sources')
out=Path('public/assets/items/inventory-v281');out.mkdir(parents=True,exist_ok=True)
ids=[p.stem for p in masters.glob('*.png')]
sheet=Image.new('RGB',(7*220,700),'#19332b');draw=ImageDraw.Draw(sheet)
for col,id in enumerate(ids):
 im=Image.open(masters/(id+'.png')).convert('RGBA');bounds=im.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox();crop=im.crop(bounds)
 for row,(name,method) in enumerate([('NEAREST',Image.Resampling.NEAREST),('LANCZOS',Image.Resampling.LANCZOS),('BOX',Image.Resampling.BOX)]):
  thumb=crop.copy();thumb.thumbnail((108,108),method)
  result=Image.new('RGBA',(128,128));result.paste(thumb,((128-thumb.width)//2,(128-thumb.height)//2))
  if name=='LANCZOS':result.save(out/(id+'.png'),optimize=True)
  sheet.paste(result.resize((192,192),Image.Resampling.NEAREST),(col*220+10,row*230+25),result.resize((192,192),Image.Resampling.NEAREST))
  draw.text((col*220+10,row*230+5),id+' '+name,fill='white')
sheet.save('docs/iteration281b-resampling.png')
