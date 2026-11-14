# StudyProgress: entrega local

El proyecto incluye backend Spring, web React, app Expo, pruebas, documentación y presentación. Los cinco integrantes figuran con 100 % de participación y los aportes confirmados. La publicación externa se deja para después.

## Ejecutar en local

Al iniciar el stack local con los pasos siguientes, la web queda en **http://localhost:8088**.

- Correo de demo: `demo@studyprogress.example`
- Contraseña de demo: `DemoStudy2026`

Los datos de esa cuenta son de demostración y se guardan en PostgreSQL local. Puedes crear otra cuenta desde la web.

## Desde una copia nueva

Necesitas Docker Desktop iniciado y Node 24. Abre una terminal en `StudyProgress/`. El README incluye una opción con Java 21 y H2 para ejecutar el proyecto sin Docker.

```powershell
node scripts/setup-local.mjs
docker compose up -d --build
```

Cuando arranque, abre http://localhost:8088 y registra una cuenta. Para cargar la demo:

```powershell
$env:API_URL='http://localhost:8088/api/v1'
node scripts/seed-demo.mjs
```

Conserva el `.env` generado mientras uses el mismo volumen de PostgreSQL. La contraseña inicial de una base persistente no cambia al recrear su contenedor. El ZIP contiene el código y ejemplos de configuración, sin claves locales ni bases de datos.

## App en tu teléfono

Desde esta carpeta, con el stack Docker anterior activo:

```powershell
npm ci
node scripts/configure-mobile-local.mjs
docker compose -f docker-compose.yml -f docker-compose.mobile.yml up -d
npm run mobile
```

Usa Expo Go compatible con SDK 58 y conecta el teléfono a la misma red Wi-Fi. Escanea el QR que muestra Expo en la terminal. El configurador detecta la IP local y habilita la conexión de la app al backend. Si la red del campus aísla dispositivos, usa una red que permita la comunicación entre la computadora y tu teléfono.

La cámara y el GPS necesitan comprobarse en un teléfono real. La app incluye permisos y alternativas manuales. El QR para abrir Expo es distinto del QR que aparece dentro de un curso para copiar sus temas.

## Para revisar y exponer

- `README.md`: arquitectura, ejecución y equipo.
- `docs/MATRIZ_RUBRICA_2.md`: correspondencia con los requisitos.
- `docs/EXPOSICION.md`: guion y respuestas técnicas.
- `docs/StudyProgress-Presentacion.pptx`: diez diapositivas editables con notas.
- `docs/VERIFICACION.md`: pruebas realizadas y su alcance.
- `docs/DESPLIEGUE.md`: preparación para cuando se retome la publicación.

Para detener los servicios conservando los datos: `docker compose down`.
