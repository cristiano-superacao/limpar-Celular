import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { me } from "../lib/api";
import { getToken } from "../lib/auth";

export function AdminProtected() {
  const [allow, setAllow] = useState<null | boolean>(null);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return setAllow(false);
      try {
        const data = await me();
        setAllow(data.user.role === "ADMIN");
      } catch {
        setAllow(false);
      }
    })();
  }, []);

  if (allow === null) {
    return (
      <div className="text-sm text-slate-500" aria-busy="true">Verificando permissões...</div>
    );
  }

  if (!allow) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
