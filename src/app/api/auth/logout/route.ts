import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil" });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
