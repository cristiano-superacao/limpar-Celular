import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../lib/auth";
import { useEffect, useState } from "react";
import { me } from "../lib/api";

export function Shell() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Carrega role do usuário para exibir links condicionalmente
    (async () => {
      try {
        if (!getToken()) return;
        const data = await me();
        setIsAdmin(data.user.role === "ADMIN");
      } catch {
        // Silencia erros; API já protegerá acesso
        setIsAdmin(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Limpa Celular</div>
              <div className="text-xs text-slate-500">Limpeza e backup com controle</div>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" to="/dashboard">
              Dashboard
            </Link>
            {isAdmin ? (
              <Link className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" to="/admin/cloud">
                Nuvem (Admin)
              </Link>
            ) : null}
            <button
              className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
              onClick={() => {
                clearToken();
                navigate("/login");
              }}
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-slate-500">
          MVP - varredura/backup/exclusão em modo demonstração.
        </div>
      </footer>
    </div>
  );
}
