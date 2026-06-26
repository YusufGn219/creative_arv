export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string | null
  avatar: string | null
  avatar_url: string | null
  date_joined: string
  article_count?: number
  post_count?: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Article {
  id: number
  author: User | null
  category: Category | null
  tags: Tag[]
  title: string
  slug: string
  description: string
  content: object
  is_published: boolean
  is_approved: boolean
  is_banned: boolean
  reading_time: number
  comment_count?: number
  created_at: string
  updated_at: string
}

export interface Forum {
  id: number
  created_by: User | null
  category: Category | null
  tags: Tag[]
  title: string
  slug: string
  description: string
  rules: string
  is_published: boolean
  is_approved: boolean
  is_pinned: boolean
  is_banned: boolean
  post_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  forum: number
  forum_slug?: string
  author: User | null
  title: string
  slug: string
  body: object | string
  article_ref?: { title: string; slug: string } | null
  is_published: boolean
  is_approved: boolean
  is_banned: boolean
  reply_count?: number
  comments_count?: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  author: User | null
  body: string
  is_deleted: boolean
  parent: number | null
  replies: Comment[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
