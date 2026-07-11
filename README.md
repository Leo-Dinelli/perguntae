# 🎴 PerguntAê

Jogo de adivinhação em grupo inspirado nos clássicos de tabuleiro: uma carta,
uma resposta secreta e **20 dicas** — quanto menos dicas o time precisar, mais
pontos leva (1ª dica vale 20 pontos, 20ª vale 1).

**Web app estático**: roda em qualquer navegador (celular, tablet, desktop),
sem servidor e sem cadastro.

## Modos de jogo

- **Partida em grupo** — times com placar, 10 temas (Esportes, Comida, Lugares,
  Objetos, Pessoas, Filmes & Séries, Música, Animais, Marcas, Games),
  conhecimentos gerais (todos misturados) ou **roleta** que sorteia o tema a
  cada carta. A dificuldade escolhida define um mix (ex.: Fácil = 70% fáceis,
  20% médias, 10% difíceis). Baralho embaralhado a cada partida, sem carta
  repetida, com opção de **pular carta**.
- **Jogar sozinho** — mesmo baralho, pontuação individual para bater o próprio
  recorde.
- **Modo casal** — 330 perguntas sem certo ou errado, em três profundidades:
  leve (🍿), média (💛) e profunda (🌊). Sem placar e **sem histórico**: nada
  do modo casal é gravado.

## Privacidade

- **Histórico de partidas** (grupo/solo): fica **apenas no localStorage do
  dispositivo/navegador** — cada pessoa vê somente as próprias partidas, mesmo
  com o jogo rodando em vários aparelhos ao mesmo tempo.
- **Métricas de uso**: o site usa Google Analytics 4 para medir visitas e
  partidas (eventos anônimos: tema, dificuldade, rodadas). O script **só
  carrega após o visitante aceitar** o banner de cookies (LGPD) — recusando,
  nenhum dado sai do navegador. Implementação em `src/analytics.ts`.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173/perguntae/
npm test           # engine + validação do banco de cartas
npm run build      # build de produção em dist/
```

## Gerando mais cartas (rumo a 300+ por tema)

As cartas escritas à mão vivem em `src/data/*.ts`. Para escalar o banco, use o
gerador (ferramenta de desenvolvimento — o app continua estático/offline):

```bash
ANTHROPIC_API_KEY=sk-... node scripts/generate-cards.mjs \
  --theme esportes --difficulty medio --count 30
```

O script gera as cartas via API da Anthropic, valida cada uma (20 dicas,
nenhuma dica vaza a resposta, resposta inédita) e grava um pack JSON em
`src/data/packs/`, agregado automaticamente pelo app. Sempre finalize com
`npm test` — os testes do banco são o gate de qualidade de tudo, packs
incluídos.

## Deploy

Publicado no GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`):
todo push na `main` roda lint + testes + build e publica `dist/`.

> O `base` do Vite está fixo em `/perguntae/` — o repositório precisa se
> chamar `perguntae` (ou ajuste `vite.config.ts`).

Para ativar: **Settings → Pages → Source: GitHub Actions** no repositório.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS 4 · Vitest · fontes self-hosted
(Fontsource). A lógica do jogo é pura e testada em `src/game/engine.ts`; o
banco de cartas em `src/data/` é validado por testes (20 dicas por carta, IDs
únicos, nenhuma dica revela a resposta).
