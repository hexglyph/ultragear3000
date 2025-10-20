# Repository Guidelines

## Project Structure & Module Organization
- `src/` contém o código TypeScript/React com subpastas para núcleo (`core/`), cenas (`game/scenes/`), sistemas (`game/systems/`), estado (`game/state/`) e UI (`ui/`).
- `public/` guarda assets estáticos (ex.: `logo.svg`).
- `docs/` reúne notas de roadmap e planejamento (`next-steps.md`).
- Configurações de build e lint ficam na raiz (`vite.config.ts`, `tsconfig.*`, `eslint.config.js`).

## Build, Test & Development Commands
- `bun install` — instala dependências usando Bun.
- `bun run dev` — executa o Vite em modo desenvolvimento (porta padrão 5173) com hot reload.
- `bun run build` — roda `tsc -b` seguido de `vite build` para gerar artefatos de produção em `dist/`.
- `bun run test` — executa a suíte Vitest (atualmente placeholder, expandir ao adicionar testes).
- `bun run lint` — aplica ESLint nas pastas `src/**/*.ts(x)` conforme a config do repositório.

## Coding Style & Naming Conventions
- Código em TypeScript com React/Three deve usar `tsx/ts`; preferir componentes funcionais e hooks.
- Indentação padrão de 2 espaços; manter imports agrupados por origem.
- Nomear arquivos em `kebab-case` (`race-scene.tsx`) e tipos/interfaces em `PascalCase`.
- Utilizar ESLint + Prettier integrados (via `bun run lint`) antes de abrir PRs.

## Testing Guidelines
- Framework: Vitest (unit/integration). Adicione arquivos `*.test.ts(x)` próximos ao código alvo.
- Escreva casos para novas lógicas de estado/sistemas; valide regressões de física/jogabilidade com mocks.
- Planeje cobertura mínima de 80% para módulos críticos (estado de corrida, upgrades) quando a suíte estiver estabelecida.

## Commit & Pull Request Guidelines
- Commits devem ser descritivos (ex.: `feat: add fuel consumption to race loop`, `fix: restore camera rig pivots`).
- Abra PRs com descrição curta, checklist de testes (`bun run dev`, `bun run lint`, `bun run test`) e screenshots/GIFs quando houver mudanças visuais.
- Referencie issues relevantes e destaque riscos ou follow-ups técnicos.

## Agent Tips & Safety
- Não remover configurações do Bun ou sobrescrever arquivos binários de assets.
- Verifique logs do navegador ao depurar falhas de rendering; arquivos principais: `src/game/scenes/race/RaceScene.tsx` e `src/game/state/*`.
