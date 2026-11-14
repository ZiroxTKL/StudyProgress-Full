import { Component, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
export const colors = {
  green: "#205747",
  ink: "#294639",
  muted: "#788674",
  line: "#e1e8dc",
  bg: "#f7f8f3",
  cream: "#e8efcf",
};
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, paddingBottom: 40 },
  title: {
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -1,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: 23,
  },
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 15,
    padding: 20,
    marginBottom: 14,
  },
  h2: { fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: 10 },
  text: { fontSize: 14, color: colors.ink, lineHeight: 22 },
  muted: { fontSize: 12, color: colors.muted, lineHeight: 19 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  spread: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 13,
    color: colors.ink,
    fontSize: 14,
    marginBottom: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 8,
  },
  error: { color: "#a34834", fontSize: 12, lineHeight: 18, marginBottom: 10 },
  badge: {
    backgroundColor: "#edf2e4",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, color: "#63794e" },
  button: {
    backgroundColor: colors.green,
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  buttonText: { color: "white", fontSize: 13, fontWeight: "700" },
  secondary: { backgroundColor: "#e9efdf" },
  secondaryText: { color: colors.green },
  disabled: { opacity: 0.45 },
  state: { padding: 24, alignItems: "center", gap: 13 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 18 },
  link: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 9,
  },
});
export function Button({
  children,
  onPress,
  disabled = false,
  secondary = false,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}
export function Loading() {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.green} />
      <Text style={styles.muted}>Cargando tu información…</Text>
    </View>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <View style={styles.state} accessibilityRole="alert">
      <Text style={styles.h2}>No pudimos conectar</Text>
      <Text style={styles.muted}>{message}</Text>
      <Button onPress={retry}>Intentar de nuevo</Button>
    </View>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.state}>
      <Text style={{ fontSize: 30 }}>✦</Text>
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}
export function Screen({
  children,
  title,
  text,
  reload,
  loading = false,
}: {
  children: ReactNode;
  title: string;
  text?: string;
  reload?: () => void;
  loading?: boolean;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        reload ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={reload}
            tintColor={colors.green}
          />
        ) : undefined
      }
    >
      <Text style={styles.title}>{title}</Text>
      {text && <Text style={styles.subtitle}>{text}</Text>}
      {children}
    </ScrollView>
  );
}
export function ProgressBar({ value }: { value: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={{
        height: 6,
        borderRadius: 5,
        backgroundColor: "#edf0e6",
        marginVertical: 13,
      }}
    >
      <View
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: 6,
          borderRadius: 5,
          backgroundColor: "#91a56d",
        }}
      />
    </View>
  );
}
export const dateLabel = (s: string) =>
  new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString("es-PE");
export function confirmDelete(name: string, action: () => void) {
  Alert.alert(
    "¿Eliminar este elemento?",
    `Se eliminará «${name}». Esta acción no se puede deshacer.`,
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: action },
    ],
  );
}
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <View style={styles.state}>
        <Text style={styles.h2}>La vista tuvo un problema</Text>
        <Button onPress={() => this.setState({ error: false })}>
          Intentar nuevamente
        </Button>
      </View>
    ) : (
      this.props.children
    );
  }
}
