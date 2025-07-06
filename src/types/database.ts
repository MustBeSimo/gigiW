export interface Profile {
  id: string
  updated_at: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_status: 'free' | 'premium'
  subscription_end_date: string | null
  stripe_customer_id: string | null
  avatar_style: 'friend' | 'professional' | 'minimal' | null
  created_at: string
}

export interface MoodLog {
  id: string
  user_id: string
  mood_emoji: string | null
  mood_rating: number | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  price_id: string | null
  quantity: number | null
  cancel_at_period_end: boolean | null
  cancel_at: string | null
  canceled_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  created: string
  ended_at: string | null
  trial_start: string | null
  trial_end: string | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'id'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created'>
        Update: Partial<Omit<Subscription, 'id' | 'user_id'>>
      }
      mood_logs: {
        Row: MoodLog
        Insert: Omit<MoodLog, 'id' | 'created_at'>
        Update: Partial<Omit<MoodLog, 'id' | 'user_id'>>
      }
    }
    Functions: {
      is_subscription_active: (user_id: string) => boolean
    }
  }
} 