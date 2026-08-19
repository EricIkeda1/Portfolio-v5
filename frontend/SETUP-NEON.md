# Configuração do painel administrativo — Neon + Vercel

## 1. Criar as tabelas no Neon

1. Abra o projeto no Neon.
2. Entre em **SQL Editor**.
3. Abra o arquivo `database/neon.sql` deste projeto.
4. Cole todo o conteúdo no SQL Editor e execute.

O script cria:

- `admins`: contas que podem entrar no painel.
- `portfolio_profile`: foto, descrição, WhatsApp, e-mail e GitHub.
- `portfolio_projects`: projetos exibidos em “Projetos em destaque”.

O script **não apaga tabelas existentes**.

## 2. Criar seu primeiro administrador

No final de `database/neon.sql` existe este comando comentado:

```sql
INSERT INTO admins (email, password_hash)
VALUES ('seuemail@exemplo.com', crypt('SUA_SENHA_FORTE_AQUI', gen_salt('bf', 12)))
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

Troque o e-mail e a senha, remova os `--` das linhas correspondentes e execute no SQL Editor.

A senha não é salva em texto puro. O banco armazena somente o hash em `password_hash`.

## 3. Configurar as variáveis na Vercel

Em **Project > Settings > Environment Variables**, crie:

- `DATABASE_URL`: a connection string do seu banco Neon.
- `SESSION_SECRET`: uma chave aleatória longa, com pelo menos 32 caracteres.

Para gerar uma chave no terminal:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Depois faça um novo deploy.

## 4. Desenvolvimento local

Como o projeto agora usa funções em `/api`, não use apenas `npm run dev` para testar login e banco localmente.

Use:

```bash
npm install
npx vercel dev
```

Crie também um `.env.local` baseado em `.env.example`.

## 5. Acessar o painel

Depois do deploy:

```text
https://SEU-DOMINIO/admin/login
```

Após entrar, você poderá:

- trocar a foto de “Quem sou eu” usando um link compartilhado do Google Drive;
- editar toda a descrição;
- alterar WhatsApp, e-mail e GitHub;
- adicionar novos projetos;
- editar, ordenar, ocultar e excluir projetos existentes.

## Google Drive

Na imagem de perfil, use **Compartilhar > Acesso geral > Qualquer pessoa com o link**. Cole no painel o link normal do Drive, por exemplo:

```text
https://drive.google.com/file/d/ID_DO_ARQUIVO/view?usp=sharing
```

O site converte automaticamente esse link para uma URL de imagem que pode ser renderizada pelo navegador.
