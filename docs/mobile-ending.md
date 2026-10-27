# Encerramento da sequência móvel

O texto e a sombra começavam em 72% da mesma faixa que conduzia o vídeo de 0 a 100%. Portanto, os últimos 28% continuavam avançando por trás do escurecimento e do conteúdo. Os testes anteriores verificavam o índice final, mas não exigiam que ele aparecesse descoberto antes do texto.

No celular, a área fixada passa de quatro para cinco alturas. O vídeo termina em 80% dessa área, mantendo quatro alturas para a sequência, e o texto começa somente após 86%. O último frame permanece visível por pelo menos 350 ms antes que a sombra e o título possam entrar, inclusive quando seu download chegar atrasado. A confirmação vem do desenho no canvas, não somente do progresso solicitado pelo scroll. Ao voltar, essa confirmação é reiniciada. O timer é descartado junto com os demais recursos do hero.

O PC mantém o comportamento anterior. As animações das demais seções e todos os arquivos de imagem são preservados.

`check-mobile-ending.mjs` usa eventos touchStart/touchMove/touchEnd em Chromium com viewport móvel. Verifica a primeira passagem sem retornar: último frame desenhado com sombra/texto invisíveis, pin ainda no topo e navegação posterior. Um segundo contexto segura a resposta do último frame e verifica que o conteúdo não o encobre enquanto estiver pendente, nem imediatamente depois de chegar. O teste não equivale a validação em Safari físico.
