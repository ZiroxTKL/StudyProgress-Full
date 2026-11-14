import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Check, Pencil, Trash2, QrCode, Plus } from "lucide-react";
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
import { useToast } from "../contexts/ToastContext";
import {
  PageHeading,
  ProgressBar,
  ErrorState,
  Skeleton,
  EmptyState,
  Modal,
  Button,
  Badge,
  ConfirmDialog,
  dateLabel,
} from "../components/ui";
import {
  ResourceForm,
  courseFields,
  taskFields,
  evaluationFields,
  type Field,
} from "../components/ResourceForm";
type Editor = {
  kind: "course" | "task" | "topic" | "evaluation" | "grade";
  item?: any;
};
export default function CourseDetailPage() {
  const { id } = useParams(),
    courseId = Number(id),
    navigate = useNavigate(),
    r = useResource(useCallback((s) => api.course(courseId, s), [courseId])),
    m = useMutation(r.reload),
    toast = useToast();
  const [tab, setTab] = useState("tareas"),
    [editor, setEditor] = useState<Editor | null>(null),
    [qr, setQr] = useState(false),
    [deletion, setDeletion] = useState<{
      kind: string;
      id: number;
      name: string;
    } | null>(null);
  if (r.loading) return <Skeleton />;
  if (r.error) return <ErrorState message={r.error} retry={r.reload} />;
  const d = r.data!;
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
      title: "Registrar calificación",
    },
  };
  async function save(v: any) {
    if (!editor) return;
    const e = editor;
    if (e.kind === "course") await api.saveCourse(v, courseId);
    if (e.kind === "task") await api.saveTask(v, courseId, e.item?.id);
    if (e.kind === "topic") await api.saveTopic(v, courseId, e.item?.id);
    if (e.kind === "evaluation")
      await api.saveEvaluation(v, courseId, e.item?.id);
    if (e.kind === "grade") await api.grade(e.item.id, v.calificacion);
    setEditor(null);
    toast("Cambios guardados");
    r.reload();
  }
  const actions = (
    kind: "task" | "topic" | "evaluation",
    item: Task | Topic | Evaluation,
    complete?: () => Promise<unknown>,
  ) => (
    <div className="row-actions">
      {complete && (
        <button
          disabled={m.busy}
          aria-label={`Completar ${"titulo" in item ? item.titulo : item.nombre}`}
          title="Completar"
          onClick={() => m.run(complete, "¡Actividad completada!")}
        >
          <Check size={18} />
        </button>
      )}
      {kind === "evaluation" && (
        <Button
          variant="secondary"
          onClick={() => setEditor({ kind: "grade", item })}
        >
          Calificar
        </Button>
      )}
      <button
        aria-label="Editar actividad"
        title="Editar"
        onClick={() => setEditor({ kind, item })}
      >
        <Pencil size={16} />
      </button>
      <button
        aria-label="Eliminar actividad"
        title="Eliminar"
        onClick={() =>
          setDeletion({
            kind,
            id: item.id,
            name: "titulo" in item ? item.titulo : item.nombre,
          })
        }
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
  return (
    <>
      <Link to="/cursos" className="back-link">
        ← Mis cursos
      </Link>
      <PageHeading
        eyebrow="TU ESPACIO PARA APRENDER"
        title={d.curso.nombre}
        text={d.curso.descripcion}
        action={
          <div className="row-actions">
            <Button variant="secondary" onClick={() => setQr(true)}>
              <QrCode size={18} />
              Compartir QR
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditor({ kind: "course", item: d.curso })}
            >
              <Pencil size={16} />
              Editar
            </Button>
            <Button
              variant="ghost"
              aria-label="Eliminar curso"
              onClick={() =>
                setDeletion({
                  kind: "course",
                  id: courseId,
                  name: d.curso.nombre,
                })
              }
            >
              <Trash2 size={18} />
            </Button>
          </div>
        }
      />
      <div className="course-summary panel">
        <div>
          <h2>Tu avance en este curso</h2>
          <p className="muted">
            Cada tema y tarea completados suman a tu progreso.
          </p>
          <ProgressBar
            value={d.progreso.porcentajeProgreso}
            label="Actividades completadas"
          />
        </div>
        <div className="grade-summary">
          <strong>
            {d.progreso.promedioEvaluaciones ?? "—"}
            <small>/20</small>
          </strong>
          <span>
            Promedio simple · {d.progreso.evaluacionesCalificadas} evaluaciones
          </span>
        </div>
      </div>
      <div className="tabbar" role="tablist" aria-label="Actividades del curso">
        {[
          ["tareas", "Tareas", d.tareas.length],
          ["temas", "Temas", d.temas.length],
          ["evaluaciones", "Evaluaciones", d.evaluaciones.length],
        ].map(([key, label, count]) => (
          <button
            role="tab"
            aria-selected={tab === key}
            key={key}
            onClick={() => setTab(String(key))}
          >
            {label}
            <span>{count}</span>
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h2>
          {tab === "tareas"
            ? "Tu plan de acción"
            : tab === "temas"
              ? "Lo que vas a aprender"
              : "Tus evaluaciones"}
        </h2>
        <Button
          onClick={() =>
            setEditor({
              kind:
                tab === "tareas"
                  ? "task"
                  : tab === "temas"
                    ? "topic"
                    : "evaluation",
            })
          }
        >
          <Plus size={17} />
          Agregar{" "}
          {tab === "tareas" ? "tarea" : tab === "temas" ? "tema" : "evaluación"}
        </Button>
      </div>
      <div className="activity-list">
        {tab === "tareas" &&
          (d.tareas.length ? (
            d.tareas.map((t) => (
              <article className="activity-row" key={t.id}>
                <span
                  className={`check-indicator ${t.completada ? "done" : ""}`}
                >
                  <Check size={16} />
                </span>
                <div className="activity-body">
                  <h3>{t.titulo}</h3>
                  <p>{t.descripcion}</p>
                  <div className="inline-meta">
                    <span>{dateLabel(t.fechaLimite)}</span>
                    <Badge tone={t.prioridad === "ALTA" ? "orange" : "neutral"}>
                      {t.prioridad.toLowerCase()}
                    </Badge>
                    {t.completada && <Badge tone="green">Completada</Badge>}
                  </div>
                </div>
                {actions(
                  "task",
                  t,
                  t.completada ? undefined : () => api.completeTask(t.id),
                )}
              </article>
            ))
          ) : (
            <EmptyState text="Agrega la primera tarea de este curso." />
          ))}
        {tab === "temas" &&
          (d.temas.length ? (
            d.temas.map((t) => (
              <article className="activity-row" key={t.id}>
                <span
                  className={`check-indicator ${t.completado ? "done" : ""}`}
                >
                  <Check size={16} />
                </span>
                <div className="activity-body">
                  <h3>{t.nombre}</h3>
                  <p>{t.descripcion}</p>
                  {t.completado && <Badge tone="green">Completado</Badge>}
                </div>
                {actions(
                  "topic",
                  t,
                  t.completado ? undefined : () => api.completeTopic(t.id),
                )}
              </article>
            ))
          ) : (
            <EmptyState text="Divide la materia en temas para ver cómo avanzas." />
          ))}
        {tab === "evaluaciones" &&
          (d.evaluaciones.length ? (
            d.evaluaciones.map((t) => (
              <article className="activity-row" key={t.id}>
                <span className="evaluation-grade">
                  {t.calificacion ?? "—"}
                </span>
                <div className="activity-body">
                  <h3>{t.titulo}</h3>
                  <p>{t.descripcion}</p>
                  <div className="inline-meta">
                    <span>{dateLabel(t.fecha)}</span>
                    <Badge>{t.tipo.toLowerCase()}</Badge>
                    <span>{t.ponderacion} % del curso</span>
                  </div>
                </div>
                {actions("evaluation", t)}
              </article>
            ))
          ) : (
            <EmptyState text="Registra evaluaciones y sus calificaciones para seguir tus resultados." />
          ))}
      </div>
      {editor && (
        <Modal
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
                    nombre: "",
                    titulo: "",
                    descripcion: "",
                    fechaLimite: today(),
                    fecha: today(),
                    prioridad: "MEDIA",
                    tipo: "EXAMEN",
                    ponderacion: 0,
                  }
            }
            onCancel={() => setEditor(null)}
            onSubmit={save}
          />
        </Modal>
      )}
      {qr && (
        <Modal title="Lleva este curso a tu app" onClose={() => setQr(false)}>
          <p className="muted">
            Escanea desde la app móvil. Se copiará el nombre del curso y hasta
            10 temas; tus tareas y notas siguen siendo privadas.
          </p>
          <div className="qr-code">
            <QRCodeSVG
              value={JSON.stringify({
                version: 1,
                type: "studyprogress-course",
                nombre: d.curso.nombre,
                descripcion: d.curso.descripcion || "",
                temas: d.temas.slice(0, 10).map((t) => t.nombre),
              })}
              size={260}
              level="L"
            />
          </div>
          <small className="muted">
            En la app: Herramientas → Importar curso con QR.
          </small>
        </Modal>
      )}
      {deletion && (
        <ConfirmDialog
          title={`¿Eliminar ${deletion.kind === "course" ? "este curso" : "esta actividad"}?`}
          text={`Se eliminará «${deletion.name}»${deletion.kind === "course" ? " junto con sus temas, tareas y evaluaciones" : ""}. Esta acción no se puede deshacer.`}
          busy={m.busy}
          onCancel={() => setDeletion(null)}
          onConfirm={async () => {
            const x = deletion;
            const action =
              x.kind === "course"
                ? () => api.deleteCourse(x.id)
                : x.kind === "task"
                  ? () => api.deleteTask(x.id)
                  : x.kind === "topic"
                    ? () => api.deleteTopic(x.id)
                    : () => api.deleteEvaluation(x.id);
            if (await m.run(action, "Recurso eliminado")) {
              setDeletion(null);
              if (x.kind === "course") navigate("/cursos");
            }
          }}
        />
      )}
    </>
  );
}
