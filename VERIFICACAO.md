# Verificação da entrega

Data: 03/11/2026.

- TypeScript: frontend e funções API aprovados.
- Sete testes aprovados: classificação web, compatibilidade de links antigos, URLs seguras, capas sem imagem, sessão, proteção de origem e renderização/rodapé.
- Build de produção e pré-renderização concluídos para Início, Portfólio, Sobre, Contato, entrada de detalhes, Admin e 404.
- Conexão real: projeto Neon `Portfoliov5`, branch de teste `preview-portfolio-web-20261103`. Leitura das configurações e dos seis projetos concluída pela API.
- Vitrine resultante: WebShop, Proj Galeria De Fotos e X4Glass, identificados como web nos registros atuais. Mobile e artigo acadêmico ficaram fora da vitrine, sem exclusão do banco.
- A resposta pública foi conferida sem DATABASE_URL, senha/hash ou URL interna da foto de perfil.
- Busca, navegação sem recarregar a página, rodapé e menu flutuante conferidos no navegador; layout mobile verificado em viewport de 390 px dentro de iframe de QA temporário.

## Limite da prévia

O servidor isolado de prévia do navegador não conseguiu acessar o endpoint externo do Neon (`fetch failed`). Nesse ambiente, o aviso de dados de apresentação foi mostrado corretamente. A integração do código Node com o Neon foi testada separadamente e passou. Esse teste não substitui conferir `/api/health` e `/api/content` depois de atualizar sua Vercel.

## Produção

Não houve push no GitHub, deploy no domínio ou alteração dos registros de produção. A migração foi exercitada na branch de teste. A branch de teste foi mantida para revisão; ela não é referenciada nem tem credenciais no pacote. Use suas variáveis atuais de produção ao publicar.

O formulário de contato prepara e-mail no aplicativo do visitante; não é um serviço de envio de e-mail no backend.
