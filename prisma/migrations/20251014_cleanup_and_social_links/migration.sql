-- CleanupAndSocialLinks
-- Remove tabela Activity e adiciona campos de redes sociais no User

-- 1. Remover tabela Activity se existir
DROP TABLE IF EXISTS "Activity" CASCADE;

-- 2. Adicionar campos de redes sociais no User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twitterUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;

