import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import OpenAI from "openai"

interface OptimizeRequest {
  content: string
  platform: "twitter" | "facebook"
  tone?: "professional" | "casual" | "engaging" | "informative"
  audience?: string
}

interface OptimizeResponse {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OptimizeResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed" 
    })
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user) {
      return res.status(401).json({ 
        success: false,
        error: "Not authenticated" 
      })
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OpenAI API key not configured"
      })
    }

    // Validate request body
    const { content, platform, tone = "engaging", audience }: OptimizeRequest = req.body

    if (!content || typeof content !== "string") {
      return res.status(400).json({ 
        success: false,
        error: "Content is required" 
      })
    }

    if (!platform || !["twitter", "facebook"].includes(platform)) {
      return res.status(400).json({ 
        success: false,
        error: "Platform must be either 'twitter' or 'facebook'" 
      })
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Define platform-specific constraints and guidelines
    const platformGuidelines = {
      twitter: {
        maxLength: 280,
        suggestions: [
          "Use hashtags strategically (1-3 relevant hashtags)",
          "Include engaging questions to drive interaction",
          "Keep it concise and punchy",
          "Use emojis sparingly but effectively",
          "Include a clear call-to-action if appropriate"
        ]
      },
      facebook: {
        maxLength: 2000, // Recommended for better engagement
        suggestions: [
          "Tell a story or share insights",
          "Use line breaks for better readability",
          "Ask questions to encourage comments",
          "Include relevant links if appropriate",
          "Use emojis to add personality"
        ]
      }
    }

    const currentPlatform = platformGuidelines[platform]
    
    // Create the optimization prompt
    const prompt = `
You are a social media expert specializing in ${platform} content optimization. 

Original content: "${content}"
Platform: ${platform}
Desired tone: ${tone}
${audience ? `Target audience: ${audience}` : ''}

Guidelines for ${platform}:
- Maximum recommended length: ${currentPlatform.maxLength} characters
- ${currentPlatform.suggestions.join('\n- ')}

Please optimize this content for ${platform} following these requirements:
1. Keep the core message intact
2. Make it more engaging and ${tone}
3. Ensure it's within ${currentPlatform.maxLength} characters
4. Apply platform-specific best practices
5. Make it more likely to generate engagement

Respond with ONLY the optimized content, no explanations or additional text.
    `

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional social media content optimizer. Respond only with the optimized content, no additional explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const optimizedContent = completion.choices[0]?.message?.content?.trim()

    if (!optimizedContent) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate optimized content"
      })
    }

    // Generate suggestions based on the platform
    const suggestions = [
      ...currentPlatform.suggestions,
      `Current length: ${optimizedContent.length} characters`,
      `Platform limit: ${currentPlatform.maxLength} characters`,
    ]

    res.status(200).json({
      success: true,
      data: {
        originalContent: content,
        optimizedContent,
        suggestions,
        characterCount: optimizedContent.length,
        platformLimits: {
          twitter: platformGuidelines.twitter.maxLength,
          facebook: platformGuidelines.facebook.maxLength,
        }
      }
    })

  } catch (error: any) {
    console.error("Error in /api/optimize:", error)
    
    let errorMessage = "Failed to optimize content"
    
    if (error.code === "invalid_api_key") {
      errorMessage = "Invalid OpenAI API key"
    } else if (error.code === "insufficient_quota") {
      errorMessage = "OpenAI API quota exceeded"
    } else if (error.message) {
      errorMessage = error.message
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}