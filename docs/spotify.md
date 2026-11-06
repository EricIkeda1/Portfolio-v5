# Spotify na página de links

O card de Spotify vira um mini player quando a conta está autorizada e há uma música disponível. Mostra capa, título, artista e “Ouvindo agora” ou “Última música ouvida”. O botão abre a música no Spotify; o site não controla sua conta, não toca áudio automaticamente e não inclui controles de reprodução fictícios.

## Ativar uma vez

1. Entre em https://developer.spotify.com/dashboard com sua conta Spotify. Apps em Development Mode exigem Spotify Premium do proprietário.
2. Crie ou use um aplicativo pessoal com Web API e cadastre exatamente este Redirect URI: `http://127.0.0.1:43821/callback`.
3. No seu computador, na pasta do projeto, coloque `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET` em `.env.local`. Esses valores vêm das configurações do aplicativo. Nunca use o prefixo `VITE_`.
4. Execute `npm run spotify:connect`. Abra o endereço exibido no mesmo computador e autorize a leitura da música atual e do histórico recente. Não é necessário autorizar controle da reprodução, biblioteca ou playlists.
5. O comando grava as três variáveis em `.env.spotify.local`, ignorado pelo Git, sem imprimir tokens. Importe essas variáveis em Vercel → projeto → Settings → Environment Variables, ambiente Production. Faça redeploy.
6. Visite `/api/content?view=spotify`. Deve retornar `state: ready` e somente os dados da música. `empty` significa que não há música recente disponível. `not_configured` indica variáveis ausentes; `unavailable` indica autorização inválida, restrição do Spotify ou falha temporária.
7. Confira `/links`. A interface atualiza a cada minuto enquanto a aba está visível. Sem conexão ou em falhas, mantém o botão para seu perfil, sem exibir músicas inventadas.

As credenciais ficam apenas nas variáveis do servidor. O navegador recebe somente título, artista, álbum, capa pública, URL da música, estado de reprodução, duração e posição da última consulta. Nenhum histórico completo ou token é publicado. O endpoint utiliza a função `/api/content` existente e não adiciona uma função ao limite do plano Hobby.

O cache público é de até 30 segundos; a consulta no navegador ocorre a cada 60 segundos. A posição exibida é uma fotografia da última atualização, não um controle remoto. A animação do indicador respeita movimento reduzido.

Para revogar, remova o aplicativo nas permissões da sua conta Spotify e retire as variáveis da Vercel. Se o segredo ou token vazar, revogue e reconecte. Se o aplicativo perder autorização ou Premium, o botão de perfil continua funcionando.

## Verificação

- `npm run test:spotify` cobre música atual, última ouvida, falhas, rate limit, cache e proteção dos tokens na resposta pública.
- `npx tsc -b` verifica os componentes.
- `npm run build` verifica pré-renderização e CSP.

Referências oficiais:
- https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
- https://developer.spotify.com/documentation/web-api/concepts/quota-modes
