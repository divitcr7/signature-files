import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/getSessionUser";
import { AmDashboard } from "./AmDashboard";

interface PageProps {
  searchParams: {
    start?: string;
    end?: string;
  };
}

/**
 * AM Dashboard Page (Server Component)
 * 
 * Fetches data server-side and applies month range filtering.
 * Only shows metrics for the logged-in AM's accountManagerId.
 */
export default async function AMDashboardPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  // AM users must have amId - enforce server-side
  if (user.role === "AM" && !user.amId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AM Dashboard</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium mb-2">Account Not Linked</p>
              <p className="text-yellow-700 text-sm">
                Your account is not linked to an Account Manager (amId).
                Please contact your administrator to link your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only AM role can access this page - enforce server-side
  if (user.role !== "AM") {
    redirect("/dashboard/management");
  }

  // Build where clause with month range filter
  const whereClause: {
    accountManagerId: number;
    month?: {
      gte?: string;
      lte?: string;
    };
  } = {
    accountManagerId: user.amId!,
  };

  if (searchParams.start || searchParams.end) {
    whereClause.month = {};
    if (searchParams.start) {
      whereClause.month.gte = searchParams.start;
    }
    if (searchParams.end) {
      whereClause.month.lte = searchParams.end;
    }
  }

  // Fetch metrics for the AM user with month range filter
  const metrics = await prisma.metricMonthly.findMany({
    where: whereClause,
    orderBy: [{ month: "asc" }],
  });

  // Get all available months for the filter dropdown
  const allMetrics = await prisma.metricMonthly.findMany({
    where: { accountManagerId: user.amId! },
    select: { month: true },
    orderBy: [{ month: "asc" }],
  });

  const availableMonths = [
    ...new Set(allMetrics.map((m) => m.month)),
  ].sort();

  return (
    <AmDashboard
      user={{
        name: user.name ?? null,
        email: user.email ?? null,
        role: user.role,
      }}
      metrics={metrics.map((m) => ({
        id: m.id,
        month: m.month,
        netRetention: m.netRetention,
        grossRetention: m.grossRetention,
        renewalPremium: m.renewalPremium,
        lostPremium: m.lostPremium,
        newBizPremium: m.newBizPremium,
        policyCountStart: m.policyCountStart,
        policyCountEnd: m.policyCountEnd,
        amName: m.amName,
      }))}
      availableMonths={availableMonths}
    />
  );
}
