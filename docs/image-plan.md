# Plano de imagens — implementação com fotos recebidas

As cinco fotografias foram recebidas no segundo envio. Não houve remoção de fundo: as máscaras mantêm as fotografias originais e não fingem transparência.

- Pao.jpg: medalhão com rotação e pequenos círculos orbitais de regiões diferentes; sombra no wrapper.
- Croassaint com Cafe.jpg: máscaras validadas antes de recortes; float independente e vapor apenas por transform/opacity.
- Pao 2.jpg: cobertura com pan diagonal e partículas leves.
- Pao 1.jpg: máscara orgânica, sem cortar as plaquinhas, parallax separado do tilt.
- Interior: Ken Burns, sem rotação.

As variantes spin, orbit, float, kenburns, parallax, morphMask e parts estão implementadas em MotionImage. Spin é usado dentro de parts; orbit está disponível e compartilha os recortes orbitais. Parallax nesta entrega é pan local de baixa amplitude, não medição contínua de posição no scroll. MorphMask combina duas máscaras fixas usando opacidade/transform; não anima clip-path nem border-radius. As plaquinhas da vitrine não foram substituídas ou apagadas; sua legibilidade depende do recorte.

Croissant e xícara não foram separados por segmentação: a foto inteira flutua dentro de máscara. Não foi acrescentado vapor sobreposto falso. Interior usa Ken Burns sem rotação. Farinha vem da sequência de celular; não há sistema adicional de partículas.

Loops CSS por transform/opacity foram preferidos a loops JS por elemento. motion-v controla os reveals e NumberTicker; GSAP controla hero e story pin. Nenhum elemento tem transform simultaneamente comandado pelas duas bibliotecas. IntersectionObserver pausa os loops fora da viewport; visibilidade da aba e redução de movimento pausam o conjunto.

Componentes Inspira usados: ShimmerButton, BlurReveal, Marquee, NumberTicker. Fontes locais consultadas em `/workspace/libraries/inspira-ui`; documentação remota retornou 403. O catálogo animate não está instalado além do SKILL.md: foram aplicadas suas regras de limpeza e pausa, sem alegar execução de seus scripts ausentes.
