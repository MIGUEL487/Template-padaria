# Pausa para ler o texto do hero

No celular e PC, cruzar o fim da faixa do vídeo segura a posição do hero em 82% da área fixada. O vídeo continua alcançando seu último quadro normalmente. Depois da breve permanência do quadro final, a entrada do título, descrição e botões passa a ser conduzida por tempo, sem exigir mais scroll.

Quando todos os elementos terminaram de aparecer, a tela fica disponível para leitura por **2,5 segundos**. Só então libera a passagem para baixo. Eventos de roda, toque e teclas de rolagem são consumidos nesse intervalo; deslocamentos de impulso ou scrollbar são limitados à posição guardada. O Lenis é pausado e retomado, com o destino antigo descartado. A implementação não fixa o body nem recria o canvas/vídeo.

Links do hero e da navegação continuam utilizáveis: uma escolha explícita libera a pausa imediatamente. Links diretos válidos para outras seções também não são bloqueados. Reduzir animações ou trocar orientação desmonta a pausa e remove listeners/timers. Voltar ao início rearma a pausa para uma nova passagem.

O tempo de leitura pausa quando a aba fica oculta. Uma falha de mídia não pode prender a página indefinidamente: há liberação após 15 segundos visíveis esperando o fim do vídeo, independente do tempo de leitura normal.

`test_reading_pause.py` verifica 360×640, 390×844 e PC 1440×900 com e sem Lenis. Simula um grande impulso atravessando o hero, tenta continuar com roda/teclado/toque, exige todo o texto dentro da viewport e pelo menos 2,3 s de leitura após opacidade completa (tolerância de medição para o timer de 2,5 s). Confirma que o impulso anterior não é reaplicado na liberação e que um novo gesto avança. Também testa o CTA e a remoção da pausa ao desativar animações. Resultados em `reading-pause-tests.json`; capturas em `artifacts/reading-pause/`.

O player e os vídeos não foram alterados. Testes em Chromium emulado, sem validação em aparelho físico.
