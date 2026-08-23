# Correção do 404 em /api

## Desenvolvimento local

Este projeto usa Vercel Functions na pasta `api/`. O Vite sozinho não executa essas funções.

Dentro da pasta `frontend`, execute:

```bash
npm install
npm run dev
```

O script `npm run dev` agora executa `vercel dev`. Na primeira execução, se necessário, vincule a pasta ao projeto `portfolio-v5` da Vercel.

Para abrir apenas o frontend sem as APIs, use:

```bash
npm run dev:vite
```

## Teste rápido

Com o servidor completo iniciado, abra:

```text
/api/health
```

Resposta esperada quando API + Neon estão funcionando:

```json
{
  "ok": true,
  "api": "online",
  "database": "connected"
}
```

## Vercel / produção

O repositório possui o aplicativo dentro da pasta `frontend`. No projeto `portfolio-v5` da Vercel, configure:

- Settings -> Build and Deployment -> Root Directory
- Root Directory: `frontend`
- Framework Preset: `Vite`

Depois faça um novo Redeploy.

Se o Root Directory ficar na raiz do repositório, a Vercel não encontra `frontend/package.json`, `frontend/vercel.json` nem `frontend/api`, e as rotas `/api/*` retornam 404.


## Desenvolvimento local corrigido

- `npm run dev`: inicia apenas o Vite.
- `npm run dev:vercel`: inicia o ambiente Vercel local e as funções `/api`.

Não configure o Development Command da Vercel como `npm run dev:vercel`, pois isso causaria invocação recursiva. O `vercel.json` usa `npm run dev -- --port $PORT`.
