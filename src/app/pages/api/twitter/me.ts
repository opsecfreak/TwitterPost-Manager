import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { TwitterApi } from "twitter-api-v2"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.accessToken) {
    return res.status(401).json({ error: "Not authenticated" })
  }

  const client = new TwitterApi(session.accessToken as string)
  const me = await client.v2.me()
  res.json(me)
}
