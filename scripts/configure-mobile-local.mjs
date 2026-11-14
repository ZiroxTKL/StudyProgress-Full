import os from "node:os";
import { readFile, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import "./setup-local.mjs";

const candidates = Object.entries(os.networkInterfaces())
  .filter(
    ([name]) => !/docker|vethernet|virtual|wsl|vmware|vpn|loopback/i.test(name),
  )
  .flatMap(([, addresses]) =>
    (addresses || [])
      .filter((a) => a.family === "IPv4" && !a.internal)
      .map((a) => a.address),
  )
  .filter((ip) => /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(ip));
const ip =
  process.argv[2] ||
  candidates.find((x) => x.startsWith("192.168.")) ||
  candidates[0];
if (!ip || isIP(ip) !== 4)
  throw new Error(
    "No encontramos una IP de red local. Ejecuta: node scripts/configure-mobile-local.mjs TU_IP_LAN",
  );
const api = `http://${ip}:8088/api/v1`;
async function setVariable(file, key, value) {
  let body = "";
  try {
    body = await readFile(file, "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const lines = body
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith(`${key}=`));
  lines.push(`${key}=${value}`);
  await writeFile(file, lines.join("\n") + "\n");
}
await setVariable("mobile/.env", "EXPO_PUBLIC_API_URL", api);
await setVariable(".env", "LOCAL_WEB_ORIGIN", `http://${ip}:8088`);
await setVariable(".env", "LAN_IP", ip);
console.log(`App móvil configurada para ${api}`);
console.log(
  "Ejecuta docker compose -f docker-compose.yml -f docker-compose.mobile.yml up -d y luego npm run mobile. Usa la misma red Wi-Fi en el teléfono.",
);
