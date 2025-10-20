# Referência de Design — Top Gear 3000 (SNES)

Esta ficha consolida elementos essenciais do Top Gear 3000 original (Super Nintendo) e propõe parâmetros adaptados para o protótipo web do Ultragear 3000.

## 1. Visão Geral do Produto

- **Plataforma**: Super Nintendo (SNES) com distribuição pela Kemco (global) e Gremlin Interactive (desenvolvimento). No Japão recebeu o título _The Planet’s Champ: TG3000_ (lançamento NA: fevereiro de 1995; JP: 28/04/1995).  
  _Referências_: Nintendo, Wikipedia
- **Modos**: Campeonato (progressão com upgrades entre provas) e Versus (corrida única). Suporte para até 4 jogadores via Multitap, tela em quadrantes.  
  _Referências_: Gaming Alexandria
- **Diferencial técnico**: uso exclusivo do chip DSP-4, habilitando bifurcações com rotas de comprimentos distintos. TG3000 é o único jogo do SNES com esse chip.  
  _Referências_: Wikipedia
- **Escopo**: cerca de 12 sistemas solares somando aproximadamente 48 pistas.  
  _Referências_: GameFAQs

## 2. Núcleo de Jogabilidade

### 2.1 Modelo de Corrida

- Grid com até 20 carros (1–4 humanos + IA nomeadas).  
  _Referências_: Wikipedia
- Gerenciamento de recursos por faixa especial:
  - **Combustível**: consumo contínuo, reabastecimento em faixas vermelhas (Recharge).
  - **Integridade estrutural**: dano cumulativo, reparo em faixas azuis (Repair).
  - **Nitro/Boost**: cargas limitadas; upgrades ampliam potência/duração e podem recuperar combustível em níveis altos.  
    _Referências_: Wikipedia
- Bifurcações simultâneas de pista com tempos diferentes (risco × recompensa).  
  _Referências_: Wikipedia

### 2.2 “Armas” (autoimpacto)

- **Jump**: salto livre e ilimitado para evitar tráfego, obstáculos ou coletar bônus.
- **Warp/Fasear**: atravessa carros/trechos por ~1,5 s respeitando a trajetória.
- **Boost**: aceleração temporária; cargas extras em bônus.  
  Observação: nenhuma arma causa dano direto à IA — elas aprimoram a mobilidade do jogador.  
  _Referências_: Wikipedia

### 2.3 Economia e Progressão

- Créditos por corrida alimentam uma loja entre provas.
- Árvores de upgrade (motor, câmbio, pneus, blindagem, boost, slot de “armas”) com itens temáticos como motor de fusão nuclear, blindagem cobalto-titânio e câmbio de polímero líquido.
- Três dificuldades: IA mais rápida e campeonatos mais longos em níveis superiores; em fácil/médio alguns componentes de nível 6 não liberam.
- Sistema de senhas recupera progresso/upgrades; inclui códigos “cheat” clássicos (ex.: “BBB” nas três primeiras posições concede muitos créditos e inicia no segundo evento).  
  _Referências_: Wikipedia

### 2.4 Versus (até 4 jogadores)

- Corridas únicas com seleção rápida de quatro perfis (aceleração, velocidade, boost). Tela fixa em quatro quadrantes; IA preenche vagas livres; requer Multitap.  
  _Referências_: Gaming Alexandria

## 3. Apresentação e UX

- HUD exibe posição, volta/distância, combustível, integridade, velocímetro, contador de boost e indicador de arma ativa.
- Opções do jogador: cor do carro, nome, unidades (KM/H ou MPH) e mapeamento livre de botões no controle.  
  _Referências_: Wikipedia
- Estética: futurismo “ano 3000”, pistas planetárias extensas, sensação de alta velocidade e tráfego intenso.

## 4. Especificação Moderna Inspirada

### 4.1 Sistemas e Entidades (dados)

