-- Seed data for Study System
-- Matches the localStorage defaults defined in src/data/seed.ts
--
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_USER_ID_HERE' with the actual user UUID after creating a user
-- 2. Run this after schema.sql has been applied
-- 3. This creates the default subjects, columns, and tags

-- Set the user_id variable (replace with your actual user_id)
-- DO $$
-- DECLARE
--   v_user_id UUID := 'YOUR_USER_ID_HERE';
-- BEGIN
--   -- Use v_user_id in the INSERT statements below
-- END $$;

-- For convenience, using a placeholder that you should replace:
-- Find-and-replace 'USER_ID_PLACEHOLDER' with your actual user UUID

-- ============================================
-- SUBJECTS with papers
-- ============================================

-- Bangla
WITH bangla AS (
  INSERT INTO subjects (id, user_id, name)
  VALUES (gen_random_uuid(), 'USER_ID_PLACEHOLDER'::uuid, 'Bangla')
  RETURNING id
)
INSERT INTO papers (user_id, subject_id, name)
SELECT 'USER_ID_PLACEHOLDER'::uuid, bangla.id, paper_name
FROM bangla, (VALUES ('1st Paper'), ('2nd Paper')) AS p(paper_name);

-- English
WITH english AS (
  INSERT INTO subjects (id, user_id, name)
  VALUES (gen_random_uuid(), 'USER_ID_PLACEHOLDER'::uuid, 'English')
  RETURNING id
)
INSERT INTO papers (user_id, subject_id, name)
SELECT 'USER_ID_PLACEHOLDER'::uuid, english.id, paper_name
FROM english, (VALUES ('1st Paper'), ('2nd Paper')) AS p(paper_name);

-- ICT (no papers)
INSERT INTO subjects (user_id, name)
VALUES ('USER_ID_PLACEHOLDER'::uuid, 'ICT');

-- Finance
WITH finance AS (
  INSERT INTO subjects (id, user_id, name)
  VALUES (gen_random_uuid(), 'USER_ID_PLACEHOLDER'::uuid, 'Finance')
  RETURNING id
)
INSERT INTO papers (user_id, subject_id, name)
SELECT 'USER_ID_PLACEHOLDER'::uuid, finance.id, paper_name
FROM finance, (VALUES ('1st Paper'), ('2nd Paper')) AS p(paper_name);

-- Accounting
WITH accounting AS (
  INSERT INTO subjects (id, user_id, name)
  VALUES (gen_random_uuid(), 'USER_ID_PLACEHOLDER'::uuid, 'Accounting')
  RETURNING id
)
INSERT INTO papers (user_id, subject_id, name)
SELECT 'USER_ID_PLACEHOLDER'::uuid, accounting.id, paper_name
FROM accounting, (VALUES ('1st Paper'), ('2nd Paper')) AS p(paper_name);

-- Management
WITH management AS (
  INSERT INTO subjects (id, user_id, name)
  VALUES (gen_random_uuid(), 'USER_ID_PLACEHOLDER'::uuid, 'Management')
  RETURNING id
)
INSERT INTO papers (user_id, subject_id, name)
SELECT 'USER_ID_PLACEHOLDER'::uuid, management.id, paper_name
FROM management, (VALUES ('1st Paper'), ('2nd Paper')) AS p(paper_name);

-- Marketing
WITH marketing AS (
  INSERT INTO subjects (id, user_id, name)
  VALUES (gen_random_uuid(), 'USER_ID_PLACEHOLDER'::uuid, 'Marketing')
  RETURNING id
)
INSERT INTO papers (user_id, subject_id, name)
SELECT 'USER_ID_PLACEHOLDER'::uuid, marketing.id, paper_name
FROM marketing, (VALUES ('1st Paper'), ('2nd Paper')) AS p(paper_name);

-- ============================================
-- DEFAULT COLUMNS (Kanban board)
-- ============================================
INSERT INTO columns (user_id, name, "order") VALUES
  ('USER_ID_PLACEHOLDER'::uuid, 'Due Tonight', 0),
  ('USER_ID_PLACEHOLDER'::uuid, 'This Week', 1),
  ('USER_ID_PLACEHOLDER'::uuid, 'Upcoming', 2),
  ('USER_ID_PLACEHOLDER'::uuid, 'Pending', 3),
  ('USER_ID_PLACEHOLDER'::uuid, 'Done', 4);

-- ============================================
-- DEFAULT TAGS
-- ============================================
INSERT INTO tags (user_id, name, color) VALUES
  ('USER_ID_PLACEHOLDER'::uuid, 'Urgent', 'red'),
  ('USER_ID_PLACEHOLDER'::uuid, 'Important', 'orange'),
  ('USER_ID_PLACEHOLDER'::uuid, 'Easy', 'green'),
  ('USER_ID_PLACEHOLDER'::uuid, 'Hard', 'purple'),
  ('USER_ID_PLACEHOLDER'::uuid, 'Review', 'blue');

-- ============================================
-- DEFAULT SETTINGS
-- ============================================
INSERT INTO settings (user_id, theme, accent_color, card_display_fields, exam_mode_active)
VALUES (
  'USER_ID_PLACEHOLDER'::uuid,
  'system',
  'blue',
  '{subject, dueDate, tags}',
  FALSE
);
