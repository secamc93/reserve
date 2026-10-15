import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VotingValidationError,
  validateCreateVoting,
  validateCreateVotingGroup,
  validateCreateVotingOption,
  validateDateRange,
  validateDisplayOrder,
  validateISO8601Format,
  validateQuorumConfiguration,
  validateUpdateVoting,
  validateVotingPeriod,
} from "./voting-validation";

const START = "2026-03-01T08:00:00Z";
const END = "2026-03-01T18:00:00Z";

describe("validateDateRange", () => {
  it("acepta un fin posterior al inicio", () => {
    expect(() => validateDateRange(START, END)).not.toThrow();
  });

  it("rechaza fin igual o anterior al inicio", () => {
    expect(() => validateDateRange(START, START)).toThrow("La fecha de fin debe ser posterior");
    expect(() => validateDateRange(END, START)).toThrow(VotingValidationError);
  });

  it("rechaza fechas que no se pueden interpretar", () => {
    expect(() => validateDateRange("no-fecha", END)).toThrow("Fecha de inicio inválida");
    expect(() => validateDateRange(START, "no-fecha")).toThrow("Fecha de fin inválida");
  });
});

describe("validateQuorumConfiguration", () => {
  it("exige porcentaje cuando se requiere quórum", () => {
    expect(() => validateQuorumConfiguration(true)).toThrow("debe especificarse el porcentaje");
  });

  it.each([0, -5, 100.1])("rechaza porcentaje fuera de (0, 100]: %d", (pct) => {
    expect(() => validateQuorumConfiguration(true, pct)).toThrow("entre 0 y 100");
  });

  it("acepta los bordes válidos y la ausencia de quórum", () => {
    expect(() => validateQuorumConfiguration(true, 100)).not.toThrow();
    expect(() => validateQuorumConfiguration(true, 0.5)).not.toThrow();
    expect(() => validateQuorumConfiguration(false)).not.toThrow();
  });
});

describe("validateISO8601Format", () => {
  it.each(["2026-03-01T08:00:00Z", "2026-03-01T08:00:00.123Z"])("acepta %s", (value) => {
    expect(() => validateISO8601Format(value, "Fecha")).not.toThrow();
  });

  it.each(["2026-03-01", "2026-03-01T08:00:00", "2026-03-01T08:00:00-05:00", "01/03/2026 08:00"])(
    "rechaza %s nombrando el campo",
    (value) => {
      expect(() => validateISO8601Format(value, "Fecha de inicio")).toThrow(/^Fecha de inicio debe estar en formato ISO 8601/);
    },
  );
});

describe("validateDisplayOrder", () => {
  it("acepta enteros positivos", () => {
    expect(() => validateDisplayOrder(1)).not.toThrow();
  });

  it.each([0, -1, 1.5, Number.NaN])("rechaza %d", (order) => {
    expect(() => validateDisplayOrder(order)).toThrow("entero positivo");
  });
});

describe("validateCreateVotingGroup", () => {
  const valid = { name: "Asamblea 2026", votingStartDate: START, votingEndDate: END };

  it("acepta un grupo válido", () => {
    expect(() => validateCreateVotingGroup({ ...valid, requiresQuorum: true, quorumPercentage: 51 })).not.toThrow();
  });

  it("rechaza nombres de menos de 3 o más de 150 caracteres", () => {
    expect(() => validateCreateVotingGroup({ ...valid, name: "AB" })).toThrow("Nombre debe tener al menos 3 caracteres");
    expect(() => validateCreateVotingGroup({ ...valid, name: "x".repeat(151) })).toThrow("Nombre no puede exceder 150 caracteres");
  });

  it("rechaza fechas fuera de ISO 8601 o invertidas", () => {
    expect(() => validateCreateVotingGroup({ ...valid, votingStartDate: "2026-03-01" })).toThrow("formato ISO 8601");
    expect(() => validateCreateVotingGroup({ ...valid, votingStartDate: END, votingEndDate: START })).toThrow("posterior");
  });

  it("rechaza descripción > 1000 y notas > 2000", () => {
    expect(() => validateCreateVotingGroup({ ...valid, description: "d".repeat(1001) })).toThrow("Descripción");
    expect(() => validateCreateVotingGroup({ ...valid, notes: "n".repeat(2001) })).toThrow("Notas");
  });

  it("rechaza quórum requerido sin porcentaje", () => {
    expect(() => validateCreateVotingGroup({ ...valid, requiresQuorum: true })).toThrow("quórum");
  });
});

describe("validateCreateVoting / validateUpdateVoting", () => {
  it("valida título, descripción, orden y porcentaje al crear", () => {
    const valid = { title: "Aprobar presupuesto", description: "Presupuesto 2026", displayOrder: 1 };
    expect(() => validateCreateVoting(valid)).not.toThrow();
    expect(() => validateCreateVoting({ ...valid, title: "No" })).toThrow("Título");
    expect(() => validateCreateVoting({ ...valid, displayOrder: 0 })).toThrow("entero positivo");
    expect(() => validateCreateVoting({ ...valid, requiredPercentage: 150 })).toThrow("porcentaje requerido");
  });

  it("al actualizar solo valida lo que llega y restringe el tipo de votación", () => {
    expect(() => validateUpdateVoting({})).not.toThrow();
    expect(() => validateUpdateVoting({ votingType: "majority" })).not.toThrow();
    expect(() => validateUpdateVoting({ votingType: "ranked" })).toThrow("Tipo de votación inválido");
  });
});

describe("validateCreateVotingOption", () => {
  const valid = { optionText: "Sí", optionCode: "YES", displayOrder: 1 };

  it("acepta colores hexadecimales de 6 dígitos", () => {
    expect(() => validateCreateVotingOption({ ...valid, color: "#22c55e" })).not.toThrow();
  });

  it.each(["22c55e", "#fff", "#22c55g"])("rechaza el color %s", (color) => {
    expect(() => validateCreateVotingOption({ ...valid, color })).toThrow("hexadecimal");
  });

  it("rechaza códigos de más de 20 caracteres", () => {
    expect(() => validateCreateVotingOption({ ...valid, optionCode: "C".repeat(21) })).toThrow("Código de la opción");
  });
});

describe("validateVotingPeriod", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("está activa dentro del periodo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
    expect(validateVotingPeriod(START, END)).toEqual({ isActive: true });
  });

  it("no está activa antes de iniciar ni después de terminar", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T07:00:00Z"));
    const before = validateVotingPeriod(START, END);
    expect(before.isActive).toBe(false);
    expect(before.message).toMatch(/aún no ha comenzado/);

    vi.setSystemTime(new Date("2026-03-01T19:00:00Z"));
    const after = validateVotingPeriod(START, END);
    expect(after.isActive).toBe(false);
    expect(after.message).toMatch(/ha finalizado/);
  });
});
