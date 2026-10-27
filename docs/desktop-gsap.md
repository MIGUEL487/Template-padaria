# Controle de PC com GSAP

A medição anterior com gestos apenas para baixo registrou 24–26 ciclos de iniciar/parar e dois seeks, carregando também o vídeo reverso mesmo sem intenção de voltar. O RAF permaneceu estável no ambiente de teste; esse resultado não reproduz todo travamento de uma GPU física, mas revela comandos de mídia desnecessários.

O PC agora tem um player separado, `app/lib/desktop-player.ts`. GSAP `quickTo` suaviza o destino por 280 ms e seu ticker coordena os comandos do decodificador. O vídeo roda em velocidade nativa constante, sem writes contínuos em currentTime ou playbackRate. A direção é determinada pela mudança do destino pedida pelo scroll, não por um quadro que o decodificador apresentou além do destino. Pequenas inversões têm uma margem/estabilização antes de trocar o arquivo.

Há apenas um elemento de vídeo no PC. Numa inversão real, guarda-se um quadro estático no canvas enquanto o mesmo decodificador recebe o arquivo reverso e busca a posição equivalente. O quadro guardado desaparece quando o vídeo fica pronto. Isso evita manter dois decodificadores Full HD ativos/alocados por alternâncias involuntárias.

Os arquivos `pc-gsap.mp4` e `pc-gsap-reverse.mp4` mantêm 1920×1080, 150 quadros e 30 fps. Têm um keyframe a cada 15 quadros e não usam B-frames: uma inversão não precisa reconstruir uma cadeia de previsão de vários segundos. CRF 23 com perdas, sem redução de resolução. São 2.240.824 e 2.164.991 bytes, respectivamente. `npm run prepare:video:pc` regenera esses arquivos com FFmpeg.

A faixa de PC passa de cinco para três alturas, com 80% para pedir a sequência completa. Assim, um gesto produz mais movimento e menos pausas curtas. A reprodução ainda alcança o destino pela ordem dos quadros; não há seek a cada tick. A pausa de leitura de 2,5 segundos permanece.

O player móvel, os seus MP4s e o caminho de sticky/scroll nativo foram preservados. A skill `$gsap` não foi encontrada no catálogo nem nos arquivos locais; foi usada diretamente a biblioteca GSAP já instalada.

## Verificação

`review_desktop.py` executa a mesma sequência de roda/microgestos em 1440×900/DPR 2, CPU normal e CPU 4× mais lenta. Registra play/pause, seeks, retrocessos, intervalos RAF, descarte de quadros e quantidade de elementos de vídeo. Relatórios em `desktop-before.json` e `desktop-after.json`. A versão nova exige zero seeks/trocas involuntárias e apenas um elemento de vídeo durante a descida.

| Medição | Antes, CPU normal / 4× | Depois, CPU normal / 4× |
|---|---|---|
| Inícios/paradas | 24 / 26 | 14 / 11 |
| Seeks na descida | 2 / 2 | 0 / 0 |
| Superfícies de vídeo | 2 / 2 | 1 / 1 |
| Quadros descartados reportados | 0 / 0 | 0 / 0 |
| RAF p95 | 16,7 / 16,8 ms | 16,7 / 16,8 ms |

O mesmo gesto agora avança até o quadro 53 em vez do 32, por causa da faixa mais curta. Essa diferença de distância é parte da mudança, não uma comparação isolada de decodificação. O ensaio de sequência completa também reportou todos os 150 quadros e nenhum descarte no novo player de PC.

Os testes de mídia validam ida/volta e pausa no destino; os de leitura verificam o bloqueio de impulso com/sem Lenis, liberação, CTA e redução de movimento. Os de toque/orientação verificam a manutenção da versão móvel. Typecheck e build estático também são executados. Emulação Chromium não equivale ao PC físico do usuário; o deploy público não foi confirmado daqui.
