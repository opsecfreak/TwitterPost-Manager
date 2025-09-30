import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import TwitterClient from "@/lib/twitter"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.accessToken) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // Create Twitter client instance
    const twitterClient = new TwitterClient(session.accessToken)

    // Get user profile
    const userProfile = await twitterClient.getMe()

    if (!userProfile) {
      return res.status(500).json({ error: "Failed to fetch user profile" })
    }

    res.status(200).json({
      success: true,
      data: userProfile,
    })
  } catch (error: any) {
    console.error("Error in /api/twitter/me:", error)
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    })
  }
}