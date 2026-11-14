import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, MoreHorizontal } from "lucide-react";
import { courseSchema, type Course } from "@studyprogress/client";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { usePageQuery } from "../hooks/usePageQuery";
import {
  PageHeading,
  SearchBox,
  Pagination,
  ErrorState,
  Skeleton,
  EmptyState,
  Modal,
  AddButton,
} from "../components/ui";
import { ResourceForm, courseFields } from "../components/ResourceForm";
import { useToast } from "../contexts/ToastContext";
export default function CoursesPage() {
  const { q, search, setSearch, update } = usePageQuery("nombre"),
    r = useResource(useCallback((s) => api.courses(q, s), [q])),
    [creating, setCreating] = useState(false),
    toast = useToast();
  return (
    <>
      <PageHeading
        eyebrow="APRENDER CON DIRECCIÓN"
        title="Mis cursos"
        text="Un espacio para cada materia. Una vista clara de tu semestre."
        action={
          <AddButton onClick={() => setCreating(true)}>Nuevo curso</AddButton>
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
            <option value="nombre">Nombre</option>
            <option value="id">Creación</option>
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
              <div className="course-grid">
                {r.data.content.map((c: Course, i) => (
                  <Link
                    to={`/cursos/${c.id}`}
                    key={c.id}
                    className="course-card"
                  >
                    <div className="spread">
                      <span className={`course-initial color-${i % 4}`}>
                        <BookOpen size={23} />
                      </span>
                      <ArrowUpRight size={20} />
                    </div>
                    <h2>{c.nombre}</h2>
                    <p>
                      {c.descripcion ||
                        "Tu siguiente aprendizaje empieza aquí."}
                    </p>
                    <span className="course-open">
                      Abrir curso <MoreHorizontal size={19} />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={search ? "Sin resultados" : "Tu semestre empieza aquí"}
                text={
                  search
                    ? "Prueba otra búsqueda o limpia los filtros."
                    : "Crea un curso para agregar temas, tareas y evaluaciones."
                }
                action={
                  <AddButton onClick={() => setCreating(true)}>
                    Crear un curso
                  </AddButton>
                }
              />
            )}
            <Pagination page={r.data} onChange={update} />
          </>
        )
      )}
      {creating && (
        <Modal title="Nuevo curso" onClose={() => setCreating(false)}>
          <ResourceForm
            fields={courseFields}
            schema={courseSchema}
            initial={{ nombre: "", descripcion: "" }}
            onCancel={() => setCreating(false)}
            submitLabel="Crear curso"
            onSubmit={async (v) => {
              await api.saveCourse(v);
              setCreating(false);
              toast("Curso creado");
              r.reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}
