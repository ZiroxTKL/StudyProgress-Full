#!/usr/bin/env bash
set -euo pipefail

runtime_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
env_file="${1:?Indica la ruta al archivo de entorno}"
: "${APP_ADDRESS:?APP_ADDRESS es obligatorio}"
test -f "$env_file"
test -f "$runtime_dir/backend.jar"
test -f "$runtime_dir/web/index.html"
test -f "$runtime_dir/certs/global-bundle.pem"

jre_image="eclipse-temurin:21-jre-alpine@sha256:ac05c3c42b7c2f1a52c9bd52f01041fa1958231b15ebeae7420429cbc5baf474"
caddy_image="caddy:2-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0"
docker pull "$jre_image"
docker pull "$caddy_image"
docker network inspect studyprogress >/dev/null 2>&1 || docker network create studyprogress
docker volume create studyprogress-caddy-data >/dev/null
docker volume create studyprogress-caddy-config >/dev/null

docker rm -f studyprogress-api >/dev/null 2>&1 || true
docker run -d --name studyprogress-api --restart unless-stopped \
    --network studyprogress --env-file "$env_file" --user 10001:10001 \
    --read-only --tmpfs /tmp:rw,noexec,nosuid,size=128m \
    --cap-drop ALL --security-opt no-new-privileges:true \
    --memory 900m --pids-limit 256 \
    --log-opt max-size=10m --log-opt max-file=3 \
    --mount "type=bind,source=$runtime_dir/backend.jar,target=/app/app.jar,readonly" \
    --mount "type=bind,source=$runtime_dir/certs/global-bundle.pem,target=/app/certs/global-bundle.pem,readonly" \
    --health-cmd 'wget -q -O - http://127.0.0.1:8080/health || exit 1' \
    --health-interval 15s --health-timeout 5s --health-start-period 60s --health-retries 3 \
    "$jre_image" java -XX:MaxRAMPercentage=65 -XX:+ExitOnOutOfMemoryError -jar /app/app.jar

api_ready=false
for attempt in $(seq 1 60); do
    if docker exec studyprogress-api wget -q -O - http://127.0.0.1:8080/health >/dev/null 2>&1; then
        api_ready=true
        break
    fi
    sleep 2
done
if [ "$api_ready" != true ]; then
    printf '%s\n' 'El backend no respondio a la comprobacion de salud.' >&2
    exit 1
fi

docker rm -f studyprogress-web >/dev/null 2>&1 || true
docker run -d --name studyprogress-web --restart unless-stopped \
    --network studyprogress -p 80:80 -p 443:443 --env "APP_ADDRESS=$APP_ADDRESS" \
    --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m \
    --log-opt max-size=10m --log-opt max-file=3 \
    --mount "type=bind,source=$runtime_dir/Caddyfile,target=/etc/caddy/Caddyfile,readonly" \
    --mount "type=bind,source=$runtime_dir/web,target=/srv,readonly" \
    --mount type=volume,source=studyprogress-caddy-data,target=/data \
    --mount type=volume,source=studyprogress-caddy-config,target=/config \
    "$caddy_image"

printf 'Web: https://%s\nAPI: https://%s/api/v1\n' "$APP_ADDRESS" "$APP_ADDRESS"
