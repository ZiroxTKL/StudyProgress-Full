# Guía de pruebas manuales

## Web

1. Levanta la API, carga la demo e inicia sesión. Revisa que no aparezcan cursos de otro usuario.
2. Crea un curso y recarga. Comprueba persistencia.
3. En el detalle crea un tema, tarea y evaluación. Edita cada uno y registra una nota de 17.5.
4. Completa tema/tarea. El progreso debe usar `(temas completados + tareas completadas) / (temas + tareas)`. Repetir secuencialmente la acción no duplica puntos.
5. En tareas cambia página, tamaño y búsqueda. Verifica totales y query params.
6. Guarda la URL y vuelve con Atrás. La consulta debe conservarse.
7. Intenta enviar títulos vacíos, fechas pasadas y notas mayores a 20. Debe bloquear el envío o devolver 400.
8. Cancela una eliminación. Después confirma una sobre datos de prueba: la lista debe actualizarse.
9. Detén temporalmente el backend, abre una vista y revisa el error y reintento. No deben aparecer datos inventados.
10. Revisa 390×844, 768×1024 y 1440×1000, navegación por teclado, modal y cierre con Escape.
11. Cierra sesión y usa Atrás. Las rutas privadas deben pedir login. La renovación del refresh revocado debe dar 401.

## Teléfono real: cámara

1. Abre la app Expo compatible con SDK 58 y autentícate contra la misma API.
2. Web: detalle del curso → Compartir QR.
3. App: Herramientas → Abrir cámara. Acepta permiso cuando quieras usarlo.
4. Escanea el QR, revisa los datos y confirma. Debe crear un curso y sus temas en la API. La vista web debe mostrarlo al recargar.
5. Escanea un QR de otro producto: informa que no es válido y no realiza escrituras.
6. Deniega permiso: aparece explicación, acceso a ajustes y opción de pegar el contenido QR. Repite la importación por esa alternativa.

## Teléfono real: GPS y API externa

1. Herramientas → Usar mi ubicación. Se solicita permiso al iniciar la acción.
2. Comprueba temperatura, lluvia, viento y sugerencia de lugar. La atribución Open-Meteo debe aparecer.
3. Deniega el permiso o desactiva GPS. Debe explicar qué falta y permitir coordenadas manuales.
4. Prueba latitud `-12.0464`, longitud `-77.0428` como consulta manual de Lima. No son datos predeterminados de la cuenta.
5. Prueba coordenadas fuera de rango y sin conexión. La app debe dar feedback sin bloquear la navegación.
6. Sal de la pantalla durante una consulta. Se cancela la llamada HTTP; no debe actualizar una pantalla desmontada.

## Sesión móvil

1. Inicia sesión, cierra y abre la app. Debe recuperar la sesión desde SecureStore.
2. Completa una tarea móvil y revisa la web.
3. Cierra sesión. Las credenciales del dispositivo deben eliminarse y el refresh dejar de funcionar.
4. Prueba el botón Atrás de Android y cambio de pestañas.

## Registro de evidencia

Anota dispositivo, sistema operativo, versión Expo, URL API, fecha y resultado. Conserva fotos/capturas de permisos, alternativa manual y actualización en web. Las capturas `web-telefono.jpg` son del diseño web responsive y no acreditan una app nativa ejecutándose.
