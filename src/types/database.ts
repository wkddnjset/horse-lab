// Supabase Database Types
// NOTE: 이 파일은 수동 정의입니다. 프로덕션에서는 supabase gen types 사용을 권장합니다.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          kakao_id: string | null
          nickname: string
          avatar_url: string | null
          subscription_status: 'free' | 'premium'
          is_admin: boolean
          free_race_date: string | null
          free_race_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      races: {
        Row: {
          id: string
          race_date: string
          race_number: number
          venue: 'seoul' | 'busan' | 'jeju'
          distance: number
          track_condition: string | null
          track_type: string | null
          start_time: string | null
          entries_count: number
          status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['races']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['races']['Insert']>
      }
      horses: {
        Row: {
          id: string
          name: string
          age: number | null
          sex: string | null
          total_races: number
          win_count: number
          place_count: number
          show_count: number
          rating: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['horses']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['horses']['Insert']>
      }
      jockeys: {
        Row: {
          id: string
          name: string
          win_rate: number | null
          recent_form: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['jockeys']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['jockeys']['Insert']>
      }
      race_entries: {
        Row: {
          id: string
          race_id: string
          horse_id: string
          jockey_id: string | null
          gate_number: number
          horse_weight: number | null
          odds: number | null
        }
        Insert: Database['public']['Tables']['race_entries']['Row']
        Update: Partial<Database['public']['Tables']['race_entries']['Insert']>
      }
      race_results: {
        Row: {
          id: string
          race_id: string
          horse_id: string
          finish_position: number
          finish_time: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['race_results']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['race_results']['Insert']>
      }
      strategy_predictions: {
        Row: {
          id: string
          race_id: string
          strategy_type: 'stats' | 'record' | 'chemistry' | 'health' | 'pace' | 'course' | 'weight'
          rank: number
          horse_id: string
          score: number
          reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['strategy_predictions']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['strategy_predictions']['Insert']>
      }
      user_picks: {
        Row: {
          id: string
          user_id: string
          race_id: string
          weights: Json
          result: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_picks']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_picks']['Insert']>
      }
      user_pick_presets: {
        Row: {
          id: string
          user_id: string
          name: string
          weights: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_pick_presets']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_pick_presets']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          paddle_subscription_id: string | null
          paddle_customer_id: string | null
          status: 'active' | 'cancelled' | 'paused' | 'past_due' | 'inactive'
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      data_sync_logs: {
        Row: {
          id: string
          sync_type: string
          status: 'in_progress' | 'success' | 'failed'
          records_count: number | null
          error_message: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['data_sync_logs']['Row'], 'started_at'>
        Update: Partial<Database['public']['Tables']['data_sync_logs']['Insert']>
      }
      prediction_logs: {
        Row: {
          id: string
          race_id: string
          strategy_type: string
          status: 'success' | 'failed'
          execution_time_ms: number | null
          error_message: string | null
        }
        Insert: Database['public']['Tables']['prediction_logs']['Row']
        Update: Partial<Database['public']['Tables']['prediction_logs']['Insert']>
      }
    }
  }
}
