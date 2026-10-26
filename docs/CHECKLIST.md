# Checklist da preparação

- [x] Prompt v2 lido; textos oficiais preservados.
- [x] ZIPs inspecionados; amostras visuais de primeiro, meio e último frame.
- [x] PC: 240 retratos; celular: 150 retratos. Não se assumiu a estimativa de 180.
- [x] Referência Sunbeam tentada, bloqueada pelo proxy; sem extração inventada.
- [x] Nuxt 4, Vue 3, TypeScript, Tailwind v4, GSAP, Lenis e motion-v instalados.
- [x] Lint varre todos os arquivos CSS/Vue/TS de app; prova com `padding:13px` falhou como esperado, fixture removida.
- [x] Novos frames recebidos: PC 239 paisagem; celular 150 retrato. Manifesto exclui posters.
- [x] Cinco fotografias recebidas e otimizadas para AVIF/WebP em três larguras.
- [x] Reservas Georgia/system-ui usadas e documentadas. Fontes personalizadas continuam não fornecidas.
- [x] Hero e janela de bitmaps; bitmap.close; fallback de poster; progresso imperativo sem updates Vue por tick.
- [x] Dez blocos de página, quatro componentes Inspira adaptados e movimento com pausa por viewport.
- [x] Medições do hero no build estático: 16 cenários, com/sem Lenis, DPR 1/2, CPU 1×/4×; reteste móvel após ajuste.
- [x] Cardápio filtrável, modal demonstrativo, mapa e links seguros, preferência de movimento.
- [x] Title/description/OG, JSON-LD Bakery, sitemap, robots, favicon; sem backend.
- [x] Revisão local de superfície estática e dependências, com alerta conhecido e limitações documentadas.
- [ ] Pentest automatizado Strix: CLI/configuração não disponíveis; não executado.
- [ ] Meta estrita de nenhum intervalo acima de 50 ms: não cumprida universalmente, dois picos em CPU 4× móvel.
- [x] Screenshots por seção em 390/768/1440, com e sem redução de movimento; revisão de layout e ausência de overflow.
- [ ] Homologação em Safari/iPhone físico e teste de longa duração de memória.
- [ ] Contatos, avaliações, dados comerciais e fontes reais fornecidos antes do lançamento comercial.
- [ ] Produção na Vercel confirmada externamente (não equivale a build local ou push GitHub).

O template está implementado; este documento distingue o que foi verificado, limitações e configuração necessária para lançamento. Não equivale a certificação WCAG, segurança ou Awwwards.
