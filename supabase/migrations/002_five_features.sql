-- 1. 灵感捕捉表
CREATE TABLE IF NOT EXISTS inspirations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('新词概念','新工具','创意想法','待深挖话题','其他')),
  status TEXT NOT NULL DEFAULT '待挖掘' CHECK (status IN ('待挖掘','已深入','已放弃')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own inspirations" ON inspirations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. 能量日志加高效时段
ALTER TABLE energy_logs ADD COLUMN IF NOT EXISTS peak_time TEXT CHECK (peak_time IN ('morning','afternoon','evening'));

-- 3. 习惯表 + 打卡日志
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own habits" ON habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own habit_logs" ON habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. 内容收藏加要点
ALTER TABLE contents ADD COLUMN IF NOT EXISTS key_points TEXT[] DEFAULT '{}';

-- 5. 周复盘加字段
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS biggest_challenge TEXT DEFAULT '';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS peak_energy_moment TEXT DEFAULT '';
