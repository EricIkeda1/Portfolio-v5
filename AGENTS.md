# Portfolio-v5

React 19 + TypeScript + Vite, com funções Node em `api/` e Neon PostgreSQL.

- Desenvolvimento completo (UI + API): `npm run dev`.
- Validação: `npm run check`. Integração de leitura: `npm run test:integration`.
- Interface pública: `src/web/`; painel: `src/admin/`.
- Conteúdo público vem do Neon por `/api/content`. Defaults são apenas apresentação offline.
- Não embutir credenciais, usar segredos VITE_ ou incluir `.env.local` em pacotes.
- Exibir apenas projetos web; manter dados mobile/outros no banco.
- Preservar a logo original e o rodapé “Desenvolvido por Eric Y. Ikeda”, sem acesso rápido.
- Migrações devem ser aditivas e testadas em branch isolada antes da produção.
