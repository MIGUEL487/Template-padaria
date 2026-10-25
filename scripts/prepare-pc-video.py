"""Gera o scrub de PC sem o primeiro quadro de enquadramento incompatível.
Uso: python3 scripts/prepare-pc-video.py PC.zip
Requer Pillow e ffmpeg. Não amplia nem reduz a largura útil de 1080 pixels.
"""
from pathlib import Path
from PIL import Image, ImageStat
from io import BytesIO
import zipfile, tempfile, subprocess, hashlib, json, sys

with tempfile.TemporaryDirectory(prefix='refugio-pc-') as tmp:
    root=Path(tmp);target=Path('public/frames/pc');target.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(sys.argv[1]) as z:
        names=sorted(n for n in z.namelist() if Path(n).name.startswith('ezgif-frame-') and n.endswith('.jpg'))
        if len(names)!=240:raise ValueError('Esperados os 240 quadros do lote PC inspecionado')
        first=Image.open(BytesIO(z.read(names[0]))).convert('RGB')
        if sum(ImageStat.Stat(first.crop((0,300,1080,400))).mean)/3>=10:
            raise ValueError('Primeiro quadro mudou: reinspecione o enquadramento antes de excluir')
        for i,name in enumerate(names[1:]):
            data=z.read(name);im=Image.open(BytesIO(data)).convert('RGB')
            if im.size!=(1080,1920) or sum(ImageStat.Stat(im.crop((0,300,1080,400))).mean)/3<10:
                raise ValueError(f'Enquadramento incompatível: {name}')
            (root/f'{i:03}.jpg').write_bytes(data)
        poster=Image.open(root/'000.jpg').crop((0,600,1080,1320))
        poster.save(target/'poster.webp','WEBP',lossless=True)
    output=root/'scroll.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-framerate','30','-i',str(root/'%03d.jpg'),'-vf','crop=1080:720:0:600','-c:v','libx264','-preset','medium','-crf','15','-g','1','-keyint_min','1','-bf','0','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2','-y',str(output)],check=True)
    data=output.read_bytes();(target/'scroll.mp4').write_bytes(data)
    revision=hashlib.sha256(data).hexdigest()[:12]
    manifest={'renderer':'video','video':'scroll.mp4','poster':'poster.webp','count':239,'fps':30,'width':1080,'height':720,'revision':revision,'excludedSourceFrames':['ezgif-frame-001.jpg'],'sourceFirstFrame':'ezgif-frame-002.jpg','sourceLastFrame':'ezgif-frame-240.jpg'}
    (target/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    for p in target.glob('frame_*.webp'):p.unlink()
    print('PC: 239 quadros 1080x720, todos keyframes,',len(data),'bytes')
