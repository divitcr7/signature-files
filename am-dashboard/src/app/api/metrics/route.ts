import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/getSessionUser";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/metrics?accountManagerId=123
 * 
 * Fetches metrics for a specific Account Manager.
 * 
 * Role-based access:
 * - MANAGEMENT: can query any accountManagerId
 * - AM: can only query their own amId (enforced server-side)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const accountManagerIdParam = searchParams.get("accountManagerId");

    // For AM users, they can only see their own metrics
    if (user.role === "AM") {
      if (!user.amId) {
        return NextResponse.json(
          { error: "Your account is not linked to an Account Manager" },
          { status: 403 }
        );
      }

      // AM users: ignore the query param and use their own amId
      const metrics = await prisma.metricMonthly.findMany({
        where: { accountManagerId: user.amId },
        orderBy: [{ month: "asc" }],
      });

      return NextResponse.json({ metrics });
    }

    // For MANAGEMENT users, they can query any accountManagerId
    if (user.role === "MANAGEMENT") {
      if (!accountManagerIdParam) {
        return NextResponse.json(
          { error: "accountManagerId query parameter is required" },
          { status: 400 }
        );
      }

      const accountManagerId = parseInt(accountManagerIdParam, 10);
      if (isNaN(accountManagerId)) {
        return NextResponse.json(
          { error: "Invalid accountManagerId" },
          { status: 400 }
        );
      }

      // Verify the AccountManager exists and is active
      const accountManager = await prisma.accountManager.findUnique({
        where: { id: accountManagerId },
      });

      if (!accountManager || !accountManager.active) {
        return NextResponse.json(
          { error: "Account Manager not found or inactive" },
          { status: 404 }
        );
      }

      const metrics = await prisma.metricMonthly.findMany({
        where: { accountManagerId },
        orderBy: [{ month: "asc" }],
      });

      return NextResponse.json({ metrics });
    }

    return NextResponse.json(
      { error: "Invalid role" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

