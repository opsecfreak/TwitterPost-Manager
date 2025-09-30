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
    nextauth?: "configured" | "not_configured"
  }
  version?: string
}