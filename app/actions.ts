"use server";

import { cookies } from "next/headers";

export async function verifyPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_gate", password, {
      path: "/",
      httpOnly: true,   // ✅ JSからアクセス不可。XSS攻撃でCookieを盗まれない
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return true;
  }
  return false;
}
