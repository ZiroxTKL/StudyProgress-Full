import { Alert, Text, View } from "react-native";
import { friendlyError } from "@studyprogress/client";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { Screen, Button, Badge, styles } from "../components/ui";
export default function ProfileScreen() {
  const a = useAuth(),
    n = useNavigation();
  return (
    <Screen title="Mi perfil" text="Tu cuenta y tu espacio personal.">
      <View style={styles.card}>
        <Text style={styles.h2}>{a.user?.nombre}</Text>
        <Text style={[styles.muted, { marginBottom: 15 }]}>
          {a.user?.email}
        </Text>
        <Badge>
          {a.user?.rol === "ADMIN" ? "Administrador" : "Estudiante"}
        </Badge>
        <Text style={[styles.muted, { marginVertical: 20 }]}>
          Tus credenciales de sesión se guardan con SecureStore en este
          dispositivo. Tus cursos y actividades se guardan en el servidor.
        </Text>
        <Button secondary onPress={() => n.go({ name: "goals" })}>
          Mis objetivos
        </Button>
        <View style={{ height: 12 }} />
        <Button secondary onPress={() => n.go({ name: "reminders" })}>
          Mis recordatorios
        </Button>
        <View style={{ height: 24 }} />
        <Button
          onPress={() =>
            a
              .logout()
              .catch((e) =>
                Alert.alert(
                  "Sesión cerrada en el dispositivo",
                  friendlyError(e),
                ),
              )
          }
        >
          Cerrar sesión
        </Button>
      </View>
    </Screen>
  );
}
