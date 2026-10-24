import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "OPEN" },
    include: { car: true, _count: { select: { requests: true } } },
    orderBy: [{ closingDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ opportunities });
}