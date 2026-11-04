# Prévias de projetos com GitHub + IA

O painel agora pode ler um repositório GitHub público, localizar capturas existentes e gerar uma imagem ilustrativa a partir do README e dos arquivos de interface.

## Ativar

1. Configure `AI_GATEWAY_API_KEY` nas variáveis de ambiente do **servidor** na Vercel ou no `.env.local`. A chave é criada na sua conta do Vercel AI Gateway; a geração usa o saldo e os limites dessa conta.
2. O modelo padrão é `google/gemini-3.1-flash-image`, confirmado no catálogo do serviço. Você pode alterar `AI_PREVIEW_MODEL` para outro modelo de linguagem compatível com saída de imagem. Modelos somente de texto ou modelos image-only não servem para esta implementação de `generateText`.
3. Se atingir o limite público da API do GitHub, configure opcionalmente `GITHUB_TOKEN` com acesso mínimo de leitura. O token não torna repositórios privados elegíveis para envio à IA.
4. Reinicie o desenvolvimento ou publique novamente após configurar as variáveis.

A presença de `VERCEL_OIDC_TOKEN` também permite a autenticação automática suportada pela Vercel, sujeita à ativação e ao saldo da conta do AI Gateway. Para uma configuração explícita e previsível, utilize `AI_GATEWAY_API_KEY`.

## Usar

1. Entre em `/admin` e abra **Projetos → Editar**.
2. Informe a URL do repositório no campo GitHub. Para WebShop e Galeria antigos que tinham só o endereço de demonstração, o sistema reconhece o repositório correspondente.
3. Use **Buscar capturas no GitHub** para ver as imagens identificadas no repositório. Essa etapa não faz uma chamada paga de IA.
4. Use **Gerar prévia com IA** para que o modelo leia os trechos selecionados e produza uma imagem. A ação é manual, autenticada, sem repetição automática e com bloqueio de concorrência por projeto.
5. Revise o resultado, clique em **Usar esta prévia** e em **Salvar projeto**. Antes de salvar, a capa pública não muda.

A prévia aprovada aparece na página inicial, no carrossel, na listagem e nos detalhes do projeto. Imagens geradas recebem o rótulo **“Prévia com IA”**: são reconstruções ilustrativas e podem diferir da interface real. Capturas obtidas do repositório permanecem imagens reais do arquivo original.

## Dados e limites

- Não executa, instala ou publica o código dos repositórios.
- Só acessa URLs fixas da API GitHub; não busca URLs arbitrárias fornecidas pelo visitante.
- Lê metadados e até oito arquivos públicos selecionados, com limites de tamanho. Pastas de backend, dependências, testes, `.env`, credenciais e autenticação são excluídas.
- Aplica redação de padrões comuns de segredos, sem prometer detectar todas as formas possíveis de segredo. Nunca coloque credenciais em um repositório público.
- Apenas os trechos públicos selecionados e a descrição do projeto são enviados ao modelo; nenhuma configuração de conta, chave ou outro registro do Neon entra no prompt.
- O modelo não recebe ferramentas nem permissão de executar instruções presentes no README/código.
- Imagens geradas ficam na tabela dedicada `portfolio_project_previews` no seu Neon; limite de 2,5 MB por imagem. São servidas por `/api/project-preview`.
- Imagens ainda não aprovadas só podem ser abertas por uma sessão de administrador. A URL pública só funciona quando o projeto está publicado e utiliza exatamente aquela imagem.
- O banco mantém as prévias geradas para revisão. Elas não são reenviadas para o modelo a cada visita ao site. A migração aditiva `database/003-project-previews.sql` é aplicada ao gerar a primeira imagem, sem alterar os projetos existentes.
- A Vercel foi configurada com até 300 segundos para essa função; a disponibilidade do tempo máximo depende da configuração/plano da conta. Há timeouts nas consultas e na geração.
- A interface exibe estados de processamento e mensagens para falta de chave, saldo, limites e falhas. Nunca informa que uma geração aconteceu se o provedor não retornou uma imagem.

## Validação desta entrega

TypeScript, testes automatizados e build foram executados. A leitura de um GitHub real e a persistência/controle de acesso das imagens foram exercitados em uma branch de teste do Neon, com uma imagem de teste (não gerada por IA).

**A geração paga não foi executada nesta sessão**, pois não há chave/saldo de IA configurado no projeto. Ela fica disponível após você configurar o serviço. Não há chave no ZIP.

## Referências

- https://vercel.com/docs/ai-gateway/modalities/image-generation/ai-sdk
- https://ai-sdk.dev/docs/ai-sdk-core/image-generation
- https://ai-gateway.vercel.sh/v1/models
