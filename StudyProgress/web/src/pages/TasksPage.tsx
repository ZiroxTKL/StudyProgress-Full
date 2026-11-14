import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Trash2, Pencil } from "lucide-react";
import { taskSchema, type Task } from "@studyprogress/client";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { usePageQuery } from "../hooks/usePageQuery";
import { useMutation } from "../hooks/useMutation";
import {
  PageHeading,
  SearchBox,
  Pagination,
  ErrorState,
  Skeleton,
  EmptyState,
  Modal,
  Button,
  Badge,
  ConfirmDialog,
  dateLabel,
} from "../components/ui";
import { ResourceForm, taskFields } from "../components/ResourceForm";
export default function TasksPage() {
  const { q, search, setSearch, update } = usePageQuery("fechaLimite"),
    r = useResource(useCallback((s) => api.tasks(q, s), [q])),
    m = useMutation(r.reload),
    [editing, setEditing] = useState<Task | null>(null),
    [deleting, setDeleting] = useState<Task | null>(null);
  return (
    <>
      <PageHeading
        eyebrow="UN PASO A LA VEZ"
        title="Mis tareas"
        text="Prioriza lo importante y celebra lo que ya terminaste."
        action={
          <Link className="button primary" to="/cursos">
            Agregar desde un curso
          </Link>
        }
      />
      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} />
        <label>
          Ordenar por{" "}
          <select
            value={q.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="fechaLimite">Fecha límite</option>
            <option value="titulo">Título</option>
            <option value="prioridad">Prioridad</option>
          </select>
        </label>
      </div>
      {r.loading ? (
        <Skeleton />
      ) : r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : (
        r.data && (
          <>
            {r.data.content.length ? (
              <div className="panel table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Tarea</th>
                      <th>Fecha límite</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.data.content.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <Link
                            className="table-title"
                            to={`/cursos/${t.cursoId}`}
                          >
                            {t.titulo}
                          </Link>
                          <small className="table-description">
                            {t.descripcion}
                          </small>
                        </td>
                        <td>{dateLabel(t.fechaLimite)}</td>
                        <td>
                          <Badge
                            tone={t.prioridad === "ALTA" ? "orange" : "neutral"}
                          >
                            {t.prioridad.toLowerCase()}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={t.completada ? "green" : "neutral"}>
                            {t.completada ? "Completada" : "Pendiente"}
                          </Badge>
                        </td>
                        <td>
                          <div className="row-actions">
                            {!t.completada && (
                              <button
                                disabled={m.busy}
                                title="Completar tarea"
                                aria-label={`Completar ${t.titulo}`}
                                onClick={() =>
                                  m.run(
                                    () => api.completeTask(t.id),
                                    "¡Tarea completada!",
                                  )
                                }
                              >
                                <Check size={18} />
                              </button>
                            )}
                            <button
                              title="Editar tarea"
                              aria-label={`Editar ${t.titulo}`}
                              onClick={() => setEditing(t)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              title="Eliminar tarea"
                              aria-label={`Eliminar ${t.titulo}`}
                              onClick={() => setDeleting(t)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                text={
                  search
                    ? "No hay tareas con ese nombre."
                    : "Agrega tus próximas tareas dentro de un curso."
                }
                action={
                  <Link className="button primary" to="/cursos">
                    Ir a mis cursos
                  </Link>
                }
              />
            )}
            <Pagination page={r.data} onChange={update} />
          </>
        )
      )}
      {editing && (
        <Modal title="Editar tarea" onClose={() => setEditing(null)}>
          <ResourceForm
            fields={taskFields}
            schema={taskSchema}
            initial={{ ...editing }}
            onCancel={() => setEditing(null)}
            onSubmit={async (v) => {
              await api.saveTask(v, editing.cursoId, editing.id);
              setEditing(null);
              r.reload();
            }}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="¿Eliminar esta tarea?"
          text={`Se eliminará «${deleting.titulo}». Esta acción no se puede deshacer.`}
          busy={m.busy}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            if (
              await m.run(() => api.deleteTask(deleting.id), "Tarea eliminada")
            )
              setDeleting(null);
          }}
        />
      )}
    </>
  );
}
