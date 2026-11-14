import { useRef, useState } from "react";
import { type ZodType } from "zod";
import { fieldErrors, friendlyError } from "@studyprogress/client";
import { Button } from "./ui";
export interface Field {
  name: string;
  label: string;
  type?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}
export function ResourceForm({
  fields,
  schema,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Guardar cambios",
}: {
  fields: Field[];
  schema: ZodType;
  initial?: Record<string, unknown>;
  onSubmit: (v: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial || {}),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const running = useRef(false);
  function change(name: string, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    const parsed = schema.safeParse(next);
    setErrors(parsed.success ? {} : fieldErrors(parsed.error));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (running.current) return;
    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await onSubmit(result.data);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} noValidate className="resource-form">
      {fields.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={`field-${f.name}`}>{f.label}</label>
          {f.options ? (
            <select
              id={`field-${f.name}`}
              value={String(values[f.name] ?? "")}
              onChange={(e) => change(f.name, e.target.value)}
              aria-invalid={!!errors[f.name]}
            >
              <option value="" disabled>
                Seleccionar…
              </option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              id={`field-${f.name}`}
              value={String(values[f.name] ?? "")}
              onChange={(e) => change(f.name, e.target.value)}
              maxLength={500}
            />
          ) : (
            <input
              id={`field-${f.name}`}
              type={f.type || "text"}
              value={String(values[f.name] ?? "")}
              onChange={(e) => change(f.name, e.target.value)}
              autoComplete={
                f.type === "password"
                  ? "current-password"
                  : f.name === "email"
                    ? "email"
                    : "off"
              }
              aria-invalid={!!errors[f.name]}
              aria-describedby={`hint-${f.name}`}
            />
          )}
          <small
            id={`hint-${f.name}`}
            className={errors[f.name] ? "field-error" : "muted"}
          >
            {errors[f.name] || f.hint}
          </small>
        </div>
      ))}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
export const titleFields: Field[] = [
  { name: "titulo", label: "Título" },
  { name: "descripcion", label: "Descripción", type: "textarea" },
];
export const courseFields: Field[] = [
  { name: "nombre", label: "Nombre del curso" },
  { name: "descripcion", label: "Descripción", type: "textarea" },
];
export const taskFields: Field[] = [
  ...titleFields,
  { name: "fechaLimite", label: "Fecha límite", type: "date" },
  {
    name: "prioridad",
    label: "Prioridad",
    options: ["ALTA", "MEDIA", "BAJA"].map((value) => ({
      value,
      label: value[0] + value.slice(1).toLowerCase(),
    })),
  },
];
export const evaluationFields: Field[] = [
  ...titleFields,
  { name: "fecha", label: "Fecha", type: "date" },
  {
    name: "tipo",
    label: "Tipo",
    options: ["EXAMEN", "PRACTICA", "PROYECTO", "OTRO"].map((value) => ({
      value,
      label: value,
    })),
  },
  {
    name: "ponderacion",
    label: "Ponderación (%)",
    type: "number",
    hint: "Porcentaje entre 0 y 100",
  },
];
