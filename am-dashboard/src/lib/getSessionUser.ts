import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  const role = (session.user as any).role as "MANAGEMENT" | "AM";
  const amId = (session.user as any).amId as number | null;

  return {
    name: session.user.name,
    email: session.user.email,
    role,
    amId,
  };
}
