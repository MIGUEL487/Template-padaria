# Correção do scrub de PC

## Diagnóstico
- No ZIP de PC, somente `ezgif-frame-001.jpg` usa área útil 1080×720 entre barras y599–1319; os quadros 002–240 ocupam 1080×1440 entre y240–1680. A abertura antiga começava com outro enquadramento. Foi excluído apenas esse primeiro quadro incompatível.
- A exportação anterior reduzia PC para 960px e o canvas intermediário era ampliado por CSS. Além disso, a janela de bitmaps buscava e decodificava imagens durante o gesto; no teste anterior havia picos de rAF.
- Os JPGs originais também contêm blocos de compressão visíveis, especialmente em mãos em movimento. Isso já está na fonte; não é possível restaurar detalhe real ausente.

## Solução
239 quadros compatíveis, recorte fixo `(0,600,1080,1320)` em todos eles. Exportação H.264 1080×720, CRF15, todos os quadros independentes (GOP1, sem B-frames), faststart e 30fps. Arquivo ~9,6 MB; substitui ~13,4 MB de WebP de PC. Poster lossless do mesmo quadro inicial, mesmo recorte.

No desktop, `<video>` fica pausado e o tempo é controlado pelo progresso do scroll. Há apenas um seek pendente; quando termina, segue para o alvo mais recente. Não há canvas ampliado nem fetch de JPG/WebP individual no desktop. Mantida a retenção da cena, saída e navegação. Mobile permanece no renderer de bitmaps existente. Com movimento reduzido no PC, somente o poster é mostrado, sem carregar o MP4.

Reprodução: `python3 scripts/prepare-pc-video.py caminho/PC.zip` (Pillow e ffmpeg).

## Evidências
- ffprobe: 239 quadros, 239 keyframes, 1080×720, 30fps, duração 7,966667s.
- Comparação RGB: primeiro quadro codificado vs poster nativo PSNR 46,99dB; quadro de vídeo 119 vs JPG original 121 recortado: 42,87dB. São amostras, não métrica de toda a sequência; não provam recuperação de detalhe perdido na fonte.
- Chromium local: 80 seeks, mediana 15,8ms, p95 24ms e máximo 32,8ms; zero pedidos de imagens individuais de PC, zero erros JS. Ver pc-video-results.json.
- Início, 25%, 50%, 75%, fim e retorno, rolagem com wheel e troca de orientação validados. Testes de navegação, filtros, modal e movimento reduzido passaram em 390/768/1440.
- A matriz de rAF ainda tem picos em alguns cenários, especialmente CPU4×; não foi demonstrada ausência absoluta de travadas em qualquer dispositivo/rede. Métricas de rAF não equivalem à latência do decoder. Ver PERF.md.

Para melhorar a nitidez além da fonte atual, é necessário o vídeo original de PC, preferencialmente exportado em paisagem e com menos compressão. Não foi inventada resolução extra ou aplicado sharpening para disfarçar os blocos.
