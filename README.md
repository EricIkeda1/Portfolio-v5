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
- Para testar o fluxo completo em uma **branch isolada** do Neon: `CONTACT_TEST_DATABASE=1 node --env-file=/caminho/ambiente-de-teste.env scripts/test-contact.mjs`. O arquivo de ambiente deve conter `DATABASE_URL` da branch de teste e uma `SESSION_SECRET` e uma `CONTACT_ENCRYPTION_KEY` exclusivas de testes. Esse teste cria mensagens fictícias apenas nessa branch.

### Notificações no celular

Em `/admin` → **Mensagens**, toque em **Ativar notificações neste celular** e permita os avisos do navegador. Use **Testar notificação** para confirmar o recebimento. O botão **Desativar neste aparelho** interrompe os avisos apenas nesse dispositivo.

No Android, use um navegador compatível, como Chrome. No iPhone (iOS 16.4+), adicione o painel à Tela de Início pelo Safari e abra o ícone criado antes de ativar. A permissão deve ser concedida no próprio celular. A entrega depende da conexão e das configurações de notificação/bateria do sistema.

O servidor envia um aviso genérico, sem nome, e-mail ou conteúdo do visitante, e o toque abre `/admin#mensagens`. As chaves VAPID são geradas uma única vez e armazenadas no Neon; apenas a chave pública chega ao navegador. As inscrições são restritas ao administrador, persistem entre sessões e podem ser desativadas. O worker não faz cache de páginas privadas. Uma falha no push preserva a mensagem recebida na caixa de entrada.

A nova integração reutiliza `/api/admin-messages` para configuração, inscrição, status, teste e desativação. `api/_lib/push.ts` cria as tabelas adicionais de forma idempotente. Não é necessário configurar uma conta de envio de e-mail, Firebase ou WhatsApp. Para validar em uma branch isolada: `CONTACT_TEST_DATABASE=1 node --env-file=/caminho/ambiente-de-teste.env scripts/test-push.mjs`. O teste valida a assinatura/criptografia real, com o transporte de push substituído para não enviar avisos externos.

### Last Circle — minigame

Abra `/arena` ou use “Jogar minigame” no rodapé. É um battle royale original em Canvas 2D, solo contra 15 bots, com três armas, equipamentos coletáveis, cura, colete e uma zona que encolhe. Os bots também combatem entre si.

- Desktop: WASD/setas para mover, mouse para mirar e clique segurado para atirar; R recarrega, F usa kit, 1/2/3 troca entre armas coletadas e Esc pausa.
- Celular: controle esquerdo move; controle direito mira e atira. Botões de arma, recarga e cura ficam na tela.
- A partida pausa ao trocar de aba ou sair da janela. O recorde é um número salvo no localStorage deste navegador; não há conta, multiplayer, envio de dados de jogo ou integração com Neon.
- O jogo carrega sob demanda em um chunk separado. A simulação e a renderização usam Canvas; o HUD atualiza até dez vezes por segundo, o DPR é limitado e partículas respeitam movimento reduzido.
- Validação da simulação: `node scripts/test-arena.mjs`.

### Foco e atalhos do minigame

Ao iniciar ou continuar pelo botão, o jogo solicita tela cheia e, quando disponível, Keyboard Lock para as teclas usadas na arena e atalhos comuns. Durante a partida com o canvas focado, os eventos são capturados antes da verificação de Ctrl/Alt/Meta para evitar ações padrão do navegador, como abrir um arquivo ou recarregar a página. As teclas físicas são usadas para movimentação.

Esc pausa; Tab pausa e preserva a navegação por teclado; F11 mantém a saída nativa. Ao pausar, perder o foco, sair da tela cheia ou desmontar a página, a captura é liberada. A partida funciona também quando o navegador não oferece ou não autoriza a captura. Atalhos reservados pelo Windows, como algumas combinações com Win, não podem ser bloqueados com garantia por uma página web. Não há alteração de configurações do sistema operacional.

Regressão de teclado: `node scripts/test-arena-keyboard.mjs`.
