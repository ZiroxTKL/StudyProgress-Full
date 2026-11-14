import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { useMutation } from "../hooks/useMutation";
import { useNavigation } from "../contexts/NavigationContext";
import {
  Screen,
  Loading,
  ErrorState,
  Empty,
  Button,
  Badge,
  styles,
  dateLabel,
} from "../components/ui";
export default function TasksScreen() {
  const [page, setPage] = useState(0),
    r = useResource(
      useCallback(
        (s) =>
          api.tasks({ page, size: 10, search: "", sort: "fechaLimite" }, s),
        [page],
      ),
    ),
    m = useMutation(r.reload),
    n = useNavigation();
  return (
    <Screen
      title="Mis tareas"
      text="Tu plan de acción, en cualquier lugar."
      reload={r.reload}
      loading={r.loading}
    >
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : (
        r.data && (
          <>
            {r.data.content.length ? (
              r.data.content.map((t) => (
                <View key={t.id} style={styles.card}>
                  <View style={styles.spread}>
                    <Text style={[styles.h2, { flex: 1 }]}>{t.titulo}</Text>
                    <Badge>{t.prioridad}</Badge>
                  </View>
                  <Text style={styles.muted}>
                    {dateLabel(t.fechaLimite)} ·{" "}
                    {t.completada ? "Completada" : "Pendiente"}
                  </Text>
                  <View style={[styles.row, { marginTop: 18 }]}>
                    {!t.completada && (
                      <Button
                        disabled={m.busy}
                        onPress={() =>
                          m.run(
                            () => api.completeTask(t.id),
                            "¡Tarea completada!",
                          )
                        }
                      >
                        Completar
                      </Button>
                    )}
                    <Button
                      secondary
                      onPress={() => n.go({ name: "course", id: t.cursoId })}
                    >
                      Ir al curso
                    </Button>
                  </View>
                </View>
              ))
            ) : (
              <Empty text="Agrega tareas dentro de tus cursos." />
            )}
            <View style={styles.row}>
              <Button
                secondary
                disabled={page === 0}
                onPress={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Text style={styles.muted}>
                {page + 1}/{Math.max(1, r.data.totalPages)}
              </Text>
              <Button
                secondary
                disabled={page + 1 >= r.data.totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </View>
          </>
        )
      )}
    </Screen>
  );
}
