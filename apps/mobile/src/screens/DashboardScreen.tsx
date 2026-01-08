import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { createRequest, listRequests, type CleaningRequest } from "../lib/api";
import { statusLabel } from "../lib/format";
import { Button, Card, FieldLabel, Input, Subtitle, Title } from "../ui/components";
import { colors, radius, spacing } from "../ui/theme";

function StatusBadge({ status }: { status: string }) {
  const bg =
    status === "APPROVED"
      ? "#ecfdf5"
      : status === "REJECTED"
        ? "#fef2f2"
        : status === "SCANNED"
          ? "#eff6ff"
          : status === "COMPLETED"
            ? "#f1f5f9"
            : "#fffbeb";

  const fg =
    status === "APPROVED"
      ? "#047857"
      : status === "REJECTED"
        ? "#b91c1c"
        : status === "SCANNED"
          ? "#1d4ed8"
          : status === "COMPLETED"
            ? "#334155"
            : "#92400e";

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{statusLabel(status)}</Text>
    </View>
  );
}

export function DashboardScreen({ navigation }: any) {
  const auth = useAuth();
  const token = auth.token;

  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deviceInfo, setDeviceInfo] = useState("");
  const [creating, setCreating] = useState(false);

  const header = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    return { total, pending };
  }, [requests]);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listRequests(token);
      setRequests(data.requests);
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.container}
        data={requests}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              if (!token) return;
              setRefreshing(true);
              try {
                const data = await listRequests(token);
                setRequests(data.requests);
              } catch (err) {
                Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao atualizar");
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.lg }}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Title>Dashboard</Title>
                <Subtitle>Solicite a limpeza e acompanhe o status.</Subtitle>
              </View>
              <Button title="Sair" variant="secondary" onPress={() => void auth.logout()} />
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Solicitações</Text>
                <Text style={styles.metricValue}>{header.total}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Pendentes</Text>
                <Text style={styles.metricValue}>{header.pending}</Text>
              </View>
            </View>

            <Card>
              <Title>Solicitar limpeza</Title>
              <Subtitle>Descreva o aparelho e o que deseja limpar (WhatsApp, Downloads etc.).</Subtitle>

              <View style={{ height: spacing.lg }} />

              <FieldLabel>Descrição</FieldLabel>
              <Input
                value={deviceInfo}
                onChangeText={setDeviceInfo}
                placeholder="Ex.: Motorola G. Limpar mídia do WhatsApp."
                multiline
                style={{ height: 90, textAlignVertical: "top" }}
              />

              <View style={{ height: spacing.md }} />

              <Button
                title={creating ? "Enviando..." : "Enviar solicitação"}
                disabled={creating}
                onPress={async () => {
                  if (!token) return;
                  setCreating(true);
                  try {
                    await createRequest(token, deviceInfo.trim() ? deviceInfo.trim() : undefined);
                    setDeviceInfo("");
                    const data = await listRequests(token);
                    setRequests(data.requests);
                  } catch (err) {
                    Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao solicitar");
                  } finally {
                    setCreating(false);
                  }
                }}
              />

              <View style={{ height: spacing.sm }} />

              <Button title="Nuvem (Admin)" variant="secondary" onPress={() => navigation.navigate("AdminCloud")} />
            </Card>

            <Text style={styles.sectionTitle}>Minhas solicitações</Text>
            {loading ? <Text style={styles.muted}>Carregando...</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Solicitação #{item.id.slice(0, 8)}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.deviceInfo || "(sem descrição)"}
                </Text>
                <Text style={styles.itemMeta}>Criado em {new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: spacing.sm }}>
                <StatusBadge status={item.status} />
                <Button title="Abrir" variant="secondary" onPress={() => navigation.navigate("RequestDetail", { id: item.id })} />
              </View>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </View>
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
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  metricValue: {
    marginTop: 6,
    fontSize: 18,
    color: colors.text,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
  itemRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  itemDesc: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
  },
  itemMeta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
