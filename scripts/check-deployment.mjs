const base = (process.env.API_URL || "").replace(/\/$/, "");
if (!base.startsWith("https://"))
  throw new Error(
    "Configura API_URL con la URL HTTPS pública terminada en /api/v1",
  );
const email = process.env.DEMO_EMAIL,
  password = process.env.DEMO_PASSWORD;
if (!email || !password)
  throw new Error(
    "Configura DEMO_EMAIL y DEMO_PASSWORD con una cuenta de pruebas del servidor.",
  );
async function call(path, options = {}) {
  const start = performance.now();
  const res = await fetch(base + path, {
    ...options,
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return { res, ms: performance.now() - start };
}
const login = await call("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const { token } = await login.res.json();
const times = [];
for (let i = 0; i < 10; i++) {
  const { ms } = await call("/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  times.push(ms);
}
const mean = times.reduce((a, b) => a + b, 0) / times.length;
console.log(
  JSON.stringify(
    {
      endpoint: "/dashboard",
      samples: times.length,
      meanMs: Math.round(mean),
      under500ms: mean < 500,
    },
    null,
    2,
  ),
);
