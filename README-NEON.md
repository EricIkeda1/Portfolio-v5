# Neon

As instruções atualizadas estão no README.md, na seção “Seus dados do Neon”.
A conexão usa `DATABASE_URL` somente no servidor. Não configure `VITE_DATABASE_URL`.
`/api/health` verifica conectividade e `/api/content` entrega os dados públicos atuais.
A migração aditiva 002 separa demonstrações de repositórios e permite a categoria web.
