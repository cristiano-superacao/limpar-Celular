import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createRequest, listRequests, type CleaningRequest } from "../lib/api";
import { statusLabel } from "../lib/format";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
        ? "bg-red-50 text-red-700"
        : status === "SCANNED"
          ? "bg-blue-50 text-blue-700"
          : status === "COMPLETED"
            ? "bg-slate-100 text-slate-700"
            : "bg-amber-50 text-amber-700";

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>{statusLabel(status)}</span>;
}

export function DashboardPage() {
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deviceInfo, setDeviceInfo] = useState("");
  const [creating, setCreating] = useState(false);

  const header = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    return { total, pending };
  }, [requests]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const data = await listRequests();
      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Solicite a limpeza, aguarde aprovação e depois escolha backup/exclusão por tema.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border bg-white px-4 py-3">
            <div className="text-xs text-slate-500">Solicitações</div>
            <div className="text-lg font-semibold">{header.total}</div>
          </div>
          <div className="rounded-2xl border bg-white px-4 py-3">
            <div className="text-xs text-slate-500">Pendentes</div>
            <div className="text-lg font-semibold">{header.pending}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Solicitar limpeza</h2>
          <p className="mt-1 text-sm text-slate-600">Descreva o modelo do celular e o que você quer limpar.</p>

          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setCreating(true);
              try {
                await createRequest(deviceInfo.trim() ? deviceInfo.trim() : undefined);
                setDeviceInfo("");
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao solicitar");
              } finally {
                setCreating(false);
              }
            }}
          >
            <textarea
              className="min-h-24 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
              value={deviceInfo}
              onChange={(e) => setDeviceInfo(e.target.value)}
              placeholder="Ex.: Samsung A52. Limpar mídia do WhatsApp e Downloads."
            />
            <button
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={creating}
              type="submit"
            >
              {creating ? "Enviando..." : "Enviar solicitação"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Minhas solicitações</h2>
            <button
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              onClick={() => void refresh()}
              type="button"
            >
              Atualizar
            </button>
          </div>

          {error ? <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-slate-500">Carregando...</div>
            ) : requests.length === 0 ? (
              <div className="text-sm text-slate-500">Nenhuma solicitação ainda.</div>
            ) : (
              requests.map((r) => (
                <Link
                  key={r.id}
                  to={`/requests/${r.id}`}
                  className="block rounded-2xl border p-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">Solicitação #{r.id.slice(0, 8)}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-slate-600">{r.deviceInfo || "(sem descrição)"}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Criado em {new Date(r.createdAt).toLocaleString()}</div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
