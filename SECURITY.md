# Segurança do Portfolio v5

## Depois do deploy

1. Confirme que `DATABASE_URL` e uma `SESSION_SECRET` com pelo menos 32 caracteres estão definidas na Vercel.
2. Gere uma nova senha com `npm run admin:hash` e configure temporariamente `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` na Vercel antes do deploy.
3. Publique a nova versão. O backend cria/atualiza o administrador e remove a conta de demonstração antiga quando o novo e-mail é diferente.
4. Teste o novo login em `/admin`.
5. Depois de confirmar o acesso, remova `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` da Vercel; a credencial já estará salva no Neon.
6. No futuro, use **Configurações > Alterar acesso do administrador** para novas trocas de e-mail ou senha.

## Rate limiting

Após 5 falhas do mesmo IP dentro de 15 minutos, novas tentativas desse IP são temporariamente bloqueadas com HTTP 429. Também existe um limite mais alto por conta para reduzir ataques distribuídos sem facilitar bloqueio malicioso do administrador. Os identificadores são derivados com HMAC usando `SESSION_SECRET`.

## Vercel

O `vercel.json` adiciona HSTS, CSP, proteção contra framing, `nosniff`, política de referrer e restrições de câmera/microfone/geolocalização. O `/admin` também recebe `noindex` e `no-store`.

A proteção contra DDoS da própria Vercel continua complementando essas medidas. Se houver tráfego automatizado agressivo, o Vercel Firewall/Attack Mode ou BotID podem ser habilitados como uma camada adicional na plataforma.
