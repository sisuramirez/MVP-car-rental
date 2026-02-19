import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SessionData, UserRole, defaultSession, sessionOptions } from "./session";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isAuthenticated) {
    session.isAuthenticated = defaultSession.isAuthenticated;
    session.username = defaultSession.username;
    session.loginTime = defaultSession.loginTime;
    session.role = defaultSession.role;
  }

  return session;
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<{ valid: boolean; role: UserRole } | false> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const demoUsername = process.env.DEMO_USERNAME;
  const demoPasswordHash = process.env.DEMO_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    console.error("ADMIN_USERNAME or ADMIN_PASSWORD_HASH not set in environment");
    return false;
  }

  // Check admin credentials
  if (username === adminUsername) {
    const valid = await bcrypt.compare(password, adminPasswordHash);
    return valid ? { valid: true, role: "admin" } : false;
  }

  // Check demo credentials
  if (demoUsername && demoPasswordHash && username === demoUsername) {
    const valid = await bcrypt.compare(password, demoPasswordHash);
    return valid ? { valid: true, role: "demo" } : false;
  }

  // Run bcrypt to prevent timing attacks
  await bcrypt.compare(password, "$2b$10$invalidhashfortimingattak000000000000000000000");
  return false;
}

/**
 * Guard for mutating API routes. Returns the session if the user is an admin,
 * or a 403 NextResponse if they are a demo user or unauthenticated.
 */
export async function requireAdmin(): Promise<
  { session: SessionData } | NextResponse
> {
  const session = await getSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Treat undefined role (old sessions) as admin for backward compatibility
  const effectiveRole = session.role ?? "admin";

  if (effectiveRole === "demo") {
    return NextResponse.json(
      { error: "Cuenta demo — acción no permitida" },
      { status: 403 }
    );
  }

  return { session };
}
