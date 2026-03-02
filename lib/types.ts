export interface Diary {
  id: string
  user_id: string
  title: string
  body: string
  mood: '开心' | '思考' | '疲惫' | '充实' | '焦虑' | '幸福'
  important_thing: string
  gain: string
  tomorrow: string
  self_note: string
  energy_level: 1 | 2 | 3 | 4 | 5
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  title: string
  video_url: string
  douyin_url: string
  thumbnail_url: string
  tags: string[]
  description: string
  created_at: string
}

export interface Content {
  id: string
  user_id: string
  url: string
  title: string
  summary: string
  my_note: string
  category: '职场' | '育儿' | '理财' | '个人成长' | '其他'
  source_type: 'wechat' | 'youtube' | 'web'
  created_at: string
}

export interface Parenting {
  id: string
  user_id: string
  title: string
  content: string
  milestone_age: string
  tags: string[]
  created_at: string
}

export interface Career {
  id: string
  user_id: string
  type: 'goal' | 'decision' | 'learning'
  title: string
  content: string
  progress: number
  created_at: string
}

export interface Finance {
  id: string
  user_id: string
  goal_name: string
  target_amount: number
  current_amount: number
  note: string
  created_at: string
  updated_at: string
}

export interface EnergyLog {
  id: string
  user_id: string
  level: 1 | 2 | 3 | 4 | 5
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  type: 'weekly' | 'monthly'
  period_start: string
  period_end: string
  highlights: string
  improvements: string
  next_plans: string
  stats: Record<string, unknown>
  created_at: string
}

export interface Database {
  diaries: Diary
  videos: Video
  contents: Content
  parenting: Parenting
  career: Career
  finance: Finance
  energy_logs: EnergyLog
  reviews: Review
}
