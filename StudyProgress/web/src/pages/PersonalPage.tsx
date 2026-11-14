import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Pencil, Trash2, Bell, Target } from "lucide-react";
import {
  goalSchema,
  reminderSchema,
  today,
  type Goal,
  type Reminder,
} from "@studyprogress/client";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { useMutation } from "../hooks/useMutation";
import {
  PageHeading,
  ErrorState,
  Skeleton,
  EmptyState,
  Modal,
  AddButton,
  Badge,
  ConfirmDialog,
  dateLabel,
} from "../components/ui";
import {
  ResourceForm,
  titleFields,
  type Field,
} from "../components/ResourceForm";
import { useToast } from "../contexts/ToastContext";
export default function PersonalPage() {
  const goals = useLocation().pathname === "/objetivos",
    r = useResource<Goal[] | Reminder[]>(
      useCallback((s) => (goals ? api.goals(s) : api.reminders(s)), [goals]),
    ),
    m = useMutation(r.reload),
    [editor, setEditor] = useState<Goal | Reminder | "new" | null>(null),
    [deleting, setDeleting] = useState<Goal | Reminder | null>(null),
    [filter, setFilter] = useState("all"),
    toast = useToast();
  const fields: Field[] = [
    ...titleFields,
    goals
      ? { name: "fechaLimite", label: "Fecha límite", type: "date" }
      : {
          name: "fechaHora",
          label: "Fecha y hora (hora local de Lima)",
          type: "datetime-local",
        },
  ];
  const items = r.data?.filter(
    (t) =>
      filter === "all" ||
      (filter === "done") === ("completado" in t ? t.completado : t.enviado),
  );
  return (
    <>
      <PageHeading
        eyebrow={
          goals ? "DALE DIRECCIÓN A TU ESFUERZO" : "DEJA ESPACIO EN TU MENTE"
        }
        title={goals ? "Mis objetivos" : "Recordatorios"}
        text={
          goals
            ? "Define una meta y hazla parte de tu día."
            : "Prepara tus próximas fechas importantes."
        }
        action={
          <AddButton onClick={() => setEditor("new")}>
            {goals ? "Nuevo objetivo" : "Nuevo recordatorio"}
          </AddButton>
        }
      />
      <div className="toolbar">
        <label>
          Mostrar{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="done">{goals ? "Completados" : "Enviados"}</option>
          </select>
        </label>
      </div>
      {r.loading ? (
        <Skeleton />
      ) : r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : items?.length ? (
        <div className="personal-grid">
          {items.map((t) => (
            <article className="personal-card" key={t.id}>
              <div className="spread">
                <span className="course-initial color-0">
                  {goals ? <Target /> : <Bell />}
                </span>
                <Badge
                  tone={
                    ("completado" in t ? t.completado : t.enviado)
                      ? "green"
                      : "neutral"
                  }
                >
                  {"completado" in t
                    ? t.completado
                      ? "Completado"
                      : "En progreso"
                    : t.enviado
                      ? "Enviado"
                      : "Programado"}
                </Badge>
              </div>
              <h2>{t.titulo}</h2>
              <p>{t.descripcion}</p>
              <small className="muted">
                {dateLabel("fechaLimite" in t ? t.fechaLimite : t.fechaHora)}
              </small>
              <div className="row-actions card-actions">
                {"completado" in t && !t.completado && (
                  <button
                    title="Completar objetivo"
                    aria-label={`Completar ${t.titulo}`}
                    disabled={m.busy}
                    onClick={() =>
                      m.run(() => api.completeGoal(t.id), "¡Objetivo cumplido!")
                    }
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  title="Editar"
                  aria-label={`Editar ${t.titulo}`}
                  onClick={() => setEditor(t)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  title="Eliminar"
                  aria-label={`Eliminar ${t.titulo}`}
                  onClick={() => setDeleting(t)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          text={
            goals
              ? "Tu próximo objetivo puede empezar con algo pequeño."
              : "Agrega un recordatorio para una fecha que no quieres olvidar."
          }
          action={
            <AddButton onClick={() => setEditor("new")}>
              Crear {goals ? "objetivo" : "recordatorio"}
            </AddButton>
          }
        />
      )}{" "}
      {!goals && (
        <p className="muted help-note">
          Los correos requieren que el servidor tenga Resend configurado. La
          agenda permanece disponible en la aplicación.
        </p>
      )}
      {editor && (
        <Modal
          title={`${editor === "new" ? "Nuevo" : "Editar"} ${goals ? "objetivo" : "recordatorio"}`}
          onClose={() => setEditor(null)}
        >
          <ResourceForm
            fields={fields}
            schema={goals ? goalSchema : reminderSchema}
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
            onCancel={() => setEditor(null)}
            onSubmit={async (v) => {
              const id = editor === "new" ? undefined : editor.id;
              if (goals) await api.saveGoal(v, id);
              else await api.saveReminder(v, id);
              setEditor(null);
              toast("Cambios guardados");
              r.reload();
            }}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="¿Eliminar este elemento?"
          text={`Se eliminará «${deleting.titulo}».`}
          busy={m.busy}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            if (
              await m.run(
                () =>
                  goals
                    ? api.deleteGoal(deleting.id)
                    : api.deleteReminder(deleting.id),
                "Elemento eliminado",
              )
            )
              setDeleting(null);
          }}
        />
      )}
    </>
  );
}
