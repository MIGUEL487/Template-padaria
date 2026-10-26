# Inspeção dos anexos v2

## Atualização atual — novos frames Full HD de PC

`ezgif-608aead148f86922-jpg.zip` substitui **somente o conjunto PC**. São 150 JPEGs, `ezgif-frame-001.jpg` a `ezgif-frame-150.jpg`, todos em **1920×1080**, sem mudança de dimensões. Cena: peneira polvilhando farinha em um pão, em paisagem. Primeiro, intermediário e último frame foram abertos visualmente.

Os bytes JPEG foram preservados sem reconversão ou upscaling. Total: **5.788.858 bytes**; maior frame: **127.659 bytes**. O poster é cópia do primeiro frame com nome novo `poster-hq.jpg`. O manifesto usa os nomes reais e o novo caminho para não reutilizar os antigos WebP de PC. A cor inferior do último frame, medida, é `#605a54`.

Os 150 WebP móveis em 720×1280 e as cinco fotos **não foram alterados**. Agora são 300 frames no total. O conjunto PC anterior de 239 WebP foi removido da árvore publicada. O pico de bitmaps permitido foi reduzido no PC para janela ±4 / 6 à frente para compensar a resolução maior.

As medições anteriores em PERF.md referem-se ao PC antigo; a atualização Full HD tem validações específicas em `fullscreen-checks.json` e `hero-fullscreen-update.md`.

## Material recebido anteriormente — PC substituído pela atualização acima

Os anexos `files.zip` e `fotos-webp.zip` substituem os conjuntos abaixo. Foram extraídos e inspecionados primeiro, meio e último frame, além das cinco fotografias.

- PC: **239 frames reais**, `frame_001.webp` a `frame_239.webp`, todos **1080×720**. O poster é separado e não conta como frame. 10.203.668 bytes, máximo 57.926 bytes por frame. Enquadramento horizontal consistente nas amostras, sem as barras pretas do conjunto anterior.
- Celular: **150 frames reais**, `frame_001.webp` a `frame_150.webp`, **720×1280**. 7.315.498 bytes, máximo 56.314 bytes por frame. Fundo escuro faz parte da cena.
- Total: **389 frames**. Não há necessidade de reconverter os WebP fornecidos, que foram preservados. Manifestos de origem foram conferidos; o manifesto publicado foi produzido a partir dos arquivos reais, sem contar `poster.webp` nem assumir números.
- BottomColor amostrado na faixa inferior de 16 linhas do último frame: PC `#ab9d8c`; celular `#342d26`. A junção visual considera também o scrim final do hero, evitando ligar diretamente uma foto escurecida a uma cor amostrada clara.
- Cinco fotos recebidas em WebP: café/croissant 1920×1440 (119.668 bytes), interior 1920×1920 (133.016), pães vistos de cima 1920×1428 (274.028), vitrine 1920×1280 (177.532), pães rústicos 1920×1280 (146.716). Variantes locais AVIF/WebP em 640/960/1440; detalhes em `photo-measured.json`.

As fontes continuam ausentes. Usadas reservas Georgia e system-ui. As seções foram implementadas com as imagens atuais; nenhum material das versões apagadas foi recuperado e nenhuma foto foi gerada.

## Histórico da inspeção anterior — superado pelos novos anexos

Inspeção visual dos primeiros, intermediários e últimos frames em contact sheets, além de metadados dos arquivos reais. O script `import-assets.mjs` registra medidas e a lista ordenada em `assets-measured.json` e `public/frames/manifest.json`.

## PC.zip

240 JPEGs, `ezgif-frame-001.jpg` a `ezgif-frame-240.jpg`. Amostras 001, 060, 120, 121 e 240: **1080×1920, retrato**, não paisagem. Padeiro sovando massa.

Faixa aproximada de conteúdo por amostragem de linhas (limiar de brilho 18/255, análise reduzida a 108×192): no frame 001, y≈600–1320; nos frames 060, 120 e 240, y≈240–1680. Confirmado visualmente: a imagem cresce dentro de uma tela vertical com barras pretas. O limiar é diagnóstico, não um recorte exato de produção.

Não foi aplicado recorte variável nem aumento artificial de resolução: isso poderia esconder as barras introduzindo mudanças de zoom ou descarte de conteúdo. É necessário receber a exportação de PC em paisagem, com enquadramento consistente, para validar o hero pedido.

## Celular.zip

150 JPEGs, `ezgif-frame-001.jpg` a `ezgif-frame-150.jpg`. Amostras 001, 060, 076, 120 e 150: **1080×1920**, cena de mão polvilhando farinha no pão, fundo escuro. Área escura no alto pertence à cena; não deve ser tratada automaticamente como barra preta.

## Ausências

Os anexos desta entrega não contêm `Imagem/`, as cinco fotografias citadas no briefing, `Textos.txt`, `Prompt do Scrolling.txt` nem arquivos de fontes. O texto oficial do hero está no briefing v2 e foi preservado em `app/config/site.ts`; os outros dois TXT não são necessários para recuperar esse texto.

Fontes personalizadas ausentes: utilizar Georgia e system-ui como reservas explícitas. Não foi carregada nem licenciada Bringbold, Kangmas, Balney ou DM Sans.

Fotos necessárias: `Pao.jpg`, `Pao 2.jpg`, `Pao 1.jpg`, `Croassaint com Cafe.jpg`, `Interior de uma Padaria.jpg`. Nenhuma fotografia foi gerada, substituída por material falso ou recuperada de versões apagadas.

## Estado

A preparação WebP preserva o enquadramento dos arquivos recebidos. O conjunto PC continua inadequado para aprovação visual e de desempenho do hero paisagem. O manifesto é técnico e ainda não constitui aprovação para publicação.

Pesos medidos: PC original 11.702.885 bytes, WebP 16.080.912 bytes, maior frame 72.164 bytes; celular original 7.605.800 bytes, WebP 6.631.820 bytes, maior frame 50.188 bytes. Nenhum frame excede as metas individuais do briefing. A conversão PC ficou maior que o JPEG original: não é uma melhoria de peso total, e deverá ser revista com a sequência correta. Não há buracos de numeração em nenhum dos dois conjuntos.

Base técnica: `nuxt typecheck` e `nuxt generate` concluídos com sucesso. O teste proposital com 13 px foi rejeitado pelo lint. Ainda não foram executadas medições ou revisão visual de um hero funcional, pois ele não foi implementado nesta preparação.
