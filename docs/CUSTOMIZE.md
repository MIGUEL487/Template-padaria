# Personalizar O Refúgio

## Configuração

`app/config/site.ts` contém nome, URL, marca, cores, fontes de reserva, hero oficial, cardápio, avaliações, pilares, horários, endereço, consulta do mapa, redes sociais e WhatsApp. Editorial de demonstração fica em `app/content/demo.ts`.

Configure WhatsApp como somente dígitos, incluindo país e DDD (10–15 dígitos). Somente um número válido habilita links `wa.me`, mensagens codificadas e botão flutuante. Enquanto vazio, Pedir abre uma informação de demonstração; nenhum pedido é enviado. Redes são renderizadas apenas com URL HTTPS preenchida. Nenhum endereço comercial, número de contato ou avaliação real foi inventado.

Troque o endereço ilustrativo da Praça da Sé, os horários e `contacts.demonstration`. Troque a URL antes de publicar e atualize `public/sitemap.xml`. A autoria/direito de uso comercial das fotos deve ser conferida pelo responsável pelo template.

## Imagens e frames

Os ZIPs recebidos mais recentemente são a fonte atual. `scripts/import-assets.mjs <pasta>` espera `pc/pc`, `mobile/celular`, `photos/Imagem`, conforme estrutura de extração descrita no relatório. Importa somente `frame_*.webp`, exclui poster e manifest dos frames e produz novo manifesto medido. Use a lista do manifesto, nunca aritmética de nomes.

As fotos têm variantes AVIF e WebP em 640, 960 e 1440 pixels. Não existe remoção artificial de fundo: máscaras circulares e orgânicas preservam os fundos originais.

O PC foi substituído depois por 150 JPEGs Full HD. Reimporte somente PC com `npm run prepare:frames:pc -- /pasta/jpeg`. Esse script preserva os JPEGs e o manifesto móvel. Não rode o importador combinado usando a pasta antiga v2, pois ela contém o PC anterior. O poster inicial do hero lê diretamente o manifesto gerado, evitando caminhos divergentes entre poster e player.

## Fontes

Nenhuma fonte personalizada foi recebida. Georgia e system-ui são reservas reais usadas no site. Para Bringbold Nineties, Kangmas e Balney, forneça arquivos e licença comercial, converta para WOFF2 e configure `@font-face` com `font-display:swap`. Nenhuma dessas fontes foi declarada como carregada. DM Sans também não foi baixada.

## Movimento e testes

Preferência do sistema é respeitada; rodapé persiste a escolha em localStorage com try/catch. `?motion=full` e `?motion=off` forçam o modo para testes. `?lenis=off` permite comparação. Dispositivos com ponteiro coarse usam scroll nativo, mesmo com Lenis=on; a opção on significa habilitação quando adequada, não forçar toque suavizado.

`npm run typecheck`, `npm run generate`, depois servir `.output/public`. `scripts/perf-hero.mjs` e `scripts/shots.mjs` usam Chromium instalado; configure CHROMIUM_PATH se necessário.

## Publicação

Vercel: raiz do checkout, framework Nuxt, `npm run generate`. Com VERCEL=1, Nitro escolhe vercel-static e gera `.vercel/output/static` com a configuração Build Output API em `.vercel/output/config.json`. Não force Output Directory para `.output/public` na Vercel: deixe a integração Nuxt usar a saída nativa. Localmente, a saída continua `.output/public`. O script CSP seleciona a pasta correta conforme o ambiente; também aceita caminho explícito por argumento para presets personalizados.

O build injeta CSP com hashes por HTML; estilos inline são necessários para Vue/GSAP e permitidos. Nunca sirva a raiz do repositório em produção. Não há backend, API, login ou checkout.

Tipos em `app/types/extensions.ts` são apenas limites para futuras integrações; não existe implementação antecipada de carrinho, painel ou blog.
