# Matriz de Testes — CristianeTX

## Automatizados

| ID | Área | Teste | Prioridade |
|---|---|---|---|
| STR-01 | Estrutura | arquivos obrigatórios | P0 |
| STR-02 | Estrutura | links e assets locais | P0 |
| STR-03 | HTML | H1 único, lang, viewport | P1 |
| CNT-01 | Conteúdo | canonical e metadata | P1 |
| CNT-02 | Identidade | identidade pública Cristiane Teixeira | P0 |
| CNT-03 | Conteúdo | ausência de placeholders/rascunho | P1 |
| SMK-01 | Rotas | todas as páginas carregam | P0 |
| SMK-02 | Browser | Chromium/Firefox/WebKit | P1 |
| SMK-03 | Runtime | zero console error/pageerror | P1 |
| IMG-01 | Imagens | carregamento real | P1 |
| RSP-01 | Responsivo | zero overflow horizontal | P1 |
| RSP-02 | Home | hero 4:3 em mobile | P1 |
| RSP-03 | Home | painel abaixo da foto em fluxo normal | P1 |
| RSP-04 | Escritório | abertura dentro da viewport | P1 |
| NAV-01 | Menu | abrir/fechar/Escape/toque externo | P1 |
| NAV-02 | Âncoras | subnav sem título coberto | P1 |
| NAV-03 | Scroll | zero puxão após scroll manual | P1 |
| UX-01 | Carrossel | controles mudam slide ativo | P1 |
| UX-02 | Cookies | aviso, aceite e persistência | P1 |
| UX-03 | Touch | controles primários >= 44×44 | P1 |
| A11Y-01 | Semântica | controles visíveis com nome acessível | P1 |
| A11Y-02 | Preferências | reduced-motion e forced-colors | P1 |
| WA-01 | Contato | nenhum WhatsApp fictício em produção | P0 |\n| DAT-02 | Fixture | WhatsApp/OAB/Instagram fictícios válidos e confinados ao QA | P1 |
| BLD-01 | Bundle | CSS/JS válidos e limites de tamanho | P1 |
| BLD-02 | Bundle | imagens e tamanho total dentro do orçamento | P2 |
| PRD-01 | Produção | rotas críticas publicadas | P0 |
| PRD-02 | Produção | CSS/JS publicados | P0 |
| PRD-03 | Produção | 404 customizado | P1 |

## Viewports automatizadas

Matriz geral:

- 360×800;
- 393×852;
- 412×915;
- 768×1024;
- 1366×768.

Hero e abertura institucional também recebem:

- 320×568;
- 375×812;
- 390×844;
- 430×932.

Os valores representam classes de viewport. O layout não depende do nome/modelo do aparelho.

## Manuais

| ID | Área | Teste |
|---|---|---|
| VIS-01 | Identidade | hierarquia, recorte e sobriedade institucional |
| VIS-02 | Aparelho físico | iOS Safari real |
| VIS-03 | Aparelho físico | Android/Chrome real |
| LEG-01 | Conteúdo | revisão jurídica |
| DAT-01 | Institucional | OAB, WhatsApp e Instagram oficiais |
| CONV-01 | Conversão | CTA e fluxo de contato quando o canal oficial existir |

## Evidência

Falha automatizada deve preservar trace, screenshot e relatório Playwright quando disponíveis. Falha visual manual deve registrar viewport/aparelho, rota, screenshot e resultado esperado.\n## Dados institucionais de QA\n\nEnquanto os dados oficiais não forem fornecidos, `qa/fixtures/institutional.test.json` usa valores fictícios exclusivamente para testes. O pipeline falha se qualquer um deles aparecer dentro de `docs/`.\n