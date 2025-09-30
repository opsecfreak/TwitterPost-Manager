import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import FacebookClient from "@/lib/facebook"

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

    if (session.provider !== "facebook") {
      return res.status(400).json({ error: "Not authenticated with Facebook" })
    }

    // Create Facebook client instance
    const facebookClient = new FacebookClient(session.accessToken)

    // Get user profile
    const userProfile = await facebookClient.getMe()

    if (!userProfile) {
      return res.status(500).json({ error: "Failed to fetch Facebook user profile" })
    }

    // Get user's pages
    const userPages = await facebookClient.getUserPages()

    res.status(200).json({
      success: true,
      data: {
        user: userProfile,
        pages: userPages,
      },
    })
  } catch (error: any) {
    console.error("Error in /api/facebook/me:", error)
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    })
  }
}