# Revisão de segurança — build estático local

Escopo autorizado: código deste template e servidor estático local em 127.0.0.1:8780. Sem varredura de Sunbeam, Google Maps, Vercel ou outros serviços externos.

Skills de AppSec, OWASP, revisão de código e remediação Strix foram lidas. `strix --version` falhou: CLI ausente. O pacote enviado fornece skills, não uma instalação autenticada do scanner. Não foi iniciado scan pago nem enviado código à nuvem. **Não houve pentest automatizado Strix**, nem alegação de aprovação OWASP.

## Dependências

`npm audit --omit=dev --json` reportou 7 alertas high, todos da cadeia Nuxt → Nitro/listhen → node-forge. Advisory raiz: GHSA-86w9-cpqp-85rv, verificação RSA PKCS#1 v1.5. A última versão consultada de node-forge, 1.4.0, continua no intervalo vulnerável. A sugestão automatizada de downgrade de Nuxt não foi aplicada sem análise de compatibilidade.

Justificativa de exposição: o deploy desta entrega contém somente HTML/CSS/JS/imagens de `.output/public`; não publica node_modules, listener TLS de listhen, código de servidor Nitro ou operações de verificação RSA. O alerta permanece relevante na cadeia de ferramentas de desenvolvimento/build e deve ser acompanhado. Isto não é uma auditoria limpa.

## Controles implementados

- Sem backend, banco, login, pagamento ou formulários de envio.
- Templates Vue escapam o conteúdo; sem v-html ou eval com dados externos. O JSON-LD usa constantes locais.
- Validação de dígitos no WhatsApp e encodeURIComponent na mensagem.
- Links externos com noopener/noreferrer; redes vazias não renderizadas.
- Mapa isolado por iframe sandbox; loading lazy e política de referência explícita. Destino fora do escopo de testes.
- CSP do HTML com hashes dos scripts gerados, scripts/conexões/fontes locais, sem unsafe-eval; style-src permite unsafe-inline para estilos dinâmicos. Headers de frame-ancestors, nosniff, referrer e permissions no deploy.
- CSP/meta e headers não garantem ausência de falhas; headers da produção dependem do provedor aplicar a configuração.

## Cobertura OWASP 2025

A01/A07: não há controle de acesso ou autenticação para avaliar. A02: configuração e superfície estática revisadas. A03: audit acima, com alerta conhecido. A04: não há segredo ou criptografia da aplicação; TLS de produção não testado. A05: revisão de sinks e payload de query local, sem backend para SQL. A06/A08: dados demonstrativos, sem transações, atualizações ou desserialização remota executável. A09: logs/alertas de infraestrutura não avaliados. A10: fallback de canvas e isolamento de falha de recurso, sem cobertura exaustiva de erros.

Resultados das verificações locais e limitações devem ser lidos junto com `PERF.md` e `CHECKLIST.md`; não equivalem a certificação ou scan de produção.

Probes locais de `/.git/config`, `/.env`, `/package.json` e `/../package.json` retornaram 404 no servidor que serve somente `.output/public`. Isso confirma isolamento desses caminhos nesta execução, não em qualquer configuração de hosting.

O caminho com `..` foi normalizado pelo fetch do cliente; esse resultado não é prova de teste de path traversal bruto contra o servidor.
