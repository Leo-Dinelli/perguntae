# 🎴 20 Dicas

Jogo de adivinhação em grupo inspirado nos clássicos de tabuleiro: uma carta,
uma resposta secreta e **20 dicas** — quanto menos dicas o time precisar, mais
pontos leva (1ª dica vale 20 pontos, 20ª vale 1).

**Web app estático**: roda em qualquer navegador (celular, tablet, desktop),
sem servidor e sem cadastro.

## Modos de jogo

- **Partida em grupo** — times com placar, 5 temas (Esportes, Comida, Lugares,
  Objetos, Pessoas), conhecimentos gerais (todos misturados) ou **roleta** que
  sorteia o tema a cada carta. Três dificuldades. Sem carta repetida na partida.
- **Modo casal** — perguntas sem certo ou errado para fortalecer a conexão, em
  três profundidades: leve (🍿), média (💛) e profunda (🌊).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173/vinte-dicas/
npm test           # engine + validação do banco de cartas
npm run build      # build de produção em dist/
```

## Deploy

Publicado no GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`):
todo push na `main` roda lint + testes + build e publica `dist/`.

> O `base` do Vite está fixo em `/vinte-dicas/` — o repositório precisa se
> chamar `vinte-dicas` (ou ajuste `vite.config.ts`).

Para ativar: **Settings → Pages → Source: GitHub Actions** no repositório.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS 4 · Vitest · fontes self-hosted
(Fontsource). A lógica do jogo é pura e testada em `src/game/engine.ts`; o
banco de cartas em `src/data/` é validado por testes (20 dicas por carta, IDs
únicos, nenhuma dica revela a resposta).
