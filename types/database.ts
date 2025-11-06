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
          bio: string | null
          avatar_url: string | null
          neighborhood: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          bio?: string | null
          avatar_url?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          bio?: string | null
          avatar_url?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
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

