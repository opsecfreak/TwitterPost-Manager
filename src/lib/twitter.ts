import { TwitterApi, TwitterV2IncludesHelper, TweetV2PostTweetResult } from "twitter-api-v2"

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
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

export class TwitterClient {
  private client: TwitterApi

  constructor(accessToken: string) {
    this.client = new TwitterApi(accessToken)
  }

  /**
   * Get the authenticated user's profile information
   */
  async getMe(): Promise<TwitterUser | null> {
    try {
      const response = await this.client.v2.me({
        "user.fields": ["profile_image_url", "public_metrics"],
      })
      
      return response.data as TwitterUser
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  /**
   * Post a tweet on behalf of the authenticated user
   */
  async postTweet(tweetData: TweetData): Promise<TweetResult> {
    try {
      // Validate tweet text length (Twitter's limit is 280 characters)
      if (tweetData.text.length > 280) {
        return {
          success: false,
          error: "Tweet text exceeds 280 character limit",
        }
      }

      if (tweetData.text.trim().length === 0) {
        return {
          success: false,
          error: "Tweet text cannot be empty",
        }
      }

      const tweetPayload: any = {
        text: tweetData.text,
      }

      // Add media if provided
      if (tweetData.media_ids && tweetData.media_ids.length > 0) {
        tweetPayload.media = {
          media_ids: tweetData.media_ids,
        }
      }

      const response = await this.client.v2.tweet(tweetPayload)

      return {
        success: true,
        data: response,
      }
    } catch (error: any) {
      console.error("Error posting tweet:", error)
      
      let errorMessage = "Failed to post tweet"
      
      // Handle specific Twitter API errors
      if (error.code === 401) {
        errorMessage = "Unauthorized: Please re-authenticate with Twitter"
      } else if (error.code === 403) {
        errorMessage = "Forbidden: You don't have permission to post tweets"
      } else if (error.code === 429) {
        errorMessage = "Rate limit exceeded: Please wait before posting again"
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Upload media (images, videos) to Twitter
   */
  async uploadMedia(mediaBuffer: Buffer, mediaType: string): Promise<string | null> {
    try {
      const mediaId = await this.client.v1.uploadMedia(mediaBuffer, {
        mimeType: mediaType,
      })
      return mediaId
    } catch (error) {
      console.error("Error uploading media:", error)
      return null
    }
  }

  /**
   * Get user's recent tweets
   */
  async getUserTweets(userId: string, maxResults: number = 10) {
    try {
      const response = await this.client.v2.userTimeline(userId, {
        max_results: maxResults,
        "tweet.fields": ["created_at", "public_metrics", "attachments"],
      })
      
      return response.data
    } catch (error) {
      console.error("Error fetching user tweets:", error)
      return null
    }
  }

  /**
   * Validate Twitter API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.client.v2.me()
      return true
    } catch (error) {
      console.error("Twitter API connection failed:", error)
      return false
    }
  }
}

export default TwitterClient