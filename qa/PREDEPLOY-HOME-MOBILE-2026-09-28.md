# Evidência pré-deploy: Home e responsividade global

Data: 2026-09-28  
Branch: `fix/home-mobile-predeploy`  
Escopo: `BUG-HOME-01` a `BUG-HOME-05` e `BUG-MOBILE-01`  
Publicação: não executada

## Resultado executivo

Os seis bugs do escopo foram corrigidos no build local. A regressão automatizada, o bundle local e os smokes passaram. Permanecem pendentes apenas os aceites externos já previstos na matriz: revisão visual, revisão jurídica, testes em aparelhos físicos e dados oficiais para canais de conversão.

## Causas raiz e correções

| Bug | Causa raiz | Correção |
|---|---|---|
| BUG-HOME-01 | O hero desktop usava altura mínima vinculada a quase toda a viewport e a apresentação herdava dimensões e espaçamentos excessivos. | Remoção da altura mínima no desktop, espaçamento fluido e slides institucionais limitados. |
| BUG-HOME-02 | Os três painéis institucionais eram composições tipográficas genéricas, sem imagens relacionadas ao conteúdo. | Três imagens editoriais originais em WebP, com proporção 4:3, texto alternativo e dimensões explícitas. |
| BUG-HOME-03 | A seção de conteúdo tinha chamadas amplas e pouco específicas, sem responder a intenções reais de busca previdenciária. | Copy original sobre planejamento, incapacidade e descontos não reconhecidos, com links internos contextuais. |
| BUG-HOME-04 | O layout em duas colunas, a largura e os espaçamentos produziam baixa densidade, eixo visual fraco e muito espaço em branco. | Cabeçalho centralizado, grade limitada a 1040 px, três cards responsivos e espaçamento reduzido. |
| BUG-HOME-05 | CTA final e rodapé usavam eixos e larguras diferentes, gerando ruptura visual no encerramento. | CTA centralizado, ações balanceadas e grid do rodapé limitado e alinhado ao mesmo eixo. |
| BUG-MOBILE-01 | As páginas não declaravam `viewport-fit=cover` e o header não possuía contrato explícito de largura e safe areas. A cascata acumulada também não protegia o documento contra overflow residual. | `viewport-fit=cover` em todas as páginas, header global com `width: 100%`, container fluido, safe areas, `min-width: 0` e proteção contra overflow. Nenhuma regra por modelo de aparelho foi criada. |

## Arquivos modificados

- `docs/index.html`
- `docs/404.html`
- `docs/artigos/index.html`
- `docs/atuacao/index.html`
- `docs/atuacao/planejamento/index.html`
- `docs/atuacao/incapacidade/index.html`
- `docs/atuacao/pcd/index.html`
- `docs/atuacao/fraudes/index.html`
- `docs/contato/index.html`
- `docs/cookies/index.html`
- `docs/escritorio/index.html`
- `docs/faq/index.html`
- `docs/privacidade/index.html`
- `docs/termos/index.html`
- `docs/assets/css/styles.css`
- `docs/assets/images/home-editorial/analise-documental.webp`
- `docs/assets/images/home-editorial/planejamento-previdenciario.webp`
- `docs/assets/images/home-editorial/orientacao-segurado.webp`
- `scripts/validate-content.mjs`
- `tests/home-predeploy-regressions.spec.mjs`
- `qa/TEST-MATRIX.md`
- `qa/evidence/before/*`
- `qa/evidence/after/*`
- `package-lock.json`

## Testes permanentes adicionados

O arquivo `tests/home-predeploy-regressions.spec.mjs` adiciona 14 contratos:

- sete testes globais, um por largura em 320, 360, 375, 390, 393, 412 e 430 px, executados em todas as rotas;
- dois testes de menu em retrato e paisagem;
- um contrato global de viewport e safe area;
- cinco contratos para escala, imagens, conteúdo, centralização e encerramento da Home, com `BUG-HOME-03` e `BUG-HOME-04` cobertos conjuntamente em um deles.

O validador de conteúdo agora falha se alguma página remover `viewport-fit=cover` ou se o CSS perder o tratamento de safe areas.

## Regressão

| Gate | Resultado |
|---|---:|
| Estrutura, 14 páginas e 8 imagens | PASS |
| Conteúdo, identidade, SEO, placeholders e safe areas | PASS |
| Playwright completo, Chromium, Firefox e WebKit | 163 PASS |
| Bundle local minificado | PASS, 27 arquivos e 425.773 bytes |
| Smoke do artefato local | 14 PASS |
| Smoke da produção atualmente publicada | 7 PASS |
| FAIL automatizado final | 0 |
| Pendente automatizado final | 0 |

Os contratos históricos `RSP-01` a `RSP-04`, `NAV-01` a `NAV-03`, `UX-01` a `UX-03`, `A11Y-01` e `A11Y-02`, `CNT-01` a `CNT-03`, `SMK-01` a `SMK-03`, `IMG-01`, `BLD-01`, `BLD-02` e `PRD-03` foram reexecutados pela suíte e pelos gates de build/smoke.

## Evidências mobile

Em todas as larguras exigidas, a medição retornou `headerLeft = 0`, `headerWidth = viewport` e `scrollWidth = viewport`. O teste também percorreu todas as rotas, validou retrato e paisagem, abriu o menu e confirmou `viewport-fit=cover` e os tokens de safe area.

Os testes são orientados à viewport. Galaxy A55, iPhone 16 e Realme C75x não recebem CSS específico. A validação em aparelhos físicos continua como aceite manual externo, conforme `VIS-02` e `VIS-03`.

## Evidência visual

- Antes: `qa/evidence/before/desktop-1536.png`, `mobile-320.png`, `mobile-393.png`, `mobile-430.png` e `landscape.png`.
- Depois: `qa/evidence/after/desktop-1536.png`, `mobile-320.png`, `mobile-393.png`, `mobile-430.png` e `landscape.png`.
- Métrica desktop depois: hero 657,5 px, apresentação 359,1 px, grade de conteúdo 1040 px, CTA 900 px e rodapé 1040 px, todos centralizados e sem overflow.

## Pendências externas

- `VIS-01`: aceite estético da responsável.
- `VIS-02`: Safari em iPhone físico.
- `VIS-03`: Chrome em Android físico, incluindo Galaxy A55 e Realme C75x quando disponíveis.
- `LEG-01`: aceite jurídico do conteúdo.
- `DAT-01` e `CONV-01`: dados oficiais e canal externo de conversão.

Nenhuma dessas pendências representa falha automatizada do build local. Elas não autorizam publicação automática.

## Confirmação obrigatória

**DEPLOY NÃO EXECUTADO.** A branch local está preparada para revisão e deve permanecer fora de `main` e do GitHub Pages até autorização expressa.
