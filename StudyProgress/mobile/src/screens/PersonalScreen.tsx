import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import {
  goalFormSchema,
  reminderSchema,
  today,
  type Goal,
  type Reminder,
} from "@studyprogress/client";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { useMutation } from "../hooks/useMutation";
import {
  ResourceForm,
  FormModal,
  titleFields,
  type Field,
} from "../components/ResourceForm";
import {
  Screen,
  Loading,
  ErrorState,
  Empty,
  Button,
  Badge,
  styles,
  confirmDelete,
  dateLabel,
} from "../components/ui";
export default function PersonalScreen({ goals }: { goals: boolean }) {
  const r = useResource<Goal[] | Reminder[]>(
      useCallback((s) => (goals ? api.goals(s) : api.reminders(s)), [goals]),
    ),
    m = useMutation(r.reload),
    [editor, setEditor] = useState<Goal | Reminder | "new" | null>(null);
  const fields: Field[] = [
    ...titleFields,
    goals
      ? {
          name: "fechaLimite",
          label: "Fecha límite (AAAA-MM-DD)",
          type: "date",
        }
      : {
          name: "fechaHora",
          label: "Fecha y hora de Lima",
          type: "datetime",
          hint: "AAAA-MM-DDTHH:mm, por ejemplo 2026-12-01T18:30",
        },
  ];
  return (
    <Screen
      title={goals ? "Mis objetivos" : "Recordatorios"}
      text={
        goals ? "Dale dirección a tu esfuerzo." : "Deja espacio en tu mente."
      }
      reload={r.reload}
      loading={r.loading}
    >
      <Button onPress={() => setEditor("new")}>
        + Nuevo {goals ? "objetivo" : "recordatorio"}
      </Button>
      <View style={{ height: 20 }} />
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : r.data?.length ? (
        r.data.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.h2}>{t.titulo}</Text>
            <Text style={styles.muted}>{t.descripcion}</Text>
            <Text style={[styles.muted, { marginVertical: 12 }]}>
              {dateLabel("fechaLimite" in t ? t.fechaLimite : t.fechaHora)}
            </Text>
            <Badge>
              {"completado" in t
                ? t.completado
                  ? "Completado"
                  : "En progreso"
                : t.enviado
                  ? "Enviado"
                  : "Programado"}
            </Badge>
            <View style={[styles.row, { marginTop: 17 }]}>
              {"completado" in t && !t.completado && (
                <Button
                  disabled={m.busy}
                  onPress={() =>
                    m.run(() => api.completeGoal(t.id), "¡Objetivo cumplido!")
                  }
                >
                  Completar
                </Button>
              )}
              <Button secondary onPress={() => setEditor(t)}>
                Editar
              </Button>
              <Button
                secondary
                disabled={m.busy}
                onPress={() =>
                  confirmDelete(t.titulo, () =>
                    m.run(
                      () =>
                        goals ? api.deleteGoal(t.id) : api.deleteReminder(t.id),
                      "Elemento eliminado",
                    ),
                  )
                }
              >
                Eliminar
              </Button>
            </View>
          </View>
        ))
      ) : (
        <Empty
          text={
            goals
              ? "Tu próximo objetivo puede empezar con algo pequeño."
              : "Agrega una fecha que no quieras olvidar."
          }
        />
      )}{" "}
      {!goals && (
        <Text style={styles.muted}>
          Los correos requieren configuración de Resend en el servidor.
        </Text>
      )}
      {editor && (
        <FormModal
          title={`${editor === "new" ? "Nuevo" : "Editar"} ${goals ? "objetivo" : "recordatorio"}`}
          onClose={() => setEditor(null)}
        >
          <ResourceForm
            fields={fields}
            schema={goals
              ? goalFormSchema(editor !== "new" && "fechaLimite" in editor
                ? editor.fechaLimite
                : undefined)
              : reminderSchema}
            initial={
              editor === "new"
                ? {
                    titulo: "",
                    descripcion: "",
                    fechaLimite: today(),
                    fechaHora: "",
                  }
                : { ...editor }
            }
            onSubmit={async (v) => {
              const id = editor === "new" ? undefined : editor.id;
              if (goals) await api.saveGoal(v, id);
              else await api.saveReminder(v, id);
              setEditor(null);
              r.reload();
            }}
          />
        </FormModal>
      )}
    </Screen>
  );
}
