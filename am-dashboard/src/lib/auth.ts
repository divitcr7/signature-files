import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { UserRole } from "@prisma/client";

const MANAGEMENT_EMAILS = [
  "vik@benchmarkbroker.com",
  "wesley@benchmarkbroker.com",
  "jfoty@benchmarkbroker.com",
  "sakshi@benchmarkbroker.com",
];

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      // Keep tenantId if you are single-tenant. Omit for multi-tenant.
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],

  session: { strategy: "jwt" },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async signIn({ user, profile }) {
      try {
        // Microsoft sometimes doesn't set user.email; pull from common profile fields.
        const derivedEmail =
          user.email ||
          (profile as any)?.email ||
          (profile as any)?.preferred_username ||
          (profile as any)?.upn;

        if (!derivedEmail) {
          console.error("Sign in failed: No email provided by Microsoft profile");
          return false;
        }

        const email = derivedEmail.toLowerCase();

        const role = MANAGEMENT_EMAILS.includes(email) ? "MANAGEMENT" : "AM";

        let amId: number | null = null;
        if (role === "AM") {
          const am = await prisma.accountManager.findUnique({
            where: { email },
            select: { id: true },
          });
          amId = am?.id ?? null;
        }

        await prisma.user.upsert({
          where: { email },
          update: {
            name: user.name ?? "",
            role,
            amId,
          },
          create: {
            id: crypto.randomUUID(),
            name: user.name ?? "",
            email,
            role,
            amId,
          },
        });

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (
        url.includes("/api/auth/callback") ||
        url.includes("/api/auth/signin?callbackUrl=")
      ) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith("/")) {
        if (url === "/api/auth/signin" || url.includes("/api/auth/error")) {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },

    async jwt({ token }) {
      if (!token.email) return token;

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: { role: true, amId: true, name: true },
      });

      token.role = dbUser?.role ?? "AM";
      token.amId = dbUser?.amId ?? null;
      token.name = dbUser?.name ?? token.name;

      return token;
    },

    async session({ session, token }) {
      // Make sure your next-auth Session type is augmented for user.role/user.amId
      session.user.role = token.role as UserRole;
      session.user.amId = token.amId as number | null;
      return session;
    },
  },
};
