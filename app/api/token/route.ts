import { NextResponse } from "next/server";
import { validateConfig } from "@/lib/config";
import { encryptConfig, getKeyFromEnv } from "@/lib/token";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateConfig(body);
  if (!result.ok || !result.config) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  let key: Buffer;
  try {
    key = getKeyFromEnv();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server misconfigured: ENCRYPTION_KEY is not set." },
      { status: 500 }
    );
  }

  const token = encryptConfig(result.config, key);
  return NextResponse.json({ token, feedPath: `/api/feed/${token}` });
}
