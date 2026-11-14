import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
try {
  await writeFile(
    ".env",
    `DB_PASSWORD=${randomBytes(24).toString("hex")}\nJWT_SECRET=${randomBytes(48).toString("hex")}\n`,
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Se creó .env con secretos locales únicos. No compartas ese archivo.",
  );
} catch (e) {
  if (e.code === "EEXIST")
    console.log(".env ya existe; se conservó sin cambios.");
  else throw e;
}
