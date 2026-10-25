# Padaria Artesanal — Design System

O catálogo está em `design-system.html`. A implementação visual da tela inicial está em `design-systems/cedric-grolet-home/index.html`.

Abra o catálogo ou a tela diretamente pelo servidor local:

```sh
python3 -m http.server 8765
```

O projeto é HTML, CSS e JavaScript estáticos. A tela inicial usa uma imagem de confeitaria como base, um objeto procedural com profundidade 3D em CSS, troca de enquadramento ao passar pelas opções do menu e controle de movimento com `prefers-reduced-motion` e botão manual.

O wireframe e o plano da interface estão em `design-systems/cedric-grolet-home/wireframe.txt` e `plan.txt`. O objeto 3D é uma interpretação procedural leve para manter o protótipo sem dependências de build; a referência e o recorte 2D usados estão na pasta `assets/`.
