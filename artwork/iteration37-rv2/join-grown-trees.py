from pathlib import Path
from PIL import Image,ImageDraw
import shutil
p=Path('C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536')
s=Path(__file__).parent
a=p/'public/assets/skill-tree-v37-rv2'
backup=s/'tree-before-join';backup.mkdir(exist_ok=True)
colors={'warrior':['#3c291b','#634023','#976b37','#b48a4b'],'archer':['#322e21','#594a2c','#8c7944','#b59e62'],'rogue':['#25272c','#3f363b','#67514d','#957363'],'priest':['#4e3d28','#79633a','#ad9158','#d5bd7b'],'mage':['#2c2838','#48364b','#72546a','#ad7b8b']}
young=Image.open(a/'novice.png').convert('RGBA')
for cls,palette in colors.items():
 src=backup/(cls+'.png')
 if not src.exists():shutil.copy2(a/(cls+'.png'),src)
 old=Image.open(src).convert('RGBA');out=Image.new('RGBA',(360,740));draw=ImageDraw.Draw(out)
 # One trunk continuing from the young stem to the promoted crown. No second root system.
 draw.polygon([(158,425),(201,425),(192,480),(190,545),(196,587),(189,621),(173,641),(163,625),(170,570),(170,500)],fill=palette[0])
 draw.polygon([(164,425),(196,425),(185,487),(185,547),(190,590),(183,620),(172,632),(174,572),(175,495)],fill=palette[1])
 draw.line([(185,425),(179,477),(181,533),(181,578),(176,621)],fill=palette[2],width=7)
 draw.line([(190,431),(184,482),(187,538),(183,581)],fill=palette[3],width=2)
 for x in [167,174,190]:draw.line([(x,434),(x-3,470),(x+1,510)],fill=palette[0],width=2)
 # Continue authored bark in native pixel rows, tapering into the young trunk.
 for y in range(425,635):
  half=round(45-(min(110,y-425)/110)*31)
  row=old.crop((145,350+(y-425)%62,215,351+(y-425)%62)).resize((half*2,1),Image.Resampling.NEAREST)
  out.alpha_composite(row,(180-half,y))
 offsets={'archer':[-10,10],'rogue':[25,25],'mage':[15,-15]}.get(cls,[0,0])
 for side,ox in zip([0,2],offsets):
  x=round(([155,360,565][side]+ox)/2)
  points=[(180,488),(round((180+x)/2),465),(x+(-8 if side==0 else 8),420),(x,400),(x,310)]
  for width,color in zip([13,9,3],[palette[0],palette[1],palette[3]]):draw.line(points,fill=color,width=width)
 # Crop the adult root flare; preserve the existing lower skill branches.
 upper=old.crop((0,0,360,460));mask=Image.new('L',upper.size,255);md=ImageDraw.Draw(mask)
 for y in range(431,460):
  half=max(22,90-(y-431)*3);md.rectangle((0,y,180-half-1,y),fill=0);md.rectangle((180+half+1,y,359,y),fill=0)
 upper.putalpha(Image.composite(upper.getchannel('A'),Image.new('L',upper.size),mask))
 out.alpha_composite(upper);out.alpha_composite(young,(0,480));out.save(a/(cls+'.png'),optimize=True)
f=p/'src/ui/ranked-tree.css';t=f.read_text(encoding='utf-8');t+='\n.living-tree:not([data-class=novice]) .living-tree-image{height:1480px}.living-roots-image{visibility:hidden}\n';f.write_text(t,encoding='utf-8')
