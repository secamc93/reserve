import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./alert";

describe("Alert", () => {
  it("muestra el contenido con el estilo info por defecto", () => {
    const { container } = render(<Alert>Guardado pendiente</Alert>);
    expect(screen.getByText("Guardado pendiente")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("alert", "alert-info");
  });

  it("aplica la clase del tipo indicado", () => {
    const { container } = render(<Alert type="error">No se pudo guardar</Alert>);
    expect(container.firstChild).toHaveClass("alert-error");
  });

  it("sin onClose no muestra botón de cerrar", () => {
    render(<Alert>Sin cierre</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("con onClose muestra el botón y lo llama al hacer clic", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Alert type="success" onClose={onClose}>
        Listo
      </Alert>,
    );

    // El botón de cerrar no tiene nombre accesible (solo un SVG): se busca por rol.
    await user.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
