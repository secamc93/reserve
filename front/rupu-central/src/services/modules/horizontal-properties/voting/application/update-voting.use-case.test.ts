import { describe, expect, it, vi } from "vitest";
import type { IVotingsRepository } from "../domain/ports/votings.repository";
import type { Voting } from "../domain/entities/voting.entity";
import { UpdateVotingUseCase } from "./update-voting.use-case";
import { ActivateVotingUseCase } from "./activate-voting.use-case";

function fakeRepository(overrides: Partial<IVotingsRepository> = {}): IVotingsRepository {
  return {
    getVotings: vi.fn(),
    getVotingById: vi.fn(),
    createVoting: vi.fn(),
    updateVoting: vi.fn(),
    deleteVoting: vi.fn(),
    activateVoting: vi.fn(),
    deactivateVoting: vi.fn(),
    ...overrides,
  };
}

const base = { token: "tok", businessId: 7, groupId: 3 };

describe("UpdateVotingUseCase", () => {
  it("delega en el repositorio con los parámetros recibidos y devuelve la votación", async () => {
    const voting = { id: 9, title: "Aprobar presupuesto" } as unknown as Voting;
    const updateVoting = vi.fn().mockResolvedValue(voting);
    const useCase = new UpdateVotingUseCase(fakeRepository({ updateVoting }));

    const result = await useCase.execute({ ...base, votingId: 9, data: { title: "Aprobar presupuesto" } });

    expect(result).toEqual({ voting });
    expect(updateVoting).toHaveBeenCalledWith({ ...base, votingId: 9, data: { title: "Aprobar presupuesto" } });
  });

  it.each([0, -1])("rechaza votingId %d sin llamar al repositorio", async (votingId) => {
    const updateVoting = vi.fn();
    const useCase = new UpdateVotingUseCase(fakeRepository({ updateVoting }));

    await expect(useCase.execute({ ...base, votingId, data: {} })).rejects.toThrow("ID de la votación inválido");
    expect(updateVoting).not.toHaveBeenCalled();
  });

  it("valida los datos antes de persistir", async () => {
    const updateVoting = vi.fn();
    const useCase = new UpdateVotingUseCase(fakeRepository({ updateVoting }));

    await expect(useCase.execute({ ...base, votingId: 9, data: { votingType: "ranked" } })).rejects.toThrow(
      "Tipo de votación inválido",
    );
    await expect(useCase.execute({ ...base, votingId: 9, data: { title: "ab" } })).rejects.toThrow("Título");
    expect(updateVoting).not.toHaveBeenCalled();
  });

  it("propaga el error del repositorio", async () => {
    const useCase = new UpdateVotingUseCase(
      fakeRepository({ updateVoting: vi.fn().mockRejectedValue(new Error("HTTP 500")) }),
    );
    await expect(useCase.execute({ ...base, votingId: 9, data: {} })).rejects.toThrow("HTTP 500");
  });
});

describe("ActivateVotingUseCase", () => {
  it("activa y devuelve el mensaje del repositorio", async () => {
    const activateVoting = vi.fn().mockResolvedValue("Votación activada");
    const useCase = new ActivateVotingUseCase(fakeRepository({ activateVoting }));

    await expect(useCase.execute({ ...base, votingId: 4 })).resolves.toEqual({ message: "Votación activada" });
    expect(activateVoting).toHaveBeenCalledWith({ ...base, votingId: 4 });
  });

  it("rechaza votingId inválido sin llamar al repositorio", async () => {
    const activateVoting = vi.fn();
    const useCase = new ActivateVotingUseCase(fakeRepository({ activateVoting }));

    await expect(useCase.execute({ ...base, votingId: 0 })).rejects.toThrow("ID de la votación inválido");
    expect(activateVoting).not.toHaveBeenCalled();
  });
});
