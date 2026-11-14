import { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type ZodType } from "zod";
import { fieldErrors, friendlyError } from "@studyprogress/client";
import { Button, styles } from "./ui";
export interface Field {
  name: string;
  label: string;
  type?: string;
  hint?: string;
  options?: string[];
}
export function ResourceForm({
  fields,
  schema,
  initial,
  onSubmit,
  label = "Guardar",
}: {
  fields: Field[];
  schema: ZodType;
  initial?: Record<string, unknown>;
  onSubmit: (v: any) => Promise<void>;
  label?: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial || {}),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    lock = useRef(false);
  function change(name: string, value: string) {
    const v = { ...values, [name]: value };
    setValues(v);
    const result = schema.safeParse(v);
    setErrors(result.success ? {} : fieldErrors(result.error));
  }
  async function submit() {
    if (lock.current) return;
    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await onSubmit(result.data);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <View>
      {fields.map((f) => (
        <View key={f.name} style={{ marginBottom: 15 }}>
          <Text style={styles.label}>{f.label}</Text>
          {f.options ? (
            <View style={[styles.row, { marginBottom: 8 }]}>
              {f.options.map((o) => (
                <Button
                  key={o}
                  secondary={values[f.name] !== o}
                  onPress={() => change(f.name, o)}
                >
                  {o}
                </Button>
              ))}
            </View>
          ) : (
            <TextInput
              accessibilityLabel={f.label}
              style={styles.input}
              value={String(values[f.name] ?? "")}
              onChangeText={(v) => change(f.name, v)}
              secureTextEntry={f.type === "password"}
              autoCapitalize={f.type === "email" ? "none" : "sentences"}
              autoCorrect={f.type !== "email" && f.type !== "password"}
              keyboardType={
                f.type === "email"
                  ? "email-address"
                  : f.type === "number"
                    ? "decimal-pad"
                    : "default"
              }
              multiline={f.type === "textarea"}
              placeholder={
                f.type === "date"
                  ? "AAAA-MM-DD"
                  : f.type === "datetime"
                    ? "AAAA-MM-DDTHH:mm"
                    : undefined
              }
            />
          )}
          <Text style={errors[f.name] ? styles.error : styles.muted}>
            {errors[f.name] || f.hint}
          </Text>
        </View>
      ))}
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Button onPress={submit} disabled={busy}>
        {busy ? "Guardando…" : label}
      </Button>
    </View>
  );
}
export function FormModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <Text style={styles.h2}>{title}</Text>
            {children}
            <View style={{ height: 14 }} />
            <Button secondary onPress={onClose}>
              Cerrar
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
export const courseFields: Field[] = [
  { name: "nombre", label: "Nombre del curso" },
  { name: "descripcion", label: "Descripción", type: "textarea" },
];
export const titleFields: Field[] = [
  { name: "titulo", label: "Título" },
  { name: "descripcion", label: "Descripción", type: "textarea" },
];
export const taskFields: Field[] = [
  ...titleFields,
  {
    name: "fechaLimite",
    label: "Fecha límite",
    type: "date",
    hint: "Formato AAAA-MM-DD",
  },
  { name: "prioridad", label: "Prioridad", options: ["ALTA", "MEDIA", "BAJA"] },
];
export const evaluationFields: Field[] = [
  ...titleFields,
  { name: "fecha", label: "Fecha", type: "date" },
  {
    name: "tipo",
    label: "Tipo",
    options: ["EXAMEN", "PRACTICA", "PROYECTO", "OTRO"],
  },
  { name: "ponderacion", label: "Ponderación (0–100 %)", type: "number" },
];
