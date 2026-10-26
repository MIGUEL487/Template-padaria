# Primeira rolagem e composição do pão

O player anterior iniciava as requisições com uma amostragem espaçada (0, 10, 20…). Agora começa com frames consecutivos e reorganiza a fila pela posição atual: primeiro a vizinhança visível, depois o próximo trecho no sentido da rolagem. Quatro downloads e duas decodificações simultâneas continuam limitados; bitmaps fora da janela são liberados.

Falhas de download têm até três tentativas por frame. Quando `createImageBitmap` estiver ausente ou rejeitar um arquivo válido, o player tenta uma imagem HTML a partir do mesmo blob local. URLs temporárias são revogadas. O último quadro permanece visível enquanto o próximo é preparado. Isso melhora a recuperação; não garante todos os frames sob uma conexão mais lenta que o gesto de rolagem.

Um acompanhamento de 180 ms com GSAP suaviza o playhead no PC e no celular. A fotografia de pães da essência permanece inteira em `BreadPortrait.vue`: enquadramento em arco, leve deslocamento vertical ligado ao scroll e entrada da legenda. Não há cópias circulares ou rotação do pão. A implementação aplica as regras da skill local `/workspace/skills/animate/SKILL.md`: movimento reduzido, dimensões estáveis e descarte dos triggers/tweens no teardown. O catálogo mencionado nessa skill não acompanha o pacote instalado; a integração foi feita diretamente no site, conforme o pedido.

`scripts/check-first-scroll.mjs` testa contextos novos, sem cache aquecido, e começa a rolar antes de aguardar o carregamento completo. Inclui atraso de 100 ms por requisição, falha de download e rejeição simulada de `createImageBitmap`. Valida proximidade do frame desenhado ao solicitado em doze posições crescentes, sem voltar ao início. Verifica a ordem inicial consecutiva, ausência das órbitas e a apresentação com movimento reduzido. Resultados em `first-scroll-checks.json`.

Teste em Chromium com emulação móvel e desktop. A alternativa de decodificação é exercitada por simulação; não houve ensaio em Safari físico.
