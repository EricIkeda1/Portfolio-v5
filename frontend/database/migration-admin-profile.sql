-- Execute este arquivo uma única vez no SQL Editor do Neon se o banco já existe.
-- Ele não apaga nenhum dado.

ALTER TABLE portfolio_profile
  ADD COLUMN IF NOT EXISTS education_course TEXT NOT NULL DEFAULT 'Engenharia de Software';

ALTER TABLE portfolio_profile
  ADD COLUMN IF NOT EXISTS education_institution TEXT NOT NULL DEFAULT 'UniSenaiPR – Londrina';

ALTER TABLE portfolio_profile
  ADD COLUMN IF NOT EXISTS education_completion TEXT NOT NULL DEFAULT '2026';

UPDATE portfolio_profile
SET
  education_course = COALESCE(NULLIF(education_course, ''), 'Engenharia de Software'),
  education_institution = COALESCE(NULLIF(education_institution, ''), 'UniSenaiPR – Londrina'),
  education_completion = COALESCE(NULLIF(education_completion, ''), '2026')
WHERE id = 1;
