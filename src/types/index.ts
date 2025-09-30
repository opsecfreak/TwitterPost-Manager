import { TweetV2PostTweetResult } from "twitter-api-v2"

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
  description?: string
  verified?: boolean
  created_at?: string
}

export interface TweetData {
  text: string
  media_ids?: string[]
}

export interface TweetResult {
  success: boolean
  data?: TweetV2PostTweetResult
  error?: string
}

export interface FacebookUser {
  id: string
  name: string
  email?: string
  picture?: {
    data: {
      url: string
    }
  }
}

export interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
  category_list?: Array<{
    id: string
    name: string
  }>
}

export interface FacebookPostData {
  message: string
  link?: string
  published?: boolean
}

export interface FacebookPostResult {
  success: boolean
  data?: {
    id: string
    post_id?: string
  }
  error?: string
}

export interface DraftPost {
  id: string
  title: string
  content: string
  platform: "twitter" | "facebook"
  facebookPageId?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface OptimizeRequest {
  content: string
  platform: "twitter" | "facebook"
  tone?: "professional" | "casual" | "engaging" | "informative"
  audience?: string
}

export interface OptimizeResponse {
  success: boolean
  data?: {
    originalContent: string
    optimizedContent: string
    suggestions: string[]
    characterCount: number
    platformLimits: {
      twitter: number
      facebook: number
    }
  }
  error?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HealthStatus {
  status: "ok" | "error"
  timestamp: string
  uptime: number
  environment: string
  services: {
    database?: "connected" | "disconnected"
    twitter_api?: "configured" | "not_configured"
    facebook_api?: "configured" | "not_configured"
    openai_api?: "configured" | "not_configured"
    nextauth?: "configured" | "not_configured"
  }
  version?: string
}

export type Platform = "twitter" | "facebook"
export type PostTone = "professional" | "casual" | "engaging" | "informative"