# Correção do deploy 2.1.1

A Vercel recusou o deploy do commit 0567b3f com `exceeded_serverless_functions_per_deployment`: havia 13 funções independentes e o plano Hobby permite 12. O build de Vite havia terminado; a falha ocorreu ao publicar as funções.

A geração e a entrega de prévias agora compartilham uma função. Os handlers internos ficam em `api/_lib` e a URL pública `/api/project-preview?id=...` permanece a mesma por rewrite. As verificações de sessão, origem e publicação permanecem nos respectivos handlers. Total: 12 entrypoints.

## Atualizar

1. Substitua os arquivos do repositório pelo conteúdo deste ZIP, mantendo suas variáveis de ambiente.
2. **Remova o arquivo antigo `api/project-preview.ts` do GitHub**, se existir. Ele foi substituído por `api/_lib/public-preview-handler.ts`; apenas copiar os novos arquivos sem excluir o antigo manterá 13 funções e a falha.
3. Inclua o `vercel.json` atualizado e os dois handlers de `api/_lib`.
4. Faça commit e aguarde o novo deploy chegar a Ready.

Depois do deploy, entre em `/admin`, edite um projeto salvo, busque uma captura do GitHub ou gere uma prévia, clique em **Usar esta prévia** e depois **Salvar projeto**. Fazer deploy não gera imagens automaticamente. A geração precisa de acesso ao AI Gateway (chave no servidor ou OIDC autorizado) e saldo. Consulte `IA-PREVIAS.md`.

Nenhuma publicação ou alteração no banco de produção foi executada nesta correção.
