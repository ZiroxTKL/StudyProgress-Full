# Verificación de la entrega local

Fecha de revisión: 13 de noviembre de 2026, hora de Lima.

## Comprobaciones realizadas

| Comprobación | Resultado |
|---|---|
| Comparación del ZIP con GitHub | Contenido equivalente al commit `4461bf777a7534e6aaefa4c1385d5be7207bce57`, omitiendo finales de línea |
| `mvn verify` con Java 21 | Correcto |
| Contratos JUnit contra H2 | 11 aprobados |
| Los mismos contratos contra PostgreSQL 16 real en Testcontainers | 11 aprobados, ninguno omitido |
| Pruebas del servicio de progreso con Mockito | 2 aprobadas |
| Pruebas Vitest de cliente y validación | 9 aprobadas |
| Pruebas de interfaz y formularios | 3 aprobadas |
| TypeScript de web, móvil y paquete compartido | Correcto |
| Compilación web Vite | Correcta |
| Versiones de dependencias de Expo | Compatibles con el mapa de SDK 58 instalado |
| Empaquetado JavaScript Android con Expo | Correcto; no equivale a un APK ni a ejecución física |
| Construcción de imágenes backend y web | Correcta |
| Stack local Spring + PostgreSQL + Caddy | Operativo en puerto 8088 |
| Postman/Newman contra el proxy y PostgreSQL | 35 requests y 36 aserciones aprobadas |
| Presentación | 10 diapositivas renderizadas e inspeccionadas, con notas y validación de estructura |

En total, las suites de backend y clientes incluyen **36 pruebas automáticas aprobadas**, además de la colección Postman. Los contratos cubren autenticación, recursos de otro usuario, paginación SQL, validaciones, progreso, puntos, rotación y revocación de refresh, importación QR y eliminación de actividades relacionadas.

## Revisión visual y funcional de la web

Se verificaron ingreso, recuperación de sesión tras recargar, creación de un curso desde formulario, actualización de progreso al completar una tarea, QR de importación y segunda página del listado de tareas. La revisión visual cubrió tamaños de escritorio, tablet y teléfono. Las capturas documentan un entorno local de demostración; no prueban un despliegue externo.

Los datos iniciales se cargaron mediante la API real y se conservaron en la base de datos. La colección de Postman también se ejecutó a través de Caddy, usando GET, POST, PUT, PATCH y DELETE.

## Límites de la comprobación

- No se publicó el stack ni una build móvil, conforme a la solicitud de mantener esta entrega local.
- El código nativo se comprobó con TypeScript y el empaquetador Expo. Cámara, GPS y experiencia física requieren un teléfono con permisos reales.
- El envío Resend está desactivado en la demo. No se afirma haber entregado correos.
- Los tiempos observados son locales y no acreditan latencia pública, disponibilidad continua ni una nota de evaluación.
