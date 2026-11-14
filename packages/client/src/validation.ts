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
const activityDescription = z.preprocess(
  (value) => value === null ? "" : value,
  description,
);
const date = (currentDate?: string) =>
  z.iso.date("Selecciona una fecha válida").refine(
    (value) => value === currentDate || value >= today(),
    "La fecha debe ser hoy o posterior si la cambias",
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
  descripcion: activityDescription,
});
export const taskFormSchema = (currentDate?: string) => z.object({
  titulo: title,
  descripcion: activityDescription,
  fechaLimite: date(currentDate),
  prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]),
});
export const taskSchema = taskFormSchema();
export const goalFormSchema = (currentDate?: string) => z.object({
  titulo: title,
  descripcion: activityDescription,
  fechaLimite: date(currentDate),
});
export const goalSchema = goalFormSchema();
export const topicSchema = courseSchema;
export const reminderSchema = z.object({
  titulo: title,
  descripcion: activityDescription,
  fechaHora: z
    .string()
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && Date.parse(v) > Date.now(),
      "Selecciona una fecha y hora futuras",
    ),
});
export const evaluationFormSchema = (currentDate?: string) => z.object({
  titulo: title,
  descripcion: activityDescription,
  fecha: date(currentDate),
  tipo: z.enum(["EXAMEN", "PRACTICA", "PROYECTO", "OTRO"]),
  ponderacion: z.coerce.number().min(0).max(100),
});
export const evaluationSchema = evaluationFormSchema();
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
export const COURSE_QR_MAX_BYTES = 2500;

export function parseCourseQr(raw: string) {
  // This character limit also bounds parsing on devices without TextEncoder.
  if (raw.length > COURSE_QR_MAX_BYTES)
    throw new Error("El código QR es demasiado grande");
  return courseQrSchema.parse(JSON.parse(raw));
}
export function fieldErrors(error: z.ZodError) {
  return Object.fromEntries(
    error.issues.map((i) => [String(i.path[0]), i.message]),
  );
}
