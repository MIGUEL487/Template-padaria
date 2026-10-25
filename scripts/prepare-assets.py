from PIL import Image, ImageStat
from pathlib import Path
import json
for p in Path('public/images').glob('*.jpg'):
 im=Image.open(p).convert('RGB')
 for width in [640,1280]:
  copy=im.copy();copy.thumbnail((width,10000));copy.save(p.with_name(p.stem+f'-{width}.webp'),'WEBP',quality=80)
for group in ['pc','mobile']:
 paths=sorted(Path('public/frames',group).glob('*.webp'))
 colors=[]
 for p in paths:
  im=Image.open(p).convert('RGB');colors.append(ImageStat.Stat(im.crop((0,im.height-16,im.width,im.height))).mean)
 color='#'+''.join(f'{round(sum(c[i] for c in colors)/len(colors)):02x}' for i in range(3))
 Path('public/frames',group,'manifest.json').write_text(json.dumps({'frames':[p.name for p in paths],'count':len(paths),'width':im.width,'height':im.height,'bottomColor':color},indent=2))
 print(group,len(paths),im.size,color,max(p.stat().st_size for p in paths))
