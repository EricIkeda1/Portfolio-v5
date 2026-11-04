# Eric Y. Ikeda · Portfólio Web

Projeto completo em React 19 + TypeScript + Vite, com API Node.js e PostgreSQL no Neon. Redesign baseado nos protótipos desktop e mobile: superfícies em cinza, tipografia limpa, carrossel de projetos, navegação flutuante e menu sobre a página. A vitrine é exclusivamente de desenvolvimento web.

## Começar

Requisitos: Node.js 22.13 ou superior e npm. O ZIP contém o código-fonte completo; não inclui `node_modules`, credenciais nem a pasta Git.

```bash
npm ci
```

Copie `.env.example` para `.env.local` e preencha **no seu computador**:

```dotenv
DATABASE_URL=sua-conexao-PostgreSQL-do-Neon
SESSION_SECRET=sua-chave-aleatoria-de-pelo-menos-32-caracteres
```

No Windows, copie pelo Explorador de Arquivos, ou use `Copy-Item .env.example .env.local` no PowerShell. Não coloque aspas extras no valor da conexão. Nunca publique `.env.local` nem use `VITE_DATABASE_URL`.

```bash
npm run dev
```

Abra o endereço impresso no terminal. O próprio Vite inicia também as funções `/api`, incluindo as rotas administrativas; não é necessário outro servidor local.

**Se não houver banco configurado**, as páginas mostram conteúdo de apresentação e um aviso. Isso não significa que o Neon esteja conectado. A resposta de `/api/health` deve ser `{"ok":true,"database":"connected"}` e `/api/content` deve retornar os seus registros.

## Atualizar o repositório existente

1. Faça um backup da sua cópia e mantenha as variáveis de ambiente atuais na Vercel.
2. Extraia este ZIP e copie o conteúdo de `Portfolio-v5/` para a raiz do repositório `EricIkeda1/Portfolio-v5`, onde está o `package.json`. Substitua os arquivos quando solicitado. Não apague seu `.git` ou seus arquivos `.env` locais.
3. Execute `npm ci` e `npm run check`.
4. Confira o site com `npm run dev`; faça seu commit e push pelo fluxo que você já utiliza. Este pacote não fez push nem publicou alterações no seu domínio.

Na Vercel, mantenha `DATABASE_URL` apontando para o **mesmo banco** e reutilize sua `SESSION_SECRET`. Use framework Vite, instalação `npm ci`, build `npm run build`, saída `dist`. As funções em `api/` são executadas pela Vercel. **Não envie somente a pasta `dist` para hospedagem estática**, pois ela não executa o backend do Neon.

A configuração `vercel.json` já inclui as páginas e os links diretos dos projetos. O GitHub Actions executa TypeScript, testes e build nos pushes e PRs. Com a integração GitHub/Vercel já ativa, o deploy continua pelo fluxo da Vercel.

## Páginas

| Caminho | Conteúdo |
| --- | --- |
| `/` | Apresentação e projetos em destaque |
| `/portfolio` | Carrossel, busca, filtros e lista de projetos |
| `/portfolio/<nome>-<id>` | Detalhes do registro escolhido no Neon |
| `/sobre` | Texto de apresentação, foto, tecnologias e formação |
| `/contato` | Canais de contato e formulário para preparar e-mail |
| `/admin` | Login e gerenciamento de conteúdo e projetos |

O menu flutuante abre sobre o conteúdo desfocado. Usa um diálogo nativo com foco contido, fechamento por Escape e devolução do foco ao botão. No celular há botões maiores e componentes arredondados. O carrossel avança a cada cinco segundos, aceita gesto de arrastar e teclado, tem pausa e indicadores, sem setas. Respeita a preferência por movimento reduzido.

## Seus dados do Neon

A interface carrega `/api/content`, e a função consulta `portfolio_settings` e `portfolio_projects` com `@neondatabase/serverless`. Os dados atualizados substituem integralmente a lista de apresentação. Há atualização a cada 30 segundos e atualização entre abas após salvar no painel.

São utilizados os textos de apresentação, imagem de perfil, contatos, currículo, ordem, status de publicação, descrições, tecnologias, destaques e imagens dos projetos. Os contatos são lidos do banco. A formação e os grupos de tecnologias ficam em `src/web/Pages.tsx` (não existiam campos equivalentes no banco original).

A atualização cria somente dois campos adicionais se ainda não existirem:

- `demo_url`: endereço da demonstração, separado do GitHub.
- `category`: `web`, `mobile`, `other` ou `auto`.

A migração aditiva `database/002-web-portfolio.sql` também está incluída. O backend reconhece o esquema atualizado e só faz a migração na primeira execução necessária. Não apaga nem republica projetos existentes. Teste mudanças futuras em uma branch do Neon antes de usar produção.

