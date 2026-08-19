-- Portfolio v5 - Neon PostgreSQL
-- Seguro para executar no SQL Editor: não apaga tabelas existentes.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_profile (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  photo_drive_url TEXT NOT NULL DEFAULT '',
  about_text TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  highlights TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  github_url TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#4285FF',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_projects_sort_order_idx
  ON portfolio_projects (sort_order, id);

INSERT INTO portfolio_profile (
  id,
  photo_drive_url,
  about_text,
  whatsapp,
  email,
  github_url
)
VALUES (
  1,
  'https://drive.google.com/file/d/18I4wMhuprbKT0OLBLvAvz12yAoPNQSNc/view?usp=sharing',
  'Meu nome é Eric, sou desenvolvedor de software e gosto de transformar ideias em projetos reais. Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções modernas, rápidas e que realmente façam a diferença para quem as utiliza.\n\nGosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.\n\nAlém de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.',
  '',
  'ericikeda2002@mail.com',
  'https://github.com/EricIkeda1'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_projects (name, type, tags, description, highlights, github_url, color, sort_order)
SELECT * FROM (VALUES
  ('Ademiconnect', 'CRM Mobile', ARRAY['Flutter','Supabase','Mobile']::TEXT[], 'CRM Mobile desenvolvido com Flutter e Supabase, com sincronização em tempo real e funcionamento offline. Solução completa para gestão de relacionamento com clientes.', ARRAY['Sync em tempo real','Modo offline','Flutter + Supabase']::TEXT[], 'https://github.com/EricIkeda1/Ademiconnect', '#4285FF', 1),
  ('Temperlights', 'App Industrial', ARRAY['Mobile','Rastreabilidade','Produção']::TEXT[], 'Aplicativo para rastreabilidade da produção industrial, com acompanhamento em tempo real de cada etapa do processo de fabricação.', ARRAY['Rastreabilidade','Produção industrial','Tempo real']::TEXT[], 'https://github.com/EricIkeda1/Temperlights-Mobile', '#5B9BFF', 2),
  ('X4Glass', 'Sistema Web', ARRAY['Full Stack','Rastreabilidade','Equipe']::TEXT[], 'Sistema de rastreabilidade para produção de vidros desenvolvido em equipe. Projeto colaborativo com foco em qualidade e organização de processos industriais.', ARRAY['Desenvolvimento em equipe','Rastreabilidade','Full Stack']::TEXT[], 'https://github.com/EricIkeda1/X4Glass', '#7AB3FF', 3),
  ('AES', 'Criptografia', ARRAY['Python','Cibersegurança','Algoritmos']::TEXT[], 'Implementação completa do algoritmo AES (Advanced Encryption Standard) em Python do zero, sem bibliotecas externas. Desenvolvido na disciplina de Segurança da Informação, cobrindo as principais etapas do AES de 128 bits.', ARRAY['AES 128-bit','Python puro','Cibersegurança']::TEXT[], 'https://github.com/EricIkeda1/AES', '#A78BFF', 4)
) AS seed(name, type, tags, description, highlights, github_url, color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_projects);

-- CRIE O PRIMEIRO ADMIN TROcando o e-mail e a senha abaixo.
-- A senha é armazenada como hash bcrypt pelo pgcrypto, nunca em texto puro.
-- Depois de editar, remova os dois hífens do começo das próximas 3 linhas e execute.
-- INSERT INTO admins (email, password_hash)
-- VALUES ('seuemail@exemplo.com', crypt('SUA_SENHA_FORTE_AQUI', gen_salt('bf', 12)))
-- ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Para adicionar outro administrador futuramente:
-- INSERT INTO admins (email, password_hash)
-- VALUES ('outro@email.com', crypt('OUTRA_SENHA_FORTE', gen_salt('bf', 12)));
