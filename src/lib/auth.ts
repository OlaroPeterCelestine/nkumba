export const SESSION_COOKIE = "nkumba_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12;

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function safeEqual(left: string, right: string) {
  const max = Math.max(left.length, right.length);
  let diff = left.length === right.length ? 0 : 1;

  for (let i = 0; i < max; i += 1) {
    diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }

  return diff === 0;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string, secret: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return bytesToBase64Url(signature);
}

export function getAuthConfig() {
  const username = process.env.ADMIN_USERNAME ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";

  if (!username || !password || !secret) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_PASSWORD, and SESSION_SECRET must be set.",
    );
  }

  return { username, password, secret };
}

export async function createSessionToken(username: string) {
  const { secret } = getAuthConfig();
  const payload = JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  const encoded = bytesToBase64Url(encoder.encode(payload));
  const signature = await sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !token.includes(".")) {
    return false;
  }

  try {
    const { secret, username } = getAuthConfig();
    const [encoded, signature] = token.split(".");
    const expected = await sign(encoded, secret);

    if (!safeEqual(signature, expected)) {
      return false;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(encoded)),
    ) as { sub?: string; exp?: number };

    if (payload.sub !== username) {
      return false;
    }

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function credentialsMatch(username: string, password: string) {
  const config = getAuthConfig();
  return (
    safeEqual(username, config.username) && safeEqual(password, config.password)
  );
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