No seu banco atual, WebShop e Galeria tinham o endereço de demonstração no campo `github`. A interface reconhece esses registros e separa os botões com os repositórios verificados. Os projetos mobile e artigos permanecem no banco e no painel, mas são filtrados na vitrine pública. Em **Categoria pública**, selecione “Desenvolvimento web” para publicar um projeto web sem depender da classificação automática; selecione “Outro” para ocultá-lo da vitrine web.

**Delivery-Restaurante ainda não está cadastrado no banco consultado.** Por isso só aparece na versão de apresentação. Para publicá-lo com os dados reais, adicione-o em `/admin` (categoria Web) com o repositório `https://github.com/EricIkeda1/Delivery-Restaurante`, demonstração `https://deliveryeyi.vercel.app/` e imagem `/projects/delivery-hero.jpg`.

## Imagens e marca

Sua logo original está em `public/brand/eric-y-ikeda.png`. A logo não é redesenhada: seu arquivo é usado no topo e no rodapé. O rodapé contém apenas a marca e **“Desenvolvido por Eric Y. Ikeda”**, sem acesso rápido.

As capas presentes no pacote vieram dos repositórios públicos. WebShop usa sua marca e Delivery usa uma foto do projeto. Não são apresentadas como capturas de interface. Projetos sem imagem usam uma capa tipográfica com nome e tipo; imagens inválidas também têm esse tratamento. Para utilizar uma captura real, atualize `image_url` no painel com uma URL pública. Os arquivos originais não são substituídos por telas geradas.

## Administração

Seu administrador existente continua no Neon. O login usa senha com scrypt, sessão assinada, cookie HttpOnly/SameSite e bloqueio por tentativas. As escritas verificam sessão e origem. A conexão e a chave de sessão ficam somente no servidor.

Para **um banco novo sem administrador**, configure `ADMIN_EMAIL` e um hash scrypt gerado com `npm run admin:hash` após definir `ADMIN_NEW_PASSWORD` temporariamente no terminal. O script exige 12 a 128 caracteres. Na Vercel, cole o hash literal em `ADMIN_PASSWORD_HASH`. Em `.env.local` lido pelo Vite, escape cada `$` do hash como `\$`, para evitar expansão de variáveis. Remova `ADMIN_NEW_PASSWORD` do terminal ao concluir. Deixe o bootstrap vazio se já tem acesso; ele não redefine contas existentes.

## Contato

O formulário **prepara uma mensagem no aplicativo de e-mail do visitante**; o envio é concluído pelo próprio visitante. Não simula um envio no servidor, não armazena mensagens e não precisa de uma chave de serviço de e-mail. O botão WhatsApp usa o número configurado no Neon.

## Verificações

```bash
npm run typecheck
npm test
npm run build
# Ou todos juntos:
npm run check
# Leitura real do banco e teste da API (exige .env.local):
npm run test:integration
```

Os testes de integração são de leitura, além da migração aditiva caso o esquema ainda precise dela. Use uma branch de teste se não quiser aplicar a migração no banco configurado. O build não precisa acessar o banco: faz pré-renderização das páginas principais, e a API atualiza o conteúdo no navegador. Os detalhes têm URLs próprias e carregam o registro atual por ID.

## Organização

- `src/web/`: identidade visual, navegação, páginas, carrossel e classificação dos projetos.
- `src/context/PortfolioContentContext.tsx`: carregamento e atualização do conteúdo.
- `src/lib/portfolio.ts`: contratos e conteúdo de apresentação.
- `src/admin/AdminPage.tsx`: painel administrativo existente, com campos de demonstração e categoria.
- `api/`: funções de leitura e administração; `api/_lib/db.ts` mantém a conexão do servidor.
- `database/`: esquema e migração aditiva.
- `tests/`: testes de comportamento e integração.
- `scripts/prerender.mjs`: HTML inicial e metadados para as páginas públicas.

Nenhuma credencial de Neon ou senha está incluída no ZIP.

## Novo: prévias por IA e navegação grafite

A navegação e o menu flutuante agora têm fundo grafite independente do plano de fundo, com texto claro e item ativo destacado. O painel de projetos recebeu um assistente para buscar capturas do GitHub e gerar imagens de interface a partir dos arquivos do repositório. A geração precisa de `AI_GATEWAY_API_KEY` no servidor e usa o saldo do serviço configurado. Veja `IA-PREVIAS.md` para ativação, revisão das imagens e limites. Sua capa só muda após escolher a imagem e salvar o projeto.

### Correção de deploy 2.1.1

O pacote agora possui 12 funções, compatíveis com o limite Hobby. Ao atualizar, **exclua o antigo `api/project-preview.ts`** e use o `vercel.json` atualizado. Veja `CORRECAO-DEPLOY.md`.
