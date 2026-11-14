# Cobertura de la segunda entrega

La tabla identifica implementación y evidencia. Una ruta de código no acredita por sí sola un puntaje ni reemplaza la demostración.

| Criterio | Implementación | Evidencia y alcance |
|---|---|---|
| Exposición | PPTX de 10 diapositivas, notas y guion de 20 minutos | Ensayo y dominio individual a cargo del equipo |
| Mobile: API propia | `mobile/src/services/api.ts`, `packages/client/src/api.ts` | Cursos, actividades y estados dependen de Spring |
| Mobile: JWT seguro | `SecureStore`, contexto Auth e interceptores | Rotación probada por HTTP; requiere prueba en teléfono |
| Mobile: arquitectura | screens, components, hooks, contexts, services | Componentes funcionales, useState/useEffect/useContext/useReducer |
| Mobile: dos sensores | `ToolsScreen.tsx`, `useStudyWeather.ts` | Cámara QR y ubicación para clima; permisos y fallbacks implementados |
| Mobile: API externa | `services/weather.ts` | Open-Meteo con timeout, validación y atribución |
| Mobile: errores/carga | hooks, UI states y validaciones compartidas | Retry de GET, confirmaciones, feedback y listas vacías |
| Web: cliente Axios | `packages/client/src/api.ts` | GET/POST/PUT/PATCH/DELETE, refresh único, headers y cancelación |
| Web: componentes | `components/ui.tsx`, ResourceForm, Layout, páginas | Más de diez componentes reutilizados con props TypeScript |
| Web: hooks/estado | AuthContext, ToastContext y hooks | Estado global de sesión y lógica separada de las vistas |
| Web: routing | `router.tsx` | PrivateRoute, :id, query params, lazy/Suspense, 404 e historial |
| Web: errores/validación | ErrorBoundary, ResourceForm, estados y toasts | Validación temprana con Zod y segunda validación Jakarta |
| UI/UX: estilo | `styles.css` | Paleta verde, tipografía consistente y revisión a 390 y 1440 px |
| UI/UX: interacción | Modal nativo, confirmaciones y búsqueda | Debounce, labels, teclado, filtros, orden y estados vacíos |
| UI/UX: vistas | Login, registro, dashboard, cursos, detalle, tareas, objetivos, recordatorios, perfil | Información real obtenida del backend |
| Paginación | `CursoRepository`, `TareaRepository`, `PageResponse` | Dos endpoints paginados SQL, totales y tamaños 10/25/50/100 |
| Deployment | Dockerfiles, Compose prod, Caddy y eas.json | Preparado; exige publicar API/RDS y EAS con cuentas reales |
| Participación | Tabla del README | 100 % por integrante según solicitud del equipo |

## Correspondencia con el sílabo

- Spring Boot, REST, DTOs y excepciones: backend heredado y controladores v1.
- PostgreSQL, JPA/Hibernate y repositorios: persistencia del dominio y consultas paginadas.
- JUnit, Mockito y Testcontainers: contratos HTTP y pruebas del servicio de progreso.
- Eventos/asincronía: listeners heredados y scheduler activado al habilitar correo.
- Spring Security/JWT: acceso, roles, sesión renovable y comprobación de propiedad.
- TypeScript, Axios, React, hooks y rutas: web y paquete cliente compartido.
- React Native, Expo y sensores: app, cámara y ubicación.
- Integración/despliegue: clientes contra una API, Docker, proxy y configuración cloud.

## Requisitos que necesitan evidencia externa

La publicación pública del stack, HTTPS operativo, disponibilidad, medición de latencia y ejecución de sensores físicos requieren el entorno real. La exposición y la participación no pueden verificarse solo ejecutando código. El proyecto incluye lo necesario para prepararlos, sin dar esas evidencias por existentes.
