# Personalização
- Conteúdo e produtos: src/content/index.ts. Todos os textos comerciais adicionais são demo.
- Contatos: src/config/site.config.ts; WhatsApp aceita somente 10–15 dígitos. Links de pedidos usam encodeURIComponent. Sem número, abre aviso de demonstração.
- Tokens de cores: início de src/style.css. Georgia é o fallback editorial local.
- Imagens: public/images. Execute python3 scripts/prepare-assets.py após substituir fontes; exige Pillow.
- Frames: public/frames/pc e mobile; mantenha a lista real. A seleção atual no renderer corresponde aos 60 frames enviados.
- Antes de publicar: cadastre dados reais, troque história e avaliações, revise licenças de fotos e fontes e configure domínio/SEO. Mapa e redes estão ausentes enquanto não houver endereço e perfis verificados.

PC agora usa public/frames/pc/scroll.mp4 + poster.webp e um manifesto de vídeo. Regenere com scripts/prepare-pc-video.py e reinspecione as regras de enquadramento se o lote de entrada mudar. Mobile continua com WebP.
