# Portfólio v5 · EricIkeda1

Meu portfólio e minha página de links pessoais, reunidos em um projeto com React, TypeScript, APIs em Node.js e PostgreSQL na Neon. Aqui apresento meus projetos e minha trajetória, mantenho minhas redes sociais e gerencio os conteúdos e mensagens pelo painel administrativo.

| Acesso | Endereço |
| --- | --- |
| Portfólio | [www.ericyikeda.com.br](https://www.ericyikeda.com.br/) |
| Links pessoais | [links.ericyikeda.com.br](https://links.ericyikeda.com.br/) |
| Administração | [Painel administrativo](https://www.ericyikeda.com.br/admin) |

## Funcionalidades

### Portfólio

- Apresentação pessoal, habilidades, trajetória e histórico das versões do site.
- Projetos carregados do Neon, com seleção para visualizar descrição, tecnologias, destaques, imagem quando cadastrada e link do repositório.
- Estatísticas públicas do GitHub, como repositórios e linguagens utilizadas.
- Perfil, foto, projetos e informações de contato editáveis pelo admin.
- Formulário de contato com nome, e-mail e mensagem, enviado dentro do site.
- Layout responsivo para desktop e celular, com animações e suporte a movimento reduzido.
- A página inicial e `/portfolio` apresentam o mesmo portfólio.

### Links pessoais

- Página compacta com foto centralizada, nome e ícones para Instagram, LinkedIn, Spotify e Strava.
- Foto obtida da configuração do perfil no Neon por uma API do servidor. Para o avatar, o proxy prioriza uma miniatura de 320 px do Google Drive e mantém cache das respostas bem-sucedidas.
- **Pixel:** cachorro virtual com animações de carinho, rabinho, corações e descanso.
- **Sua vibe hoje:** escolha entre “De boa”, “No foco” e “Na correria” para receber uma reação do Pixel. A escolha é mantida apenas na memória da página; não é enviada ao banco.
- **Recadinhos privados:** o visitante escolhe entre enviar anonimamente ou informar o nome, sem precisar fornecer e-mail.
- Compartilhamento nativo quando disponível, com alternativa para copiar o link.
- QR Code gerado no navegador, com opção de baixar a imagem.
- Limpeza automática de `utm_*` e `fbclid` da barra de endereço, preservando outros parâmetros, fragmentos e o estado do histórico, sem recarregar a página.
- Capa, título e descrição próprios para a prévia de compartilhamento. O middleware entrega o HTML pessoal no subdomínio antes de carregar o JavaScript.

### Administração

O painel possui as abas **Visão geral**, **Quem sou eu**, **Projetos**, **Contato**, **Recados pessoais**, **Contatos do portfólio** e **Configurações**.

- Cadastro, edição, exclusão, ordenação e controle de publicação dos projetos.
- Edição do perfil, imagem e informações de contato.
- Atualização do e-mail e da senha do administrador mediante confirmação da senha atual.
- Caixas separadas para contatos profissionais e recados dos links, com paginação e contagem própria de mensagens não lidas.
- Marcar mensagens como lidas ou não lidas e responder por e-mail quando o remetente informou um endereço.
- **Excluir mensagem**, com confirmação antes da exclusão permanente, nas duas caixas.
- Ativar, testar e desativar notificações push por aparelho.

### Mensagens, privacidade e notificações

Os formulários compartilham a validação no servidor, o campo antispam e o limite de cinco envios aceitos por origem a cada 15 minutos, aplicado de forma atômica no banco.

Nome, e-mail e texto dos envios aceitos são armazenados em um payload com **AES-256-GCM**. As colunas de texto da tabela recebem marcadores de proteção; o servidor descriptografa o payload para exibição no painel autenticado. No modo anônimo, o nome informado pelo visitante não é enviado nem salvo. As mensagens não fazem parte da API pública de conteúdo.

As notificações usam Web Push e um service worker, com avisos genéricos que não exibem nome, e-mail ou texto do remetente. Ao tocar, o administrador abre a caixa correspondente: `/admin#mensagens` ou `/admin#recados`. Falhas de push não desfazem uma mensagem já recebida.

Para receber no celular, ative os avisos pelo painel no próprio aparelho. A entrega depende da permissão do navegador, conexão e configurações do sistema. O serviço não envia mensagens pelo WhatsApp nem por e-mail.

### Moderação com IA local

Antes de salvar um novo envio, o servidor analisa o texto e, quando informado, o nome com um **classificador de aprendizado de máquina local**, complementado por regras para ameaças explícitas e algumas formas de disfarce.

- Modelo de regressão logística com TF-IDF e n-gramas de palavras e caracteres, treinado com o ToLD-Br e exemplos sintéticos de ameaças e frases legítimas.
- Execução no servidor em Node.js, sem chave de IA, chamadas a fornecedores externos, GPU ou treinamento em produção.
- A mesma proteção para contatos profissionais, recados anônimos e recados com nome.
- Conteúdo detectado retorna HTTP `422 CONTENT_BLOCKED`, antes da gravação e do push. O código da aplicação não registra o texto bloqueado em logs ou no banco.
- Se o modelo estiver ausente ou inválido, o envio retorna `503` e não é aceito sem análise.
- Mensagens de visitantes não são usadas para treinar o modelo. Mensagens antigas não são apagadas retroativamente.

**Limitações:** é um modelo leve, com compreensão limitada de contexto e baixa recuperação de toxicidade genérica. Pode deixar passar ameaças indiretas ou bloquear frases legítimas; a revisão e a exclusão manual continuam necessárias. O teste do modelo isolado no corpus de origem apresentou precisão de **78,95%** e recall de **26,18%**. Esses números não medem a eficácia das regras adicionais nem representam a detecção de ameaças reais do site.

A arquitetura, a licença do modelo, a origem dos dados, o treinamento e a avaliação completa estão em [MODERATION.md](MODERATION.md).

### Integração opcional com Spotify

O projeto inclui um cartão compacto para mostrar a música atual ou a última ouvida, com capa, título, artista e link para o Spotify. Ele depende da autorização da conta e das variáveis de ambiente do servidor; não toca áudio automaticamente nem oferece controles de reprodução fictícios.

Sem configuração, autorização válida ou música disponível, o cartão não é exibido na página de links e o ícone do perfil continua disponível. Consulte [docs/spotify.md](docs/spotify.md) para configurar.

### Last Circle · minigame do portfólio

Em `/arena`, há um battle royale original em Canvas 2D, solo contra 15 bots, com armas, equipamentos, cura e zona que encolhe.

- **Desktop:** WASD/setas para mover, mouse para mirar e atirar, R para recarregar, F para usar kit e 1/2/3 para trocar armas coletadas. Esc pausa; Tab pausa e permite navegar pela interface.
- **Celular:** controles virtuais de movimento, mira e ações.
- Pausa ao perder foco, carregamento sob demanda e recorde local no navegador, sem conta ou multiplayer.
- Tela cheia e captura de teclado são solicitadas quando disponíveis; o navegador e o sistema operacional controlam quais atalhos podem ser capturados.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | React 19, TypeScript, Vite, Tailwind CSS e CSS próprio |
| Backend | Node.js, funções serverless da Vercel e Routing Middleware |
| Banco | PostgreSQL na Neon, com `@neondatabase/serverless` |
| Proteção de dados | `node:crypto`, AES-256-GCM, scrypt e sessões administrativas |
| Notificações e compartilhamento | Web Push, service worker, Web Share API, Clipboard API e `qrcode` |
| Moderação | Classificador local versionado em JSON; treinamento offline com Python, NumPy, SciPy e scikit-learn |
| Extras | Canvas 2D, API pública do GitHub e integração opcional com Spotify |

## Executando localmente

Use Node.js compatível com o Vite instalado: **20.19+ ou 22.12+**. Os testes que importam TypeScript com `--experimental-strip-types` podem ser executados com Node.js 22.12+.

```bash
git clone https://github.com/EricIkeda1/Portfolio-v5.git
cd Portfolio-v5
npm ci
```

Copie `.env.example` para `.env.local` e configure os valores do seu ambiente:

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão do PostgreSQL na Neon |
| `SESSION_SECRET` | Segredo da sessão, com pelo menos 32 caracteres |
| `CONTACT_ENCRYPTION_KEY` | Chave permanente de 32 bytes em hexadecimal, com 64 caracteres |
| `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` | Opcionais, para criar a primeira conta em um banco novo |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` e `SPOTIFY_REFRESH_TOKEN` | Opcionais, para autorizar o cartão de música |

Mantenha os segredos somente no servidor e nos arquivos de ambiente ignorados pelo Git. Não use o prefixo `VITE_` nessas variáveis. Guarde uma cópia segura da chave de criptografia: perdê-la ou substituí-la impede a leitura dos payloads já cifrados.

Para iniciar:

```bash
npm run dev
```

O Vite possui um middleware local que executa as principais rotas `/api`, incluindo conteúdo, contato e mensagens administrativas. Para reproduzir o ambiente da Vercel, incluindo rotas que não estão nesse mapa local, use:

```bash
npm run dev:vercel
```

Sem banco e segredos configurados, partes da interface podem usar conteúdo local de fallback, mas autenticação e gravação de mensagens exigem o backend configurado. A moderação utiliza o artefato já versionado; não é necessário instalar Python para executar o site.

### Primeiro acesso administrativo

Em um banco novo, configure `ADMIN_EMAIL` e gere `ADMIN_PASSWORD_HASH` com `npm run admin:hash`, usando a variável temporária `ADMIN_NEW_PASSWORD`. O script exige uma senha de 12 a 128 caracteres e imprime somente o hash.

O bootstrap cria a conta apenas quando a tabela de administradores está vazia; não altera contas existentes. Depois, as credenciais podem ser gerenciadas pelo painel. Veja [README-NEON.md](README-NEON.md) para os detalhes de configuração.

## Build e deploy

```bash
npx tsc -b
npm run build
```

O build gera os arquivos em `dist/`, pré-renderiza as páginas públicas e verifica os hashes dos scripts estáticos na Content Security Policy. A administração é carregada no cliente e utiliza APIs autenticadas.

O deploy está conectado à branch `main` do GitHub na Vercel. Configure as variáveis do servidor no projeto e associe os domínios antes de publicar uma instalação própria. O arquivo `middleware.ts` trata a página inicial do subdomínio de links; `vercel.json` contém os cabeçalhos de segurança e a inclusão do modelo nas funções que usam moderação.

## Verificações

Os comandos abaixo usam fixtures locais ou simulação em memória, sem precisar de um banco de produção:

```bash
node scripts/test-moderation.mjs
node scripts/test-message-delete.mjs
node scripts/test-message-sources.mjs
node scripts/test-personal-links.mjs
npm run test:spotify
node scripts/test-arena.mjs
node scripts/test-arena-keyboard.mjs
```

Após o build, valide também a prévia social e as rotas do middleware:

```bash
node --experimental-strip-types scripts/test-links-preview.mjs
```

Os testes de integração que acessam o Neon, como `test-contact.mjs`, `test-security.mjs`, `test-push.mjs` e `test-personal-links-db.mjs`, devem usar **somente uma branch isolada**, `CONTACT_TEST_DATABASE=1` e segredos exclusivos de teste. Eles criam dados fictícios. Não aponte esses comandos para produção. Instruções adicionais estão em [SECURITY.md](SECURITY.md).

## Organização

```text
src/
  sections/                 Seções do portfólio
  components/links/         Pixel, widget de vibe, QR Code e recadinhos
  admin/                    Painel e caixas de entrada
  game/                     Last Circle
  context/                  Carregamento do conteúdo público
api/
  _lib/moderation/           Inferência e modelo local de IA
  _lib/                     Banco, autenticação, criptografia e push
  *.ts                      APIs públicas e administrativas
public/                     Assets, capa social e worker de notificações
scripts/                    Pré-renderização e verificações
  moderation/               Treinamento, avaliação e licença do modelo
middleware.ts               Roteamento do subdomínio de links
```

## Documentação complementar

- [Configuração do Neon e administrador](README-NEON.md)
- [Proteção dos dados e credenciais](SECURITY.md)
- [Moderação local, avaliação e limitações](MODERATION.md)
- [Autorização e configuração do Spotify](docs/spotify.md)

## Autor

**EricIkeda1** · [GitHub](https://github.com/EricIkeda1) · [LinkedIn](https://www.linkedin.com/in/ericikeda1/)
