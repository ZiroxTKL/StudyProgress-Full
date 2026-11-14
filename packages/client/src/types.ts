export interface User {
  id: number;
  nombre: string;
  email: string;
  puntos: number;
  rol: string;
}
export interface Course {
  id: number;
  nombre: string;
  descripcion: string;
}
export interface Task {
  id: number;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridad: "ALTA" | "MEDIA" | "BAJA";
  completada: boolean;
  cursoId: number;
}
export interface Topic {
  id: number;
  nombre: string;
  descripcion: string;
  completado: boolean;
  cursoId: number;
}
export interface Evaluation {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  ponderacion: number;
  calificacion: number | null;
  cursoId: number;
}
export interface Goal {
  id: number;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  completado: boolean;
}
export interface Reminder {
  id: number;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  enviado: boolean;
}
export interface Progress {
  cursoId: number;
  nombreCurso: string;
  totalTemas: number;
  temasCompletados: number;
  totalTareas: number;
  tareasCompletadas: number;
  porcentajeProgreso: number;
  evaluacionesCalificadas: number;
  promedioEvaluaciones: number | null;
}
export interface CourseDetail {
  curso: Course;
  progreso: Progress;
  tareas: Task[];
  temas: Topic[];
  evaluaciones: Evaluation[];
}
export interface Dashboard {
  cursos: number;
  tareasPendientes: number;
  tareasCompletadas: number;
  objetivosCompletados: number;
  puntos: number;
  nivel: string;
  progreso: Progress[];
  proximasTareas: Task[];
}
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
export interface PageQuery {
  page: number;
  size: number;
  search: string;
  sort: string;
}
export interface Tokens {
  token: string;
  refreshToken?: string;
}
export interface SessionStorage {
  access(): Promise<string | null>;
  refresh(): Promise<string | null>;
  save(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}
export type CourseInput = Pick<Course, "nombre" | "descripcion">;
export type TaskInput = Pick<
  Task,
  "titulo" | "descripcion" | "fechaLimite" | "prioridad"
>;
export type GoalInput = Pick<Goal, "titulo" | "descripcion" | "fechaLimite">;
export type ReminderInput = Pick<
  Reminder,
  "titulo" | "descripcion" | "fechaHora"
>;
export type EvaluationInput = Pick<
  Evaluation,
  "titulo" | "descripcion" | "fecha" | "tipo" | "ponderacion"
>;
