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

## Interface e desempenho

- Desktop escuro com tipografia do sistema, superfícies discretas e detalhes em violeta, seguindo a referência visual.
- Mobile claro em lavanda, com botões amplos, navegação flutuante em quatro destinos e menu modal inspirado no Material Design 3 Expressive.
- Projetos publicados carregados de `/api/content`, com filtros, carrossel por toque e teclado, tecnologias e links cadastrados.
- O campo de link existente aceita demonstrações, repositórios e publicações. O rótulo acompanha o destino.
- Imagens cadastradas em `image_url` são carregadas sob demanda e têm prioridade sobre as capturas locais reais do WebShop e da galeria. As prévias são apresentadas em molduras CSS de notebook e celular. Imagens do Drive recebem tamanhos responsivos; outras URLs mantêm o arquivo de origem. Na ausência de imagem, o projeto usa uma capa tipográfica.
- Painel administrativo e seu CSS carregados separadamente, sem downloads de fontes externas ou efeitos de cursor na página pública.
- Pedidos simultâneos de conteúdo são deduplicados. A atualização ocorre ao retornar à aba após dois minutos ou após uma alteração anunciada pelo painel, em vez de consultas a cada 30 segundos.
- Animações pontuais, com suporte a `prefers-reduced-motion`. O carrossel não avança sozinho.
- Consultas públicas de configurações e projetos executadas em paralelo. A inicialização do esquema ocorre somente se a estrutura estiver ausente, evitando DDL a cada inicialização de função pública.
- Credenciais do Neon permanecem nas funções do servidor; não use variáveis `VITE_*` para segredos.

Validação local: `npx tsc -b` e `npm run build`.

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
