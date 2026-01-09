import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/getSessionUser";

export default async function DashboardHome() {
  const user = await getSessionUser();

  if (!user) redirect("/api/auth/signin");

  if (user.role === "MANAGEMENT") {
    redirect("/dashboard/management");
  }

  redirect("/dashboard/am");
}
