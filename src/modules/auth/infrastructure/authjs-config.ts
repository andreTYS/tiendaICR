/**
 * Auth.js v5 configuration.
 * Strategy: JWT (edge-safe — no DB reads in proxy).
 * Role and id are baked into the token at sign-in.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "../domain/user-role";
import { login } from "../application/login";
import { prismaUserRepository } from "./prisma-user-repository";
import { bcryptPasswordHasher } from "./bcrypt-password-hasher";
import { checkRateLimit } from "@/shared/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        // Rate-limit: 5 attempts per IP per 60s (in-memory, single-instance safe)
        // request may be a standard Request (with Headers) or a raw IncomingMessage
        const req = request as unknown as Request | undefined;
        const forwarded = req?.headers?.get?.("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

        const rl = checkRateLimit(ip);
        if (!rl.allowed) {
          console.warn(`[rate-limit] login blocked for IP ${ip}`);
          return null;
        }

        const result = await login(
          {
            email: String(credentials?.email ?? ""),
            password: String(credentials?.password ?? ""),
          },
          { users: prismaUserRepository, hasher: bcryptPasswordHasher }
        );

        if (!result.ok) return null;

        return {
          id: result.value.id,
          email: result.value.email,
          role: result.value.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // user is only set on first sign-in
        token.role = (user as { role: Role }).role;
        token.id = user.id!;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role: Role; id: string }).role =
          token.role as Role;
        (session.user as { role: Role; id: string }).id =
          token.id as string;
      }
      return session;
    },
  },
});
