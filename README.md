# Miolo — padaria de todos os dias

Template responsivo de padaria brasileira, em português. HTML, CSS e JavaScript, sem dependências remotas em tempo de execução. Uma etapa de build em Node gera os arquivos que serão publicados.

## Rodar

```sh
npm ci --ignore-scripts
npm test
npm run build
python3 -m http.server 8766 --directory dist
```

Abra http://localhost:8766/. No Vercel, framework **Other**, comando de build `npm run build`, diretório de saída `dist`. As configurações estão em `vercel.json`; o diretório raiz do projeto deve ser a raiz deste repositório. As rotas antigas redirecionam para o início.

O build copia somente a versão atual do site, gera caminhos de assets com hash de conteúdo e publica `release.json` com a revisão. HTML deve ser revalidado; os assets versionados podem ser armazenados em cache. A existência de um commit no GitHub não comprova que o domínio de produção foi atualizado: confirme o sucesso do deployment no Vercel e a revisão servida em `/release.json`.

## Recursos

- Abertura fotográfica imediata. Croissant, pão e café procedurais em Three.js são carregados somente ao escolher **Explorar em 3D**, com seleção por hover, foco ou toque e rotação por arraste. O destaque fotográfico continua disponível se WebGL falhar.
- Revelações por IntersectionObserver, transições pela Web Animations API, hover e movimento ambiental em CSS.
- Movimento reduzido, pausa manual, pausa em aba oculta, renderização limitada a 30 fps e suspensão fora da tela. Alternativa SVG se WebGL falhar.
- Cardápio filtrável, sacola com quantidades persistidas localmente e cópia da lista. Não há envio de pedido ou checkout.
- Valores, receitas e horários demonstrativos, para personalização pela padaria.

## Arquivos

`index.html`: página. `assets/bakery/style.css`: identidade e animações. `app.js`: interface. `model.js`: modelos 3D originais e renderizador, com parâmetros e seed determinística. `morning.webp`: fotografia gerada para este projeto. SVGs originais: ilustrações e alternativa 2D. Three.js r170 vendorizado, licença MIT em `assets/bakery/vendor/THREE-LICENSE.txt`.

## Skills solicitadas

Orientações de `/workspace/skills/animate/SKILL.md` e `/workspace/skills/img2threejs/SKILL.md` consultadas. Os pacotes fornecidos contêm somente os documentos, sem catálogo, scripts `forge` ou contratos referenciados. A implementação adapta seus princípios de animação e modelagem procedural; não reivindica execução ou aprovação do pipeline de reconstrução da skill. Modelos estilizados, inferidos da imagem de padaria, sem promessa de reconstrução fotométrica.
