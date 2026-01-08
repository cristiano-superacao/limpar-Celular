import { useEffect, useState } from "react";
import { getCloudConfig, setCloudConfig, type CloudProvider } from "../lib/api";

export function AdminCloudPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<CloudProvider>("NONE");
  const [bucketOrContainer, setBucketOrContainer] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await getCloudConfig();
        if (data.config) {
          setEnabled(data.config.enabled);
          setProvider(data.config.provider);
          setBucketOrContainer(data.config.bucketOrContainer || "");
          setRegion(data.config.region || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao carregar");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuração de nuvem (Admin)</h1>
        <p className="mt-1 text-sm text-slate-600">
          Define se o sistema oferece backup e para qual provedor (no MVP, ações são demonstrativas).
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {loading ? <div className="text-sm text-slate-500">Carregando...</div> : null}
        {error ? (
          <div role="alert" aria-live="polite" className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        {ok ? (
          <div role="status" aria-live="polite" className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{ok}</div>
        ) : null}

        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError(null);
            setOk(null);
            try {
              await setCloudConfig({
                enabled,
                provider,
                bucketOrContainer: bucketOrContainer.trim() ? bucketOrContainer.trim() : null,
                region: region.trim() ? region.trim() : null,
              } as any);
              setOk("Configuração salva.");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Falha ao salvar");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Habilitar backup em nuvem
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">Provedor</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
              value={provider}
              onChange={(e) => setProvider(e.target.value as CloudProvider)}
            >
              <option value="NONE">Nenhum</option>
              <option value="AZURE_BLOB">Azure Blob</option>
              <option value="AWS_S3">AWS S3</option>
              <option value="GOOGLE_DRIVE">Google Drive</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Container/Bucket</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
              value={bucketOrContainer}
              onChange={(e) => setBucketOrContainer(e.target.value)}
              placeholder="ex.: limpa-celular-backups"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Região (opcional)</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="ex.: eastus"
            />
          </div>

          <div className="md:col-span-2">
            <button
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
