# Direção das imagens
Fotografias reais com enquadramentos editoriais, sem simular transparência. Pães rústicos na narrativa de processo; café em máscara de arco na história; interior full-bleed com zoom lento. Produtos reutilizam as cinco fotos e são identificados como ilustrativos.

Loops implementados: kenburns e float. IntersectionObserver pausa os loops fora da viewport. Não foram criadas variantes artificiais de orbit/parts/spin; recortes individuais de pães e remoção de fundo não implementados.

Canvas escolhe apenas PC ou celular conforme orientação/largura e decodifica via img.decode. ResizeObserver define a resolução; limite 1280 por eixo e sem multiplicação por DPR. Não há crossfade entre frames. A transição de saída foi estilizada com cor aproximada; os manifests registram a cor medida para refinamento futuro.
