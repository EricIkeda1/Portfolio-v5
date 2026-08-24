# Portfolio v5 + Neon

O conteúdo do portfólio agora é carregado do Neon por funções serverless da Vercel.

## Variáveis de ambiente

Crie um arquivo `.env` dentro de `frontend` no desenvolvimento local:

```env
DATABASE_URL=sua_connection_string_do_neon
SESSION_SECRET=uma_chave_longa_e_aleatoria
```

Na Vercel, configure as mesmas variáveis em **Project Settings > Environment Variables**.
`DATABASE_URL` nunca deve usar o prefixo `VITE_`, pois ela é segredo do backend.

## Banco

As tabelas são criadas automaticamente na primeira chamada da API. O arquivo
`database/schema.sql` também contém a estrutura para consulta ou criação manual
pelo SQL Editor do Neon.

O backend inicializa um administrador de demonstração apenas se ele ainda não existir:

- E-mail: `admin@portfolio.dev`
- Senha inicial: `admin123`

A senha é armazenada como hash scrypt, nunca em texto puro no banco. Troque essa
credencial antes de usar o painel como uma área administrativa de produção.

## Desenvolvimento local

O comando `npm run dev` inicia apenas o Vite e não executa as funções `/api`.
Para testar frontend + backend juntos, use:

```bash
npm install
npm run dev:vercel
```

## Fluxo

- `GET /api/content`: conteúdo público do portfólio.
- `POST /api/admin-login`: autenticação e cookie HttpOnly.
- `GET /api/admin-content`: carrega dados completos para o painel.
- `PUT /api/admin-content`: salva perfil e contatos.
- `POST/PUT/DELETE /api/admin-projects`: CRUD dos projetos.
- `/admin`: interface administrativa.

Ao salvar no painel, outra aba do portfólio no mesmo navegador é atualizada por
`BroadcastChannel`. Outros visitantes recebem os dados atualizados no próximo
carregamento ou na atualização automática periódica do conteúdo.
