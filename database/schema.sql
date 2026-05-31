-- Study System Database Schema
-- Compatible with Supabase (PostgreSQL with Row Level Security)
-- Generated for future backend integration

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- Stores user profile data linked to Supabase Auth
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth';

CREATE INDEX idx_users_auth_uid ON users(auth_uid);

-- ============================================
-- SUBJECTS TABLE
-- Academic subjects the student is studying
-- ============================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE subjects IS 'Academic subjects (Bangla, English, Finance, etc.)';

CREATE INDEX idx_subjects_user_id ON subjects(user_id);

-- ============================================
-- PAPERS TABLE
-- Papers within a subject (1st Paper, 2nd Paper)
-- ============================================
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE papers IS 'Papers within a subject (e.g. 1st Paper, 2nd Paper)';

CREATE INDEX idx_papers_subject_id ON papers(subject_id);
CREATE INDEX idx_papers_user_id ON papers(user_id);

-- ============================================
-- COLUMNS TABLE
-- Task board columns for kanban view
-- ============================================
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE columns IS 'Kanban board columns (Due Tonight, This Week, Upcoming, etc.)';

CREATE INDEX idx_columns_user_id ON columns(user_id);

-- ============================================
-- TAGS TABLE
-- Tags for categorizing tasks
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE tags IS 'Tags for categorizing tasks (Urgent, Important, Easy, etc.)';

CREATE INDEX idx_tags_user_id ON tags(user_id);

-- ============================================
-- TASKS TABLE
-- Homework assignments, study tasks, to-dos
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  column_id UUID REFERENCES columns(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  urgency TEXT NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE tasks IS 'Homework assignments, study tasks, and to-do items';

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- TASK_TAGS JUNCTION TABLE
-- Many-to-many relationship between tasks and tags
-- ============================================
CREATE TABLE task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, tag_id)
);
COMMENT ON TABLE task_tags IS 'Junction table linking tasks to tags (many-to-many)';

CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- ============================================
-- DAILY_LOGS TABLE
-- Daily class logs - what was taught and homework
-- ============================================
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  what_was_taught TEXT NOT NULL,
  homework TEXT NOT NULL DEFAULT '',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE daily_logs IS 'Daily class logs recording what was taught and homework assigned';

CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
CREATE INDEX idx_daily_logs_subject_id ON daily_logs(subject_id);

-- ============================================
-- TRACKER_ENTRIES TABLE
-- College, tuition, and self-study session entries
-- ============================================
CREATE TYPE tracker_type AS ENUM ('college', 'tuition', 'self_study');

CREATE TABLE tracker_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type tracker_type NOT NULL,
  date DATE NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  topic TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  duration INTEGER, -- in minutes, for self-study sessions
  teacher_name TEXT,
  location TEXT,
  accomplishment TEXT,
  homework TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE tracker_entries IS 'Study session entries: college classes, tuition lessons, and self-study sessions';

CREATE INDEX idx_tracker_entries_user_id ON tracker_entries(user_id);
CREATE INDEX idx_tracker_entries_type ON tracker_entries(type);
CREATE INDEX idx_tracker_entries_date ON tracker_entries(date);
CREATE INDEX idx_tracker_entries_subject_id ON tracker_entries(subject_id);

-- ============================================
-- COLLEGE_PROGRESS TABLE
-- Syllabus tracking: subject > paper > chapters > topics
-- ============================================
CREATE TABLE college_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL DEFAULT gen_random_uuid(),
  chapter_name TEXT NOT NULL,
  topic_id UUID NOT NULL DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE college_progress IS 'College syllabus progress tracking: chapters and topics with completion status';

CREATE INDEX idx_college_progress_user_id ON college_progress(user_id);
CREATE INDEX idx_college_progress_subject_id ON college_progress(subject_id);
CREATE INDEX idx_college_progress_paper_id ON college_progress(paper_id);

-- ============================================
-- REVISION_SCHEDULES TABLE
-- Spaced repetition revision queue
-- ============================================
CREATE TABLE revision_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  first_studied_at TIMESTAMPTZ NOT NULL,
  next_review_date TIMESTAMPTZ NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  intervals INTEGER[] NOT NULL DEFAULT '{1, 3, 7, 14, 30}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'mastered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE revision_schedules IS 'Spaced repetition revision queue with configurable intervals (1-3-7-14-30 day schedule)';

