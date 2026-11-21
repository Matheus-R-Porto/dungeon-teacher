from pathlib import Path
from PIL import Image
import shutil
s=Path(__file__).parent;f=s/'masters/white-wolf-main.png';backup=s/'pre-finish-actions/white-wolf-main.png'
if not backup.exists():shutil.copy2(f,backup)
atlas=Image.open(backup).convert('RGBA')
# Back/right recoil in the study looked like the death pose. Prepare distinct,
# grounded, compressed whole-body drawings; scar remains on the authored side.
for direction in [2,3]:
 base=atlas.crop((0,direction*96,96,direction*96+96));shear=-.10 if direction==3 else .06
 recoil=base.transform((96,96),Image.Transform.AFFINE,(1,shear,-shear*87,0,1/.92,87-87/.92),Image.Resampling.NEAREST)
 atlas.paste(recoil,(6*96,direction*96))
atlas.save(f)
