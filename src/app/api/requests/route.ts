import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError, hashSessionToken, newSessionToken, normalizeEmail, setSessionCookie } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("bm-session")?.value;
  if (!token) return NextResponse.json({ requests: [] });

  const requests = await prisma.purchaseRequest.findMany({
    where: { sessionToken: hashSessionToken(token) },
    select: {
      id: true,
      status: true,
      opportunity: { select: { month: true, city: true, car: { select: { brand: true, model: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const opportunityId = typeof body?.opportunityId === "string" ? body.opportunityId : "";

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^\+?[\d\s()-]{8,15}$/.test(phone) || !city || !opportunityId) {
    return apiError("Please provide your name, a valid email, phone, city and opportunity.");
  }

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity || opportunity.status !== "OPEN") return apiError("This buying group is no longer open.", 404);

  try {
    const sessionToken = request.cookies.get("bm-session")?.value ?? newSessionToken();
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: { name, email, phone, city, opportunityId, sessionToken: hashSessionToken(sessionToken) },
      select: {
        id: true,
        status: true,
        opportunity: { select: { month: true, city: true, car: { select: { brand: true, model: true } } } },
      },
    });
    const response = NextResponse.json({ request: purchaseRequest }, { status: 201 });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("You have already joined this buying group.", 409);
    }
    throw error;
  }
}