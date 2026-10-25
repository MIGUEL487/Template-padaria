# Miolo — padaria de todos os dias

Novo template responsivo de padaria brasileira, em português. HTML, CSS e JavaScript, sem build e sem dependências remotas em tempo de execução.

## Rodar

```sh
python3 -m http.server 8766
```

Abra http://localhost:8766/. No Vercel, framework **Other**, sem comando de build, diretório de saída `.`. As rotas antigas redirecionam para o início.

## Recursos

- Croissant, pão e café procedurais em Three.js, com seleção por hover, foco ou toque e rotação por arraste.
- Revelações por IntersectionObserver, transições pela Web Animations API, hover e movimento ambiental em CSS.
- Movimento reduzido, pausa manual, pausa em aba oculta, renderização limitada a 30 fps e suspensão fora da tela. Alternativa SVG se WebGL falhar.
- Cardápio filtrável, sacola com quantidades persistidas localmente e cópia da lista. Não há envio de pedido ou checkout.
- Valores, receitas e horários demonstrativos, para personalização pela padaria.

## Arquivos

`index.html`: página. `assets/bakery/style.css`: identidade e animações. `app.js`: interface. `model.js`: modelos 3D originais e renderizador, com parâmetros e seed determinística. `morning.webp`: fotografia gerada para este projeto. SVGs originais: ilustrações e alternativa 2D. Three.js r170 vendorizado, licença MIT em `assets/bakery/vendor/THREE-LICENSE.txt`.

## Skills solicitadas

Orientações de `/workspace/skills/animate/SKILL.md` e `/workspace/skills/img2threejs/SKILL.md` consultadas. Os pacotes fornecidos contêm somente os documentos, sem catálogo, scripts `forge` ou contratos referenciados. A implementação adapta seus princípios de animação e modelagem procedural; não reivindica execução ou aprovação do pipeline de reconstrução da skill. Modelos estilizados, inferidos da imagem de padaria, sem promessa de reconstrução fotométrica.
