# Qualidade — CristianeTX

Esta pasta concentra a estratégia, matriz e critérios de regressão do site institucional da Cristiane Teixeira Advocacia Previdenciária.

A identidade pública do projeto permanece exclusivamente CristianeTX. Os artefatos desta pasta são internos ao repositório e não fazem parte do bundle publicado no GitHub Pages.

## Fluxo

1. alteração em branch;
2. critérios de aceite e risco definidos;
3. Quality Gate automático;
4. revisão visual quando a mudança é estética;
5. merge em `main`;
6. deploy do mesmo artefato aprovado;
7. smoke em produção;
8. incidente relevante vira regressão permanente.

## Arquivos

- `QA-STRATEGY.md`: gates, severidade e política de aprovação;
- `TEST-MATRIX.md`: cobertura automatizada e manual;
- `INCIDENT-TO-REGRESSION.md`: regra para transformar falha real em teste permanente.
