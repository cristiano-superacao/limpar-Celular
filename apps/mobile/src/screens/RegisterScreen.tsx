import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { register } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, FieldLabel, InlineMessage, Input, Subtitle, Title } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function RegisterScreen({ navigation }: any) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Card>
            <Title>Criar conta</Title>
            <Subtitle>Cadastre-se para solicitar a limpeza.</Subtitle>

            <View style={{ height: spacing.lg }} />

            <View style={{ gap: spacing.md }}>
              <View>
                <FieldLabel>E-mail</FieldLabel>
                <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
              <View>
                <FieldLabel>Senha (mín. 8)</FieldLabel>
                <Input value={password} onChangeText={setPassword} secureTextEntry />
              </View>

              {error ? <InlineMessage type="error" text={error} /> : null}

              <Button
                title={loading ? "Criando..." : "Criar conta"}
                disabled={loading}
                onPress={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    const data = await register(email.trim(), password);
                    await auth.setToken(data.token);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Falha ao cadastrar");
                  } finally {
                    setLoading(false);
                  }
                }}
              />

              <Button title="Já tenho conta" variant="secondary" onPress={() => navigation.navigate("Login")} />
            </View>
          </Card>

          <Text style={styles.hint}>
            Ao criar a conta, você já entra automaticamente.
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
  hint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
});
