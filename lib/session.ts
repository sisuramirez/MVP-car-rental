import { SessionOptions } from "iron-session";

export interface SessionData {
  isAuthenticated: boolean;
  username: string;
  loginTime: number;
}

export const defaultSession: SessionData = {
  isAuthenticated: false,
  username: "",
  loginTime: 0,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-secret-change-me-in-production-now",
  cookieName: "mvp-car-rental-admin",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
