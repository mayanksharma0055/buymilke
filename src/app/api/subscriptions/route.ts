import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError, hashSessionToken, newSessionToken, normalizeEmail, setSessionCookie } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("bm-session")?.value;
  if (!token) return NextResponse.json({ subscription: null });
  const subscription = await prisma.subscription.findFirst({
    where: { sessionToken: hashSessionToken(token) },
    select: { plan: true, status: true, createdAt: true },
  });
  return NextResponse.json({ subscription });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const plan = body?.plan === "annual" ? "annual" : "monthly";

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^\+?[\d\s()-]{8,15}$/.test(phone)) {
    return apiError("Please provide your name, a valid email and phone number.");
  }

  try {
    const sessionToken = request.cookies.get("bm-session")?.value ?? newSessionToken();
    const subscription = await prisma.subscription.create({
      data: { name, email, phone, plan, sessionToken: hashSessionToken(sessionToken) },
      select: { plan: true, status: true, createdAt: true },
    });
    const response = NextResponse.json({ subscription }, { status: 201 });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("An account with this email already exists.", 409);
    }
    throw error;
  }
}