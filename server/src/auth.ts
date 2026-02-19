import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { AuthConfig } from "@hono/auth-js";
import bcryptjs from "bcryptjs";

export const prisma = new PrismaClient();

export const authConfig: AuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcryptjs.compare(credentials.password as string, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  ],
  basePath: "/auth",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      console.log("signIn callback - user:", user?.email);
      return true;
    },
    async session({ session, token }: any) {
      if (session.user && (token.sub || token.id)) {
        const userId = (token.sub || token.id) as string;
        // Fetch latest data from DB to avoid JWT staleness
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { image: true, role: true, name: true },
        });

        console.log(`[AUTH SESSION] Fetching for ${userId}. Image in DB: ${user?.image}`);

        if (user) {
          session.user.image = user.image;
          session.user.role = user.role;
          session.user.name = user.name;
        }
        session.user.id = userId;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id;
        token.image = user.image;
        token.role = user.role;
      }
      return token;
    },
  },
  debug: true,
};
