import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { setToken } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-900" />
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-slate-500">Acesse para solicitar e acompanhar a limpeza.</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const data = await login(email, password);
                setToken(data.token);
                navigate("/dashboard");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao entrar");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none ring-slate-200 focus:ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="seuemail@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none ring-slate-200 focus:ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="********"
              />
            </div>

            {error ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-600">
            Não tem conta?{" "}
            <Link className="font-semibold text-slate-900 hover:underline" to="/register">
              Criar agora
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-4 text-xs text-slate-500">
          Dica: para modo Admin, por enquanto você precisa promover o usuário no banco (SQLite) para role ADMIN.
        </div>
      </div>
    </div>
  );
}
