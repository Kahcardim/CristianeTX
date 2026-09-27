# Incidente → Regressão — CristianeTX

Toda falha relevante encontrada em produção ou em aparelho físico deve deixar prevenção permanente.

## Registro mínimo

1. ID e data;
2. rota;
3. dispositivo/browser ou viewport;
4. impacto;
5. severidade;
6. comportamento observado;
7. comportamento esperado;
8. causa raiz;
9. correção;
10. evidência;
11. teste de regressão criado;
12. resultado do reteste.

## Regra

Se o defeito puder ser detectado automaticamente sem gerar falso positivo recorrente, deve entrar na suíte.

Exemplos:

- scroll puxando sozinho → teste de estabilidade após scroll manual;
- hero diferente entre aparelhos → contrato geométrico por classes de viewport;
- link quebrado → validação estrutural;
- CSS não publicado → auditoria do artefato + smoke de produção;
- 404 sem estilo → smoke do 404 real;
- botão pequeno em touchscreen → target mínimo em controles primários.

Falhas estritamente subjetivas de identidade visual permanecem com validação humana, mas devem ter cenário de reteste documentado.
