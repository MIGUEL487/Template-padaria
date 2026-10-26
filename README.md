# O Refúgio — template v2

Site de página única em Nuxt 4, Vue 3 e TypeScript, com Tailwind v4, GSAP, Lenis e motion-v. Hero de frames, narrativa presa ao scroll, cardápio filtrável, história, experiência, avaliações demonstrativas, localização e rodapé com preferência de movimento.

```sh
npm ci --ignore-scripts
npm run typecheck
npm run generate
python3 -m http.server 8780 --directory .output/public
```

O script de frames usa os arquivos reais e não depende de sequência contínua. Caminho de entrada é fornecido por argumento; originais ficam fora do repositório. `npm run generate` impõe o lint da escala. Consulte `docs/asset-report.md`, `docs/assets-measured.json`, `docs/image-plan.md` e `docs/design-system-reference.md`.

Na Vercel, deixe a saída automática do framework Nuxt: o preset vercel-static produz `.vercel/output/static`, enquanto o build local produz `.output/public`. O script CSP considera essa diferença. Não configure manualmente `.output/public` como Output Directory na Vercel.

## Materiais e personalização

O PC usa agora 150 JPEGs Full HD em 1920×1080, preservados do novo ZIP; o celular mantém seus 150 WebP em 720×1280. As cinco fotografias permanecem. Os assets publicados já estão versionados: não é necessário reimportar para gerar o site. Para substituir só PC: `npm run prepare:frames:pc -- /pasta/dos/jpeg`. O importador combinado antigo substitui ambos os conjuntos e deve receber somente uma pasta com material atualizado.

Não há fontes personalizadas: as reservas atuais são Georgia e system-ui. Fontes Zarmatype gratuitas para uso pessoal exigem licença comercial para venda do template. Endereço, horários, avaliações e cardápio são demonstrativos. WhatsApp não é inventado: vazio, abre informação em vez de enviar um pedido. Redes não preenchidas ficam ocultas.

## Relatórios

Veja `docs/PERF.md`, `docs/security-report.md`, `docs/image-plan.md`, `docs/CUSTOMIZE.md` e `docs/CHECKLIST.md`. A meta de fluidez é medida em Chromium headless; isso não garante desempenho em aparelhos reais. Não existe certificação ou prêmio Awwwards. A auditoria de dependências tem um alerta transitivo documentado, e Strix não foi executado por falta de CLI/configuração. O build estático está disponível em `.output/public` e servido localmente na porta 8780; não equivale a um deployment de produção confirmado.
