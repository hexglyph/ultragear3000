# Ultragear 3000

Ultragear 3000 é um jogo de corrida espacial inspirado no clássico Top Gear 3000. O objetivo é competir em campeonatos interplanetários, conquistar créditos com bons resultados e usar esses recursos para evoluir seu carro hiperpersonalizável.

## Visão Geral

- **Campanha galáctica**: avance por sistemas estelares, cada um com 4 pistas com biomas e condições climáticas distintos (dia, noite, neblina, montanha, praia, deserto, campos, etc.).
- **Metajogo de upgrades**: cada corrida rende créditos proporcionais à sua colocação. Invista em motor, transmissão, aerodinâmica, pneus, freios, blindagem, energia e protótipos especiais.
- **Viagem interplanetária**: animações cinemáticas conectam o término de um campeonato ao salto para o próximo sistema.
- **Experiência arcade moderna**: gameplay acessível, sensação de velocidade elevada, trilha dinâmica e efeitos visuais modulados por clima e bioma.

## Filosofia de Design

1. **Profundidade modular**: componentes de veículo, pistas e eventos devem ser definidos via dados (JSON) para facilitar expansão.
2. **Escalabilidade visual**: tecnologia 3D com pipelines de pós-processamento para entregar estética retro-futurista sem comprometer performance.
3. **Ferramentas ágeis**: hot reload, edição de pista baseada em curvas e telemetria de corrida para iterar rápido em novas pistas.
4. **Acessibilidade**: suporte a gamepad, teclado e assistência de direção, com camadas opcionais de simulação para jogadores hardcore.

## Stack Técnica

- **Motor**: [Three.js](https://threejs.org/) com renderização WebGL2 + pós-processamento (glow, motion blur e LUTs).
- **Física**: [cannon-es](https://github.com/pmndrs/cannon-es) para simular dinâmica arcade customizada (downforce, drift assistido).
- **Framework**: [Vite](https://vitejs.dev/) + TypeScript para desenvolvimento moderno, hot reload e build otimizado.
- **Gestão de estado**: Zustand (estado global leve) + RxJS para eventos reativos (telemetria, clima dinâmico).
- **UI**: React + TailwindCSS para HUD e menus sobrepostos ao canvas WebGL.
- **Ferramentas**: ESLint + Prettier + Vitest + Playwright para testes automatizados.
- **Asset pipeline**: GLTF para carros, Heightmaps para pistas, Audio em OGG/MP3 com WebAudio API.

## Estrutura de Jogo

```
src/
  core/        // engine wrappers, loop, input, assets
  game/
    scenes/    // race, garage, mapa galáctico, menu
    world/     // planetas, pistas, clima, IA
    systems/   // economia, upgrades, progressão
  ui/          // HUD, menus, overlays
  data/        // definições JSON de planetas, pistas, upgrades
```

### Loops Principais

- **Race Loop** → Física de corrida, IA dos rivais, eventos dinâmicos de pista, clima reativo, telemetria.
- **Garage Loop** → Gestão de inventário, upgrades, tuning rápido, preview de estatísticas.
- **Galaxy Loop** → Mapa de progressão, recompensas, narrativa, desbloqueios.

## Roadmap Macro

1. **Fase Proto (0.1)**  
   - Protótipo de corrida em uma pista com carro controlável, IA simples e HUD básico.  
   - Sistema de clima e ciclo dia/noite rudimentar.  
   - UI de pós-corrida com recompensa básica.  

2. **Fase Alpha (0.5)**  
   - Editor interno de pistas baseado em curvas.  
   - Múltiplos planetas com diferenciação visual e comportamental.  
   - Sistema de upgrades funcional com feedback visual no carro.  
   - Economia e progressão interplanetária.  

3. **Fase Beta (0.9)**  
   - Polimento visual (pós-processamento, efeitos).  
   - IA competitiva com múltiplas personalidades.  
   - Cutscenes de viagem interplanetária.  
   - Conteúdo completo (pistas, eventos especiais, bosses).  

4. **Release (1.0)**  
   - Otimização, balanceamento, suporte multilíngue.  
   - Modo multiplayer assíncrono (ghosts e rankings).  
   - Conteúdos finais de narrativa e conquistas.

## Próximos Passos

1. Configurar monorepo Vite + TypeScript + Three.js.  
2. Implementar núcleo de engine (loop, render, input e física).  
3. Prototipar corrida com pista procedural simples, HUD e AI básica.  
4. Deixar documentado o fluxo de assets e guidelines visuais / sonoros.  
5. Projetar o sistema de economia e upgrades com dados externos.

> Veja `docs/next-steps.md` para uma lista detalhada de tarefas planejadas nas próximas sprints.

Este repositório conterá o código-fonte, documentos de design e scripts de automação necessários para construir o Ultragear 3000.

## Referências

- [`docs/reference/tg3000-reference.md`](docs/reference/tg3000-reference.md): estudo detalhado do Top Gear 3000 original (SNES) + blueprint moderno para orientar sistemas, conteúdo e UX.
- [`docs/reference/sprite-placeholders.md`](docs/reference/sprite-placeholders.md): catálogo de placeholders SVG com dimensões alvo para HUD, pista, mapa e UI.

## Como Rodar (protótipo atual)

```bash
bun install
bun run dev
```

- **Controles de corrida**: `W`/`↑` acelera, `S`/`↓` freia, `A`/`←` e `D`/`→` esterçam, `Shift` ativa boost.  
- **Atalhos de cena**: `R` retoma a corrida, `G` abre o hangar, `M` (ou `P`) abre o mapa galáctico.  
- **Upgrade (protótipo)**: dentro do hangar, pressione `U` para consumir créditos e subir o nível do upgrade destacado (placeholder).
