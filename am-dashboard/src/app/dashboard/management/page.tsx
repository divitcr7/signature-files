import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/getSessionUser";
import { ManagementDashboard } from "./ManagementDashboard";

interface PageProps {
  searchParams: {
    amIds?: string; // Comma-separated list: "1,2,3"
    start?: string;
    end?: string;
  };
}

/**
 * Management Dashboard Page (Server Component)
 * 
 * Allows MANAGEMENT users to select multiple AMs and compare their metrics.
 * Fetches data server-side and applies filters.
 */
export default async function ManagementDashboardPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  // Only management allowed
  if (user.role !== "MANAGEMENT") {
    redirect("/dashboard/am");
  }

  // Fetch all active account managers for dropdown
  const accountManagers = await prisma.accountManager.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  // Parse selected AM IDs
  let selectedAmIds: number[] = [];
  if (searchParams.amIds) {
    selectedAmIds = searchParams.amIds
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);
  }

  // Fetch metrics for selected AMs
  let metrics: Array<{
    id: string;
    month: string;
    netRetention: number;
    grossRetention: number;
    renewalPremium: number;
    lostPremium: number;
    newBizPremium: number;
    policyCountStart: number;
    policyCountEnd: number;
    amName: string;
    accountManagerId: number;
  }> = [];

  let availableMonths: string[] = [];
  const selectedAmNames: string[] = [];

  // If AMs are selected, fetch their metrics
  if (selectedAmIds.length > 0) {
    // Verify all selected AMs exist and are active
    const validAmIds: number[] = [];
    for (const amId of selectedAmIds) {
      const accountManager = await prisma.accountManager.findUnique({
        where: { id: amId },
      });

      if (accountManager && accountManager.active) {
        validAmIds.push(amId);
        selectedAmNames.push(accountManager.name);
      }
    }

    if (validAmIds.length > 0) {
      // Build where clause with month range filter
      const whereClause: {
        accountManagerId: {
          in: number[];
        };
        month?: {
          gte?: string;
          lte?: string;
        };
      } = {
        accountManagerId: {
          in: validAmIds,
        },
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

      // Fetch metrics for all selected AMs
      const fetchedMetrics = await prisma.metricMonthly.findMany({
        where: whereClause,
        orderBy: [{ month: "asc" }, { accountManagerId: "asc" }],
      });

      metrics = fetchedMetrics.map((m) => ({
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
        accountManagerId: m.accountManagerId,
      }));

      // Get all available months from all selected AMs
      const allMetrics = await prisma.metricMonthly.findMany({
        where: {
          accountManagerId: {
            in: validAmIds,
          },
        },
        select: { month: true },
        orderBy: [{ month: "asc" }],
      });

      availableMonths = [...new Set(allMetrics.map((m) => m.month))].sort();
    }
  }

  return (
    <ManagementDashboard
      user={{
        name: user.name ?? null,
        email: user.email ?? null,
        role: user.role,
      }}
      accountManagers={accountManagers}
      metrics={metrics}
      availableMonths={availableMonths}
      selectedAmNames={selectedAmNames}
    />
  );
}
