from pathlib import Path
from PIL import Image,ImageDraw
import math,json,sys,colorsys
s=Path(__file__).parent;src=s/'repaired';out=s/'professions';out.mkdir(exist_ok=True)
classes=['novice','warrior','archer','rogue','priest','mage'];bodies=['masculine','feminine']
# Native 96px body is placed at +16 in a 128px tool cell; same world pixel scale.
FISH_RIGHT=[((60,65),(25,12)),((45,66),(84,26)),((43,65),(103,45)),((42,70),(91,27)),((42,67),(89,16)),((42,65),(84,12)),((41,67),(89,20)),((42,71),(101,53))]
MINE_LEFT=[((59,70),(27,64)),((56,59),(53,26)),((56,49),(72,21)),((60,57),(28,38)),((61,68),(23,85)),((59,66),(25,73)),((58,68),(26,65)),((59,70),(27,64))]
def cell(im,d,f):
 i=d*36+f;return im.crop((i%9*96,i//9*96,i%9*96+96,i//9*96+96))
def tool_points(d,kind,k):
 if kind=='fishing':
  a,b=FISH_RIGHT[k]
  if d==1:a,b=tuple((96-x,y) for x,y in [a,b])
  if d==0:
   a=(43,65 if k<3 else 68);b=[(24,15),(64,44),(85,92),(81,80),(78,63),(73,45),(78,55),(83,87)][k]
  if d==2:a=(48,65);b=[(24,15),(62,20),(87,28),(81,22),(78,13),(73,10),(78,16),(87,35)][k]
 else:
  a,b=MINE_LEFT[k]
  if d==3:a,b=tuple((96-x,y) for x,y in [a,b])
  if d in [0,2]:
   a=[(60,68),(43,60),(40,47),(35,59),(35,68),(36,68),(60,68),(60,68)][k];b=[(27,67),(70,28),(73,20),(74,46),(76,86 if d==0 else 55),(72,77 if d==0 else 47),(29,69),(27,67)][k]
 return a,b
def lerp(a,b,t):return tuple(round(x+(y-x)*t) for x,y in zip(a,b))
def mask(im):
 result=Image.new('RGBA',im.size,(0,0,0,255));px=result.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=im.getpixel((x,y));h,ss,v=colorsys.rgb_to_hsv(r/255,g/255,b/255);h*=360
   if a>127:
    if 203<=h<255 and b>r*1.2:px[x,y]=(255,0,0,255)
    elif 255<=h<303 and b>g*1.2:px[x,y]=(0,255,0,255)
 return result
def body_pose(base,d,kind,k):
 protected=garment(d);im=base.copy();px=im.load();regions=[(26,56,36,74),(60,56,70,74)] if d%2==0 else [(47,55,58,74)] if d==1 else [(38,55,49,74)]
 for x0,y0,x1,y1 in regions:
  for y in range(y0,y1):
   for x in range(x0,x1):
    r,g,b,a=px[x,y]
    if a and not protected.getpixel((x,y)) and not (b>r*1.2 and b>g*.85):px[x,y]=(0,0,0,0)
 lean=([0,0,0,2,6,3,1,0] if kind=='mining' else [0,0,3,0,-2,-3,-2,0])[k]
 if lean:
  upper=Image.new('RGBA',(96,96));upper.alpha_composite(im.crop((0,0,96,75)));im.paste((0,0,0,0),(0,0,96,75))
  if d%2:upper=upper.rotate(lean*(1 if d==1 else -1),resample=Image.Resampling.NEAREST,center=(48,77));im.alpha_composite(upper)
  else:im.alpha_composite(upper,(0,max(0,round(lean/2))))
 return im,lean
def draw_tool(layer,a,b,kind):
 g=ImageDraw.Draw(layer);g.line([a,b],fill='#251d1c',width=4);g.line([a,b],fill='#916038',width=2);g.line([(a[0],a[1]-1),(b[0],b[1]-1)],fill='#d5ae6c',width=1)
 if kind=='mining':
  dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy);nx,ny=-dy/length,dx/length;ux,uy=dx/length,dy/length
  pts=[(b[0]+nx*t+ux*bend,b[1]+ny*t+uy*bend) for t,bend in [(-11,-3),(-6,1),(0,2),(7,0),(12,-4)]];g.line(pts,fill='#202128',width=5);g.line(pts,fill='#7a8084',width=3);g.line([(x-1,y-1) for x,y in pts],fill='#cfd5c8',width=1)
 else:
  r=lerp(a,b,.18);g.ellipse((r[0]-3,r[1]-1,r[0]+3,r[1]+5),fill='#202128',outline='#a7b0ae');g.point((r[0],r[1]+2),fill='#ede8d8');g.rectangle((b[0]-1,b[1]-1,b[0]+1,b[1]+1),fill='#d5ae6c')
def draw_arms(im,d,a,b,kind,k,cls,lean):
 g=ImageDraw.Draw(im);glove=['#4b2f23','#865639','#cc9969'] if cls in ['novice','warrior','archer','rogue'] else ['#8a5037','#d99b69','#f9d9aa'];sleeve={'warrior':('#54585e','#a7b0ae'),'novice':('#938c91','#dfd5c5'),'archer':('#435b82','#8fa5bd'),'rogue':('#392b4c','#6d5282'),'priest':('#beb5b2','#f5e8cf'),'mage':('#2e4268','#607b9c')}[cls]
 hands=[lerp(a,b,t) for t in ([.27,.54] if kind=='mining' else [.16,.32])]
 shoulders=[(33,55),(63,55)] if d%2==0 else [(49,55),(54,57)] if d==1 else [(47,55),(42,57)]
 for i,(shoulder,hand) in enumerate(zip(shoulders,hands)):
  shift=(-1 if d==1 else 1)*round(lean/3) if d%2 else 0;shoulder=(shoulder[0]+shift,shoulder[1]+max(0,round(lean/3)));elbow=(round((shoulder[0]+hand[0])/2)+(-3 if i==0 else 3),round((shoulder[1]+hand[1])/2)+(3 if hand[1]>shoulder[1] else -2))
  g.line([shoulder,elbow,hand],fill='#251d1c',width=7);g.line([shoulder,elbow],fill=sleeve[0],width=5);g.line([(shoulder[0]-1,shoulder[1]),(elbow[0]-1,elbow[1])],fill=sleeve[1],width=2);g.line([elbow,hand],fill=glove[0],width=5);g.line([(elbow[0],elbow[1]-1),(hand[0],hand[1]-1)],fill=glove[1],width=3);g.rectangle((hand[0]-2,hand[1]-2,hand[0]+2,hand[1]+2),fill=glove[0]);g.line([(hand[0]-1,hand[1]-1),(hand[0]+1,hand[1]-1)],fill=glove[2],width=1)
 return hands
def build(cls,body):
 old=Image.open(src/f'{cls}-{body}-none.png').convert('RGBA');atlas=Image.new('RGBA',(1024,1024));records=[]
 for d in range(4):
  base=cell(old,d,0)
  for kind,offset in [('fishing',0),('mining',8)]:
   for k in range(8):
    im,lean=body_pose(base,d,kind,k);large=Image.new('RGBA',(128,128));large.alpha_composite(im,(16,16));a,b=tool_points(d,kind,k);aa,bb=tuple((x+16,y+16) for x,y in [a,b]);tool=Image.new('RGBA',(128,128));draw_tool(tool,aa,bb,kind)
    if d==2:
     tool.alpha_composite(large);large=tool
    else:large.alpha_composite(tool)
    arm=Image.new('RGBA',(96,96));hands=draw_arms(arm,d,a,b,kind,k,cls,lean);large.alpha_composite(arm,(16,16));index=d*16+offset+k;atlas.alpha_composite(large,(index%8*128,index//8*128));records.append({'direction':d,'type':kind,'phase':k,'frame':offset+k,'tip':list(bb),'hands':[[x+16,y+16] for x,y in hands]})
 atlas.save(out/f'{cls}-{body}.png');mask(atlas).save(out/f'{cls}-{body}-mask.png');(out/f'{cls}-{body}.json').write_text(json.dumps({'cell':128,'columns':8,'rows':8,'framesPerDirection':16,'feetY':104,'records':records},indent=2),encoding='utf-8')
 for kind,offset in [('fishing',0),('mining',8)]:
  board=Image.new('RGB',(1024,512),'#26333b');seq=[]
  for k in range(8):
   strip=Image.new('RGB',(512,128),'#26333b')
   for d in range(4):i=d*16+offset+k;q=atlas.crop((i%8*128,i//8*128,i%8*128+128,i//8*128+128));board.paste(q,(k*128,d*128),q);strip.paste(q,(d*128,0),q)
   seq.append(strip)
  board.save(s/f'{cls}-{body}-{kind}.png');seq[0].save(s/f'{cls}-{body}-{kind}.gif',save_all=True,append_images=seq[1:],duration=[150,120,120,400,140,160,160,200],loop=0,disposal=2)
if __name__=='__main__':
 for cls in (classes if '--all' in sys.argv else ['novice']):
  for body in (bodies if '--all' in sys.argv else ['masculine']):build(cls,body)
 print('Prepared native profession poses')
