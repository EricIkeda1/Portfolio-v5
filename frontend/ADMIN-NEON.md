# Painel administrativo + Neon

O projeto possui uma área administrativa em `/admin/login` e `/admin`.

## O que pode ser alterado no painel

- Foto do perfil por link compartilhado do Google Drive
- Texto da seção **Quem sou eu**
- Formação: curso, instituição e ano de conclusão
- WhatsApp
- E-mail
- GitHub
- Projetos em destaque: criar, editar, ocultar e excluir

Todos esses dados são persistidos no PostgreSQL do Neon pelas rotas `/api/*`. A variável `DATABASE_URL` fica somente no backend e nunca é enviada ao navegador.

## Banco já existente

Execute `database/migration-admin-profile.sql` no SQL Editor do Neon.

## Banco novo

Execute `database/neon.sql` no SQL Editor do Neon.

## Variáveis no Vercel

Configure:

- `DATABASE_URL`: string de conexão do Neon
- `SESSION_SECRET`: texto aleatório com pelo menos 32 caracteres

## Criar administrador

No SQL Editor do Neon:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admins (email, password_hash)
VALUES ('seu-email@exemplo.com', crypt('SUA_SENHA_FORTE', gen_salt('bf', 12)))
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;
```

## Desenvolvimento local

Como o projeto usa funções `/api` da Vercel, execute com:

```bash
npx vercel dev
```

Apenas `npm run dev` inicia o Vite, mas não as funções da pasta `api`.