CREATE INDEX idx_revision_schedules_user_id ON revision_schedules(user_id);
CREATE INDEX idx_revision_schedules_next_review_date ON revision_schedules(next_review_date);
CREATE INDEX idx_revision_schedules_subject_id ON revision_schedules(subject_id);
CREATE INDEX idx_revision_schedules_status ON revision_schedules(status);

-- ============================================
-- EXAMS TABLE
-- Past and upcoming exams
-- ============================================
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('past', 'upcoming')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  routine_image TEXT, -- base64 encoded image of exam routine
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE exams IS 'Past and upcoming exams with dates and optional routine image';

CREATE INDEX idx_exams_user_id ON exams(user_id);
CREATE INDEX idx_exams_start_date ON exams(start_date);
CREATE INDEX idx_exams_type ON exams(type);

-- ============================================
-- EXAM_SUBJECTS TABLE
-- Subjects within an exam with marks and syllabus checklist
-- ============================================
CREATE TABLE exam_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  total_marks INTEGER NOT NULL DEFAULT 0,
  obtained_marks INTEGER,
  chapters JSONB NOT NULL DEFAULT '[]', -- array of {name: string, completed: boolean}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE exam_subjects IS 'Subjects within an exam: marks tracking and chapter preparation checklist';

CREATE INDEX idx_exam_subjects_exam_id ON exam_subjects(exam_id);
CREATE INDEX idx_exam_subjects_subject_id ON exam_subjects(subject_id);

-- ============================================
-- ROUTINE_ENTRIES TABLE
-- Weekly class schedule/timetable
-- ============================================
CREATE TABLE routine_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL, -- HH:MM format
  end_time TEXT NOT NULL,   -- HH:MM format
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE routine_entries IS 'Weekly class schedule: which subject/paper on which day at what time';

CREATE INDEX idx_routine_entries_user_id ON routine_entries(user_id);
CREATE INDEX idx_routine_entries_day_of_week ON routine_entries(day_of_week);

-- ============================================
-- SETTINGS TABLE
-- User preferences and app settings
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('dark', 'light', 'system')),
  accent_color TEXT NOT NULL DEFAULT 'blue',
  card_display_fields TEXT[] NOT NULL DEFAULT '{subject, dueDate, tags}',
  exam_mode_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE settings IS 'User preferences: theme, accent color, display options, and streak tracking';

CREATE INDEX idx_settings_user_id ON settings(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Each user can only access their own data
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can only see their own rows" ON users
  FOR ALL USING (auth_uid = auth.uid());

-- Subjects: users see their own
CREATE POLICY "Users can only see their own rows" ON subjects
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Papers: users see their own
CREATE POLICY "Users can only see their own rows" ON papers
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Columns: users see their own
CREATE POLICY "Users can only see their own rows" ON columns
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Tags: users see their own
CREATE POLICY "Users can only see their own rows" ON tags
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Tasks: users see their own
CREATE POLICY "Users can only see their own rows" ON tasks
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Task Tags: users see their own (through task ownership)
CREATE POLICY "Users can only see their own rows" ON task_tags
  FOR ALL USING (task_id IN (SELECT id FROM tasks WHERE user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())));

-- Daily Logs: users see their own
CREATE POLICY "Users can only see their own rows" ON daily_logs
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Tracker Entries: users see their own
CREATE POLICY "Users can only see their own rows" ON tracker_entries
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- College Progress: users see their own
CREATE POLICY "Users can only see their own rows" ON college_progress
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Revision Schedules: users see their own
CREATE POLICY "Users can only see their own rows" ON revision_schedules
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Exams: users see their own
CREATE POLICY "Users can only see their own rows" ON exams
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Exam Subjects: users see through exam ownership
CREATE POLICY "Users can only see their own rows" ON exam_subjects
  FOR ALL USING (exam_id IN (SELECT id FROM exams WHERE user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())));

-- Routine Entries: users see their own
CREATE POLICY "Users can only see their own rows" ON routine_entries
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Settings: users see their own
CREATE POLICY "Users can only see their own rows" ON settings
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- ============================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at on row changes
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON papers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracker_entries_updated_at BEFORE UPDATE ON tracker_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_college_progress_updated_at BEFORE UPDATE ON college_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revision_schedules_updated_at BEFORE UPDATE ON revision_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_subjects_updated_at BEFORE UPDATE ON exam_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routine_entries_updated_at BEFORE UPDATE ON routine_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
