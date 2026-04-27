import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Hardcoded admin credentials — change these to your own
const ADMIN_EMAIL = "yonetici@mangaoku.com";
const ADMIN_PASSWORD_HASH = "$2b$10$pya9.b/HhHgVQBLJMQwWgOIZw1bS9ESdHRURKYPZ7f5T/a3kR32ta"; // MangaAdmin2026!

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" }, // "admin" | "user"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Admin check (hardcoded)
        if (credentials.email === ADMIN_EMAIL) {
          const valid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH);
          if (!valid) return null;
          return { id: "admin", email: ADMIN_EMAIL, name: "Admin", role: "admin" };
        }

        // Regular user check (DB)
        const user = await prisma.siteUser.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: String(user.id),
          email: user.email,
          name: user.username,
          role: "user",
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.avatar = (user as { avatar?: string }).avatar;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { avatar?: string }).avatar = token.avatar as string;
        (session.user as { username?: string }).username = token.username as string;
        (session.user as { id?: string }).id = token.sub as string;
      }
      return session;
    },
  },
  pages: { signIn: "/giris" },
  secret: process.env.NEXTAUTH_SECRET,
};
