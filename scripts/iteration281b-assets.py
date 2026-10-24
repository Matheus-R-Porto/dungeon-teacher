from PIL import Image,ImageDraw
from pathlib import Path
import json,shutil
root=Path('.')
out=root/'public/assets/items/inventory-v281';out.mkdir(parents=True,exist_ok=True)
source=root/'docs/art/iteration281b-sources';source.mkdir(parents=True,exist_ok=True)
manifest=root/'docs/iteration281b-generation.json'
rows=json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else []
for row in rows:
 dest=source/(row['id']+'.png')
 shutil.copy2(row['source'],dest)
report=[]
for src in [*Path('docs/art/iteration281-sources').glob('*.png'),*source.glob('*.png')]:
 im=Image.open(src).convert('RGBA');bounds=im.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox()
 if not bounds:raise ValueError(src)
 crop=im.crop(bounds);crop.thumbnail((108,108),Image.Resampling.LANCZOS)
 result=Image.new('RGBA',(128,128));result.paste(crop,((128-crop.width)//2,(128-crop.height)//2))
 result.save(out/src.name,optimize=True)
 report.append(dict(id=src.stem,source=str(src),sourceSize=im.size,bounds=bounds,bytes=(out/src.name).stat().st_size))
Path('docs/iteration281b-assets.json').write_text(json.dumps(report,indent=2))
catalog=json.loads(Path('docs/iteration281b-catalog.json').read_text(encoding='utf-8'));order={i['id']:n for n,i in enumerate(sorted(catalog,key=lambda i:(i['type'],i['id'])))}
files=sorted(out.glob('*.png'),key=lambda p:order[p.stem]);sheet=Image.new('RGB',(8*200,((len(files)+7)//8)*190),'#19332b');draw=ImageDraw.Draw(sheet)
for n,file in enumerate(files):
 im=Image.open(file);x=(n%8)*200;y=(n//8)*190;sheet.paste(im,(x+36,y+10),im);draw.text((x+5,y+145),file.stem,fill='white')
sheet.save('docs/iteration281b-contact.png')
print('Prepared',len(files),'sprites; bytes',sum(r['bytes'] for r in report))

