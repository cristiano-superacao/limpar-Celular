import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { getCloudConfig, setCloudConfig, type CloudProvider, me } from "../lib/api";
import { Button, Card, FieldLabel, InlineMessage, Input, Subtitle, Title } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function AdminCloudScreen() {
  const auth = useAuth();
  const token = auth.token;
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<CloudProvider>("NONE");
  const [bucketOrContainer, setBucketOrContainer] = useState("");
  const [region, setRegion] = useState("");

  useEffect(() => {
    (async () => {
      if (!token) return;
      // Guard leve no cliente: redireciona se não for ADMIN
      try {
        const info = await me(token);
        if (info.user.role !== "ADMIN") {
          navigation.navigate("Dashboard");
          return;
        }
      } catch {
        navigation.navigate("Dashboard");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getCloudConfig(token);
        if (data.config) {
          setEnabled(data.config.enabled);
          setProvider(data.config.provider);
          setBucketOrContainer(data.config.bucketOrContainer || "");
          setRegion(data.config.region || "");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Falha ao carregar";
        setError(msg);
        if (msg.includes("403") || msg.toLowerCase().includes("permiss")) {
          navigation.navigate("Dashboard");
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <Card>
        <Title>Nuvem (Admin)</Title>
        <Subtitle>Define se o sistema oferece backup e qual provedor (no MVP é demonstrativo).</Subtitle>

        <View style={{ height: spacing.lg }} />

        {loading ? <Text style={styles.muted}>Carregando...</Text> : null}
        {error ? <InlineMessage type="error" text={error} /> : null}
        {ok ? <InlineMessage type="ok" text={ok} /> : null}

        <View style={{ height: spacing.lg }} />

        <View style={{ gap: spacing.md }}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Habilitar backup em nuvem</Text>
            <Button
              title={enabled ? "Ativado" : "Desativado"}
              variant={enabled ? "primary" : "secondary"}
              onPress={() => setEnabled((v) => !v)}
            />
          </View>

          <View>
            <FieldLabel>Provedor</FieldLabel>
            <View style={styles.providerRow}>
              {(["NONE", "AZURE_BLOB", "AWS_S3", "GOOGLE_DRIVE", "OTHER"] as CloudProvider[]).map((p) => (
                <Button
                  key={p}
                  title={p}
                  variant={provider === p ? "primary" : "secondary"}
                  onPress={() => setProvider(p)}
                />
              ))}
            </View>
          </View>

          <View>
            <FieldLabel>Container/Bucket</FieldLabel>
            <Input value={bucketOrContainer} onChangeText={setBucketOrContainer} placeholder="ex.: limpa-celular-backups" />
          </View>

          <View>
            <FieldLabel>Região (opcional)</FieldLabel>
            <Input value={region} onChangeText={setRegion} placeholder="ex.: eastus" />
          </View>

          <Button
            title={saving ? "Salvando..." : "Salvar"}
            disabled={saving}
            onPress={async () => {
              if (!token) return;
              setSaving(true);
              setError(null);
              setOk(null);
              try {
                await setCloudConfig(token, {
                  enabled,
                  provider,
                  bucketOrContainer: bucketOrContainer.trim() ? bucketOrContainer.trim() : null,
                  region: region.trim() ? region.trim() : null,
                });
                setOk("Configuração salva.");
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Falha ao salvar";
                setError(msg);
                Alert.alert("Erro", msg);
              } finally {
                setSaving(false);
              }
            }}
          />
        </View>

        <View style={{ height: spacing.md }} />

        <Text style={styles.note}>
          Se sua conta não for ADMIN, a API retorna 403 e esta tela não carrega a configuração.
        </Text>
      </Card>
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
  },
  providerRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  note: {
    fontSize: 12,
    color: colors.muted,
  },
});
