-- Atualização aditiva. Não apaga, não renomeia e não republica registros.
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS demo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'auto';
-- Categorias aceitas pela API: auto, web, mobile, other.
-- Em auto, a vitrine pública identifica projetos web pelo tipo/nome/tecnologias.
-- github antigo contendo demonstração continua funcionando sem reescrever o registro.
