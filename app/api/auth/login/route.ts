import { NextResponse } from "next/server";
import { getSession, validateCredentials } from "@/lib/auth";

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 min window
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espere un momento." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Complete todos los campos" },
        { status: 400 }
      );
    }

    const isValid = await validateCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.isAuthenticated = true;
    session.username = username;
    session.loginTime = Date.now();
    await session.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error del servidor. Intente nuevamente." },
      { status: 500 }
    );
  }
}
