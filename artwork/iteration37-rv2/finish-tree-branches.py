from pathlib import Path
from PIL import Image,ImageDraw
s=Path(__file__).parent;p=Path('C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/public/assets/skill-tree-v37-rv2')
for name,offset in [('warrior',[0,0,0]),('archer',[-10,0,10]),('rogue',[25,15,25]),('priest',[0,0,0]),('mage',[15,0,-15])]:
 im=Image.open(p/f'{name}.png').convert('RGBA');under=Image.new('RGBA',im.size);g=ImageDraw.Draw(under)
 palette={'priest':['#494139','#a18653','#e4d4a1'],'mage':['#292335','#66513f','#a68e6b'],'rogue':['#261d26','#594027','#a27b48']}.get(name,['#29271c','#805430','#c6934e'])
 for side in [0,2]:
  x=round(([155,360,565][side]+offset[side])/2);pts=[(180,490),(round((180+x)/2),455),(x+(-8 if side==0 else 8),420),(x,400),(x,310)]
  for width,color in zip([13,9,3],palette):g.line(pts,fill=color,width=width)
 under.alpha_composite(im);under.save(p/f'{name}.png')
print('Lower branch junctions joined to the actual skill positions')
