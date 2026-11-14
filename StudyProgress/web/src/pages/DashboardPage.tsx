import { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Target,
  Trophy,
  CalendarDays,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useResource } from "../hooks/useResource";
import {
  PageHeading,
  StatCard,
  ProgressBar,
  ErrorState,
  Skeleton,
  EmptyState,
  Badge,
  dateLabel,
} from "../components/ui";
export default function DashboardPage() {
  const { user } = useAuth(),
    r = useResource(useCallback((s) => api.dashboard(s), []));
  if (r.loading) return <Skeleton />;
  if (r.error) return <ErrorState message={r.error} retry={r.reload} />;
  const d = r.data!;
  return (
    <>
      <PageHeading
        eyebrow={new Date().toLocaleDateString("es-PE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title={`Hola, ${user?.nombre.split(" ")[0]} 👋`}
        text="Hagamos que hoy sea un buen día para avanzar."
        action={
          <Link className="button secondary" to="/cursos">
            Ver mis cursos <ArrowUpRight size={17} />
          </Link>
        }
      />
      <section className="hero-banner">
        <div>
          <span className="eyebrow">TU SEMESTRE, A TU RITMO</span>
          <h2>
            Pequeños pasos.
            <br />
            <em>Grandes posibilidades.</em>
          </h2>
          <p>
            Elige una tarea, da el siguiente paso y mira cómo crece tu progreso.
          </p>
          <Link to="/tareas" className="button cream">
            Organizar mi día <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-book">
            <BookOpen size={76} />
          </div>
          <span className="art-check">
            <CheckCircle2 size={30} />
          </span>
          <span className="art-star">✦</span>
          <span className="art-caption">CADA PASO CUENTA</span>
        </div>
      </section>
      <section className="stats-grid">
        <StatCard
          label="Cursos activos"
          value={d.cursos}
          detail="Tu semestre en marcha"
          icon={<BookOpen size={20} />}
        />
        <StatCard
          label="Tareas por hacer"
          value={d.tareasPendientes}
          detail={`${d.tareasCompletadas} completadas hasta ahora`}
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="Objetivos logrados"
          value={d.objetivosCompletados}
          detail="Avances que merecen celebrarse"
          icon={<Target size={20} />}
        />
        <StatCard
          label="Puntos acumulados"
          value={d.puntos}
          detail={`Nivel ${d.nivel.toLowerCase()}`}
          icon={<Trophy size={20} />}
        />
      </section>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-title">
            <h2>Así van tus cursos</h2>
            <Link to="/cursos">
              Ver todos <ArrowUpRight size={15} />
            </Link>
          </div>
          {d.progreso.length ? (
            d.progreso.slice(0, 5).map((p, i) => (
              <Link
                className="course-progress"
                to={`/cursos/${p.cursoId}`}
                key={p.cursoId}
              >
                <span className={`course-initial color-${i % 4}`}>
                  {p.nombreCurso.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <ProgressBar
                    value={p.porcentajeProgreso}
                    label={p.nombreCurso}
                  />
                  <small className="muted">
                    {p.temasCompletados + p.tareasCompletadas} de{" "}
                    {p.totalTemas + p.totalTareas} actividades completadas
                  </small>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              text="Crea tu primer curso y empieza a registrar tu avance."
              action={
                <Link className="button primary" to="/cursos">
                  Crear un curso
                </Link>
              }
            />
          )}
        </section>
        <section className="panel">
          <div className="panel-title">
            <h2>Tu próximo paso</h2>
            <CalendarDays size={20} />
          </div>
          {d.proximasTareas.length ? (
            d.proximasTareas.map((t) => (
              <Link
                to={`/cursos/${t.cursoId}`}
                className="upcoming-task"
                key={t.id}
              >
                <span className="task-bullet" />
                <div>
                  <strong>{t.titulo}</strong>
                  <small>{dateLabel(t.fechaLimite)}</small>
                </div>
                <Badge tone={t.prioridad === "ALTA" ? "orange" : "neutral"}>
                  {t.prioridad.toLowerCase()}
                </Badge>
              </Link>
            ))
          ) : (
            <EmptyState
              title="Tu agenda está despejada"
              text="Agrega una tarea desde cualquiera de tus cursos."
            />
          )}
          <Link to="/tareas" className="text-link">
            Ver todas las tareas <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
