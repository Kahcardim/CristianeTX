# Cristiane Teixeira | Advocacia Previdenciária

Base institucional da Dra. Cristiane Teixeira de Souza, OAB/SP.

## Arquitetura atual

- `docs/`: frontend institucional estático publicado pelo GitHub Pages.
- `backend/`: base Node.js preparada para futuras integrações.
- `.github/workflows/pages.yml`: deploy automático do frontend no GitHub Pages.

## Escopo da V1

Site institucional com apresentação da banca, áreas de atuação, seção de conteúdo e contato.

Nesta fase não existem:
- área de clientes;
- autenticação;
- banco de dados;
- armazenamento de documentos;
- dados processuais.

## Desenvolvimento local

Frontend:

```bash
cd docs
python -m http.server 8080
```

Backend:

```bash
cd backend
npm start
```

Health check:

```
GET http://localhost:3000/health
```

## Observação

O GitHub Pages publica somente conteúdo estático. O backend Node.js está versionado e preparado, mas precisará de hospedagem própria quando passar a ser utilizado.
