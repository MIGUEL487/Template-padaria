# Performance — novas sequências

Medição no preview de produção com Chromium local headless, DPR 1/2, viewport 390×900 e 1440×900, CPU normal/4× limitada. Wheel real em 50 passos de 24px. Valores desta máquina, sem garantia de FPS em dispositivos físicos.

Os novos lotes têm 240 frames PC e 150 mobile. A memória de bitmaps é limitada por janela: 33 PC e 25 mobile, com até três decodificações simultâneas. Canvas independente de DPR e geometria cover cacheada; não há estado React ou layout por tick de scroll. Não medido no React Profiler.

Mediana de 16,7 ms na matriz atual. Houve picos acima de 50 ms em alguns cenários, principalmente com CPU limitada; a meta rígida do briefing não foi cumprida em toda a matriz. Nenhum overflow horizontal. Valores completos abaixo, sem descartar picos.

| Largura | DPR | CPU | Mediana ms | p95 ms | Máximo ms | >50 ms |
|---|---|---|---|---|---|---|
| 390 | 1 | 1× | 16.7 | 16.7 | 16.8 | 0 |
| 390 | 1 | 4× | 16.7 | 50.0 | 83.3 | 6 |
| 390 | 2 | 1× | 16.7 | 16.7 | 33.3 | 0 |
| 390 | 2 | 4× | 16.7 | 33.3 | 33.4 | 0 |
| 1440 | 1 | 1× | 16.7 | 16.8 | 133.3 | 2 |
| 1440 | 1 | 4× | 16.7 | 16.8 | 50.0 | 0 |
| 1440 | 2 | 1× | 16.7 | 16.8 | 16.8 | 0 |
| 1440 | 2 | 4× | 16.7 | 100.1 | 583.3 | 15 |

## Testes funcionais

390/768/1440: scrub alcança o último frame (149 mobile, 239 PC), hero preso até concluir e menu visível somente na saída; filtros e modal funcionais, sem erros JS. Preferência de movimento reduzido respeitada. Evidência: refinement-results.json.

Teste adicional após otimização final: início, meio, fim e retorno ao início, troca PC → mobile → PC, verificação da janela limitada; sem erros. Evidência: frame-cache-results.json. A integridade de todos os 390 WebP e suas dimensões foi verificada.

Screenshots inspecionados em celular e desktop. Não realizados testes em iOS físico ou rede móvel real. Os índices mostrados em cada rolagem dependem da velocidade: todos os frames são mantidos no manifesto, mas um gesto rápido pode avançar várias posições.

Reexecutar com Playwright disponível e preview em 4173: `node scripts/verify-refinements.cjs`, `node scripts/verify-frame-cache.cjs` e `node scripts/perf-hero.cjs`.
