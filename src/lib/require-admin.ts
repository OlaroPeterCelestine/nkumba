import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function requireAdminSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!(await verifySessionToken(token))) {
    redirect("/login");
  }
}
