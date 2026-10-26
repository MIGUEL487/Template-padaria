# Desempenho medido — build estático

Chromium headless em Linux, servidor de .output/public na porta 8780. Scroll por mouse.wheel, medição de requestAnimationFrame e Performance.getMetrics via CDP. Não é medição de aparelho físico. Resultados brutos em perf-results.json; scripts reproduzíveis em scripts/perf-hero.mjs.

Desktop: matriz medida antes do ajuste exclusivamente móvel. Mobile: repetida após limitar DPR interno a 1 e diminuir janela para ±8 / 12 à frente, com 2 decodificações simultâneas. Desktop mantém ±16 / 24 à frente. Mudanças posteriores só de junções visuais abaixo do hero não alteram seu caminho de execução.

| Largura | DPR | CPU | Lenis | Mediana ms | p95 ms | Máx ms | >50ms | Updates Vue |
|---|---|---|---|---|---|---|---|---|
| 1440 | 1 | 1× | on | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 1440 | 1 | 1× | off | 16.7 | 16.8 | 33.3 | 0 | 0 |
| 1440 | 1 | 4× | on | 16.7 | 33.3 | 33.4 | 0 | 0 |
| 1440 | 1 | 4× | off | 16.7 | 33.4 | 50.0 | 0 | 0 |
| 1440 | 2 | 1× | on | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 1440 | 2 | 1× | off | 16.7 | 16.8 | 33.3 | 0 | 0 |
| 1440 | 2 | 4× | on | 16.7 | 33.3 | 33.4 | 0 | 0 |
| 1440 | 2 | 4× | off | 16.7 | 33.4 | 50.0 | 0 | 0 |
| 390 | 1 | 1× | on | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 390 | 1 | 1× | off | 16.7 | 16.7 | 16.8 | 0 | 0 |
| 390 | 1 | 4× | on | 16.7 | 16.8 | 33.4 | 0 | 0 |
| 390 | 1 | 4× | off | 16.7 | 16.8 | 33.4 | 0 | 0 |
| 390 | 2 | 1× | on | 16.7 | 16.7 | 33.4 | 0 | 0 |
| 390 | 2 | 1× | off | 16.7 | 16.7 | 33.3 | 0 | 0 |
| 390 | 2 | 4× | on | 16.7 | 16.8 | 116.6 | 2 | 0 |
| 390 | 2 | 4× | off | 16.7 | 16.8 | 50.0 | 0 | 0 |

## Leitura dos resultados

Mediana máxima 16.7 ms; p95 máximo 33.4 ms. Total de intervalos >50 ms: 2. **A meta estrita de nenhum intervalo acima de 50 ms não foi universalmente atingida.** Não se deve apresentar o site como livre de travamentos em qualquer hardware.

Todos os cenários chegaram ao último índice (PC 238, mobile 149), mantiveram canvas abaixo da resolução de origem e não apresentaram overflow horizontal. O contador de ciclo onUpdated do componente hero permaneceu em zero durante os trechos medidos; não é uma captura do Vue Devtools, indisponível neste teste de produção. O caminho de scroll não atualiza refs por tick nem mede layout.

Lenis está ativo apenas em ponteiro fino. Nos cenários móveis, on e off usam ambos scroll nativo por projeto; são repetições, não comparação com Lenis forçado em toque. No desktop a comparação cobre os dois caminhos.

## Memória

Pico decodificado desktop: 41 bitmaps; móvel: 21. Estimativa RGBA do teto móvel: 21 × 720 × 1280 × 4 ≈ 77,4 MB, além dos ~7,3 MB comprimidos. Essa é uma estimativa de pixels, **não medição de RSS/GPU**. Bitmaps são fechados ao sair da janela e no descarte.

Heap JS antes / após / volta (MB):

- 1440/DPR1/CPU1/on: 6.01 / 5.56 / 4.98
- 1440/DPR1/CPU1/off: 4.60 / 5.88 / 4.89
- 1440/DPR1/CPU4/on: 4.52 / 5.38 / 4.98
- 1440/DPR1/CPU4/off: 4.50 / 5.91 / 4.92
- 1440/DPR2/CPU1/on: 4.63 / 5.09 / 4.93
- 1440/DPR2/CPU1/off: 4.60 / 5.91 / 4.93
- 1440/DPR2/CPU4/on: 4.52 / 5.59 / 4.94
- 1440/DPR2/CPU4/off: 4.50 / 5.30 / 5.11
- 390/DPR1/CPU1/on: 6.17 / 5.06 / 6.21
- 390/DPR1/CPU1/off: 6.18 / 5.05 / 6.20
- 390/DPR1/CPU4/on: 6.18 / 5.56 / 6.69
- 390/DPR1/CPU4/off: 6.15 / 5.54 / 6.67
- 390/DPR2/CPU1/on: 6.17 / 5.61 / 6.75
- 390/DPR2/CPU1/off: 6.17 / 5.07 / 6.22
- 390/DPR2/CPU4/on: 5.76 / 5.56 / 6.69
- 390/DPR2/CPU4/off: 6.18 / 5.55 / 6.68

Os valores de JS heap variam com GC. Este teste faz uma ida e volta por cenário; ele não prova ausência de vazamentos em uso prolongado, nem mede a memória nativa dos bitmaps diretamente.

## Simplificações e limites

- Fotos reais foram reutilizadas; não há novos frames nem imagens sintéticas.
- O canvas não faz crossfade. Mostra o bitmap mais próximo pronto e mantém o poster se nenhum estiver pronto.
- Loops locais de fotos são CSS com pausa por viewport; motion-v controla reveals e preços, GSAP controla hero e narrativa.
- Janela móvel reduzida por desempenho. Canvas DPR móvel 1 é uma decisão de resolução/custo, não promessa de nitidez extra.
- Fontes personalizadas não foram fornecidas; usadas reservas explícitas.
- Imagens fonte PC 1080px limitam a nitidez em monitores grandes.
- Não houve teste em Safari/iPhone físico, conexão móvel real ou avaliação independente Awwwards.
