# Performance — abertura revisada

Medição no preview de produção com Chromium local headless, Playwright, DPR 1/2, viewport 390×900 e 1440×900 e CPU normal/4× limitada. Wheel real em passos de 24px, 50 passos. Resultados desta máquina; não equivalem a teste de dispositivo físico ou garantia de FPS.

Na execução atual: mediana de 16,7 ms em toda a matriz, p95 máximo de 33,3 ms e nenhum intervalo rAF acima de 50 ms. Canvas limitado ao tamanho útil e independente de DPR. Pré-decodificação com ImageBitmap, geometria cover cacheada e crossfade de dois frames; sem estado React ou layout por tick de scroll. O React Profiler não foi executado.

| Largura | DPR | CPU | Mediana ms | p95 ms | Máximo ms | >50 ms |
|---|---|---|---|---|---|---|
| 390 | 1 | 1× | 16.7 | 16.8 | 16.8 | 0 |
| 390 | 1 | 4× | 16.7 | 16.8 | 16.8 | 0 |
| 390 | 2 | 1× | 16.7 | 16.7 | 16.8 | 0 |
| 390 | 2 | 4× | 16.7 | 33.3 | 33.4 | 0 |
| 1440 | 1 | 1× | 16.7 | 16.8 | 16.8 | 0 |
| 1440 | 1 | 4× | 16.7 | 16.7 | 16.8 | 0 |
| 1440 | 2 | 1× | 16.7 | 16.8 | 16.8 | 0 |
| 1440 | 2 | 4× | 16.7 | 16.7 | 16.8 | 0 |

## Testes funcionais

`refinement-results.json`: em 390/768/1440, todos os 30 quadros renderizados em rolagem lenta, hero preso até o último quadro, menu oculto/inert durante a sequência e visível na saída, retorno ao topo oculta a navegação. Filtros e modal funcionais, nenhum erro JS nem overflow horizontal. Movimento reduzido conserva o poster e interrompe os loops.

Capturas de abertura, junção, história e experiência foram feitas após rolagem real e inspecionadas em celular e desktop. Não realizada matriz visual completa de cada seção/dispositivo nem teste iOS físico.

Reexecutar com Playwright disponível e preview em 4173: `node scripts/verify-refinements.cjs` e `node scripts/perf-hero.cjs`. `CHROMIUM_PATH` pode substituir `/usr/bin/chromium`.
