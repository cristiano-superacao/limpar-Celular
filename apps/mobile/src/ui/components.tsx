import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "./theme";

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function Button({
  title,
  onPress,
  disabled,
  variant,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = (variant ?? "primary") === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        (disabled ? styles.buttonDisabled : null) as any,
        pressed && !disabled ? { opacity: 0.92 } : null,
      ]}
    >
      <Text style={[styles.buttonText, isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>{title}</Text>
    </Pressable>
  );
}

export function InlineMessage({ type, text }: { type: "error" | "ok"; text: string }) {
  return (
    <View style={[styles.msg, type === "error" ? styles.msgError : styles.msgOk]}>
      <Text style={[styles.msgText, type === "error" ? styles.msgErrorText : styles.msgOkText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.muted,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    marginTop: 8,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: colors.primaryText,
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  msg: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  msgText: {
    fontSize: 13,
    fontWeight: "600",
  },
  msgError: {
    backgroundColor: colors.dangerBg,
  },
  msgErrorText: {
    color: colors.dangerText,
  },
  msgOk: {
    backgroundColor: colors.okBg,
  },
  msgOkText: {
    color: colors.okText,
  },
});
