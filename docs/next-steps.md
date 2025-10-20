# Próximos Passos Detalhados

## Núcleo de Corrida (Sprint)

- [ ] Substituir o controlador arcade simplificado por física baseada em `cannon-es` com colisões, torque e downforce configuráveis.
- [ ] Implementar IA modular com perfis distintos (agressivo, calculista, experimental) e sistema de ultrapassagem contextual.
- [ ] Adicionar geração procedural de pistas via curvas Bézier com variações por bioma, saltos, túneis e obstáculos.
- [ ] Integrar sistema de eventos dinâmicos (poças de óleo, quedas de meteoros, turbos temporários).

## Economia e Progressão

- [ ] Armazenar dados de campaign runtime (planetas vencidos, upgrades) em `IndexedDB` para persistência entre sessões.
- [ ] Introduzir ranking de corrida e cálculo de créditos baseado em posição, estilo e objetivos bônus.
- [ ] Construir árvore de upgrades com ramificações e itens únicos desbloqueados por conquistas planetárias.
- [ ] Criar cutscene interplanetária procedural com shaders e trilha dinâmica.

## Experiência de Usuário

- [ ] HUD definitivo com indicadores de energia, nitro, mini-mapa e estado da IA rival.
- [ ] Sistema de diálogo holográfico com engenheiros e rivais para contextualizar eventos.
- [ ] Accessibility pass: daltonismo, remapeamento de controles, modos de assistência.

## Tooling e Qualidade

- [ ] Automatizar lint/format/test via GitHub Actions.
- [ ] Adicionar testes de render (Playwright) e snapshot de UI crítica.
- [ ] Instrumentar telemetria de performance (fps, draw calls) com overlay debug.
- [ ] Construir editor interno de pistas (UI React + Canvas) exportando curvas em JSON.
