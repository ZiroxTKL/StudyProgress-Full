// Demo data is persisted through the actual Spring API. Run against a local environment.
const base = (process.env.API_URL || "http://127.0.0.1:8080/api/v1").replace(
  /\/$/,
  "",
);
if (
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname) &&
  process.env.ALLOW_REMOTE_DEMO !== "true"
)
  throw new Error(
    "Para cargar una cuenta pública de demo en un servidor remoto, configura ALLOW_REMOTE_DEMO=true de forma explícita.",
  );
const email = process.env.DEMO_EMAIL || "demo@studyprogress.example";
const password = process.env.DEMO_PASSWORD || "DemoStudy2026";
let token = "";
async function request(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok)
    throw new Error(`${method} ${path}: ${res.status} ${data?.message || ""}`);
  return data;
}
try {
  await request("POST", "/auth/registro", {
    nombre: "Alex Estudiante",
    email,
    password,
  });
} catch (e) {
  if (!String(e).includes("409")) throw e;
}
token = (await request("POST", "/auth/login", { email, password })).token;
const existing = await request("GET", "/cursos?size=100");
const date = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const definitions = [
  [
    "Desarrollo Basado en Plataformas",
    "Construimos productos conectando backend, web y móvil.",
    [
      "React y TypeScript",
      "Hooks y Context API",
      "React Native y Expo",
      "Integración y despliegue",
    ],
  ],
  [
    "Algoritmos y Estructuras de Datos",
    "Ideas claras para resolver problemas de forma eficiente.",
    ["Árboles de búsqueda", "Grafos", "Programación dinámica"],
  ],
  [
    "Base de Datos",
    "Diseña, consulta y protege la información.",
    ["Modelo relacional", "Consultas SQL", "Transacciones e índices"],
  ],
  [
    "Matemática Discreta",
    "Las bases para pensar de forma computacional.",
    ["Lógica proposicional", "Combinatoria", "Relaciones y funciones"],
  ],
];
for (const [index, [nombre, descripcion, temas]] of definitions.entries()) {
  if (existing.content.some((c) => c.nombre === nombre)) {
    console.log(`Ya existe: ${nombre}`);
    continue;
  }
  const course = await request("POST", "/cursos", { nombre, descripcion });
  for (const [i, name] of temas.entries()) {
    const topic = await request("POST", `/cursos/${course.id}/temas`, {
      nombre: name,
      descripcion: "Contenido del plan de estudio",
    });
    if (i < index + 1) await request("PATCH", `/temas/${topic.id}/completar`);
  }
  const titles =
    index === 0
      ? [
          "Conectar el dashboard a la API",
          "Preparar el pitch de la entrega 2",
          "Validar los sensores en el teléfono",
          "Revisar paginación y errores",
        ]
      : [
          "Resolver ejercicios de práctica",
          "Preparar resumen del tema",
          "Repasar antes de la evaluación",
        ];
  for (const [i, titulo] of titles.entries()) {
    const task = await request("POST", `/cursos/${course.id}/tareas`, {
      titulo,
      descripcion: "Dedica un bloque de estudio y registra tu avance.",
      fechaLimite: date(i + index + 1),
      prioridad: ["ALTA", "MEDIA", "BAJA"][i % 3],
    });
    if (i === 0 && index > 0)
      await request("PATCH", `/tareas/${task.id}/completar`);
  }
  const exam = await request("POST", `/cursos/${course.id}/evaluaciones`, {
    titulo: "Evaluación de avance",
    descripcion: "Registro de demostración",
    fecha: date(10),
    tipo: "PRACTICA",
    ponderacion: 20,
  });
  await request("PATCH", `/evaluaciones/${exam.id}/calificacion`, {
    calificacion: 17 + index * 0.5,
  });
}
if ((await request("GET", "/objetivos")).length === 0) {
  await request("POST", "/objetivos", {
    titulo: "Estudiar 30 minutos al día",
    descripcion: "Un hábito pequeño para avanzar con constancia.",
    fechaLimite: date(7),
  });
  const goal = await request("POST", "/objetivos", {
    titulo: "Organizar todos mis cursos",
    descripcion: "Todo mi semestre en un mismo lugar.",
    fechaLimite: date(7),
  });
  await request("PATCH", `/objetivos/${goal.id}/completar`);
}
if ((await request("GET", "/recordatorios")).length === 0)
  await request("POST", "/recordatorios", {
    titulo: "Ensayo de la presentación",
    descripcion: "Revisar el flujo web y la importación QR.",
    fechaHora: `${date(2)}T18:00:00`,
  });
console.log(
  `Demo lista en ${base}. Usuario: ${email}. Contraseña: ${password}. Datos guardados en la base de datos.`,
);