```ts
// Tipos fundamentais
type Currency = number; // créditos
type Percent = number;  // 0..100
type Meters = number;
type KmH = number;
type Seconds = number;

interface CarBaseStats {
  maxSpeed: KmH;
  accel0to100: Seconds;
  handlingGrip: number;   // 0..1
  damageMax: number;      // integridade máxima
  fuelCapacity: number;   // litros (ou unidade abstrata)
  boostCapacity: number;  // cargas
}

interface UpgradeTier {
  id: string;
  level: 1|2|3|4|5|6;
  cost: Currency;
  deltaMaxSpeed?: KmH;
  deltaAccel?: Seconds;
  deltaGrip?: number;
  deltaDamageMax?: number;
  deltaFuelCap?: number;
  boostPower?: number;
  boostDuration?: Seconds;
  unlockAtEventIndex?: number;
}

interface WeaponSpec {
  id: 'jump'|'warp'|'boost';
  cooldown: Seconds;
  charges?: number; // undefined = ilimitado (jump)
  effect: 'vertical_impulse'|'phase_through'|'speed_burst';
  params: Record<string, number>;
}

interface CarState {
  integrity: number;
  fuel: number;
  boostCharges: number;
  activeWeapon: 'jump'|'warp'|'boost';
}

interface TrackStrip {
  kind: 'normal'|'recharge'|'repair'|'hazard'|'jump_bonus';
  length: Meters;
  curvature: number; // -1..1
}

interface TrackBranch {
  id: string;
  strips: TrackStrip[];
  timeAdvantageAtRefPace: Seconds;
  riskRating: number; // 0..1
}

interface Track {
  id: string;
  planet: string;
  system: string;
  length: Meters;
  laps: number;
  speedAvgTarget: KmH;
  trafficDensity: number; // 0..1
  branches?: TrackBranch[];
}

interface Event {
  id: string;
  trackId: string;
  gridSize: number; // até 20
  rewards: { positionCredits: Currency[]; completionBonus: Currency };
  difficultyScalar: number;
}

interface Championship {
  id: string;
  systems: { name: string; eventIds: string[] }[];
  passwordSeed?: string;
}

interface PlayerProfile {
  name: string;
  unit: 'KMH'|'MPH';
  controls: Record<string, string>;
  credits: Currency;
  ownedUpgrades: Record<'engine'|'gearbox'|'tires'|'armor'|'boost'|'weapon', UpgradeTier['id']>;
}
```

### 4.2 Loop de Corrida (tempo real)

Pseudo-função de atualização:

```ts
function updateRace(dt: Seconds) {
  for (const car of allCars) {
    const input = getInput(car);
    const drag = computeDrag(car);
    const engineAccel = computeEngineAccel(car, input.throttle);
    const boostAccel = car.weaponActive === 'boost' ? computeBoostAccel(car) : 0;
    car.velocity = clamp(car.velocity + (engineAccel + boostAccel - drag) * dt, 0, car.stats.maxSpeed);

    car.fuel -= fuelRate(car, engineAccel, boostAccel) * dt;
    if (car.fuel <= 0) car.velocity = Math.max(car.velocity - emptyFuelPenalty(dt), 0);

    applySteering(car, input.steer, currentStrip.curvature, car.stats.handlingGrip);
    resolveCollisions(car, opponents, trackWorld);

    if (onStripKind(car, 'recharge')) car.fuel = Math.min(car.fuel + rechargeRate * dt, car.stats.fuelCapacity);
    if (onStripKind(car, 'repair')) car.integrity = Math.min(car.integrity + repairRate * dt, car.stats.damageMax);

    if (input.weapon && canActivate(car)) {
      if (car.activeWeapon === 'jump') applyVerticalImpulse(car, params.jumpImpulse);
      if (car.activeWeapon === 'warp') phaseThroughFor(car, params.warpTime);
      if (car.activeWeapon === 'boost') consumeBoostCharge(car);
    }

    if (hitObstacleOrHardContact(car)) car.integrity -= computeImpactDamage(car);
    if (car.integrity <= 0) applyWreckState(car);

    handleBranchesChoice(car);
    updateLapAndFinish(car);
  }
}
```

### 4.3 IA

- Objetivo: manter _pace_ alvo, escolher rotas com base em vantagem esperada e usar Jump/Boost para driblar tráfego.  
- Heurísticas:
  - **Ultrapassagem**: desvio lateral se _time to contact_ < limiar; caso contrário, aciona Jump.
  - **Gestão de combustível**: prioriza rotas com recharge quando combustível < X % e zona próxima.
  - **Branches**: escolha probabilística via `softmax(-expectedTime + riskWeight * riskPenalty)`.
  - **Dificuldade**: escala erro de direção, reflexo, agressividade e velocidade alvo.

