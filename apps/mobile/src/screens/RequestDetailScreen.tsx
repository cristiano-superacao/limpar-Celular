import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { listRequests, runMockScan, type CleaningRequest } from "../lib/api";
import { formatBytes, statusLabel } from "../lib/format";
import { Button, Card, Subtitle, Title } from "../ui/components";
import { colors, radius, spacing } from "../ui/theme";

type ScanItem = {
  id: string;
  type: string;
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

export function RequestDetailScreen({ route }: any) {
  const { id } = route.params as { id: string };
  const auth = useAuth();
  const token = auth.token;

  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);

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
    if (!token) return;
    setLoading(true);
    try {
      const data = await listRequests(token);
      const found = data.requests.find((r) => r.id === id) ?? null;
      setRequest(found);
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [id, token]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={styles.muted}>Carregando...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.root}>
        <Card>
          <Title>Solicitação</Title>
          <Subtitle>Não encontrada.</Subtitle>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={{ gap: spacing.lg }}>
        <Card>
          <Title>Solicitação #{request.id.slice(0, 8)}</Title>
          <Subtitle>Status: {statusLabel(request.status)}</Subtitle>

          <View style={{ height: spacing.lg }} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Itens</Text>
              <Text style={styles.summaryValue}>{totals.itemsCount}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Tamanho</Text>
              <Text style={styles.summaryValue}>{formatBytes(totals.totalBytes)}</Text>
            </View>
          </View>

          <View style={{ height: spacing.md }} />

          <Button
            title={scanLoading ? "Gerando varredura..." : "Gerar varredura (demo)"}
            disabled={scanLoading}
            onPress={async () => {
              if (!token) return;
              setScanLoading(true);
              try {
                await runMockScan(token, request.id);
                await refresh();
              } catch (err) {
                Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao varrer");
              } finally {
                setScanLoading(false);
              }
            }}
          />

          <View style={{ height: spacing.sm }} />

          <Button
            title="Atualizar"
            variant="secondary"
            onPress={() => {
              void refresh();
            }}
          />
        </Card>

        <Card>
          <Title>Varredura por temas</Title>
          <Subtitle>Itens agrupados (ex.: WhatsApp) para backup ou exclusão.</Subtitle>

          <View style={{ height: spacing.lg }} />

          {!scan ? (
            <View style={styles.placeholder}>
              <Text style={styles.muted}>Sem varredura ainda. Execute a varredura (demo).</Text>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {scan.groups.map((g) => {
                const groupBytes = g.items.reduce((acc, it) => acc + (it.sizeBytes || 0), 0);
                return (
                  <View key={g.theme} style={styles.group}>
                    <View style={styles.groupHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupTitle}>{g.theme}</Text>
                        <Text style={styles.groupMeta}>
                          {g.items.length} itens · {formatBytes(groupBytes)}
                        </Text>
                      </View>
                      <View style={{ gap: spacing.sm }}>
                        <Button
                          title="Backup"
                          variant="secondary"
                          onPress={async () => {
                            if (!token) return;
                            setScanLoading(true);
                            try {
                              await runMockScan(token, request.id);
                              await refresh();
                              Alert.alert("Sucesso", "Backup criado com sucesso! Válido por 5 dias.");
                            } catch (err) {
                              Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao criar backup");
                            } finally {
                              setScanLoading(false);
                            }
                          }}
                        />
                        <Button
                          title="Excluir"
                          onPress={() => Alert.alert("Excluir (demo)", "Aqui seria a exclusão real no celular.")}
                        />
                      </View>
                    </View>

                    <View style={{ height: spacing.md }} />

                    <View style={{ gap: 10 }}>
                      {g.items.map((it) => (
                        <View key={it.id} style={styles.itemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{it.type}</Text>
                            <Text style={styles.itemPath} numberOfLines={1}>
                              {it.path}
                            </Text>
                          </View>
                          <Text style={styles.itemSize}>{formatBytes(it.sizeBytes)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "700",
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 16,
    color: colors.text,
    fontWeight: "800",
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  group: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  groupMeta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.muted,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#f8fafc",
    borderRadius: radius.md,
    padding: 12,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
    textTransform: "capitalize",
  },
  itemPath: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
  },
  itemSize: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
});
