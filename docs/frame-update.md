# Atualização das sequências

Fontes: PC.zip (240 JPG) e Celular.zip (150 JPG). Ambos os arquivos fornecidos têm 1080×1920. O arquivo PC contém a cena horizontal dentro de barras pretas e muda a área ocupada ao longo da sequência. Inspeção dos 240 quadros: áreas úteis verticais 599–1319 ou 240–1680. Usado recorte central comum `(0,599,1080,1319)` em todos os quadros para manter área útil 1080×720 estável e sem barras, exportada proporcionalmente em WebP 960×640. Mobile reduzido proporcionalmente para 540×960, sem recorte.

Todas as posições originais foram preservadas em ordem, incluindo quadros repetidos: o JPEG de origem tem 194 conteúdos únicos em PC e 122 no celular. Não houve geração de imagens intermediárias nem eliminação de índices. Saída WebP qualidade 82; manifests contêm lista, quantidade, dimensão e revisão SHA-256 para cache.

Player usa a quantidade real, poster atualizado e crossfade entre vizinhos. Carrega até três arquivos simultâneos e mantém uma janela de 33 bitmaps PC ou 25 mobile em torno do quadro solicitado. Os bitmaps fora da janela são fechados; em saltos de scroll a imagem anterior permanece no canvas até chegar um quadro novo. O conjunto oposto não é pré-carregado. Mudança de orientação libera o cache anterior.

Reprodução: `python3 scripts/import-frames.py caminho/PC.zip caminho/Celular.zip` (Pillow). O recorte do importador é específico deste lote e deve ser reinspecionado se as fontes mudarem.

Verificação de integridade: 390 arquivos WebP legíveis, dimensões uniformes por conjunto e listas sem nomes repetidos ou referências ausentes.

Build e testes de início/meio/fim/retorno e orientação passaram. A matriz de performance e suas limitações estão registradas em PERF.md.
