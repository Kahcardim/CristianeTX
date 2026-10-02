# Cristiane Teixeira | Advogada Previdenciária

Site institucional da Dra. Cristiane Teixeira de Souza, OAB/SP.

## Estrutura

- `docs/`: frontend estático publicado no GitHub Pages.
- `docs/assets/images/`: somente imagens efetivamente usadas pelo site.
- `scripts/validate-site.mjs`: QA estrutural executado antes de cada deploy.
- `backend/`: base Node.js reservada para futuras integrações. Não é utilizada pela V1.
- `.github/workflows/pages.yml`: valida, minifica CSS/JS e publica o site.

## Escopo atual

A V1 é institucional e não possui área de clientes, autenticação, banco de dados, upload de documentos ou formulário próprio.

## Desenvolvimento local

```bash
cd docs
python -m http.server 8080
```

Backend reservado:

```bash
cd backend
npm start
```

Health check:

```text
GET http://localhost:3000/health
```

## Qualidade

O projeto usa Quality Gates antes e depois do deploy.

Antes da publicação:

- validação estrutural de páginas, links, âncoras, imagens e assets;
- contratos de conteúdo e identidade;
- regressão Playwright;
- smoke cross-browser em Chromium, Firefox e WebKit;
- matriz responsiva;
- testes de menu, cookies, âncoras, scroll e carrossel;
- checks de acessibilidade adaptativa e alvos de toque;
- auditoria do bundle minificado.

A build é criada uma única vez. O artefato que passou pelos gates é exatamente o mesmo publicado no GitHub Pages.

Depois do deploy, o pipeline executa smoke na produção, incluindo o 404 customizado.

Documentação interna:

- `qa/QA-STRATEGY.md`
- `qa/TEST-MATRIX.md`
- `qa/INCIDENT-TO-REGRESSION.md`

Comandos locais:

```bash
npm install
npx playwright install chromium firefox webkit
npm run qa
```

O código-fonte permanece legível no repositório. CSS e JavaScript são minificados apenas no bundle publicado.
