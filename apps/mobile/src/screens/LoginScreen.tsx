import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { login } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, FieldLabel, InlineMessage, Input, Subtitle, Title } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function LoginScreen({ navigation }: any) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.logo} />
            <View>
              <Text style={styles.brandTitle}>Limpa Celular</Text>
              <Text style={styles.brandSub}>Acesse para solicitar a limpeza</Text>
            </View>
          </View>

          <Card>
            <Title>Entrar</Title>
            <Subtitle>Use seu e-mail e senha para continuar.</Subtitle>

            <View style={{ height: spacing.lg }} />

            <View style={{ gap: spacing.md }}>
              <View>
                <FieldLabel>E-mail</FieldLabel>
                <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
              <View>
                <FieldLabel>Senha</FieldLabel>
                <Input value={password} onChangeText={setPassword} secureTextEntry />
              </View>

              {error ? <InlineMessage type="error" text={error} /> : null}

              <Button
                title={loading ? "Entrando..." : "Entrar"}
                disabled={loading}
                onPress={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    const data = await login(email.trim(), password);
                    await auth.setToken(data.token);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Falha ao entrar");
                  } finally {
                    setLoading(false);
                  }
                }}
              />

              <Button title="Criar conta" variant="secondary" onPress={() => navigation.navigate("Register")} />
            </View>
          </Card>

          <Text style={styles.hint}>
            Dica: em dispositivo físico, configure EXPO_PUBLIC_API_URL com o IP da sua máquina.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  brandSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
});
