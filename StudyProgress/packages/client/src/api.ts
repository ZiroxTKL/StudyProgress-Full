import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  SessionStorage,
  Tokens,
  User,
  Course,
  CourseDetail,
  Task,
  Goal,
  Reminder,
  Dashboard,
  Page,
  PageQuery,
  CourseInput,
  TaskInput,
  GoalInput,
  ReminderInput,
  EvaluationInput,
  Topic,
  Evaluation,
} from "./types";
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") return "Solicitud cancelada";
    if (error.code === "ECONNABORTED")
      return "La conexión tardó demasiado. Intenta nuevamente.";
    const status = error.response?.status;
    const messages: Record<number, string> = {
      400: "Revisa los datos del formulario.",
      401: "La sesión venció. Inicia sesión nuevamente.",
      403: "No tienes permiso para realizar esta acción.",
      404: "No encontramos este recurso.",
      409: "El recurso ya existe o tiene datos relacionados.",
      429: "Hay demasiadas solicitudes. Espera un momento.",
    };
    if (status && status >= 500)
      return "El servidor no está disponible. Intenta en unos momentos.";
    return status
      ? (messages[status] ?? "No pudimos completar la acción.")
      : "No hay conexión con el servidor. Revisa tu conexión a internet.";
  }
  return error instanceof Error
    ? error.message
    : "Ocurrió un problema. Intenta nuevamente.";
}
type RetryConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
  _networkRetry?: number;
};
export function createApi(
  baseURL: string,
  storage: SessionStorage,
  native = false,
  onExpired: () => void = () => {},
) {
  const config = {
    baseURL: baseURL.replace(/\/$/, ""),
    timeout: 15000,
    withCredentials: !native,
    headers: {
      "Content-Type": "application/json",
      ...(native ? { "X-Client": "native" } : {}),
    },
  };
  const http = axios.create(config),
    auth = axios.create(config);
  let refreshing: Promise<Tokens> | null = null;
  async function refreshSession() {
    if (!refreshing)
      refreshing = (async () => {
        const refreshToken = await storage.refresh();
        const { data } = await auth.post<Tokens>(
          "/auth/refresh",
          native ? { refreshToken } : {},
        );
        await storage.save(data);
        return data;
      })().finally(() => {
        refreshing = null;
      });
    return refreshing;
  }
  http.interceptors.request.use(async (request) => {
    const token = await storage.access();
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });
  http.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const request = error.config as RetryConfig | undefined;
      if (!request || axios.isCancel(error)) throw error;
      if (error.response?.status === 401 && !request._authRetry) {
        request._authRetry = true;
        try {
          const tokens = await refreshSession();
          request.headers.Authorization = `Bearer ${tokens.token}`;
          return await http(request);
        } catch (refreshError) {
          if (
            axios.isAxiosError(refreshError) &&
            refreshError.response?.status === 401
          ) {
            await storage.clear();
            onExpired();
          }
          throw refreshError;
        }
      }
      // Retry only reads: mutations are never repeated after an ambiguous network failure.
      if (
        request.method === "get" &&
        (!error.response || error.response.status >= 500) &&
        error.code !== "ERR_CANCELED" &&
        (request._networkRetry ?? 0) < 2
      ) {
        request._networkRetry = (request._networkRetry ?? 0) + 1;
        await new Promise((resolve) =>
          setTimeout(resolve, 300 * request._networkRetry!),
        );
        if (request.signal?.aborted) throw error;
        return http(request);
      }
      throw error;
    },
  );
  async function get<T>(path: string, signal?: AbortSignal, params?: object) {
    try {
      return (await http.get<T>(path, { signal, params })).data;
    } catch (e) {
      throw e;
    }
  }
  async function post<T>(path: string, body?: unknown) {
    try {
      return (await http.post<T>(path, body)).data;
    } catch (e) {
      throw e;
    }
  }
  async function put<T>(path: string, body: unknown) {
    try {
      return (await http.put<T>(path, body)).data;
    } catch (e) {
      throw e;
    }
  }
  async function patch<T>(path: string, body?: unknown) {
    try {
      return (await http.patch<T>(path, body)).data;
    } catch (e) {
      throw e;
    }
  }
  async function remove(path: string) {
    try {
      await http.delete(path);
    } catch (e) {
      throw e;
    }
  }
  return {
    http,
    refreshSession,
    async login(email: string, password: string) {
      const { data } = await auth.post<Tokens>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      await storage.save(data);
      return get<User>("/auth/me");
    },
    async register(nombre: string, email: string, password: string) {
      return (
        await auth.post<User>("/auth/registro", {
          nombre,
          email: email.trim().toLowerCase(),
          password,
        })
      ).data;
    },
    async logout() {
      try {
        await auth.post(
          "/auth/logout",
          native ? { refreshToken: await storage.refresh() } : {},
        );
      } finally {
        await storage.clear();
      }
    },
    me: (s?: AbortSignal) => get<User>("/auth/me", s),
    dashboard: (s?: AbortSignal) => get<Dashboard>("/dashboard", s),
    courses: (q: PageQuery, s?: AbortSignal) =>
      get<Page<Course>>("/cursos", s, q),
    tasks: (q: PageQuery, s?: AbortSignal) => get<Page<Task>>("/tareas", s, q),
    course: (id: number, s?: AbortSignal) =>
      get<CourseDetail>(`/cursos/${id}`, s),
    saveCourse: (b: CourseInput, id?: number) =>
      id ? put<Course>(`/cursos/${id}`, b) : post<Course>("/cursos", b),
    deleteCourse: (id: number) => remove(`/cursos/${id}`),
    saveTask: (b: TaskInput, courseId: number, id?: number) =>
      id
        ? put<Task>(`/tareas/${id}`, b)
        : post<Task>(`/cursos/${courseId}/tareas`, b),
    completeTask: (id: number) => patch<Task>(`/tareas/${id}/completar`),
    deleteTask: (id: number) => remove(`/tareas/${id}`),
    saveTopic: (b: CourseInput, courseId: number, id?: number) =>
      id
        ? put<Topic>(`/temas/${id}`, b)
        : post<Topic>(`/cursos/${courseId}/temas`, b),
    completeTopic: (id: number) => patch<Topic>(`/temas/${id}/completar`),
    deleteTopic: (id: number) => remove(`/temas/${id}`),
    saveEvaluation: (b: EvaluationInput, courseId: number, id?: number) =>
      id
        ? put<Evaluation>(`/evaluaciones/${id}`, b)
        : post<Evaluation>(`/cursos/${courseId}/evaluaciones`, b),
    grade: (id: number, calificacion: number) =>
      patch<Evaluation>(`/evaluaciones/${id}/calificacion`, { calificacion }),
    deleteEvaluation: (id: number) => remove(`/evaluaciones/${id}`),
    goals: (s?: AbortSignal) => get<Goal[]>("/objetivos", s),
    saveGoal: (b: GoalInput, id?: number) =>
      id ? put<Goal>(`/objetivos/${id}`, b) : post<Goal>("/objetivos", b),
    completeGoal: (id: number) => patch<Goal>(`/objetivos/${id}/completar`),
    deleteGoal: (id: number) => remove(`/objetivos/${id}`),
    reminders: (s?: AbortSignal) => get<Reminder[]>("/recordatorios", s),
    saveReminder: (b: ReminderInput, id?: number) =>
      id
        ? put<Reminder>(`/recordatorios/${id}`, b)
        : post<Reminder>("/recordatorios", b),
    deleteReminder: (id: number) => remove(`/recordatorios/${id}`),
    importCourse: (body: {
      nombre: string;
      descripcion: string;
      temas: string[];
    }) => post<Course>("/cursos/importar", body),
  };
}
export type StudyApi = ReturnType<typeof createApi>;
