# Portfólio V5 — Frontend estático

Portfólio desenvolvido com React, TypeScript e Vite.

Esta versão não depende de Figma Make, APIs, banco de dados, login ou painel administrativo.
O conteúdo exibido no site fica diretamente no código-fonte, principalmente em `src/lib/portfolio.ts`.

## Instalar dependências

```bash
npm install
```

## Rodar localmente

```bash
npm run dev
```

Depois, abra o endereço informado pelo Vite no terminal.

## Gerar build de produção

```bash
npm run build
```

Os arquivos de produção serão gerados em `dist/`.

## Deploy na Vercel

O projeto está configurado como Vite no `vercel.json` e não precisa de variáveis de ambiente.

## Estrutura principal

```text
src/
  components/
  context/
    PortfolioContentContext.tsx
  lib/
    portfolio.ts
  sections/
  App.tsx
  main.tsx

public/
index.html
vite.config.ts
vercel.json
```

## Editar conteúdo

Para alterar o texto "Quem sou eu", WhatsApp ou os projetos em destaque, edite:

```text
src/lib/portfolio.ts
```
