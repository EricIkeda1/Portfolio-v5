# Moderação local de mensagens

O projeto contém seu próprio classificador estatístico de texto, executado em Node.js no servidor. Não é um LLM generativo nem um serviço de moderação externo. Não precisa de chave de IA, download de modelo em produção, GPU ou Python no Vercel.

## Fluxo

1. O servidor valida método, origem, JSON e os campos.
2. O texto e, quando informado, o nome são analisados por um modelo de regressão logística com TF-IDF e n-gramas de caracteres/palavras, combinado com regras para ameaças explícitas e algumas formas de disfarce.
3. Envios detectados retornam HTTP 422 `CONTENT_BLOCKED`, antes de criptografar, consultar o banco, salvar ou enviar push. O texto bloqueado não é registrado em logs, banco ou notificações pelo código da aplicação.
4. Envios aceitos seguem a criptografia AES-256-GCM, limite de frequência e caixa separada já existentes.
5. Modelo ausente ou inválido: HTTP 503; nenhum envio passa sem verificação.

A regra vale para contato profissional, recado anônimo antigo, recado anônimo novo e recado com nome. Não há preferência ou isenção por identidade. Mensagens antigas não são apagadas retroativamente: continuam disponíveis para revisão e exclusão manual.

`GET /api/content?view=moderation` informa apenas disponibilidade, engine e versão; nunca expõe texto, pesos ou chave.

## Limitações importantes

É uma defesa adicional, não uma garantia de segurança. Um classificador leve tem compreensão limitada de contexto; citações, negações, gírias, ironia, ameaças indiretas e idiomas diferentes podem gerar erros. As regras cobrem ameaças explícitas conhecidas; nenhum teste prova cobertura de todas as ameaças.

O limiar conservador busca reduzir falsos positivos. O relatório `scripts/moderation/evaluation.json` publica a avaliação separada do conjunto de treino. No teste de toxicidade do domínio original (2.071 textos públicos, sem mensagens do portfólio), o modelo isolado alcançou precisão 0,7895 e recall 0,2618 no limiar 0,80. Isso NÃO é uma taxa de acerto para ameaças do site: o corpus não tem uma categoria específica de ameaça, e a avaliação não inclui as regras complementares. A recuperação baixa de toxicidade genérica é uma limitação conhecida; a revisão manual continua necessária. Os exemplos sintéticos não são usados como evidência de desempenho generalizado.

A inferência ocorre em memória no servidor. Mensagens de visitantes não são enviadas a fornecedores de IA, não são usadas para treinar o modelo e não são retidas quando bloqueadas pelo código da aplicação. A infraestrutura de hospedagem pode manter seus próprios metadados de requisições.

## Treinamento e proveniência

- ToLD-Br: João Augusto Leite, Diego Silva, Kalina Bontcheva e Carolina Scarton (2020), *Toxic Language Detection in Social Media for Brazilian Portuguese: New Dataset and Multilingual Analysis*. https://aclanthology.org/2020.aacl-main.91
- Fonte oficial: https://github.com/joaoaleite/ToLD-Br
- 21.000 exemplos originais; exemplos normalizados duplicados são agrupados antes da divisão treino/validação/teste. O rótulo tóxico exige ao menos dois anotadores em uma das categorias.
- Exemplos sintéticos próprios de ameaças e contrastes benignos: `scripts/moderation/threat-examples.json`, usados somente no treino.
- SHA-256 do CSV utilizado: `a905b90d5886b9c80d737aa26c41dd29077155f23b9b857080634a78f8203c90`.
- Dataset e modelo derivado: CC BY-SA 4.0. A licença original completa está em `scripts/moderation/LICENSE-ToLD-Br.txt`. Os pesos são uma adaptação treinada neste projeto; não são o modelo BERT dos autores.
- O corpus bruto não é distribuído neste repositório. O artefato contém apenas parâmetros numéricos e metadados, sem vocabulário ou cópias de mensagens.

Para reproduzir, obtenha `ToLD-BR.csv` no repositório oficial, confira o hash e execute com numpy, scipy e scikit-learn:

```sh
python scripts/moderation/train.py /caminho/ToLD-BR.csv
node scripts/test-moderation.mjs
```

Treinamento é uma tarefa de desenvolvimento. O build de produção utiliza o artefato versionado `api/_lib/moderation/model.json` e não baixa nem retreina modelos. Os testes do fluxo usam fixtures em memória; não enviam mensagens reais nem apagam contatos.
