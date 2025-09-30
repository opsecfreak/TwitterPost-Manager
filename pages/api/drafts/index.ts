import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { v4 as uuidv4 } from "uuid"

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

// In a real application, you would use a database
// For this demo, we'll use a simple in-memory store
const draftsStore: { [userId: string]: DraftPost[] } = {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    const userId = session.user.email // Using email as user ID for simplicity

    switch (req.method) {
      case "GET":
        // Get all drafts for the user
        const userDrafts = draftsStore[userId] || []
        res.status(200).json({
          success: true,
          data: userDrafts,
        })
        break

      case "POST":
        // Create a new draft
        const { title, content, platform, facebookPageId } = req.body

        if (!title || !content || !platform) {
          return res.status(400).json({ error: "Title, content, and platform are required" })
        }

        if (!["twitter", "facebook"].includes(platform)) {
          return res.status(400).json({ error: "Platform must be either 'twitter' or 'facebook'" })
        }

        const newDraft: DraftPost = {
          id: uuidv4(),
          title: title.trim(),
          content: content.trim(),
          platform,
          facebookPageId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId,
        }

        if (!draftsStore[userId]) {
          draftsStore[userId] = []
        }
        
        draftsStore[userId].push(newDraft)

        res.status(201).json({
          success: true,
          data: newDraft,
          message: "Draft created successfully",
        })
        break

      case "PUT":
        // Update an existing draft
        const { id, title: updateTitle, content: updateContent, platform: updatePlatform, facebookPageId: updatePageId } = req.body

        if (!id) {
          return res.status(400).json({ error: "Draft ID is required" })
        }

        if (!draftsStore[userId]) {
          return res.status(404).json({ error: "Draft not found" })
        }

        const draftIndex = draftsStore[userId].findIndex(draft => draft.id === id)
        
        if (draftIndex === -1) {
          return res.status(404).json({ error: "Draft not found" })
        }

        // Update the draft
        const updatedDraft = {
          ...draftsStore[userId][draftIndex],
          ...(updateTitle && { title: updateTitle.trim() }),
          ...(updateContent && { content: updateContent.trim() }),
          ...(updatePlatform && { platform: updatePlatform }),
          ...(updatePageId && { facebookPageId: updatePageId }),
          updatedAt: new Date().toISOString(),
        }

        draftsStore[userId][draftIndex] = updatedDraft

        res.status(200).json({
          success: true,
          data: updatedDraft,
          message: "Draft updated successfully",
        })
        break

      case "DELETE":
        // Delete a draft
        const { id: deleteId } = req.query

        if (!deleteId || typeof deleteId !== "string") {
          return res.status(400).json({ error: "Draft ID is required" })
        }

        if (!draftsStore[userId]) {
          return res.status(404).json({ error: "Draft not found" })
        }

        const deleteIndex = draftsStore[userId].findIndex(draft => draft.id === deleteId)
        
        if (deleteIndex === -1) {
          return res.status(404).json({ error: "Draft not found" })
        }

        const deletedDraft = draftsStore[userId].splice(deleteIndex, 1)[0]

        res.status(200).json({
          success: true,
          data: deletedDraft,
          message: "Draft deleted successfully",
        })
        break

      default:
        res.status(405).json({ error: "Method not allowed" })
    }
  } catch (error: any) {
    console.error("Error in /api/drafts:", error)
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    })
  }
}