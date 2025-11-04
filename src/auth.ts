import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Auth.js v5 configuration
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Changed from database to jwt to support Credentials provider
  providers: [
    // Developer-only credentials login (for local testing)
    ...(process.env.NODE_ENV !== "production"
      ? [
          Credentials({
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email" },
              name: { label: "Name", type: "text" },
            },
            async authorize(creds) {
              const email = creds?.email as string | undefined;
              if (!email) return null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return {
                id: `dev-${email}`,
                email,
                name: (creds?.name as string) || "Dev User",
              } as any;
            },
          }),
        ]
      : []),
  ],
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined),
});
