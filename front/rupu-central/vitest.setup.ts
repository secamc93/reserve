import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// findBy*/waitFor esperan hasta 5 s: con la máquina o el runner de CI cargados, 1 s se queda corto.
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});
