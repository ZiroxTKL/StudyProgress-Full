# Despliegue del stack

## Estado y acceso a las cuentas

El despliegue está pospuesto por solicitud del equipo. El código y los archivos de despliegue están preparados. Publicar una web aislada no demuestra que el backend, RDS y Expo funcionen juntos. La dirección HTTP del README anterior no respondió durante esta revisión. No se encontró una sesión AWS local. La CLI de Expo sí confirmó una sesión y se vinculó el proyecto `@roedeer/studyprogress-grupo7` (ID `77487daa-2645-4271-ba32-33c8699c0f30`). Esto no representa una build publicada.

Para comprobar AWS, abre https://console.aws.amazon.com/ e ingresa con la cuenta que usó el equipo en la primera entrega. En EC2 revisa las instancias y en RDS las bases. Si otra persona hizo ese despliegue, pídele que abra su sesión y conserve las claves fuera del repositorio. Para Expo, abre https://expo.dev/ y revisa Projects o ejecuta `npx eas-cli whoami` desde `mobile`. Si pide iniciar sesión, usa `npx eas-cli login` de forma interactiva. No pegues contraseñas, tokens, archivos `.pem` ni API keys en un chat.

## Producción propuesta: EC2 + RDS + Caddy

1. Reutiliza una instancia del equipo con Docker si existe. Crear recursos AWS nuevos puede generar cobros; antes de aprovisionarlos, revisa el costo y el presupuesto de la cuenta.
2. En RDS usa PostgreSQL 16, base privada y copias de seguridad. Permite 5432 solo desde el security group de EC2. La cadena JDBC debe apuntar al host real de RDS, sin credenciales dentro del código.
3. En EC2 permite 80/443 al público y 22 solo desde la IP administrativa. No publiques 8080 ni el puerto de la base. Caddy recibe el tráfico y accede al backend por la red privada de Docker.
4. Crea un registro A del dominio del equipo hacia EC2. También es válido un dominio de una plataforma cloud equivalente que proporcione HTTPS.
5. Copia el código de la rama de entrega al servidor. Crea `.env` en ese servidor a partir del ejemplo e ingresa allí los valores reales. Nunca lo agregues a Git.

```dotenv
APP_DOMAIN=estudio.tu-dominio.edu
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST_RDS:5432/studyprogress?sslmode=verify-full&sslrootcert=/app/certs/global-bundle.pem
SPRING_DATASOURCE_USERNAME=USUARIO_DE_APLICACION
SPRING_DATASOURCE_PASSWORD=VALOR_PRIVADO
JWT_SECRET=VALOR_ALEATORIO_DE_AL_MENOS_32_BYTES
EMAIL_ENABLED=false
```

Los valores de este bloque son ejemplos de configuración, no recursos creados. La imagen descarga el certificado raíz oficial de RDS. Se recomienda un usuario de aplicación con los permisos necesarios sobre su propia base, separado del administrador de RDS. `ddl-auto=update` conserva el enfoque de la primera entrega; en un sistema productivo de mayor alcance se deben introducir migraciones versionadas.

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs --tail=80 backend web
curl --fail https://TU_DOMINIO/health
```

Caddy solicita y renueva certificados TLS al resolver el dominio y recibir tráfico por 80/443. Web y API comparten origen, evitando cookies entre sitios y errores de CORS. En el navegador se utiliza `/api/v1`. El archivo de producción configura `COOKIE_SECURE=true` y `ALLOWED_ORIGINS=https://APP_DOMAIN`.

Si el equipo usa Vercel o Netlify para la web, configura un proxy del mismo origen para `/api/*` hacia el backend HTTPS. No cambies a una cookie insegura para resolver una integración entre sitios. Para Netlify/Vercel adapta también la reescritura de rutas SPA a `index.html`. La alternativa Caddy incluida ya resuelve ambos puntos.

## Publicación móvil en Expo/EAS

El proyecto Expo ya quedó vinculado: https://expo.dev/accounts/roedeer/projects/studyprogress-grupo7. Cuando se retome el despliegue, revisa que esa sea la cuenta del equipo. Estos comandos deben ejecutarse dentro de `mobile`:

```bash
npx eas-cli login
npx eas-cli project:info
npx eas-cli build:configure
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://TU_DOMINIO/api/v1 --visibility plaintext
npx eas-cli build --platform android --profile preview
```

`EXPO_PUBLIC_API_URL` es una dirección pública, no un secreto. La clave JWT, la contraseña RDS y la API key Resend pertenecen al servidor y nunca deben ser variables `EXPO_PUBLIC_*`. El ID real del proyecto ya figura en `extra.eas.projectId`, devuelto por EAS al vincular la cuenta. No es necesario crear otro proyecto. Si la CLI solicita elegir un propietario u organización, selecciona la cuenta del equipo.

El perfil preview genera un APK para instalación interna. Guarda el enlace de EAS que permite descargarlo y probarlo en un teléfono. Si el equipo usa actualizaciones EAS:

```bash
npx eas-cli update:configure
npx eas-cli update --channel preview --environment preview --message "Entrega 2 StudyProgress"
```

La distribución por Play Console/TestFlight requiere cuentas y pasos propios de esas tiendas. Un `expo export` local o un QR temporal de Metro no equivale a una publicación verificable. Para el curso, conserva la URL real del proyecto/build y la evidencia del uso contra la API pública.

## Verificación pública

- Abre web y `/health` desde otra red, en HTTPS y sin advertencias.
- Registra un usuario de pruebas. Crea un curso en web y revísalo en la app.
- Completa una tarea desde móvil y recarga la web. Debe reflejar el mismo estado.
- Abre dos cuentas distintas y confirma que no comparten recursos.
- Recarga la web, verifica la cookie Secure/HttpOnly y prueba cerrar sesión.
- En un teléfono concede/deniega cámara y GPS. Prueba ambos fallbacks.
- Mide latencia sobre el servicio público con `scripts/check-deployment.mjs` y conserva la salida. La medición local no demuestra la latencia de AWS.
- Mantén disponibles los servicios durante la evaluación y registra las URLs en `docs/ENTREGA.md`.

No se afirma disponibilidad continua ni promedio menor a 500 ms sin medir el despliegue real.
