# Pausa para ler o texto do hero

No celular e PC, cruzar o fim da faixa do vídeo segura a posição do hero em 82% da área fixada. O vídeo continua alcançando seu último quadro normalmente. Depois da breve permanência do quadro final, a entrada do título, descrição e botões passa a ser conduzida por tempo, sem exigir mais scroll.

A passagem para baixo é liberada **1 segundo após o último quadro**, incluindo a entrada do texto nesse total. A entrada foi acelerada para caber nesse intervalo, sem acrescentar outro segundo depois dela. Eventos de roda, toque e teclas de rolagem são consumidos nesse intervalo; deslocamentos de impulso ou scrollbar são limitados à posição guardada. O Lenis é pausado e retomado, com o destino antigo descartado. A implementação não fixa o body nem recria o canvas/vídeo.

Links do hero e da navegação continuam utilizáveis: uma escolha explícita libera a pausa imediatamente. Links diretos válidos para outras seções também não são bloqueados. Reduzir animações ou trocar orientação desmonta a pausa e remove listeners/timers. Voltar ao início rearma a pausa para uma nova passagem.

O tempo de leitura pausa quando a aba fica oculta. Uma falha de mídia não pode prender a página indefinidamente: há liberação após 15 segundos visíveis esperando o fim do vídeo, independente do tempo de leitura normal.

`test_reading_pause.py` verifica 360×640, 390×844 e PC 1440×900 com e sem Lenis. Simula um grande impulso atravessando o hero, tenta continuar com roda/teclado/toque e exige todo o texto dentro da viewport. Mede do último quadro à liberação, com tolerância de 850–1400 ms para o intervalo pedido de 1 s. Confirma que o impulso anterior não é reaplicado na liberação e que um novo gesto avança. Também testa o CTA e a remoção da pausa ao desativar animações. Resultados em `reading-pause-tests.json`; capturas em `artifacts/reading-pause/`.

O player e os vídeos não foram alterados. Testes em Chromium emulado, sem validação em aparelho físico.
