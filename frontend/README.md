# Portfólio V5 — Admin + Neon

Portfólio React/TypeScript com painel administrativo para editar o conteúdo sem alterar o código-fonte.

## O que está salvo no Neon

O banco PostgreSQL do Neon armazena:

- conta do administrador (`admin_users`);
- e-mail do administrador;
- senha do administrador em **hash Scrypt** — a senha original não é salva;
- data do último login;
- texto da seção **Quem sou eu**;
- número do **WhatsApp**;
- **Projetos em destaque**;
- imagem opcional, tecnologias, destaques, link, cor e ordem de cada projeto.

## Login e painel

- `/login` — login do administrador.
- `/admin` — painel administrativo responsivo.
- No próprio painel é possível alterar o e-mail e a senha do administrador.
- O login consulta o usuário diretamente na tabela `admin_users` do Neon.
- A sessão é protegida por JWT com validade de 8 horas.

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar o Neon

Crie um projeto no Neon e copie a connection string PostgreSQL pooled.

O backend cria as tabelas automaticamente no primeiro acesso. O arquivo `database/schema.sql` também contém a estrutura das tabelas.

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```env
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require

ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=uma-senha-forte-com-8-ou-mais-caracteres

JWT_SECRET=uma-chave-aleatoria-com-pelo-menos-32-caracteres
```

### Como o primeiro administrador é criado

`ADMIN_EMAIL` e `ADMIN_PASSWORD` são usados **somente quando a tabela `admin_users` ainda está vazia**.

No primeiro acesso à API:

1. a tabela `admin_users` é criada;
2. a senha de `ADMIN_PASSWORD` é transformada em hash Scrypt;
3. e-mail e hash são inseridos no Neon;
4. a partir daí, `/api/login` consulta o Neon para autenticar.

Depois que você confirmar que o login funciona e que o registro existe no Neon, pode remover `ADMIN_EMAIL` e `ADMIN_PASSWORD` das variáveis da Vercel. Mantenha `DATABASE_URL` e `JWT_SECRET`.

## 4. Rodar localmente

Como as APIs usam Vercel Functions, execute:

```bash
npx vercel dev
```

Acesse:

- Portfólio: `http://localhost:3000/`
- Login: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin`

## 5. Deploy na Vercel

Configure inicialmente estas variáveis em **Settings > Environment Variables**:

- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

Faça o deploy e abra `/login`. No primeiro acesso o administrador será persistido no Neon.

Depois de validar o login, `ADMIN_EMAIL` e `ADMIN_PASSWORD` podem ser removidas e um novo deploy pode ser feito. O usuário continuará existindo no Neon.

## Estrutura principal

```text
api/
  _lib/
    auth.ts
    db.ts
    password.ts
    project.ts
  projects/
    [id].ts
    index.ts
  admin-account.ts
  admin-session.ts
  content.ts
  login.ts
  settings.ts

database/
  schema.sql

src/
  context/
    PortfolioContentContext.tsx
  lib/
    adminApi.ts
    portfolio.ts
  pages/
    AdminPage.tsx
    LoginPage.tsx
```

## Segurança

- Nunca coloque `DATABASE_URL` em código do frontend.
- Nunca use prefixo `VITE_` em segredos.
- A senha do administrador não é armazenada em texto puro.
- Se uma connection string do Neon tiver sido exposta publicamente, gere uma nova senha/connection string antes do deploy.
