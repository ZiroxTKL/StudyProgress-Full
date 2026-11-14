# Pitch tecnológico y demo: 20 minutos

Las diapositivas editables están en el PPTX que acompaña esta entrega. Incluyen notas de presentador. Los aportes personales fueron confirmados por el equipo. La distribución del tiempo de exposición es una propuesta para el ensayo.

| Tiempo | Contenido | Responsable propuesto |
|---|---|---|
| 00:00–01:00 | Gancho y nombre del producto | Pedro |
| 01:00–03:00 | Problema del estudiante y alcance | Pedro y Marcelo |
| 03:00–04:00 | Solución y fuente única de datos | Marcelo |
| 04:00–05:00 | Experiencia web | Marcelo |
| 05:00–06:00 | App y sensores | Jorge |
| 06:00–07:00 | QR y privacidad | Jorge |
| 07:00–08:00 | Arquitectura de integración | Jesús |
| 08:00–09:00 | Sesión y propiedad de los datos | Jesús y Leonardo |
| 09:00–15:00 | Demo en vivo | Todos |
| 15:00–20:00 | Preguntas técnicas | Todos |

## Gancho propuesto

“Mañana tienes una evaluación. La fecha está en un chat, la tarea en otra plataforma y el temario entre tus apuntes. Antes de estudiar, tienes que reconstruir qué sigue. StudyProgress reúne ese plan y el avance de cada curso en un mismo espacio.”

Usa un caso cercano y no atribuyas porcentajes o estudios que el equipo no haya medido. No prometas que la aplicación aumenta notas: ayuda a organizar el trabajo.

## Preparación de demo

- Publica y verifica primero las URLs del stack. Prepara también el entorno local como respaldo.
- Carga la cuenta de demo antes de comenzar. La cuenta pública local no debe tener información personal.
- Abre sesión web y app. Prueba que ambas apunten a la misma API.
- Deja DBP con una tarea pendiente y al menos un tema. El QR debe tener datos antes del pitch.
- Verifica cámara/GPS y deja a mano la alternativa manual. Si no hay internet, explica el estado de error en lugar de simular una respuesta de clima.
- Las capturas sirven como respaldo visual si hay un problema de proyección; no equivalen a una demo funcional ni a evidencia de publicación.

## Flujo de demo de seis minutos

1. **40 s:** entrar a la cuenta y leer el resumen real.
2. **50 s:** abrir DBP y explicar actividades/progreso.
3. **60 s:** crear una tarea y completarla. Señalar el cambio de progreso y puntos.
4. **30 s:** mostrar la segunda página del listado y `?page=1`.
5. **75 s:** compartir QR desde web, escanear en el teléfono y confirmar importación.
6. **45 s:** consultar ubicación/clima o ingresar coordenadas manuales.
7. **35 s:** mostrar un recordatorio y una validación.
8. **25 s:** recargar y comprobar persistencia/sesión.

## Preguntas técnicas y respuestas

**¿Dónde viven los datos?** En el backend y la base relacional. React mantiene estado de pantalla y caché temporal de respuestas. `useResource` no reemplaza persistencia. Ver `PortalService` y los repositorios.

**¿Cómo funciona la paginación?** El repositorio consulta por dueño y texto con Pageable. `PageResponse` devuelve content, page, size, total y totalPages. El cliente refleja la consulta en query params. Ver `CursoRepository`, `TareaRepository`, `usePageQuery` y `Pagination`.

**¿Por qué no guardar JWT en localStorage?** En web el acceso está en memoria. Una cookie HttpOnly conserva la renovación y evita leerla desde JavaScript. SecureStore protege las credenciales de la app. Ver `web/src/services/api.ts`, `mobile/src/services/api.ts` y `SessionController`.

**¿Cómo renuevan sin diez requests simultáneos?** El cliente comparte una promesa `refreshing`. Un 401 permite una renovación y un reenvío del request. No hay bucle infinito porque `_authRetry` lo limita. Un fallo de autenticación definitivo limpia el estado.

**¿El servidor guarda el refresh en texto?** No. Genera 48 bytes aleatorios, guarda SHA-256 y caducidad, y rota bajo un bloqueo de fila. Cerrar sesión elimina esa sesión. Los JWT de acceso ya emitidos duran hasta su expiración.

**¿Un usuario puede cambiar un ID para leer otro curso?** El servicio verifica la propiedad del recurso obtenido. El listado SQL también filtra por dueño. Los contratos prueban 403 al leer, editar o eliminar un curso ajeno.

**¿Qué hace AbortController?** Al cambiar de vista o consulta se cancela la lectura anterior y se evita aplicar su respuesta a una pantalla que ya no corresponde. Los reintentos también comprueban cancelación.

**¿Qué operaciones reintentan?** Solo GET por red/5xx, hasta dos veces. Repetir un POST luego de un timeout puede duplicar una creación, por eso no se hace automáticamente.

**¿Qué hace cada sensor?** La cámara lee un contrato de curso estricto. GPS obtiene una ubicación puntual para clima. Se solicitan permisos al usarlos y existen alternativas manuales. No hay seguimiento en segundo plano.

**¿Por qué Open-Meteo no sustituye el backend?** Solo complementa una herramienta de estudio. Cursos, notas, tareas, objetivos y cuentas siguen dependiendo de Spring. Ver `weather.ts`.

**¿Cómo comparten cursos sin exponer notas?** El QR contiene nombre, descripción y hasta diez temas. La app permite revisar antes de importar. El servidor crea recursos nuevos del usuario autenticado dentro de una transacción.

**¿Cómo calculan el progreso?** Actividades completadas divididas por temas más tareas, multiplicado por cien. Si no hay actividades, el resultado es cero. El promedio de evaluaciones se muestra como simple porque esa es la lógica heredada. Ver `ProgresoServiceImpl` y sus pruebas Mockito.

**¿Qué prueban con Testcontainers?** Los mismos contratos HTTP que H2 contra PostgreSQL 16 real. Así se validan consultas, bloqueos, restricciones y persistencia con el motor de producción. No es una simulación de la base.

**¿Qué hace CI?** En cada push/PR verifica Maven, contratos, tipos, Vitest, build web y empaquetado Android. No despliega por sí solo. Ver `.github/workflows/ci.yml`.

**¿Cómo resuelven CORS y HTTPS?** El despliegue incluido entrega web y `/api` desde un origen mediante Caddy. La app usa la URL HTTPS de la API. RDS permite conexiones solo desde el backend. Mostrar evidencia pública únicamente cuando exista.

## Antes de exponer

Cada integrante debe practicar preguntas de todas las capas y ubicar los archivos anteriores sin depender del guion. La nota individual exige dominio del código, no solo leer las diapositivas.
