import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  cookieOptions,
  createSessionToken,
  credentialsMatch,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const username =
    typeof body === "object" && body && "username" in body
      ? String((body as { username: unknown }).username ?? "")
      : "";
  const password =
    typeof body === "object" && body && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  try {
    const valid = await credentialsMatch(username.trim(), password);

    if (!valid) {
      return NextResponse.json(
        { message: "Incorrect username or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(username.trim());
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { message: "Login is not configured yet." },
      { status: 500 },
    );
  }
}
