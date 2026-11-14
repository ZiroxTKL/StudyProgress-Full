import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import {
  courseSchema,
  topicSchema,
  taskSchema,
  evaluationSchema,
  gradeSchema,
  today,
  type Task,
  type Topic,
  type Evaluation,
} from "@studyprogress/client";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { useMutation } from "../hooks/useMutation";
import { useNavigation } from "../contexts/NavigationContext";
import {
  ResourceForm,
  FormModal,
  courseFields,
  taskFields,
  evaluationFields,
  type Field,
} from "../components/ResourceForm";
import {
  Screen,
  Loading,
  ErrorState,
  Empty,
  Button,
  Badge,
  ProgressBar,
  styles,
  confirmDelete,
  dateLabel,
} from "../components/ui";
type Editor = {
  kind: "course" | "task" | "topic" | "evaluation" | "grade";
  item?: any;
};
export default function CourseScreen({ id }: { id: number }) {
  const r = useResource(useCallback((s) => api.course(id, s), [id])),
    m = useMutation(r.reload),
    n = useNavigation(),
    [tab, setTab] = useState("task"),
    [editor, setEditor] = useState<Editor | null>(null);
  const configs = {
    course: {
      fields: courseFields,
      schema: courseSchema,
      title: "Editar curso",
    },
    task: { fields: taskFields, schema: taskSchema, title: "Tarea" },
    topic: {
      fields: [
        { name: "nombre", label: "Nombre del tema" },
        { name: "descripcion", label: "Descripción", type: "textarea" },
      ] as Field[],
      schema: topicSchema,
      title: "Tema",
    },
    evaluation: {
      fields: evaluationFields,
      schema: evaluationSchema,
      title: "Evaluación",
    },
    grade: {
      fields: [
        { name: "calificacion", label: "Calificación (0–20)", type: "number" },
      ] as Field[],
      schema: gradeSchema,
      title: "Calificación",
    },
  };
  async function save(v: any) {
    if (!editor) return;
    const e = editor;
    if (e.kind === "course") await api.saveCourse(v, id);
    if (e.kind === "task") await api.saveTask(v, id, e.item?.id);
    if (e.kind === "topic") await api.saveTopic(v, id, e.item?.id);
    if (e.kind === "evaluation") await api.saveEvaluation(v, id, e.item?.id);
    if (e.kind === "grade") await api.grade(e.item.id, v.calificacion);
    setEditor(null);
    r.reload();
  }
  const item = (
    kind: "task" | "topic" | "evaluation",
    t: Task | Topic | Evaluation,
  ) => {
    const title = "titulo" in t ? t.titulo : t.nombre,
      done =
        "completada" in t
          ? t.completada
          : "completado" in t
            ? t.completado
            : false;
    return (
      <View style={styles.card} key={t.id}>
        <Text style={styles.h2}>{title}</Text>
        <Text style={styles.muted}>{t.descripcion}</Text>
        {"fechaLimite" in t && (
          <Text style={styles.muted}>
            {dateLabel(t.fechaLimite)} · {t.prioridad}
          </Text>
        )}
        {"calificacion" in t && (
          <Text style={styles.text}>
            Nota: {t.calificacion ?? "Por calificar"} / 20 · {t.ponderacion} %
          </Text>
        )}
        {done && <Badge>Completado</Badge>}
        <View style={[styles.row, { marginTop: 15 }]}>
          {kind !== "evaluation" && !done && (
            <Button
              disabled={m.busy}
              onPress={() =>
                m.run(
                  () =>
                    kind === "task"
                      ? api.completeTask(t.id)
                      : api.completeTopic(t.id),
                  "¡Actividad completada!",
                )
              }
            >
              Completar
            </Button>
          )}
          {kind === "evaluation" && (
            <Button
              secondary
              onPress={() => setEditor({ kind: "grade", item: t })}
            >
              Calificar
            </Button>
          )}
          <Button secondary onPress={() => setEditor({ kind, item: t })}>
            Editar
          </Button>
          <Button
            secondary
            disabled={m.busy}
            onPress={() =>
              confirmDelete(title, () =>
                m.run(
                  () =>
                    kind === "task"
                      ? api.deleteTask(t.id)
                      : kind === "topic"
                        ? api.deleteTopic(t.id)
                        : api.deleteEvaluation(t.id),
                  "Actividad eliminada",
                ),
              )
            }
          >
            Eliminar
          </Button>
        </View>
      </View>
    );
  };
  return (
    <Screen
      title={r.data?.curso.nombre || "Curso"}
      text={r.data?.curso.descripcion}
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
            <View style={styles.card}>
              <Text style={styles.h2}>
                Tu avance · {Math.round(r.data.progreso.porcentajeProgreso)} %
              </Text>
              <ProgressBar value={r.data.progreso.porcentajeProgreso} />
              <Text style={styles.muted}>
                Promedio simple:{" "}
                {r.data.progreso.promedioEvaluaciones ?? "Sin notas"} / 20
              </Text>
              <View style={[styles.row, { marginTop: 15 }]}>
                <Button
                  secondary
                  onPress={() =>
                    setEditor({ kind: "course", item: r.data!.curso })
                  }
                >
                  Editar curso
                </Button>
                <Button
                  secondary
                  disabled={m.busy}
                  onPress={() =>
                    confirmDelete(
                      `${r.data!.curso.nombre} y todas sus actividades`,
                      () =>
                        m.run(async () => {
                          await api.deleteCourse(id);
                          n.back();
                        }, "Curso eliminado"),
                    )
                  }
                >
                  Eliminar curso
                </Button>
              </View>
            </View>
            <View style={[styles.row, { marginBottom: 20 }]}>
              {[
                ["task", "Tareas"],
                ["topic", "Temas"],
                ["evaluation", "Notas"],
              ].map(([key, label]) => (
                <Button
                  key={key}
                  secondary={tab !== key}
                  onPress={() => setTab(key)}
                >
                  {label}
                </Button>
              ))}
            </View>
            <Button onPress={() => setEditor({ kind: tab as Editor["kind"] })}>
              + Agregar{" "}
              {tab === "task"
                ? "tarea"
                : tab === "topic"
                  ? "tema"
                  : "evaluación"}
            </Button>
            <View style={{ height: 20 }} />
            {tab === "task" ? (
              r.data.tareas.length ? (
                r.data.tareas.map((t) => item("task", t))
              ) : (
                <Empty text="Agrega la primera tarea de este curso." />
              )
            ) : tab === "topic" ? (
              r.data.temas.length ? (
                r.data.temas.map((t) => item("topic", t))
              ) : (
                <Empty text="Divide tu aprendizaje en temas." />
              )
            ) : r.data.evaluaciones.length ? (
              r.data.evaluaciones.map((t) => item("evaluation", t))
            ) : (
              <Empty text="Registra tus próximas evaluaciones." />
            )}
          </>
        )
      )}
      {editor && (
        <FormModal
          title={configs[editor.kind].title}
          onClose={() => setEditor(null)}
        >
          <ResourceForm
            fields={configs[editor.kind].fields}
            schema={configs[editor.kind].schema}
            initial={
              editor.item
                ? { ...editor.item }
                : {
                    titulo: "",
                    nombre: "",
                    descripcion: "",
                    fechaLimite: today(),
                    fecha: today(),
                    prioridad: "MEDIA",
                    tipo: "EXAMEN",
                    ponderacion: 0,
                  }
            }
            onSubmit={save}
          />
        </FormModal>
      )}
    </Screen>
  );
}
