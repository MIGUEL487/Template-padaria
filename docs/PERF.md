# Performance — PC com vídeo nativo

Medição no preview de produção com Chromium local headless, DPR 1/2, viewport 390×900 e 1440×900, CPU normal/4× limitada. Wheel real em 50 passos de 24px. Valores desta máquina, sem garantia de FPS em dispositivos físicos ou redes reais.

PC agora usa vídeo pausado 1080×720 de quadros independentes. Latência do seek medida separadamente em 80 eventos: mediana 15,8ms, p95 24ms, máximo 32,8ms; zero requisições individuais de imagens PC. Ver pc-video-results.json. Mobile mantém 150 WebP e janela de até 25 bitmaps. Não há estado React por tick de scroll.

Na matriz de rAF, mediana 16,7ms em todos os cenários. Houve picos, principalmente com CPU limitada; não foi demonstrada ausência absoluta de travadas. rAF mede a agenda do navegador, não equivale diretamente à latência de decodificação nem prova que um quadro de vídeo foi apresentado a cada amostra. O campo canvas no JSON é do elemento oculto no PC e não é a resolução do vídeo; a resolução nativa foi verificada no teste específico e ffprobe.

| Largura | DPR | CPU | Mediana ms | p95 ms | Máximo ms | >50 ms |
|---|---|---|---|---|---|---|
| 390 | 1 | 1× | 16.7 | 16.7 | 16.8 | 0 |
| 390 | 1 | 4× | 16.7 | 33.4 | 33.5 | 0 |
| 390 | 2 | 1× | 16.7 | 16.7 | 16.8 | 0 |
| 390 | 2 | 4× | 16.7 | 33.4 | 33.4 | 0 |
| 1440 | 1 | 1× | 16.7 | 33.3 | 133.3 | 2 |
| 1440 | 1 | 4× | 16.7 | 16.7 | 16.8 | 0 |
| 1440 | 2 | 1× | 16.7 | 16.7 | 16.8 | 0 |
| 1440 | 2 | 4× | 16.7 | 66.7 | 300.0 | 6 |

## Testes funcionais atuais

390/768/1440: scrub alcança o último quadro (149 mobile, 238 PC), hero preso até concluir e menu visível somente na saída; filtros e modal funcionais, sem erros JS. Preferência de movimento reduzido respeitada. Evidência: refinement-results.json.

Vídeo PC: início, 25%, 50%, 75%, fim, retorno e wheel real validados. Troca PC → mobile → PC sem erro. Cache limitado de mobile e início/meio/fim/retorno validados pelo teste de cache atualizado. Evidências: pc-video-results.json e frame-cache-results.json. Capturas de PC no início/meio/fim foram inspecionadas; nada disso substitui teste em hardware real.

Reexecutar com Playwright disponível e preview em 4173: `node scripts/verify-pc-video.cjs`, `node scripts/verify-refinements.cjs`, `node scripts/verify-frame-cache.cjs` e `node scripts/perf-hero.cjs`.
