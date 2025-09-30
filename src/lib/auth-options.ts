import TwitterProvider from "next-auth/providers/twitter"
import FacebookProvider from "next-auth/providers/facebook"
import type { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    provider?: string
    facebookPageTokens?: { [pageId: string]: string }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    provider?: string
    facebookPageTokens?: { [pageId: string]: string }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "tweet.read tweet.write users.read offline.access",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "pages_manage_posts,pages_read_engagement,pages_show_list,publish_to_groups",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and provider info
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
        
        // For Facebook, we might need to get page access tokens
        if (account.provider === "facebook") {
          // Store Facebook page tokens if available
          token.facebookPageTokens = {}
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      session.facebookPageTokens = token.facebookPageTokens as { [pageId: string]: string }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}