import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import {
  Screen,
  Loading,
  ErrorState,
  Empty,
  ProgressBar,
  Button,
  styles,
} from "../components/ui";
export default function DashboardScreen() {
  const r = useResource(useCallback((s) => api.dashboard(s), [])),
    { user } = useAuth(),
    n = useNavigation();
  return (
    <Screen
      title={`Hola, ${user?.nombre.split(" ")[0]} 👋`}
      text="Pequeños pasos. Grandes posibilidades."
      reload={r.reload}
      loading={r.loading}
    >
      {r.loading && !r.data ? (
        <Loading />
      ) : r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : (
        r.data && (
          <>
            <View
              style={[
                styles.card,
                { backgroundColor: "#205747", borderColor: "#205747" },
              ]}
            >
              <Text style={[styles.h2, { color: "#e1ecc0", fontSize: 24 }]}>
                Tu próximo paso cuenta.
              </Text>
              <Text
                style={[styles.text, { color: "#d0dfcc", marginBottom: 18 }]}
              >
                Elige una tarea y dale un poco de espacio a lo importante.
              </Text>
              <Button secondary onPress={() => n.go({ name: "tasks" })}>
                Organizar mi día
              </Button>
            </View>
            <View style={[styles.row, { gap: 12 }]}>
              {[
                [r.data.cursos, "Cursos"],
                [r.data.tareasPendientes, "Pendientes"],
                [r.data.puntos, "Puntos"],
              ].map(([value, label]) => (
                <View
                  key={label}
                  style={[styles.card, { flex: 1, padding: 15 }]}
                >
                  <Text style={[styles.h2, { fontSize: 27 }]}>{value}</Text>
                  <Text style={styles.muted}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.h2}>Así van tus cursos</Text>
            {r.data.progreso.length ? (
              r.data.progreso.map((p) => (
                <Pressable
                  key={p.cursoId}
                  style={styles.card}
                  onPress={() => n.go({ name: "course", id: p.cursoId })}
                >
                  <View style={styles.spread}>
                    <Text style={[styles.text, { flex: 1, fontWeight: "600" }]}>
                      {p.nombreCurso}
                    </Text>
                    <Text style={styles.muted}>
                      {Math.round(p.porcentajeProgreso)} %
                    </Text>
                  </View>
                  <ProgressBar value={p.porcentajeProgreso} />
                  <Text style={styles.muted}>
                    {p.tareasCompletadas + p.temasCompletados} de{" "}
                    {p.totalTareas + p.totalTemas} actividades
                  </Text>
                </Pressable>
              ))
            ) : (
              <Empty text="Crea tu primer curso para comenzar." />
            )}
            <Button secondary onPress={() => n.go({ name: "courses" })}>
              Ver mis cursos
            </Button>
            <View style={{ height: 20 }} />
            <Button secondary onPress={() => n.go({ name: "goals" })}>
              Mis objetivos · {r.data.objetivosCompletados} logrados
            </Button>
            <View style={{ height: 12 }} />
            <Button secondary onPress={() => n.go({ name: "reminders" })}>
              Mis recordatorios
            </Button>
          </>
        )
      )}
    </Screen>
  );
}