### 4.4 Economia e Progressão

- Créditos: `baseReward * positionMultiplier * difficultyMultiplier`.
- Loja: libera tiers conforme índice do evento, emulando o _gating_ original.
- Balanceamento: reservar tiers finais para os últimos sistemas.
- Gestão de combustível/boost para manter tensão — pistas com menos faixas exigem pilotagem econômica.

### 4.5 Pistas e Conteúdo

- Meta: ~12 sistemas com 3–5 pistas cada (~48 no total).
- Cada pista: 1–2 bifurcações (uma mais rápida e arriscada), 2–4 zonas Recharge, 1–3 zonas Repair e hazards contextuais.
- Curva de dificuldade: aumenta densidade de tráfego, velocidade média e distância entre faixas especiais.

### 4.6 Controles e UX

- Remapeamento completo de botões/teclas.
- Alternância KM/H ↔ MPH.
- Câmera com FOV elevado, motion blur leve e marcações claras (vermelho = combustível, azul = reparo).

### 4.7 Modo Versus Local

- Seleção pré-corrida de quatro _builds_ equilibradas (alto pico de velocidade, melhor aceleração, melhor grip, balanceado).
- Tela fixa em quatro quadrantes; IA complementa vagas.
- Corridas isoladas, sem persistência.  
  _Referências_: Gaming Alexandria

## 5. Parâmetros de Tuning Recomendados

- **Consumo**: planejar corridas terminando com 5–15 % de combustível se o jogador quase não recarregar.
- **Dano**: colisões leves drenam velocidade; fortes reduzem integridade e aplicam _stun_ curto.
- **Boost**: 3–4 cargas base → upgrades até 6–8; duração entre 1,5 e 2,2 s.
- **Jump**: cooldown de 1,0–1,5 s; altura suficiente para atravessar 1–2 carros.
- **Warp**: 1,2–1,6 s de fase mantendo a curvatura da pista.
- **Branches**: vantagem projetada entre 0,8 e 2,5 s comparado à rota principal.

## 6. Exemplo de Tabela de Upgrades

```ts
const ENGINE: UpgradeTier[] = [
  { id: 'E1', level: 1, cost: 2000,  deltaMaxSpeed: +10 },
  { id: 'E2', level: 2, cost: 5000,  deltaMaxSpeed: +12 },
  { id: 'E3', level: 3, cost: 9000,  deltaMaxSpeed: +14, unlockAtEventIndex: 6 },
  { id: 'E4', level: 4, cost: 15000, deltaMaxSpeed: +16, unlockAtEventIndex: 12 },
  { id: 'E5', level: 5, cost: 23000, deltaMaxSpeed: +18, unlockAtEventIndex: 20 },
  { id: 'E6', level: 6, cost: 32000, deltaMaxSpeed: +20, unlockAtEventIndex: 28 }
];
// Replicar estrutura para gearbox, tires, armor e boost.
```

## 7. Sistema de Senhas (opcional)

- Gerar senha a partir de hash do índice do evento, upgrades e créditos, com checksum curto — emulando a abordagem do original.  
  _Referências_: Wikipedia

## 8. Essenciais para “Soar” como TG3000

- Corrida arcade com 20 carros, combustível e integridade geridos por faixas especiais.  
  _Referências_: Wikipedia
- Armas de mobilidade (jump/warp/boost) que afetam apenas o jogador e exigem leitura de tráfego.  
  _Referências_: Wikipedia
- Bifurcações com tempos distintos e economia de upgrades entre provas.  
  _Referências_: Wikipedia
- Versus 4 jogadores via Multitap com seleção de _builds_.  
  _Referências_: Gaming Alexandria
- Progresso extenso por sistemas planetários (~12) totalizando ~48 pistas.  
  _Referências_: GameFAQs
- Sistema de senhas para retomar campanha e suportar _cheats_.  
  _Referências_: Wikipedia
- Mapeamento livre de controles e alternância KM/H ↔ MPH.  
  _Referências_: Wikipedia
