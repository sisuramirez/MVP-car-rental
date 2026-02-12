import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { SessionData, defaultSession, sessionOptions } from "./session";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isAuthenticated) {
    session.isAuthenticated = defaultSession.isAuthenticated;
    session.username = defaultSession.username;
    session.loginTime = defaultSession.loginTime;
  }

  return session;
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    console.error("ADMIN_USERNAME or ADMIN_PASSWORD_HASH not set in environment");
    return false;
  }

  if (username !== adminUsername) {
    // Still run bcrypt compare to prevent timing attacks
    await bcrypt.compare(password, "$2b$10$invalidhashfortimingattak000000000000000000000");
    return false;
  }

  return bcrypt.compare(password, adminPasswordHash);
}
