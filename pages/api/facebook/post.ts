import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import FacebookClient from "@/lib/facebook"

interface FacebookPostRequest {
  message: string
  pageId: string
  pageAccessToken: string
  link?: string
  published?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.accessToken) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    if (session.provider !== "facebook") {
      return res.status(400).json({ error: "Not authenticated with Facebook" })
    }

    // Validate request body
    const { message, pageId, pageAccessToken, link, published }: FacebookPostRequest = req.body

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Post message is required" })
    }

    if (!pageId || !pageAccessToken) {
      return res.status(400).json({ error: "Page ID and access token are required" })
    }

    // Create Facebook client instance
    const facebookClient = new FacebookClient(session.accessToken)

    // Post to the Facebook page
    const result = await facebookClient.postToPage(
      pageId,
      pageAccessToken,
      {
        message: message.trim(),
        link,
        published: published !== false, // Default to true
      }
    )

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: "Posted to Facebook successfully!",
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error: any) {
    console.error("Error in /api/facebook/post:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    })
  }
}