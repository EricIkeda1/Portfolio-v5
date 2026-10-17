# SEO e publicação

## O que mudou

- A página inicial apresenta os serviços de criação de sites em Ibiporã e Londrina.
- A página inicial e `/portfolio` têm título, descrição, canonical, Open Graph e Twitter próprios.
- `npm run build` gera HTML com conteúdo público já renderizado para essas duas páginas. O React mantém as animações e interações após carregar.
- Dados estruturados descrevem Eric, o site, o perfil profissional e os serviços. Não há avaliações, clientes ou endereço comercial inventados.
- Todas as respostas da FAQ estão no HTML; a abertura e o fechamento continuam interativos.
- O painel e os erros têm `noindex`. O sitemap lista somente as duas páginas públicas.
- Removido o redirecionamento genérico para a página inicial: a Vercel usa `dist/404.html` para retornar um erro 404 real quando a página não existe.

## Publicar

1. Extraia os arquivos na pasta do projeto, com `package.json` na raiz.
2. Mantenha as variáveis de ambiente atuais da Vercel.
3. Use `npm install` e `npm run build`. A saída continua sendo `dist`.
4. Publique também o `vercel.json` e a pasta `scripts`. A pré-renderização faz parte do build e não precisa de navegador ou acesso ao banco.
5. Após o deploy, confira `/`, `/portfolio`, `/admin`, `/sitemap.xml` e uma URL inexistente.
6. No Google Search Console, envie `https://www.ericyikeda.com.br/sitemap.xml` e use a inspeção de URL para solicitar indexação da página inicial e do portfólio.

O painel continua atualizando os conteúdos pela API. O HTML do portfólio gerado no build utiliza os conteúdos padrão de `src/lib/portfolio.ts`; conteúdos editados no painel são carregados pelo React. Mantenha esses valores padrão atualizados se quiser que o conteúdo inicial do HTML acompanhe alterações editoriais, e faça um novo deploy.

## Manutenção

Edite títulos, descrições e dados estruturados em `src/seo.ts`. Se mudar o domínio, atualize também `public/robots.txt`, `public/sitemap.xml` e os links do site. Preserve a confirmação do Search Console já existente em `public/google37a85b8a3a220938.html`.

Referências: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics e https://vercel.com/kb/guide/custom-404-page.

## Atualização de palavras de busca

A página inicial destaca criação de sites em Ibiporã e Londrina, sites profissionais, landing pages, WordPress e modernização de sites. Os termos foram incorporados naturalmente à apresentação, aos serviços, às perguntas frequentes, ao título, à descrição e aos dados estruturados. Não foi adicionada meta keywords.

O título animado e o layout foram mantidos. A confirmação existente do Search Console também foi preservada.

Após publicar esta versão:

1. No Search Console, inspecione `https://www.ericyikeda.com.br/`.
2. Use **Testar URL publicado** e confira se o conteúdo atualizado aparece no HTML testado.
3. Clique em **Solicitar indexação**.
4. Confira se o sitemap já enviado continua com status de sucesso; se ainda não foi enviado, informe `https://www.ericyikeda.com.br/sitemap.xml`.
5. Acompanhe as consultas e impressões no relatório Desempenho ao longo do tempo.

Não é necessário criar uma nova propriedade. A atualização depende de novo rastreamento do Google e não garante posição ou prazo. O Google pode escolher outro título ou trecho conforme a pesquisa.
