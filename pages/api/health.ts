import { NextApiRequest, NextApiResponse } from "next"

interface HealthResponse {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {},
    })
  }

  try {
    // Check Twitter API configuration
    const twitterConfigured = !!(
      process.env.TWITTER_CLIENT_ID && 
      process.env.TWITTER_CLIENT_SECRET
    )

    // Check Facebook API configuration
    const facebookConfigured = !!(
      process.env.FACEBOOK_CLIENT_ID && 
      process.env.FACEBOOK_CLIENT_SECRET
    )

    // Check OpenAI API configuration
    const openaiConfigured = !!process.env.OPENAI_API_KEY

    // Check NextAuth configuration
    const nextAuthConfigured = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.NEXTAUTH_URL
    )

    const healthData: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        twitter_api: twitterConfigured ? "configured" : "not_configured",
        facebook_api: facebookConfigured ? "configured" : "not_configured",
        openai_api: openaiConfigured ? "configured" : "not_configured",
        nextauth: nextAuthConfigured ? "configured" : "not_configured",
      },
      version: process.env.npm_package_version || "unknown",
    }

    // Set appropriate status code based on service health
    const allServicesHealthy = twitterConfigured && facebookConfigured && openaiConfigured && nextAuthConfigured
    const statusCode = allServicesHealthy ? 200 : 503

    res.status(statusCode).json(healthData)
  } catch (error) {
    console.error("Health check error:", error)
    
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {},
    })
  }
}