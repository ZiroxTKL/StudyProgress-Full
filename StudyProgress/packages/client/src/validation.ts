import { z } from "zod";
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const name = z
  .string()
  .trim()
  .min(2, "Escribe al menos 2 caracteres")
  .max(100, "Máximo 100 caracteres");
const title = z
  .string()
  .trim()
  .min(2, "Escribe al menos 2 caracteres")
  .max(150, "Máximo 150 caracteres");
const description = z.string().max(500, "Máximo 500 caracteres");
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha")
  .refine(
    (v) => !Number.isNaN(Date.parse(v)) && v >= today(),
    "La fecha debe ser hoy o posterior",
  );
export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});
export const registerSchema = loginSchema.extend({
  nombre: name,
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72, "Máximo 72 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Incluye mayúscula, minúscula y número",
    ),
});
export const courseSchema = z.object({
  nombre: name,
  descripcion: description,
});
export const taskSchema = z.object({
  titulo: title,
  descripcion: description,
  fechaLimite: date,
  prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]),
});
export const goalSchema = z.object({
  titulo: title,
  descripcion: description,
  fechaLimite: date,
});
export const topicSchema = courseSchema;
export const reminderSchema = z.object({
  titulo: title,
  descripcion: description,
  fechaHora: z
    .string()
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && Date.parse(v) > Date.now(),
      "Selecciona una fecha y hora futuras",
    ),
});
export const evaluationSchema = z.object({
  titulo: title,
  descripcion: description,
  fecha: date,
  tipo: z.enum(["EXAMEN", "PRACTICA", "PROYECTO", "OTRO"]),
  ponderacion: z.coerce.number().min(0).max(100),
});
export const gradeSchema = z.object({
  calificacion: z
    .union([z.number(), z.string().trim().min(1, "Ingresa una calificación")])
    .transform((v) => Number(v))
    .pipe(z.number().min(0, "Nota mínima: 0").max(20, "Nota máxima: 20")),
});
export const courseQrSchema = z
  .object({
    version: z.literal(1),
    type: z.literal("studyprogress-course"),
    nombre: name,
    descripcion: description,
    temas: z.array(name).max(10),
  })
  .strict();
export function parseCourseQr(raw: string) {
  if (raw.length > 2500) throw new Error("El código QR es demasiado grande");
  return courseQrSchema.parse(JSON.parse(raw));
}
export function fieldErrors(error: z.ZodError) {
  return Object.fromEntries(
    error.issues.map((i) => [String(i.path[0]), i.message]),
  );
}
