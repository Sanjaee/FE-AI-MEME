import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Function to refresh access token
async function refreshAccessToken(token: {
  refreshToken?: string;
  accessToken?: string;
  accessTokenExpires?: number;
  [key: string]: unknown;
}) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok || !refreshedTokens.success) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
      },
      async authorize(credentials) {
        // Check if this is a direct token login (from OTP verification)
        if (credentials?.accessToken) {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            // Verify the token with backend
            const response = await fetch(
              `${backendUrl}/api/auth/verify-token`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token: credentials.accessToken,
                }),
              }
            );

            const data = await response.json();

            if (data.valid && data.user) {
              return {
                id: String(data.user.id),
                username: data.user.username,
                email: data.user.email,
                role: data.user.role,
                name: data.user.username,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken,
              };
            }
            return null;
          } catch (error) {
            console.error("Token verification error:", error);
            return null;
          }
        }

        // Regular username/password login
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          // Regular username/password login
          const response = await fetch(
            `${backendUrl}/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();

          if (data.success && data.user && data.accessToken) {
            return {
              id: String(data.user.id),
              username: data.user.username,
              email: data.user.email,
              role: data.user.role,
              name: data.user.username,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only allow credentials provider (admin login)
      if (account?.provider === "credentials") {
        // Verify user exists and has admin role
        if (user && user.role === "admin") {
          return true;
        }
        return false;
      }
      
      return false;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account && account.provider === "credentials") {
        const typedUser = user as {
          id: string;
          username: string;
          email: string;
          role: string;
          name: string;
          accessToken?: string;
          refreshToken?: string;
        };
        
        return {
          ...token,
          id: typedUser.id,
          username: typedUser.username,
          email: typedUser.email,
          role: typedUser.role,
          name: typedUser.name,
          accessToken: typedUser.accessToken,
          refreshToken: typedUser.refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      const refreshed = await refreshAccessToken(token);
      return {
        ...token,
        ...refreshed,
      };
    },
    async session({ session, token }) {
      if (token && token.role === "admin") {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
