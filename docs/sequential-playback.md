# Reprodução sequencial comandada pelo scroll

Atualização posterior: o caminho principal agora usa reprodução nativa MP4. Este documento descreve o player em canvas preservado como fallback e acessível com `?renderer=frames`. Consulte `native-video-review.md` para a comparação de cadência e a implementação atual.

O scroll define o frame de destino; o frame desenhado avança uma posição de cada vez até esse destino, com cadência máxima de 30 apresentações por segundo. Um salto 0→149 percorre 0, 1, 2…149. A volta percorre os adjacentes na ordem inversa. Um novo gesto pode mudar o destino e inverter a direção a partir da posição já reproduzida.

O relógio não transforma tempo perdido em saltos. Se o próximo frame ainda não foi baixado/decodificado, o canvas conserva a imagem atual e espera. Isso implica atraso em relação ao dedo após um scroll rápido e pausas em conexões insuficientes; não há promessa de 30 fps contínuos em todo aparelho ou rede. Arquivo persistentemente indisponível não é substituído silenciosamente por outro quadro.

A janela de downloads/decodificação acompanha a posição efetivamente reproduzida, em vez de correr à frente para a posição pedida. Por isso, os intermediários continuam prioritários mesmo quando o scroll solicita o fim de uma vez. O modo anterior de recuperação pelo quadro disponível mais próximo foi substituído por essa política; o descarte de índices alternados em modo de economia de dados também foi removido. O limite de quatro downloads e duas decodificações simultâneas permanece, assim como o descarte dos bitmaps fora da janela.

No PC e no celular o vídeo ocupa quatro alturas de rolagem, com uma quinta altura para a transição. O texto espera a conclusão real da reprodução e a breve permanência do último frame. A fixação nativa móvel e as animações das demais seções são preservadas. A reprodução pode continuar alcançando o destino quando o usuário para de rolar; não há bloqueio da rolagem da página.

`scripts/check-sequential-frames.mjs` observa cada mudança efetiva do índice desenhado no canvas. Salta do início para o fim no PC e no celular, retém a resposta do frame 75, confirma que o player permanece no 74, depois libera a resposta e exige a lista exata 0…149. Exige duração de pelo menos 4,5 s e a lista inversa 149…0 ao voltar. Resultados em `sequential-frame-checks.json`. Os demais testes continuam verificando primeira carga, viewport, toque e CPU/rede limitadas. Ensaios em Chromium de desenvolvimento, sem validação no Moto físico ou confirmação do deploy.
