import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Pagination } from "../components/ui";
import { ResourceForm } from "../components/ResourceForm";
import { courseSchema } from "@studyprogress/client";
afterEach(cleanup);
describe("Pagination", () => {
  it("shows server totals and changes query state with the next control", () => {
    const update = vi.fn();
    render(
      <Pagination
        page={{
          content: Array(10).fill({}),
          page: 0,
          size: 10,
          total: 24,
          totalPages: 3,
        }}
        onChange={update}
      />,
    );
    expect(screen.getByText("Mostrando 1–10 de 24")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Página siguiente"));
    expect(update).toHaveBeenCalledWith("page", "1");
    expect(screen.getByLabelText("Página anterior")).toBeDisabled();
  });
});
describe("Forms", () => {
  it("prevents an invalid submission and gives field feedback", async () => {
    const submit = vi.fn();
    render(
      <ResourceForm
        fields={[{ name: "nombre", label: "Nombre" }]}
        schema={courseSchema}
        initial={{ nombre: "", descripcion: "" }}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(submit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Escribe al menos 2 caracteres"),
    ).toBeInTheDocument();
  });
  it("disables submission while an API mutation is pending", async () => {
    const submit = vi.fn(() => new Promise<void>(() => {}));
    render(
      <ResourceForm
        fields={[{ name: "nombre", label: "Nombre" }]}
        schema={courseSchema}
        initial={{ nombre: "DBP", descripcion: "" }}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();
  });
});
