import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { courseSchema } from "@studyprogress/client";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { useNavigation } from "../contexts/NavigationContext";
import {
  ResourceForm,
  FormModal,
  courseFields,
} from "../components/ResourceForm";
import {
  Screen,
  Loading,
  ErrorState,
  Empty,
  Button,
  styles,
} from "../components/ui";
export default function CoursesScreen() {
  const [page, setPage] = useState(0),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [creating, setCreating] = useState(false),
    n = useNavigation();
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);
  const r = useResource(
    useCallback(
      (s) => api.courses({ page, size: 10, search: query, sort: "nombre" }, s),
      [page, query],
    ),
  );
  return (
    <Screen
      title="Mis cursos"
      text="Un espacio para cada materia."
      reload={r.reload}
      loading={r.loading}
    >
      <TextInput
        accessibilityLabel="Buscar cursos"
        style={[styles.input, { marginBottom: 16 }]}
        placeholder="Buscar un curso…"
        value={search}
        onChangeText={setSearch}
      />
      <Button onPress={() => setCreating(true)}>+ Nuevo curso</Button>
      <View style={{ height: 20 }} />
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : (
        r.data && (
          <>
            {r.data.content.length ? (
              r.data.content.map((c) => (
                <Pressable
                  style={styles.card}
                  key={c.id}
                  onPress={() => n.go({ name: "course", id: c.id })}
                >
                  <Text style={styles.h2}>{c.nombre}</Text>
                  <Text style={styles.muted}>
                    {c.descripcion || "Tu siguiente aprendizaje empieza aquí."}
                  </Text>
                  <Text style={styles.link}>Abrir curso ↗</Text>
                </Pressable>
              ))
            ) : (
              <Empty
                text={
                  query
                    ? "Sin resultados. Prueba otro nombre."
                    : "Crea un curso para organizar tu semestre."
                }
              />
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
                {page + 1} / {Math.max(1, r.data.totalPages)}
              </Text>
              <Button
                secondary
                disabled={page + 1 >= r.data.totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </View>
            <Text style={[styles.muted, { marginTop: 12 }]}>
              {r.data.total} cursos en total
            </Text>
          </>
        )
      )}
      {creating && (
        <FormModal title="Nuevo curso" onClose={() => setCreating(false)}>
          <ResourceForm
            fields={courseFields}
            schema={courseSchema}
            initial={{ nombre: "", descripcion: "" }}
            onSubmit={async (v) => {
              await api.saveCourse(v);
              setCreating(false);
              r.reload();
            }}
          />
        </FormModal>
      )}
    </Screen>
  );
}
