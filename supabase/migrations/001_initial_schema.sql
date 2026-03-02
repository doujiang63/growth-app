-- 个人成长管理系统 - Initial Schema
-- Run this in Supabase SQL Editor

-- 1. Diaries
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  body TEXT,
  mood TEXT,
  important_thing TEXT,
  gain TEXT,
  tomorrow TEXT,
  self_note TEXT,
  energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  video_url TEXT NOT NULL,
  douyin_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Contents
CREATE TABLE IF NOT EXISTS contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  my_note TEXT,
  category TEXT,
  source_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Parenting
CREATE TABLE IF NOT EXISTS parenting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  milestone_age TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Career
CREATE TABLE IF NOT EXISTS career (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT CHECK (type IN ('goal','decision','learning')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  progress SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Finance
CREATE TABLE IF NOT EXISTS finance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC(12,2),
  current_amount NUMERIC(12,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Energy Logs
CREATE TABLE IF NOT EXISTS energy_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  level SMALLINT CHECK (level BETWEEN 1 AND 5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT CHECK (type IN ('weekly','monthly')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  highlights TEXT,
  improvements TEXT,
  next_plans TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- Row Level Security (RLS) Policies
-- ═══════════════════════════════════════

ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parenting ENABLE ROW LEVEL SECURITY;
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Diaries policies
CREATE POLICY "Users can view own diaries" ON diaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diaries" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diaries" ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diaries" ON diaries FOR DELETE USING (auth.uid() = user_id);

-- Videos policies
CREATE POLICY "Users can view own videos" ON videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own videos" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own videos" ON videos FOR DELETE USING (auth.uid() = user_id);

-- Contents policies
CREATE POLICY "Users can view own contents" ON contents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contents" ON contents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contents" ON contents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contents" ON contents FOR DELETE USING (auth.uid() = user_id);

-- Parenting policies
CREATE POLICY "Users can view own parenting" ON parenting FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own parenting" ON parenting FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parenting" ON parenting FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parenting" ON parenting FOR DELETE USING (auth.uid() = user_id);

-- Career policies
CREATE POLICY "Users can view own career" ON career FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own career" ON career FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own career" ON career FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own career" ON career FOR DELETE USING (auth.uid() = user_id);

-- Finance policies
CREATE POLICY "Users can view own finance" ON finance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own finance" ON finance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own finance" ON finance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own finance" ON finance FOR DELETE USING (auth.uid() = user_id);

-- Energy logs policies
CREATE POLICY "Users can view own energy_logs" ON energy_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy_logs" ON energy_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy_logs" ON energy_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy_logs" ON energy_logs FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
