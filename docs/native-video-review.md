# Revisão de fluidez com Playwright

Atualização posterior: o PC passou a um controlador separado com GSAP e um único vídeo. Consulte `desktop-gsap.md`. O player móvel desta revisão foi preservado.

A reprodução sequencial em canvas respeitava os índices, mas isso não bastava para uma cadência fluida: cada JPEG/WebP precisava chegar e ser decodificado antes de avançar. O ensaio com CPU 4× mais lenta, 400.000 bytes/s de download e 120 ms de latência reproduziu 26 intervalos acima de 100 ms, com maior intervalo de 516,5 ms. Após dez segundos, só havia chegado ao quadro 76 de 149. O teste anterior de “todos os índices em ordem” não detectava essa limitação de cadência.

## Correção

O caminho principal usa H.264/MP4 com os mesmos 150 quadros e resolução de cada conjunto, a 30 fps. O scroll controla o destino, e o navegador reproduz continuamente até lá; não há seek para o quadro final de cada gesto. Ao inverter a direção, uma segunda faixa contém os mesmos quadros na ordem inversa. A posição equivalente é buscada uma única vez na troca de direção. O segundo arquivo só é carregado quando necessário.

O navegador cuida da decodificação, buffer e apresentação. O código observa `requestVideoFrameCallback` (ou currentTime/rAF em navegadores antigos), pausa no destino e mantém o último quadro. Não baixa 150 imagens individuais no caminho principal. O canvas sequencial anterior permanece como alternativa para vídeo incompatível, erro de carregamento ou diagnóstico com `?renderer=frames`.

| Conjunto | Imagens originais | MP4 de ida | Resolução | Quadros |
|---|---:|---:|---|---:|
| Celular | 7.315.498 bytes | 1.166.957 bytes | 720×1280 | 150 |
| PC | 5.788.858 bytes | 2.058.031 bytes | 1920×1080 | 150 |

Os MP4s usam compressão com perdas H.264 CRF 23, sem reduzir a resolução. Os frames originais foram preservados. A conversão pode ser repetida com `npm run prepare:video` em uma máquina com FFmpeg; o deploy usa os arquivos já versionados e não precisa executar FFmpeg. `docs/video-assets.json` contém os dados verificados com ffprobe.

## Evidências

- `review_playback.py` faz reconhecimento com DOM estabilizado, screenshots e medição numa nova sessão sem cache. Compara a versão anterior e a atual sob a mesma limitação de CPU/rede. Relatórios em `playback-before.json` e `playback-after.json`.
- A medição nativa concluiu os 150 quadros, com zero descartes reportados pelo navegador e nenhum intervalo acima de 100 ms. O maior intervalo observado foi ~50 ms. São resultados do ambiente de teste, não garantia de fluidez no Moto físico.
- `test_native_video.py` verifica ida/volta, pausa no destino, título, preenchimento durante mudanças de altura, ausência de downloads de frames individuais e zero erros JS. Força falha dos MP4s e exige o fallback em canvas. Movimento reduzido não baixa vídeo. Relatório em `native-video-tests.json`.
- `test_video_touch.py` usa eventos reais do protocolo de toque, captura o movimento e testa duas mudanças de orientação, sem elementos de vídeo vazando ou faixas descobertas. Relatório em `video-touch-tests.json`.
- O servidor de validação suporta HTTP Range/206 como a hospedagem de MP4; `serve-test.mjs` usa o sirv já presente nas dependências do Nuxt. O helper `with_server.py` da skill gerencia a execução. O fallback passou no teste de todos os 150 índices de ida e volta com um arquivo intermediário atrasado.

## Skills e escopo visual

Foi usada a skill local `/workspace/skills/webapp-testing/SKILL.md`, com scripts Python nativos do Playwright, helper de servidor, logs e screenshots. A skill local `imagegen-frontend-web` é um aviso de migração; sua versão atual em `github.com/Leonxlnx/imagegen-skills` foi consultada para revisar enquadramento, clareza do hero, contraste e continuidade visual. O pedido é corrigir a reprodução existente: não foram geradas novas composições ou substituídas as fotografias do usuário. Capturas ficam em `artifacts/playback-review/`.

Testes usam Chromium em emulação móvel/desktop, não o Chrome no Moto Z3 Play real. Reprodução nativa pode descartar frames quando o hardware não acompanha; o teste registra os descartes em vez de prometer que isso nunca ocorrerá. Não foi possível confirmar o deploy público daqui.
