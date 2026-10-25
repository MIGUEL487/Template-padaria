# Direção das imagens
Fotografias reais com enquadramentos editoriais, sem simular transparência. Em vez de remoção automática de fundo, foram escolhidos recortes circulares e em arco, preservando as bordas e a fotografia original. Pães rústicos na narrativa de processo; café flutuando no arco da história; interior com zoom lento em um painel arredondado. Produtos reutilizam as cinco fotos e são identificados como ilustrativos.

Movimentos implementados: kenburns, float, spin no medalhão de pão visto de cima e drift nos produtos. Sombras permanecem nos wrappers; os loops animam somente transform. IntersectionObserver pausa os loops fora da viewport. O controle de animações e a preferência de movimento reduzido param os loops; o hero usa somente um poster nesse modo.

No PC, o scroll controla um vídeo pausado com 239 quadros independentes em 1080×720; o primeiro quadro incompatível foi excluído e o poster usa o mesmo recorte. Não há canvas renderizado ou requisições de frames individuais no desktop. Ver pc-video-fix.md.

No celular, canvas lê os 150 WebP do manifesto, com janela de até 25 bitmaps, até três decodificações simultâneas e dimensões 540×960. ResizeObserver calcula cover e resolução sem multiplicação por DPR. Crossfade entre vizinhos coalescido em requestAnimationFrame. Preferência de movimento reduzido mostra somente poster.
Abertura: imagem e texto, sem botões ou cabeçalho. Scrub de 160svh dentro de uma área de 280svh; os últimos 20svh da retenção conservam o último quadro. O menu só aparece 24px após começar a saída da cena. Imagem e texto sobem juntos na saída; painel creme com borda curva entra sem faixa de degradê. As demais seções compartilham fundo creme e painéis bege/fotográficos arredondados.

Atualização de fontes: 240 quadros PC e 150 mobile. Origem, recorte medido e importador registrados em frame-update.md.
