import { ReactNode } from "react"
import Head from "next/head"
import AuthButton from "./AuthButton"

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function Layout({
  children,
  title = "Social Media Manager",
  description = "Manage your social media posts from one place",
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Social Media Manager
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <AuthButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500">
              <p>&copy; 2024 Social Media Manager. Built with Next.js and NextAuth.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}