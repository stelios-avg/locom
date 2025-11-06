import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Neighborhood = Database['public']['Tables']['neighborhoods']['Row']

export type PostType = 'feed' | 'marketplace' | 'event'

export interface PostWithUser extends Post {
  profiles: Profile
  comments_count?: number
}

export interface CommentWithUser extends Comment {
  profiles: Profile
}

