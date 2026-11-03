# Melhoria de contraste e fundos

Revisão sobre o commit bf94442 do GitHub (03/11/2026).

A alteração visual está concentrada em `src/web/web.css`:

- Base em cinza azulado, com separação mais evidente entre superfícies.
- Textos secundários, tecnologias, legendas, contadores e rodapé mais escuros e maiores.
- Seções escuras mantêm textos e detalhes claros, sem usar o mesmo cinza dos fundos claros.
- Barra flutuante mais opaca para evitar que textos de trás prejudiquem a leitura.
- Campos com contornos e placeholders mais visíveis, inclusive no mobile.
- Mesmas páginas, marca, navegação, dados e API do Neon.

Para aplicar em seu projeto atual, substitua `src/web/web.css` pelo arquivo deste pacote. Se preferir, o ZIP contém o projeto completo. Mantenha seu `.env.local` e suas variáveis da Vercel.

Validação: `npm run check` aprovado (TypeScript, 7 testes e build). Pares principais de texto e superfície medidos entre 4,79:1 e 8,81:1; isso é uma verificação dos pares selecionados, não uma auditoria completa de acessibilidade do site. Conferência visual em desktop e viewport mobile sem rolagem horizontal.

Nenhuma credencial está no ZIP. Nenhum registro do Neon foi modificado. As alterações não foram publicadas no domínio.
