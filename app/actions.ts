"use server";

import { cookies } from "next/headers";

export async function verifyPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_gate", password, { path: "/", httpOnly: true });
    return true;
  }
  return false;
}
