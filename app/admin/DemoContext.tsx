"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DemoContextValue {
  isDemo: boolean;
}

const DemoContext = createContext<DemoContextValue>({ isDemo: false });

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.role === "demo") {
          setIsDemo(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DemoContext.Provider value={{ isDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
