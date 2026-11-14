import { describe, it, expect } from "vitest";
import {
  parseCourseQr,
  taskSchema,
  registerSchema,
  gradeSchema,
} from "./validation";
describe("Course imports", () => {
  it("accepts only the expected QR contract", () => {
    expect(
      parseCourseQr(
        JSON.stringify({
          version: 1,
          type: "studyprogress-course",
          nombre: "DBP",
          descripcion: "Curso",
          temas: ["React"],
        }),
      ).nombre,
    ).toBe("DBP");
  });
  it("rejects malicious URLs and unknown payloads", () => {
    expect(() => parseCourseQr("https://example.com/steal")).toThrow();
    expect(() =>
      parseCourseQr(
        JSON.stringify({
          version: 1,
          type: "studyprogress-course",
          nombre: "DBP",
          descripcion: "",
          temas: [],
          userId: 7,
        }),
      ),
    ).toThrow();
  });
  it("bounds QR size before parsing", () => {
    expect(() => parseCourseQr("x".repeat(2501))).toThrow();
  });
});
describe("Input validation", () => {
  it("rejects weak passwords and invalid emails", () => {
    expect(
      registerSchema.safeParse({
        nombre: "Ana",
        email: "wrong",
        password: "123",
      }).success,
    ).toBe(false);
  });
  it("validates task priority and dates before sending", () => {
    expect(
      taskSchema.safeParse({
        titulo: "Test task",
        descripcion: "",
        fechaLimite: "2000-01-01",
        prioridad: "URGENTE",
      }).success,
    ).toBe(false);
  });
  it("rejects grades outside the actual 0 to 20 scale", () => {
    expect(gradeSchema.safeParse({ calificacion: 21 }).success).toBe(false);
    expect(gradeSchema.parse({ calificacion: "17.5" }).calificacion).toBe(17.5);
  });
});
