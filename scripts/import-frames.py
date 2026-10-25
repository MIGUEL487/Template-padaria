"""Importa os ZIPs fornecidos sem extrair caminhos arbitrários.
Uso: python3 scripts/import-frames.py PC.zip Celular.zip
PC usa o pipeline de vídeo nativo em prepare-pc-video.py; celular permanece WebP.
"""
from PIL import Image, ImageStat
from pathlib import Path
from io import BytesIO
import zipfile, json, sys, hashlib, subprocess

def convert(archive,group,size,crop=None):
    target=Path('public/frames')/group
    with zipfile.ZipFile(archive) as z:
        names=sorted(n for n in z.namelist() if Path(n).name.startswith('ezgif-frame-') and n.lower().endswith('.jpg'))
        if not names: raise ValueError('ZIP sem sequência JPG')
        # Converte tudo antes de substituir o conjunto anterior.
        prepared=[];colors=[]
        for i,name in enumerate(names,1):
            im=Image.open(BytesIO(z.read(name))).convert('RGB')
            if im.size!=(1080,1920):raise ValueError(f'Dimensões inesperadas: {name}: {im.size}')
            if crop: im=im.crop(crop)
            im.thumbnail(size,Image.Resampling.LANCZOS)
            output=BytesIO();im.save(output,'WEBP',quality=82,method=6)
            prepared.append((f'frame_{i:03}.webp',output.getvalue()))
            colors.append(ImageStat.Stat(im.crop((0,im.height-16,im.width,im.height))).mean)
        target.mkdir(parents=True,exist_ok=True)
        for p in target.glob('frame_*.webp'):p.unlink()
        for name,data in prepared:(target/name).write_bytes(data)
        bottom='#'+''.join(f'{round(sum(c[i] for c in colors)/len(colors)):02x}' for i in range(3))
        manifest={'frames':[n for n,_ in prepared],'count':len(prepared),'width':im.width,'height':im.height,'bottomColor':bottom,'revision':hashlib.sha256(b''.join(data for _,data in prepared)).hexdigest()[:12]}
        (target/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        print(group,manifest['count'],im.size,'bytes',sum(len(b) for _,b in prepared),flush=True)

if __name__=='__main__':
    subprocess.run([sys.executable,'scripts/prepare-pc-video.py',sys.argv[1]],check=True)
    convert(sys.argv[2],'mobile',(540,960))
