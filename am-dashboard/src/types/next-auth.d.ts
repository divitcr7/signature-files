import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      amId?: number | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    amId?: number | null;
  }
}
