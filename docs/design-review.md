# Revisão visual e decisões

Direção: o trabalho da massa é a abertura; o descanso e o ritmo de preparo tornam-se o ritmo de scroll. O visitante acompanha o processo antes de ler o texto oficial. O gesto funcional fora do hero é filtrar o cardápio real de demonstração e abrir a informação de pedido, sem simular envio.

As skills frontend-design, design-taste-frontend e high-end-visual-design foram consultadas. A direção do briefing prevaleceu sobre proibições conflitantes: cores creme/caramelo, texto oficial longo, eyebrow oficial, degradês entre seções, raios macios e sequência prescrita de seções foram mantidos. Não se sorteou outra paleta nem se aplicou vidro/blur pesado sugerido por uma skill. A referência remota de Sunbeam não foi acessível; não há alegação de extração visual.

## Problemas encontrados e corrigidos

- Faixa de saída do hero inicialmente usava diretamente a cor da foto sem considerar o scrim. Agora compõe a amostra com o escurecimento final antes do degradê.
- Pico móvel de 41 bitmaps e canvas DPR 1,25: janela reduzida para pico 21 e DPR 1, com repetição das medições móveis.
- Aviso de hidratação ao aplicar movimento reduzido antes do mount: preferência é aplicada após hidratar, com CSS de redução imediato no documento. Foi feito novo build e nova verificação.
- Favicon ausente e setas sem glifo no Chromium: favicon SVG local e setas desenhadas em CSS.
- Capturas longas de página com pin produzem espaçadores vazios: evidência visual foi refeita rolando e capturando seções individualmente.
- Modo sem JavaScript: seletor CSS do noscript tinha escaping incorreto; substituído por seletores simples e verificado no HTML gerado.

## Limites visuais reconhecidos

Fonte Georgia é reserva declarada; tipografia autoral depende dos arquivos licenciados solicitados no briefing. Cinco fotos foram reutilizadas em seis produtos, com enquadramentos diferentes, sem fingir fotos individuais. Há conteúdo demonstrativo visivelmente identificado. A imagem de PC de 1080px não ganha detalhes ao cobrir monitores maiores. As máscaras não equivalem a remoção de fundo.

Não foi atribuída nota independente de design nem prometido prêmio Awwwards. O inspector genérico da Taste não foi tratado como certificado: seus limites de duas linhas, ausência de eyebrows, paleta e proibição de degradês contradizem o briefing explícito. As verificações de overflow, navegação, quantidade de H1, carregamento e screenshots foram feitas com scripts específicos reproduzíveis.
