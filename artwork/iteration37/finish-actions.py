"""Authorized offline corrections to direction and release silhouettes. Raw art stays intact."""
from pathlib import Path
from PIL import Image,ImageDraw
import shutil,json
s=Path(__file__).parent;backup=s/'pre-finish-actions';backup.mkdir(exist_ok=True)
classes=['novice','warrior','archer','rogue','priest','mage'];report=[]
for cls in classes:
 for body in ['masculine','feminine']:
  name=f'{cls}-{body}-actions';file=s/'masters'/f'{name}.png';original=backup/file.name
  if not original.exists():shutil.copy2(file,original)
  atlas=Image.open(original).convert('RGBA')
  def cell(col,row):return atlas.crop((col*96,row*96,(col+1)*96,(row+1)*96))
  def put(im,col,row):atlas.paste(im,(col*96,row*96))
  if cls=='rogue':
   put(cell(5,3).transpose(Image.Transpose.FLIP_LEFT_RIGHT),5,1)
   c=cell(4,2);arms=c.crop((24,56,72,76));c.paste((0,0,0,0),(24,56,72,76));c.alpha_composite(arms,(24,54));put(c,5,2)
  if cls=='priest' and body=='feminine':put(cell(7,3).transpose(Image.Transpose.FLIP_LEFT_RIGHT),7,1)
  if cls=='warrior' and body=='feminine':
   for col in [0,1]:put(cell(col,3).transpose(Image.Transpose.FLIP_LEFT_RIGHT),col,1)
  # An arrow belongs to the wind-up drawing only. Remove the exposed shaft/tip
  # from the released pose, retaining the held bow and arm pixels.
  for row in range(4):
   c=cell(1,row);pix=c.load()
   # Find the bow by its isolated amber shaft in the upper half of the frame.
   candidates=[]
   for x in range(12,84):
    count=sum(1 for y in range(26,48) if (lambda q:q[3]>100 and q[0]>q[1]*1.12 and q[1]>q[2]*1.3)(pix[x,y]))
    if count>=4:candidates.append((count,x))
   # Exposed arrows are pale and almost horizontal; cleanup stays outside torso.
   for y in range(45,62):
    for x in range(8,88):
     r,g,b,a=pix[x,y]
     if a>100 and max(r,g,b)-min(r,g,b)<65 and min(r,g,b)>125 and (x<29 or x>73):pix[x,y]=(0,0,0,0)
   put(c,1,row)
  atlas.save(file);report.append({'id':name,'releaseCleanup':True,'manualDirectionCorrection':cls in ['rogue','priest','warrior']})
(s/'action-finishing.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
