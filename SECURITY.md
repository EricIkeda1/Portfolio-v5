# Segurança do Portfolio v5

## Configuração

Defina `DATABASE_URL`, `SESSION_SECRET` (pelo menos 32 caracteres aleatórios) e `CONTACT_ENCRYPTION_KEY` (32 bytes aleatórios, em 64 caracteres hexadecimais) somente no backend da Vercel. Nunca use o prefixo `VITE_`.

`ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` são opcionais e criam a primeira conta somente quando a tabela de administradores está vazia. Eles não alteram, recriam nem removem contas existentes. Faça mudanças de acesso pelo painel. Uma conta antiga de demonstração deve ser removida explicitamente depois de confirmar o acesso à conta definitiva.

## Sessões administrativas

O cookie usa HttpOnly, SameSite=Strict e Secure em produção. Cada login recebe um identificador aleatório; o servidor persiste apenas o hash desse identificador. A autenticação verifica a assinatura, a expiração e o registro da sessão junto à conta atual.

O logout revoga a sessão no banco. Uma troca de senha ou e-mail invalida todas as sessões anteriores e emite uma nova para o navegador atual. Mesmo uma atualização sem nova senha renova o hash da credencial. Sessões anteriores a esta versão são rejeitadas: será necessário entrar novamente após o deploy.

## Contatos e criptografia

Novos nomes, e-mails e mensagens são agrupados em `contact_messages.private_payload`, cifrados com AES-256-GCM, nonce aleatório e autenticação do conteúdo. As colunas antigas recebem apenas marcadores sem dados pessoais. O painel autenticado descriptografa o conteúdo no servidor; a API não retorna o payload cifrado nem a chave. Na ausência da chave, novos envios falham sem gravar texto puro.

Guarde a chave com segurança e mantenha-a estável. Ela é independente da `SESSION_SECRET`: renovar a chave de sessão não impede ler as mensagens. Não substitua `CONTACT_ENCRYPTION_KEY` sem uma migração que use as chaves antiga e nova. Perder a chave impede recuperar os contatos cifrados.

### Migração dos contatos antigos

1. Teste o novo código e a migração em uma branch isolada do Neon.
2. Configure uma chave persistente na Vercel e no ambiente protegido da migração.
3. Publique o backend novo antes de migrar os contatos antigos.
4. Execute `node --env-file=/caminho/ambiente-seguro.env scripts/encrypt-existing-contacts.mjs --apply` com a mesma chave do backend e o banco correto.
5. O script cifra em lotes, substitui o texto puro somente na atualização atômica da linha, preserva os metadados e imprime apenas contagens. Ele é retomável e não cifra novamente linhas migradas.
6. Verifique o painel e se a contagem de linhas pendentes é zero.

O backend mantém leitura dos contatos antigos durante a transição. Depois da migração, não faça rollback para uma versão que desconhece `private_payload`, pois o painel antigo exibiria apenas os marcadores. Backups e histórico anteriores podem conter o texto antigo até expirar a retenção do provedor. Criptografia de campos complementa TLS, controles de acesso e criptografia de disco do provedor; não representa segurança absoluta.

## Rate limiting e navegador

O login aplica limites por IP e conta com identificadores HMAC; o formulário limita a cinco envios por IP em 15 minutos. Cabeçalhos encaminhados dependem da cadeia de proxies confiável da hospedagem.

A CSP bloqueia scripts inline executáveis e eval. O JSON-LD estático usa hash SHA-256 autorizado no `vercel.json`; ao mudar o SEO, atualize o hash e execute `node scripts/test-csp.mjs` após o build. Fontes não usam handlers inline. Há também HSTS, proteção contra framing, nosniff, política de referrer e restrições de câmera, microfone e geolocalização.

## Validação

Use exclusivamente DATABASE_URL de uma branch isolada, segredos de teste e `CONTACT_TEST_DATABASE=1` para executar `scripts/test-security.mjs`, `scripts/test-contact.mjs` e `scripts/test-push.mjs`. Os testes cobrem login, revogação, troca de credenciais, bootstrap, persistência cifrada, descriptografia autorizada, validação, paginação, limite concorrente e notificações sem conteúdo privado.
