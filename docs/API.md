# Contrato de la API v1

Base local: `http://localhost:8080/api/v1`. En producción se sustituye el origen por el dominio HTTPS del equipo. Los endpoints `/api` anteriores se conservan para compatibilidad con la primera entrega.

Todas las rutas de negocio requieren `Authorization: Bearer TOKEN`. Los cuerpos JSON utilizan `Content-Type: application/json`. Las rutas de login/registro/refresh/logout aceptan acceso anónimo para establecer o renovar una sesión.

La web recibe `token` en el cuerpo y un refresh en cookie HttpOnly. Un cliente nativo o Postman envía `X-Client: native` sin Origin y recibe también `refreshToken` en JSON. En refresh/logout debe enviar ese valor en el cuerpo. No mezcles este modo con la cookie web. Cerrar sesión revoca el refresh, mientras el acceso JWT vence según su duración.

## Endpoints

| Método | Ruta | Uso | Éxito |
|---|---|---|---:|
| POST | `/auth/registro` | Registrar usuario | 201 |
| POST | `/auth/login` | Iniciar sesión nativa / Postman | 200 |
| GET | `/auth/me` | Mi perfil | 200 |
| POST | `/auth/refresh` | Renovar y rotar sesión | 200 |
| GET | `/dashboard` | Resumen académico | 200 |
| POST | `/cursos` | Crear curso | 201 |
| GET | `/cursos?page=0&size=10&search=&sort=nombre` | Listar cursos paginados | 200 |
| GET | `/cursos/{{cursoId}}` | Detalle con actividades y progreso | 200 |
| PUT | `/cursos/{{cursoId}}` | Editar curso | 200 |
| POST | `/cursos/importar` | Importar plantilla QR | 201 |
| POST | `/cursos/{{cursoId}}/temas` | Crear tema | 201 |
| PUT | `/temas/{{temaId}}` | Editar tema | 200 |
| PATCH | `/temas/{{temaId}}/completar` | Completar tema | 200 |
| POST | `/cursos/{{cursoId}}/tareas` | Crear tarea | 201 |
| GET | `/tareas?page=0&size=10&search=&sort=fechaLimite` | Listar tareas paginadas | 200 |
| PUT | `/tareas/{{tareaId}}` | Editar tarea | 200 |
| PATCH | `/tareas/{{tareaId}}/completar` | Completar tarea | 200 |
| POST | `/cursos/{{cursoId}}/evaluaciones` | Crear evaluación | 201 |
| PUT | `/evaluaciones/{{evaluacionId}}` | Editar evaluación | 200 |
| PATCH | `/evaluaciones/{{evaluacionId}}/calificacion` | Registrar calificación | 200 |
| GET | `/objetivos` | Listar objetivos | 200 |
| POST | `/objetivos` | Crear objetivo | 201 |
| PUT | `/objetivos/{{objetivoId}}` | Editar objetivo | 200 |
| PATCH | `/objetivos/{{objetivoId}}/completar` | Completar objetivo | 200 |
| GET | `/recordatorios` | Listar recordatorios | 200 |
| POST | `/recordatorios` | Crear recordatorio | 201 |
| PUT | `/recordatorios/{{recordatorioId}}` | Editar recordatorio | 200 |
| DELETE | `/temas/{{temaId}}` | Eliminar tema | 204 |
| DELETE | `/tareas/{{tareaId}}` | Eliminar tarea | 204 |
| DELETE | `/evaluaciones/{{evaluacionId}}` | Eliminar evaluación | 204 |
| DELETE | `/objetivos/{{objetivoId}}` | Eliminar objetivo | 204 |
| DELETE | `/recordatorios/{{recordatorioId}}` | Eliminar recordatorio | 204 |
| DELETE | `/cursos/{{cursoId}}` | Eliminar curso | 204 |
| DELETE | `/cursos/{{cursoImportadoId}}` | Eliminar curso importado | 204 |
| POST | `/auth/logout` | Cerrar sesión | 204 |

## Paginación

`GET /cursos` y `GET /tareas` aceptan `page` desde cero, `size` en 10/25/50/100, `search` y `sort`. Cursos permite nombre/id. Tareas permite titulo/fechaLimite/prioridad/id. El orden es ascendente y añade id para estabilidad. Los filtros se ejecutan sobre registros del usuario autenticado.

```json
{"content":[],"page":0,"size":10,"total":0,"totalPages":0}
```

## Respuestas y validaciones

- 400: campos o parámetros inválidos, JSON mal formado, fechas pasadas o nota fuera de rango.
- 401: acceso ausente/expirado, credenciales incorrectas o refresh consumido/vencido.
- 403: recurso de otro usuario, rol insuficiente u origen no autorizado.
- 404: recurso inexistente.
- 409: datos duplicados o restricciones relacionales.
- 500: error inesperado sin información interna en la respuesta.

Las respuestas de negocio de error siguen `timestamp`, `status`, `error`, `message` y `path`. Los rechazos previos de filtros de seguridad/CORS pueden usar un formato reducido o texto. Los clientes se basan en el código HTTP y no dependen de un cuerpo idéntico para esos rechazos.

## Postman

Importa `postman_collection.json`, ajusta baseUrl y usa un email nuevo para el registro. Ejecuta las carpetas en orden. El login y refresh actualizan variables automáticamente; las creaciones guardan sus IDs. La última carpeta elimina únicamente los recursos referenciados por esas variables y cierra sesión. No ejecutes limpieza sobre IDs de datos reales. La colección de la primera entrega se conserva como `StudyProgress.postman_collection.json`.

Los ejemplos de respuesta son estructuras ilustrativas, no capturas de un servidor productivo. Los contratos JUnit son la comprobación automática del comportamiento real.
