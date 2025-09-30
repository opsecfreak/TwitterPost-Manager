import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "@/components/Layout"

export default function AuthError() {
  const router = useRouter()
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (router.query.error) {
      setError(router.query.error as string)
    }
  }, [router.query.error])

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Access was denied. You may have cancelled the authentication process."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "Default":
        return "An unexpected error occurred during authentication."
      default:
        return "An unknown error occurred during authentication."
    }
  }

  return (
    <Layout title="Authentication Error">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-red-900 mb-2">
            Authentication Error
          </h1>
          
          <p className="text-red-700 mb-6">
            {error ? getErrorMessage(error) : "An error occurred during authentication."}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>If this problem persists, please check:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• Your Twitter app configuration</li>
            <li>• Environment variables are set correctly</li>
            <li>• Callback URLs match your application settings</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}