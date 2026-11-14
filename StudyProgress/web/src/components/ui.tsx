import {
  Component,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ErrorInfo,
  type ButtonHTMLAttributes,
} from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { Page } from "@studyprogress/client";
export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}
export function Spinner() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={24} />
      <span>Cargando tu información…</span>
    </div>
  );
}
export function Skeleton() {
  return (
    <div aria-label="Cargando" role="status" className="skeleton-grid">
      {[1, 2, 3].map((x) => (
        <div className="skeleton" key={x} />
      ))}
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="state error-state" role="alert">
      <AlertCircle />
      <h3>No pudimos cargar esta vista</h3>
      <p>{message}</p>
      <Button onClick={retry}>Intentar de nuevo</Button>
    </div>
  );
}
export function EmptyState({
  title = "Todo empieza con un primer paso",
  text,
  action,
}: {
  title?: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      <BookOpen />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}
export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        {label}
        <span>{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="progress-wrap">
      {label && (
        <div className="spread">
          <span>{label}</span>
          <strong>{Math.round(value)} %</strong>
        </div>
      )}
      <div
        className="progress"
        role="progressbar"
        aria-label={label || "Progreso"}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="search-box">
      <Search size={18} />
      <span className="sr-only">Buscar</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre…"
      />
    </label>
  );
}
export function Pagination<T>({
  page,
  onChange,
}: {
  page: Page<T>;
  onChange: (key: string, value: string) => void;
}) {
  const first = page.content.length === 0 ? 0 : page.page * page.size + 1,
    last =
      page.content.length === 0
        ? 0
        : Math.min((page.page + 1) * page.size, page.total);
  const start = Math.max(0, Math.min(page.page - 2, page.totalPages - 5));
  return (
    <div className="pagination">
      <span>
        Mostrando {first}–{last} de {page.total}
      </span>
      <label>
        Por página{" "}
        <select
          value={page.size}
          onChange={(e) => onChange("size", e.target.value)}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="page-buttons">
        <button
          aria-label="Página anterior"
          disabled={page.page === 0}
          onClick={() => onChange("page", String(page.page - 1))}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from(
          { length: Math.min(5, page.totalPages) },
          (_, i) => start + i,
        ).map((n) => (
          <button
            key={n}
            aria-label={`Página ${n + 1}`}
            aria-current={page.page === n ? "page" : undefined}
            onClick={() => onChange("page", String(n))}
          >
            {n + 1}
          </button>
        ))}
        <button
          aria-label="Página siguiente"
          disabled={page.page + 1 >= page.totalPages}
          onClick={() => onChange("page", String(page.page + 1))}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      className="modal"
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <button aria-label="Cerrar ventana" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function ConfirmDialog({
  title,
  text,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={() => !busy && onCancel()}>
      <p className="muted">{text}</p>
      <div className="form-actions">
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Eliminando…" : "Eliminar"}
        </Button>
      </div>
    </Modal>
  );
}
export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button onClick={onClick}>
      <Plus size={18} />
      {children}
    </Button>
  );
}
export function ViewError() {
  return (
    <main className="state">
      <h1>Esta vista tuvo un problema</h1>
      <p>Recarga la página para volver a intentarlo.</p>
      <Button onClick={() => window.location.reload()}>Recargar aplicación</Button>
    </main>
  );
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    return this.state.error ? <ViewError /> : this.props.children;
  }
}
export const dateLabel = (s: string) =>
  new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    ...(s.length > 10 ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
