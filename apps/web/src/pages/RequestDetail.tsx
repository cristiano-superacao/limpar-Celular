import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listRequests, runMockScan, type CleaningRequest } from "../lib/api";
import { formatBytes, statusLabel } from "../lib/format";

type ScanItem = {
  id: string;
  type: "photo" | "video" | "audio" | "document" | string;
  sizeBytes: number;
  path: string;
};

type ScanGroup = {
  theme: string;
  items: ScanItem[];
};

type ScanResult = {
  generatedAt: string;
  groups: ScanGroup[];
};

export function RequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  const scan: ScanResult | null = useMemo(() => {
    if (!request?.scanResultJson) return null;
    try {
      return JSON.parse(request.scanResultJson) as ScanResult;
    } catch {
      return null;
    }
  }, [request?.scanResultJson]);

  const totals = useMemo(() => {
    const items = scan?.groups.flatMap((g) => g.items) ?? [];
    const totalBytes = items.reduce((acc, it) => acc + (it.sizeBytes || 0), 0);
    return { itemsCount: items.length, totalBytes };
  }, [scan]);

  async function refresh() {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const data = await listRequests();
      const found = data.requests.find((r) => r.id === id) ?? null;
      setRequest(found);
      if (!found) setError("Solicitação não encontrada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [id]);

  if (loading) {
    return <div className="text-sm text-slate-500">Carregando...</div>;
  }

  if (!request) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm text-slate-700">{error || "Solicitação não encontrada"}</div>
        <div className="mt-4">
          <Link className="text-sm font-semibold text-slate-900 hover:underline" to="/dashboard">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-slate-900 hover:underline" to="/dashboard">
            ← Voltar
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Solicitação #{request.id.slice(0, 8)}</h1>
          <p className="mt-1 text-sm text-slate-600">Status: {statusLabel(request.status)}</p>
        </div>

        <button
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={scanLoading}
          onClick={async () => {
            setScanLoading(true);
            setError(null);
            try {
              await runMockScan(request.id);
              await refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Falha ao executar varredura");
            } finally {
              setScanLoading(false);
            }
          }}
          type="button"
        >
          {scanLoading ? "Gerando varredura..." : "Gerar varredura (demo)"}
        </button>
      </div>

      {error ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {backupSuccess ? <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{backupSuccess}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-base font-semibold">Resumo</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Descrição</div>
              <div className="mt-1 text-sm text-slate-700">{request.deviceInfo || "(sem descrição)"}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Itens</div>
                <div className="mt-1 text-sm font-semibold">{totals.itemsCount}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Tamanho</div>
                <div className="mt-1 text-sm font-semibold">{formatBytes(totals.totalBytes)}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Obs.: no MVP, backup/exclusão são simulados e não alteram o celular real.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Varredura por temas</h2>
              <p className="mt-1 text-sm text-slate-600">Itens agrupados (ex.: WhatsApp, Downloads) para backup ou exclusão.</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              {scan?.generatedAt ? `Gerado em ${new Date(scan.generatedAt).toLocaleString()}` : "Sem varredura"}
            </div>
          </div>

          {!scan ? (
            <div className="mt-6 rounded-2xl border border-dashed p-6 text-sm text-slate-500">
              Execute a varredura (demo) para ver os itens.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {scan.groups.map((g) => {
                const groupBytes = g.items.reduce((acc, it) => acc + (it.sizeBytes || 0), 0);
                return (
                  <div key={g.theme} className="rounded-2xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">{g.theme}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {g.items.length} itens · {formatBytes(groupBytes)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                          type="button"
                          disabled={scanLoading}
                          onClick={async () => {
                            if (!request) return;
                            setScanLoading(true);
                            setError(null);
                            setBackupSuccess(null);
                            try {
                              await runMockScan(request.id);
                              await refresh();
                              setBackupSuccess(`Backup criado com sucesso! Válido por 5 dias.`);
                              setTimeout(() => setBackupSuccess(null), 5000);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Falha ao criar backup");
                            } finally {
                              setScanLoading(false);
                            }
                          }}
                        >
                          {scanLoading ? "Criando..." : "Fazer backup"}
                        </button>
                        <button
                          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                          type="button"
                          onClick={() => alert("Excluir (demo): aqui seria a exclusão real no celular.")}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-slate-500">
                          <tr>
                            <th className="py-2">Tipo</th>
                            <th className="py-2">Arquivo</th>
                            <th className="py-2 text-right">Tamanho</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {g.items.map((it) => (
                            <tr key={it.id} className="text-slate-700">
                              <td className="py-2 pr-3">{it.type}</td>
                              <td className="py-2 pr-3">{it.path}</td>
                              <td className="py-2 text-right">{formatBytes(it.sizeBytes)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
