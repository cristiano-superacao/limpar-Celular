import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken as clearStoredToken, getToken as getStoredToken, setToken as setStoredToken } from "../lib/auth";

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await getStoredToken();
        setTokenState(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      loading,
      setToken: async (t) => {
        await setStoredToken(t);
        setTokenState(t);
      },
      logout: async () => {
        await clearStoredToken();
        setTokenState(null);
      },
    }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
