# Escopo e limites
Implementado: dez seções, hero com scrub reversível, dois conjuntos de frames, filtros reais, seis produtos, modal de demonstração, preferência de movimento persistida, navegação responsiva e imagens com loops pausados fora da tela.

Simplificações em relação ao documento de referência:
- Título visível desde a entrada para apresentar a proposta sem rolagem obrigatória; não há stagger tardio 75–100%.
- Processo com imagem sticky e três etapas; não há zoom do interior sincronizado via ScrollTrigger.
- Kenburns, float, spin e drift de produtos; recortes curvos em vez de remoção de fundo ou órbitas de objetos independentes.
- Junções com painéis arredondados sobre fundo contínuo, sem faixas largas de degradê ou componente automático por tone.
- Configuração tipada de contatos, conteúdo centralizado e tokens CSS; não toda a identidade reunida em um único objeto.
- Sem endereço inventado, mapa, WhatsApp flutuante ou redes fictícias.
- WebP responsivo, sem AVIF. Georgia/Arial locais, sem fontes fornecidas.
- Lint verifica valores px em todo src e classes de fontes padrão; não certifica valores relativos, cores/contrastes ou toda a escala tipográfica. A proibição de 4px foi exercitada durante o primeiro build.
- Medição de render React no Profiler, auditoria WCAG completa, testes iOS real, SEO com domínio canônico/sitemap e matriz visual por seção completa pendentes.

## Refinamento após revisão visual

Hero sem navegação e sem botões, cena retida até o quadro final; cabeçalho flutuante aparece somente na saída. Validado em 390/768/1440: todos os 30 índices do lote anterior desenhados em rolagem lenta, quadro final antes da liberação do sticky, menu inacessível ao teclado enquanto oculto, reaparece ao descer e some ao voltar. Filtros, modal e preferência de movimento reduzido validados. Evidência: refinement-results.json e scripts/verify-refinements.cjs.

Sequências atualizadas: 240 PC / 150 mobile, carregamento por janela e manifesto dinâmico. Ver frame-update.md para inspeção e importação.
