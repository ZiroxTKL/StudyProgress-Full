import { useState } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginSchema, registerSchema } from "@studyprogress/client";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ResourceForm, type Field } from "../components/ResourceForm";
import { Button, styles } from "../components/ui";
export default function AuthScreen() {
  const [register, setRegister] = useState(false),
    a = useAuth();
  const fields: Field[] = [
    ...(register ? [{ name: "nombre", label: "Nombre completo" }] : []),
    { name: "email", label: "Correo electrónico", type: "email" },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      hint: register
        ? "Mínimo 8 caracteres con mayúscula, minúscula y número."
        : undefined,
    },
  ];
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 28, paddingTop: 42 }}
        >
          <Text style={[styles.h2, { color: "#205747", marginBottom: 42 }]}>
            studyprogress.
          </Text>
          <Text style={styles.title}>
            {register
              ? "Tu próximo capítulo empieza aquí"
              : "Tu semestre, con más claridad."}
          </Text>
          <Text style={styles.subtitle}>
            {register
              ? "Crea una cuenta para organizar tus cursos."
              : "Ingresa y continúa con tu próximo paso."}
          </Text>
          {a.error && <Text style={styles.error}>{a.error}</Text>}
          <ResourceForm
            key={String(register)}
            fields={fields}
            schema={register ? registerSchema : loginSchema}
            initial={{ nombre: "", email: "", password: "" }}
            label={register ? "Crear mi cuenta" : "Ingresar"}
            onSubmit={async (v) => {
              if (register) await api.register(v.nombre, v.email, v.password);
              await a.login(v.email, v.password);
            }}
          />
          <View style={{ height: 22 }} />
          <Button secondary onPress={() => setRegister(!register)}>
            {register ? "Ya tengo cuenta" : "Crear una cuenta"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
