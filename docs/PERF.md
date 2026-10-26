# Desempenho medido — build estático

**Histórico:** a tabela abaixo mede o conjunto PC anterior (239 WebP em 1080×720). O PC atual usa 150 JPEGs Full HD em 1920×1080 e janela menor de bitmaps. Consulte `hero-fullscreen-update.md` para a revisão atual; estes números não devem ser apresentados como medição do novo vídeo.

Chromium headless em Linux, servidor de .output/public na porta 8780. Scroll por mouse.wheel, medição de requestAnimationFrame e Performance.getMetrics via CDP. Não é medição de aparelho físico. Resultados brutos em perf-results.json; scripts reproduzíveis em scripts/perf-hero.mjs.

Matriz final repetida após a correção da ordem de inicialização dos pins. Ambos os conjuntos usam janela ±8 / 12 à frente e 2 decodificações simultâneas. Mobile usa DPR interno 1; desktop respeita a origem e o teto 1,25. O desktop foi repetido após reduzir sua janela; a matriz móvel desta versão já usava esses mesmos limites.

Após essa matriz, o desenhador recebeu um guard adicional para não redesenhar o mesmo índice quando apenas um bitmap vizinho termina de carregar. A verificação final confirmou zero redesenhos em repouso, fallback de frame corrompido e ordem dos pins; não foi produzida outra matriz de FPS para essa última redução de trabalho. Evidências em `frame-player-checks.json` e `scripts/check-pin-order.mjs`.

| Largura | DPR | CPU | Lenis | Mediana ms | p95 ms | Máx ms | >50ms | Updates Vue |
|---|---|---|---|---|---|---|---|---|
| 390 | 1 | 1× | on | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 390 | 1 | 1× | off | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 390 | 1 | 4× | on | 16.7 | 16.8 | 33.3 | 0 | 0 |
| 390 | 1 | 4× | off | 16.7 | 16.8 | 33.4 | 0 | 0 |
| 390 | 2 | 1× | on | 16.7 | 16.8 | 16.8 | 0 | 0 |
| 390 | 2 | 1× | off | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 390 | 2 | 4× | on | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 390 | 2 | 4× | off | 16.7 | 16.8 | 49.9 | 0 | 0 |
| 1440 | 1 | 1× | on | 16.7 | 16.8 | 16.8 | 0 | 0 |
| 1440 | 1 | 1× | off | 16.7 | 16.8 | 33.3 | 0 | 0 |
| 1440 | 1 | 4× | on | 16.7 | 33.4 | 300.0 | 7 | 0 |
| 1440 | 1 | 4× | off | 16.7 | 33.4 | 183.3 | 6 | 0 |
| 1440 | 2 | 1× | on | 16.7 | 16.8 | 100.0 | 1 | 0 |
| 1440 | 2 | 1× | off | 16.7 | 16.8 | 183.3 | 3 | 0 |
| 1440 | 2 | 4× | on | 16.7 | 33.3 | 150.1 | 1 | 0 |
| 1440 | 2 | 4× | off | 16.7 | 33.3 | 166.7 | 4 | 0 |

## Leitura dos resultados

Mediana máxima 16.7 ms; p95 máximo 33.4 ms. Total de intervalos >50 ms: 22. **A meta estrita de nenhum intervalo acima de 50 ms não foi universalmente atingida.** Não se deve apresentar o site como livre de travamentos em qualquer hardware.

Todos os cenários chegaram ao último índice (PC 238, mobile 149), mantiveram canvas abaixo da resolução de origem e não apresentaram overflow horizontal. O contador de ciclo onUpdated do componente hero permaneceu em zero durante os trechos medidos; não é uma captura do Vue Devtools, indisponível neste teste de produção. O caminho de scroll não atualiza refs por tick nem mede layout.

Lenis está ativo apenas em ponteiro fino. Nos cenários móveis, on e off usam ambos scroll nativo por projeto; são repetições, não comparação com Lenis forçado em toque. No desktop a comparação cobre os dois caminhos.

## Memória

Pico decodificado desktop: 21 bitmaps; móvel: 21. Estimativa RGBA do teto móvel: 21 × 720 × 1280 × 4 ≈ 77,4 MB, além dos ~7,3 MB comprimidos. Essa é uma estimativa de pixels, **não medição de RSS/GPU**. Bitmaps são fechados ao sair da janela e no descarte.

Heap JS antes / após / volta (MB):

- 390/DPR1/CPU1/on: 6.10 / 4.98 / 6.11
- 390/DPR1/CPU1/off: 6.10 / 5.47 / 6.59
- 390/DPR1/CPU4/on: 6.13 / 5.45 / 6.56
- 390/DPR1/CPU4/off: 6.14 / 5.49 / 6.60
- 390/DPR2/CPU1/on: 6.07 / 4.98 / 6.11
- 390/DPR2/CPU1/off: 6.10 / 5.46 / 6.59
- 390/DPR2/CPU4/on: 6.13 / 6.66 / 5.77
- 390/DPR2/CPU4/off: 5.75 / 5.41 / 6.52
- 1440/DPR1/CPU1/on: 5.37 / 5.86 / 4.95
- 1440/DPR1/CPU1/off: 5.33 / 5.06 / 5.02
- 1440/DPR1/CPU4/on: 5.35 / 6.27 / 6.18
- 1440/DPR1/CPU4/off: 5.33 / 4.79 / 4.66
- 1440/DPR2/CPU1/on: 5.35 / 5.61 / 4.86
- 1440/DPR2/CPU1/off: 5.33 / 5.06 / 5.03
- 1440/DPR2/CPU4/on: 5.38 / 6.30 / 6.39
- 1440/DPR2/CPU4/off: 5.37 / 5.13 / 6.16

Os valores de JS heap variam com GC. Este teste faz uma ida e volta por cenário; ele não prova ausência de vazamentos em uso prolongado, nem mede a memória nativa dos bitmaps diretamente.

## Simplificações e limites

- Fotos reais foram reutilizadas; não há novos frames nem imagens sintéticas.
- O canvas não faz crossfade. Mostra o bitmap mais próximo pronto e mantém o poster se nenhum estiver pronto.
- Loops locais de fotos são CSS com pausa por viewport; motion-v controla reveals e preços, GSAP controla hero e narrativa.
- Janela móvel reduzida por desempenho. Canvas DPR móvel 1 é uma decisão de resolução/custo, não promessa de nitidez extra.
- Fontes personalizadas não foram fornecidas; usadas reservas explícitas.
- Imagens fonte PC 1080px limitam a nitidez em monitores grandes.
- Não houve teste em Safari/iPhone físico, conexão móvel real ou avaliação independente Awwwards.
