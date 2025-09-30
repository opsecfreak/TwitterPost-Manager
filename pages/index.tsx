import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import { TwitterUser } from "@/types"

interface TweetComposerProps {
  onTweetPosted: () => void
}

function TweetComposer({ onTweetPosted }: TweetComposerProps) {
  const [tweetText, setTweetText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const maxLength = 280
  const remainingChars = maxLength - tweetText.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tweetText.trim()) {
      setMessage({ type: "error", text: "Please enter some text for your tweet" })
      return
    }

    if (tweetText.length > maxLength) {
      setMessage({ type: "error", text: `Tweet is ${tweetText.length - maxLength} characters too long` })
      return
    }

    setIsPosting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/twitter/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweetText }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: "Tweet posted successfully!" })
        setTweetText("")
        onTweetPosted()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to post tweet" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Compose Tweet</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="What's happening?"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={isPosting}
          />
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-sm ${
                remainingChars < 0
                  ? "text-red-500"
                  : remainingChars < 20
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
          disabled={isPosting || !tweetText.trim() || remainingChars < 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPosting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting...
            </div>
          ) : (
            "Post Tweet"
          )}
        </button>
      </form>
    </div>
  )
}

function UserProfile({ user }: { user: TwitterUser }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
      
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

export default function Home() {
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<TwitterUser | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const fetchUserProfile = async () => {
    if (!session) return

    setIsLoadingProfile(true)
    setProfileError(null)

    try {
      const response = await fetch("/api/twitter/me")
      const result = await response.json()

      if (result.success) {
        setUserProfile(result.data)
      } else {
        setProfileError(result.error || "Failed to load profile")
      }
    } catch (error) {
      setProfileError("Network error. Please try again.")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUserProfile()
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
              Connect your Twitter account to start managing your social media posts.
            </p>
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in with your Twitter account to compose and post tweets directly from this app.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Secure OAuth 2.0 authentication</p>
                <p>✓ Post tweets on your behalf</p>
                <p>✓ View your profile information</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile */}
          <div>
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
                    onClick={fetchUserProfile}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : userProfile ? (
              <UserProfile user={userProfile} />
            ) : null}
          </div>

          {/* Tweet Composer */}
          <div>
            <TweetComposer onTweetPosted={fetchUserProfile} />
          </div>
        </div>
      </div>
    </Layout>
  )
}