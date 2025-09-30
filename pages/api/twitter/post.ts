import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import TwitterClient from "@/lib/twitter"
import { TweetData } from "@/types"

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

    // Validate request body
    const { text, media_ids }: TweetData = req.body

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Tweet text is required" })
    }

    // Create Twitter client instance
    const twitterClient = new TwitterClient(session.accessToken)

    // Post the tweet
    const result = await twitterClient.postTweet({
      text: text.trim(),
      media_ids,
    })

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: "Tweet posted successfully!",
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error: any) {
    console.error("Error in /api/twitter/post:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    })
  }
}