from PIL import Image
from pathlib import Path
import json,shutil
items=json.loads(Path('docs/iteration281-prompts.json').read_text())
out=Path('public/assets/items/sample-v281');out.mkdir(parents=True,exist_ok=True)
masters=Path('docs/art/iteration281-sources');masters.mkdir(parents=True,exist_ok=True)
report=[]
for item in items:
 im=Image.open(item['source']).convert('RGBA');shutil.copy2(item['source'],masters/(item['id']+'.png'))
 bounds=im.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox()
 # Only crop transparent margins and resize the generated pixel-art, never draw shapes or apply mosaic filters.
 crop=im.crop(bounds);crop.thumbnail((54,54),Image.Resampling.NEAREST)
 result=Image.new('RGBA',(64,64));result.paste(crop,((64-crop.width)//2,(64-crop.height)//2))
 result.save(out/(item['id']+'.png'),optimize=True)
 report.append(dict(id=item['id'],sourceSize=im.size,bounds=bounds,size=result.size,alpha=result.getchannel('A').getextrema(),bytes=(out/(item['id']+'.png')).stat().st_size))
Path('docs/iteration281-assets.json').write_text(json.dumps(report,indent=2))
# Contact sheet is only a preview of generated sprites, not a source of artwork.
canvas=Image.new('RGBA',(7*280,360),'#18332d')
for i,item in enumerate(items):
 im=Image.open(out/(item['id']+'.png')).resize((256,256),Image.Resampling.NEAREST);canvas.alpha_composite(im,(i*280+12,30))
canvas.convert('RGB').save('docs/iteration281-samples.png')
print(json.dumps(report))
