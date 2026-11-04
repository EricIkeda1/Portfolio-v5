# Meu Portfólio

Este é o meu portfólio pessoal, criado para reunir um pouco sobre mim, minhas experiências, habilidades e os projetos que venho desenvolvendo ao longo da minha trajetória como **desenvolvedor de software**.

A ideia foi criar algo **simples, moderno e com a minha identidade**, onde eu pudesse apresentar meu trabalho de forma direta e continuar evoluindo o projeto conforme aprendo coisas novas.

**Acesse o portfólio:**  
https://www.ericyikeda.com.br/

A página inicial abre diretamente o portfólio. O endereço `/portfolio` também permanece disponível e exibe a mesma página, incluindo links diretos às seções.

## Sobre o projeto

No portfólio você encontra:

- **Sobre mim** e minha trajetória
- Minhas principais **habilidades e tecnologias**
- **Experiências** e formação
- **Projetos em destaque**
- Formas de entrar em **contato comigo**
- **Sistema de login** para acesso administrativo
- **Página de administração** para gerenciar e atualizar conteúdos do portfólio
- **Banco de dados na Neon** para armazenar e gerenciar as informações do site

A área administrativa foi criada para facilitar a manutenção do site, permitindo alterar informações e adicionar novos conteúdos sem precisar modificar diretamente o código da página.

Os dados do portfólio são armazenados em um banco **PostgreSQL hospedado na Neon**, utilizado tanto no sistema de login quanto no gerenciamento dos conteúdos da área administrativa.

O projeto foi pensado para funcionar bem tanto no **desktop quanto no mobile**, mantendo uma navegação simples, responsiva e organizada.

## Tecnologias

O projeto foi desenvolvido utilizando:

- **React**
- **TypeScript**
- **Vite**
- **PostgreSQL**
- **Neon**
- **Vercel**

## Rodando o projeto

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd Portfolio-v5
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

## Deploy

O projeto está publicado na **Vercel**:

https://www.ericyikeda.com.br/

## Autor

**EricIkeda1**

### Mensagens de contato

A seção Contato apresenta apenas o formulário de nome, e-mail e mensagem, sem redirecionar o visitante e sem cartões de WhatsApp ou outros contatos.

- `POST /api/contact` grava no Neon, valida tamanho e formato e limita a cinco envios por origem a cada 15 minutos, com controle atômico no banco e campo antispam.
- `/admin` → **Mensagens** lista os contatos com paginação e permite marcar como lidos/não lidos e abrir uma resposta por e-mail. As notificações push podem ser ativadas em cada aparelho pelo painel. Não há notificação automática no WhatsApp ou por e-mail.
- `GET/PUT /api/admin-messages` exigem a sessão administrativa existente. As mensagens nunca são incluídas na API pública de conteúdo.
- `api/_lib/contact.ts` cria de forma idempotente as duas tabelas adicionais no primeiro acesso, sem alterar os projetos e contatos já cadastrados.
- Para testar o fluxo completo em uma **branch isolada** do Neon: `CONTACT_TEST_DATABASE=1 node --env-file=/caminho/ambiente-de-teste.env scripts/test-contact.mjs`. O arquivo de ambiente deve conter `DATABASE_URL` da branch de teste e uma `SESSION_SECRET` exclusiva de testes. Esse teste cria mensagens fictícias apenas nessa branch.

### Notificações no celular

Em `/admin` → **Mensagens**, toque em **Ativar notificações neste celular** e permita os avisos do navegador. Use **Testar notificação** para confirmar o recebimento. O botão **Desativar neste aparelho** interrompe os avisos apenas nesse dispositivo.

No Android, use um navegador compatível, como Chrome. No iPhone (iOS 16.4+), adicione o painel à Tela de Início pelo Safari e abra o ícone criado antes de ativar. A permissão deve ser concedida no próprio celular. A entrega depende da conexão e das configurações de notificação/bateria do sistema.

O servidor envia um aviso genérico, sem nome, e-mail ou conteúdo do visitante, e o toque abre `/admin#mensagens`. As chaves VAPID são geradas uma única vez e armazenadas no Neon; apenas a chave pública chega ao navegador. As inscrições são restritas ao administrador, persistem entre sessões e podem ser desativadas. O worker não faz cache de páginas privadas. Uma falha no push preserva a mensagem recebida na caixa de entrada.

A nova integração reutiliza `/api/admin-messages` para configuração, inscrição, status, teste e desativação. `api/_lib/push.ts` cria as tabelas adicionais de forma idempotente. Não é necessário configurar uma conta de envio de e-mail, Firebase ou WhatsApp. Para validar em uma branch isolada: `CONTACT_TEST_DATABASE=1 node --env-file=/caminho/ambiente-de-teste.env scripts/test-push.mjs`. O teste valida a assinatura/criptografia real, com o transporte de push substituído para não enviar avisos externos.

### Criptografia de nomes e e-mails dos contatos

A implementação usa AES-256-GCM no servidor, com um IV aleatório de 12 bytes por campo e autenticação vinculada ao campo e ao identificador único do contato. Os nomes e e-mails são descriptografados apenas na API administrativa, após validar a sessão. A chave e as funções de criptografia não são incluídas no JavaScript do navegador. O corpo da mensagem não foi incluído nessa alteração e continua armazenado como texto.

**Ativação pendente de chave na Vercel:** configure `CONTACT_ENCRYPTION_KEY` como segredo exclusivo de Production, com 32 bytes gerados aleatoriamente e representados por 64 caracteres hexadecimais. Não utilize `VITE_`, não reutilize `SESSION_SECRET` e não salve a chave no Git ou no Neon. Preview/Development devem ter chaves e bancos próprios. A versão nova rejeita novos envios caso a chave esteja ausente; configure-a antes de promover esta alteração para produção.

Guarde a chave em um gerenciador de segredos com acesso restrito e backup. A perda ou substituição da chave impede a leitura dos contatos já criptografados. Para uma futura rotação, mantenha acesso à chave antiga e faça uma migração de descriptografia/recriptografia controlada; não apenas troque a variável.

Depois da implantação com a chave correta, execute uma vez, em um ambiente seguro com a mesma `DATABASE_URL` e chave de Production:

```sh
CONTACT_ENCRYPTION_MIGRATION=1 node --env-file=/caminho/seguro/production.env scripts/encrypt-existing-contacts.mjs
```

O script migra os registros antigos em lotes transacionais, verifica a descriptografia antes de substituir os campos legados por marcadores e pode ser retomado. Ao concluir, adiciona uma restrição no banco que impede novas gravações de nomes/e-mails em texto puro, inclusive por versões antigas da aplicação. Um rollback da aplicação deve preservar o suporte à criptografia e a chave. Não imprime dados pessoais nem chaves. O painel aceita registros legados durante essa janela de migração. Execute novamente para confirmar zero registros pendentes e verifique o painel autenticado. Os dados novos já entram criptografados. Backups e histórico anteriores à migração podem continuar contendo as versões antigas até sua retenção expirar.

Verificações: `node scripts/test-contact-encryption.mjs` testa o formato, a integridade, IVs distintos, Unicode e falha com chave ausente/incorreta. O teste de contato existente também verifica a gravação criptografada, a leitura administrativa e a migração idempotente; use somente uma branch Neon isolada com sua chave de testes em `CONTACT_ENCRYPTION_KEY`.
