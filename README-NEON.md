# Portfolio v5 + Neon

O conteúdo do portfólio é carregado do Neon por funções serverless da Vercel.

## Variáveis de ambiente obrigatórias

No desenvolvimento local, copie `.env.example` para `.env` e configure:

```env
DATABASE_URL=sua_connection_string_do_neon
SESSION_SECRET=uma_chave_aleatoria_com_pelo_menos_32_caracteres
```

Na Vercel, configure as mesmas variáveis em **Project Settings > Environment Variables**.
Nenhuma delas deve usar o prefixo `VITE_`, pois são segredos exclusivos do backend.

Para gerar uma `SESSION_SECRET` segura com Node:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Administrador

Não existe mais e-mail ou senha padrão no código.

Antes do primeiro deploy desta versão, é recomendado gerar uma nova senha e configurar `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` na Vercel. Assim, a conta antiga de demonstração é migrada automaticamente sem deixar a senha antiga ativa.

Gere o hash localmente:

```powershell
$env:ADMIN_NEW_PASSWORD="uma-senha-forte-com-12-ou-mais-caracteres"
npm run admin:hash
```

Copie somente o hash gerado para `ADMIN_PASSWORD_HASH` e configure também `ADMIN_EMAIL` na Vercel. Na primeira execução, o backend cria/atualiza esse administrador e remove a conta de demonstração antiga quando você escolhe outro e-mail. Depois de confirmar que o novo login funciona, essas duas variáveis opcionais podem ser removidas. O texto puro da senha nunca é salvo no projeto.

## Proteções da área administrativa

- senha com `scrypt` e salt aleatório;
- sessão assinada por `SESSION_SECRET` independente da `DATABASE_URL`;
- cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção;
- limite de 5 tentativas por IP em 15 minutos e uma proteção adicional por conta;
- bloqueio temporário persistido no Neon;
- respostas de erro sem detalhes internos do banco;
- validação de origem contra requisições cross-site nas rotas de escrita;
- headers de segurança e `noindex` para `/admin` no `vercel.json`.

## Banco

As tabelas são criadas automaticamente na primeira chamada da API. O arquivo `database/schema.sql` também contém a estrutura para criação manual pelo SQL Editor do Neon.

A tabela `admin_login_attempts` guarda somente identificadores derivados por HMAC para o rate limit; o IP e o e-mail usados na limitação não são armazenados em texto puro nessa tabela.

## Desenvolvimento local

O comando `npm run dev` inicia apenas o Vite e não executa as funções `/api`. Para testar frontend + backend juntos:

```bash
npm install
npm run dev:vercel
```

## Fluxo principal

- `GET /api/content`: conteúdo público do portfólio.
- `POST /api/admin-login`: autenticação, rate limit e cookie HttpOnly.
- `GET /api/admin-session`: verifica a sessão.
- `PUT /api/admin-credentials`: troca o e-mail e/ou senha do administrador.
- `GET /api/admin-content`: carrega dados completos para o painel.
- `PUT /api/admin-content`: salva perfil e contatos.
- `POST/PUT/DELETE /api/admin-projects`: CRUD dos projetos.
- `/admin`: interface administrativa.
