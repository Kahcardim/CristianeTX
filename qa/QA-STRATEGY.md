# Estratégia de QA — CristianeTX

## Objetivo

Impedir que correções visuais, conteúdo institucional ou alterações de navegação quebrem outras rotas, dispositivos ou a versão publicada.

## Prioridade

| Nível | Definição | Gate |
|---|---|---|
| P0 | site indisponível, navegação quebrada, conteúdo jurídico/institucional incorreto, deploy inválido | bloqueia |
| P1 | regressão funcional, overflow, hero ilegível, interação principal inacessível | bloqueia |
| P2 | defeito visual localizado sem perda funcional | exige decisão antes do merge |
| P3 | melhoria estética ou refinamento | backlog |

## Gates

### Gate 1 — Estrutura e contratos

Executa antes dos testes de navegador.

- arquivos obrigatórios;
- links, âncoras e assets locais;
- IDs duplicados;
- `alt`, dimensões de imagens, title e meta description;
- canonical;
- identidade Cristiane Teixeira;
- ausência de placeholders e textos de desenvolvimento;
- recursos adaptativos essenciais no CSS/JS.

### Gate 2 — Regressão de navegador

Playwright executa:

- smoke de todas as rotas;
- Chromium, Firefox e WebKit para smoke;
- matriz responsiva;
- Home e Escritório em larguras móveis adicionais;
- menu;
- cookies;
- subnav e âncoras;
- carrossel;
- ausência de scroll automático;
- ausência de canal de WhatsApp fictício;
- sem erros de console/pageerror;
- sem overflow horizontal;
- sem imagens quebradas;
- semântica e preferências de acessibilidade.

### Gate 3 — Artefato

O site é minificado uma única vez. O bundle resultante é auditado e armazenado como artefato validado.

O deploy não refaz a build. Ele publica exatamente o artefato que passou nos testes.

### Gate 4 — Deploy

Somente `main` pode publicar. Pull requests executam Quality Gate sem deploy.

### Gate 5 — Produção

Após o GitHub Pages concluir:

- Home;
- Escritório;
- Áreas de Atuação;
- Contato;
- CSS;
- JavaScript;
- 404 customizado.

O pipeline falha se a produção não corresponder aos contratos mínimos.

## Validação humana obrigatória

Automação não substitui:

- aprovação visual da identidade;
- leitura jurídica;
- validação em aparelho físico quando houver bug específico de browser/hardware;
- confirmação de dados institucionais;
- aceite da responsável pelo escritório.

## Regra de aprovação

Uma rodada só pode ser marcada como aprovada quando:

- P0 = 0;
- P1 = 0;
- Quality Gate verde;
- artefato auditado;
- deploy verde;
- smoke de produção verde;
- pendências bloqueadas por dados externos explicitamente registradas.
