import axios from "axios"

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

export class FacebookClient {
  private accessToken: string
  private baseUrl = "https://graph.facebook.com/v18.0"

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Get the authenticated user's profile information
   */
  async getMe(): Promise<FacebookUser | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: "id,name,email,picture",
          access_token: this.accessToken,
        },
      })
      
      return response.data as FacebookUser
    } catch (error: any) {
      console.error("Error fetching Facebook user profile:", error.response?.data || error.message)
      return null
    }
  }

  /**
   * Get user's Facebook pages that they can manage
   */
  async getUserPages(): Promise<FacebookPage[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          fields: "id,name,access_token,category,category_list",
          access_token: this.accessToken,
        },
      })
      
      return response.data.data || []
    } catch (error: any) {
      console.error("Error fetching Facebook pages:", error.response?.data || error.message)
      return []
    }
  }

  /**
   * Post to a Facebook page
   */
  async postToPage(
    pageId: string, 
    pageAccessToken: string, 
    postData: FacebookPostData
  ): Promise<FacebookPostResult> {
    try {
      // Validate post data
      if (!postData.message || postData.message.trim().length === 0) {
        return {
          success: false,
          error: "Post message cannot be empty",
        }
      }

      // Facebook has a character limit of 63,206 characters, but for better engagement,
      // we recommend keeping posts shorter
      if (postData.message.length > 2000) {
        return {
          success: false,
          error: "Post message is too long. Consider keeping it under 2000 characters for better engagement.",
        }
      }

      const postPayload: any = {
        message: postData.message,
        access_token: pageAccessToken,
      }

      // Add link if provided
      if (postData.link) {
        postPayload.link = postData.link
      }

      // Set published status (default to true for immediate posting)
      if (postData.published !== undefined) {
        postPayload.published = postData.published
      }

      const response = await axios.post(
        `${this.baseUrl}/${pageId}/feed`,
        postPayload
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error posting to Facebook page:", error.response?.data || error.message)
      
      let errorMessage = "Failed to post to Facebook page"
      
      // Handle specific Facebook API errors
      if (error.response?.data?.error) {
        const fbError = error.response.data.error
        switch (fbError.code) {
          case 190:
            errorMessage = "Invalid access token. Please re-authenticate with Facebook"
            break
          case 200:
            errorMessage = "Insufficient permissions to post to this page"
            break
          case 368:
            errorMessage = "The user has been temporarily blocked from posting"
            break
          case 506:
            errorMessage = "Duplicate post detected"
            break
          default:
            errorMessage = fbError.message || errorMessage
        }
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Get posts from a Facebook page
   */
  async getPagePosts(pageId: string, pageAccessToken: string, limit: number = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/${pageId}/posts`, {
        params: {
          fields: "id,message,created_time,likes.summary(true),comments.summary(true),shares",
          limit,
          access_token: pageAccessToken,
        },
      })
      
      return response.data.data || []
    } catch (error: any) {
      console.error("Error fetching page posts:", error.response?.data || error.message)
      return []
    }
  }

  /**
   * Validate Facebook API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.getMe()
      return true
    } catch (error) {
      console.error("Facebook API connection failed:", error)
      return false
    }
  }

  /**
   * Get long-lived page access token
   */
  async getLongLivedPageToken(pageId: string, shortLivedToken: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      })
      
      return response.data.access_token
    } catch (error: any) {
      console.error("Error getting long-lived token:", error.response?.data || error.message)
      return null
    }
  }
}

export default FacebookClient