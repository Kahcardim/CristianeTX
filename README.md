# Cristiane Teixeira | Advocacia Previdenciária

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

O deploy falha se detectar páginas obrigatórias ausentes, links ou âncoras quebrados, imagens sem dimensões/alt, assets inexistentes ou imagens órfãs.

O código-fonte permanece legível no repositório. CSS e JavaScript são minificados apenas no bundle publicado.
