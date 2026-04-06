import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const cleanBaseURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // First time login
      if (account && account.provider === "google" && account.id_token) {
        try {
          // Exchange the Google id_token for our internal FastAPI JWT
          const res = await fetch(`${cleanBaseURL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });

          if (res.ok) {
            const data = await res.json();
            token.apiToken = data.access_token;
            token.role = data.user.role;
            token.userId = data.user.id;
          } else {
            console.error("Failed to exchange token with backend API", await res.text());
          }
        } catch (err) {
          console.error("Network error during token exchange:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.apiToken = token.apiToken as string;
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-development-only",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
