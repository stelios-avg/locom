export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          email: string | null
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          neighborhood: string | null
          latitude: number | null
          longitude: number | null
          plan: string
          is_pro: boolean
          is_admin: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          email?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          plan?: string
          is_pro?: boolean
          is_admin?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          email?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          plan?: string
          is_pro?: boolean
          is_admin?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          post_type: 'feed' | 'marketplace' | 'event'
          category: string | null
          latitude: number | null
          longitude: number | null
          location_name: string | null
          price: number | null
          event_date: string | null
          event_location: string | null
          status: string | null
          hidden: boolean | null
          moderation_notes: string | null
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          post_type: 'feed' | 'marketplace' | 'event'
          category?: string | null
          latitude?: number | null
          longitude?: number | null
          location_name?: string | null
          price?: number | null
          event_date?: string | null
          event_location?: string | null
          status?: string | null
          hidden?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          post_type?: 'feed' | 'marketplace' | 'event'
          category?: string | null
          latitude?: number | null
          longitude?: number | null
          location_name?: string | null
          price?: number | null
          event_date?: string | null
          event_location?: string | null
          status?: string | null
          hidden?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      neighborhoods: {
        Row: {
          id: string
          name: string
          city: string
          latitude: number
          longitude: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          latitude: number
          longitude: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          latitude?: number
          longitude?: number
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          status: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      post_type: 'feed' | 'marketplace' | 'event'
    }
  }
}

