import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import { TwitterUser, FacebookUser, FacebookPage, DraftPost, Platform, PostTone } from "@/types"

interface PostComposerProps {
  platform: Platform
  facebookPages?: FacebookPage[]
  onPostSuccess: () => void
}

function PostComposer({ platform, facebookPages, onPostSuccess }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [selectedPageId, setSelectedPageId] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [tone, setTone] = useState<PostTone>("engaging")

  const maxLength = platform === "twitter" ? 280 : 2000
  const remainingChars = maxLength - content.length

  const handleOptimize = async () => {
    if (!content.trim()) {
      setMessage({ type: "error", text: "Please enter some content to optimize" })
      return
    }

    setIsOptimizing(true)
    setMessage(null)

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platform,
          tone,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setContent(result.data.optimizedContent)
        setMessage({ type: "success", text: "Content optimized successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to optimize content" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setMessage({ type: "error", text: "Please enter some content for your post" })
      return
    }

    if (content.length > maxLength) {
      setMessage({ type: "error", text: `Post is ${content.length - maxLength} characters too long` })
      return
    }

    if (platform === "facebook" && !selectedPageId) {
      setMessage({ type: "error", text: "Please select a Facebook page to post to" })
      return
    }

    setIsPosting(true)
    setMessage(null)

    try {
      const endpoint = platform === "twitter" ? "/api/twitter/post" : "/api/facebook/post"
      const requestBody = platform === "twitter" 
        ? { text: content }
        : { 
            message: content, 
            pageId: selectedPageId, 
            pageAccessToken: facebookPages?.find(p => p.id === selectedPageId)?.access_token 
          }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: `Posted to ${platform} successfully!` })
        setContent("")
        onPostSuccess()
      } else {
        setMessage({ type: "error", text: result.error || `Failed to post to ${platform}` })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Compose Post for {platform === "twitter" ? "Twitter" : "Facebook"}
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as PostTone)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="engaging">Engaging</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="informative">Informative</option>
          </select>
          <button
            type="button"
            onClick={handleOptimize}
            disabled={isOptimizing || !content.trim()}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Optimizing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Optimize
              </>
            )}
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {platform === "facebook" && facebookPages && facebookPages.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Facebook Page
            </label>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a page...</option>
              {facebookPages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={platform === "twitter" ? "What's happening?" : "What's on your mind?"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={isPosting || isOptimizing}
          />
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-sm ${
                remainingChars < 0
                  ? "text-red-500"
                  : remainingChars < (platform === "twitter" ? 20 : 100)
                  ? "text-orange-500"
                  : "text-gray-500"
              }`}
            >
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPosting || isOptimizing || !content.trim() || remainingChars < 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPosting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting...
            </div>
          ) : (
            `Post to ${platform === "twitter" ? "Twitter" : "Facebook"}`
          )}
        </button>
      </form>
    </div>
  )
}

function DraftManager() {
  const [drafts, setDrafts] = useState<DraftPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDraft, setEditingDraft] = useState<DraftPost | null>(null)

  const fetchDrafts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/drafts")
      const result = await response.json()
      if (result.success) {
        setDrafts(result.data)
      }
    } catch (error) {
      console.error("Error fetching drafts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDrafts()
  }, [])

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/drafts?id=${draftId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setDrafts(drafts.filter(draft => draft.id !== draftId))
      }
    } catch (error) {
      console.error("Error deleting draft:", error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Draft Posts</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Draft
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : drafts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No drafts yet. Create your first draft!</p>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{draft.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{draft.content}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {draft.platform}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setEditingDraft(draft)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TwitterProfile({ user }: { user: TwitterUser }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Twitter Profile</h2>
      
      <div className="flex items-center space-x-4">
        {user.profile_image_url && (
          <img
            src={user.profile_image_url}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>

      {user.public_metrics && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.public_metrics.followers_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.public_metrics.following_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.public_metrics.tweet_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Tweets</div>
          </div>
        </div>
      )}
    </div>
  )
}

function FacebookProfile({ user, pages }: { user: FacebookUser; pages: FacebookPage[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Facebook Profile</h2>
      
      <div className="flex items-center space-x-4 mb-4">
        {user.picture?.data?.url && (
          <img
            src={user.picture.data.url}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {pages.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Your Pages ({pages.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <span className="text-sm font-medium">{page.name}</span>
                <span className="text-xs text-gray-500">{page.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("twitter")
  const [twitterProfile, setTwitterProfile] = useState<TwitterUser | null>(null)
  const [facebookData, setFacebookData] = useState<{ user: FacebookUser; pages: FacebookPage[] } | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!session) return

    setIsLoadingProfile(true)
    setProfileError(null)

    try {
      if (session.provider === "twitter") {
        const response = await fetch("/api/twitter/me")
        const result = await response.json()
        if (result.success) {
          setTwitterProfile(result.data)
        } else {
          setProfileError(result.error || "Failed to load Twitter profile")
        }
      } else if (session.provider === "facebook") {
        const response = await fetch("/api/facebook/me")
        const result = await response.json()
        if (result.success) {
          setFacebookData(result.data)
        } else {
          setProfileError(result.error || "Failed to load Facebook profile")
        }
      }
    } catch (error) {
      setProfileError("Network error. Please try again.")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchProfile()
      if (session.provider) {
        setSelectedPlatform(session.provider as Platform)
      }
    }
  }, [session])

  if (status === "loading") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Social Media Manager
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your social media accounts to start managing your posts with AI-powered optimization.
            </p>
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in with Twitter or Facebook to compose, optimize, and post content.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Multi-platform support (Twitter & Facebook)</p>
                <p>✓ AI-powered content optimization</p>
                <p>✓ Draft management system</p>
                <p>✓ Secure OAuth authentication</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            {session.provider && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Post to:</span>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {session.provider === "twitter" && <option value="twitter">Twitter</option>}
                  {session.provider === "facebook" && <option value="facebook">Facebook</option>}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            {isLoadingProfile ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading profile...</span>
                </div>
              </div>
            ) : profileError ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-red-600">
                  <p>Error loading profile: {profileError}</p>
                  <button
                    onClick={fetchProfile}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : session.provider === "twitter" && twitterProfile ? (
              <TwitterProfile user={twitterProfile} />
            ) : session.provider === "facebook" && facebookData ? (
              <FacebookProfile user={facebookData.user} pages={facebookData.pages} />
            ) : null}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Post Composer */}
            <PostComposer 
              platform={selectedPlatform}
              facebookPages={facebookData?.pages}
              onPostSuccess={fetchProfile}
            />

            {/* Draft Manager */}
            <DraftManager />
          </div>
        </div>
      </div>
    </Layout>
  )
}