import { NextResponse } from "next/server";

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("bm-session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}