# Validação no preview de produção
Chromium local, Playwright, Linux headless. Resultados completos em perf-results.json. O script usa wheel real e amostra requestAnimationFrame. Resultados são desta máquina, não de dispositivos físicos.

Matriz: 390/1440 px, DPR 1/2 e CPU normal/4× limitada. Mediana inicial 16,7 ms em todos os cenários. Na primeira execução, p95 normal 16,7–33,4 ms, com um pico desktop de 66,6 ms. Sob CPU 4× houve picos acima de 50 ms: a meta rígida do briefing NÃO foi cumprida. Foi removida uma mutação de estilo por tick; resultados finais no JSON.

Sem render React explícito no callback de scroll; não medido pelo React Profiler. Canvas 390×900 ou 1280×900, sem escala por DPR. Sem overflow horizontal nos cenários testados. Não confundir intervalo rAF de navegador headless com garantia de FPS em iPhone/Android real.

Teste funcional em 390/768/1440 com/sem redução: filtros, abertura e Escape no diálogo, persistência do movimento e scrub com troca de frames. Zero pageerrors e zero overflow. Resultados em browser-results.json. Capturas foram feitas após rolagem, inspecionadas em desktop e celular; não foi concluída matriz visual de cada seção em todos os tamanhos.

Reexecutar com Playwright disponível: `node scripts/smoke.cjs` e `node scripts/perf-hero.cjs`. CHROMIUM_PATH pode apontar outro executável no teste de performance.

## Última execução

| Largura | DPR | CPU | Mediana ms | p95 ms | Máximo ms | >50 ms |
|---|---|---|---|---|---|---|
| 390 | 1 | 1× | 16.7 | 16.7 | 33.3 | 0 |
| 390 | 1 | 4× | 16.7 | 50.0 | 66.7 | 3 |
| 390 | 2 | 1× | 16.7 | 16.8 | 16.8 | 0 |
| 390 | 2 | 4× | 16.7 | 83.3 | 166.7 | 11 |
| 1440 | 1 | 1× | 16.7 | 16.8 | 16.8 | 0 |
| 1440 | 1 | 4× | 16.7 | 100.0 | 233.3 | 29 |
| 1440 | 2 | 1× | 16.7 | 16.7 | 16.8 | 0 |
| 1440 | 2 | 4× | 16.7 | 100.0 | 100.1 | 29 |
