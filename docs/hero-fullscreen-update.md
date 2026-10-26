# Hero em tela cheia e PC Full HD

- Selo sobreposto “o refúgio — pão, café & tempo” removido do DOM do hero em todas as larguras. A navegação posterior ao título permanece.
- PC substituído por 150 JPEGs 1920×1080 enviados pelo usuário, sem nova compressão com perdas. Celular e fotos preservados.
- Hero usa altura dinâmica `100dvh`, com reserva `100vh`. Em dispositivos móveis, largura de viewport e limites de altura do pin são sobrescritos para acompanhar a área visível.
- Causa reproduzida de um espaço vazio: em um viewport de 393×723, o ScrollTrigger colocava `max-height:723px` inline no hero. Ao aumentar a altura visível para 844, o vídeo continuava limitado a 723. O novo CSS remove esse teto no móvel. A barra de rolagem móvel também não reserva faixa lateral.
- ResizeObserver recalcula o cover e repinta imediatamente o bitmap retido, pois mudar width/height interno apaga um canvas. Medidas nulas são ignoradas e dimensões idênticas não apagam novamente a imagem.
- Ao trocar entre retrato e paisagem durante o pin, o progresso é guardado e restaurado na nova sequência, em vez de saltar para uma seção posterior.
- O comprimento do pin acompanha a quantidade real de frames; os dois conjuntos atuais têm 150 e usam quatro alturas de hero.
- PC usa janela ±4 / 6 à frente (pico de aproximadamente 11 bitmaps, ~91 MB RGBA teóricos em 1920×1080, além de buffers e demais recursos). Móvel continua ±8 / 12 à frente. Isso não é medição de memória RSS/GPU.

## Verificação

`scripts/check-hero-fullscreen.mjs` valida entrada e quatro posições de scroll em 375×667, 390×844, 393×723, 768×1024, 1440×900 e 1920×1080. Verifica preenchimento do viewport, ausência do selo, canvas com imagem desenhada, ausência de overflow e carregamento apenas do conjunto necessário.

No caso 393×723, testa mudanças de altura para 844, 640 e 780, sem apagar o canvas, e depois rotação para 844×390. Também verifica o poster antes do JavaScript. Resultados em `fullscreen-checks.json`. A ordem dos pins é coberta por `check-pin-order.mjs`, agora sem contagens fixas de frames.

Testes usam Chromium com emulação móvel. Não houve ensaio em Safari/iPhone físico. “Tela inteira” significa a área disponível para a página; não esconde as barras do próprio navegador nem solicita a API Fullscreen.

## Medição do novo PC Full HD

Build estático, Chromium headless, 1440×900. DPR 1/2, CPU 1×/4×, com/sem Lenis. Resultados brutos em pc-hq-perf.json.

| DPR | CPU | Lenis | Mediana ms | p95 ms | Máx ms | >50ms | Updates Vue |
|---|---|---|---|---|---|---|---|
| 1 | 1× | on | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 1 | 1× | off | 16.7 | 16.7 | 49.9 | 0 | 0 |
| 1 | 4× | on | 16.7 | 33.4 | 83.3 | 1 | 0 |
| 1 | 4× | off | 16.7 | 33.3 | 50.0 | 0 | 0 |
| 2 | 1× | on | 16.7 | 16.8 | 16.8 | 0 | 0 |
| 2 | 1× | off | 16.7 | 16.8 | 16.8 | 0 | 0 |
| 2 | 4× | on | 16.7 | 16.7 | 33.4 | 0 | 0 |
| 2 | 4× | off | 16.7 | 16.8 | 100.0 | 2 | 0 |

Pico observado: 11 bitmaps de PC. Canvas até 1728×1080 em DPR 2, abaixo da origem 1920×1080. Todos os cenários chegaram ao índice final 149. Houve 3 intervalos >50 ms no conjunto de medições; não é garantia de ausência de picos em aparelhos reais.
