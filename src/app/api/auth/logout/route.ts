import { NextResponse, NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // 1. Tentukan URL tujuan redirect (harus absolute URL)
  const loginUrl = new URL("/login", request.url);

  // 2. Buat response redirect
  const response = NextResponse.redirect(loginUrl, {
    status: 303, // Menggunakan 303 See Other untuk memastikan browser melakukan GET ke /login
  });

  // 3. Hapus cookie pada response tersebut
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Langsung kadaluarsa
  });

  return response;
}