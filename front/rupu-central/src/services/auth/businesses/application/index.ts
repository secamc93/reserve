/**
 * Application Layer - Businesses Use Cases
 */

import { IBusinessesRepository, IBusinessConfiguredResourcesRepository } from '../domain/ports';
import { GetBusinessesUseCase } from './get-businesses.use-case';
import { GetBusinessConfiguredResourcesUseCase } from './get-business-configured-resources.use-case';
import { ActivateResourceUseCase } from './activate-resource.use-case';
import { DeactivateResourceUseCase } from './deactivate-resource.use-case';

export interface BusinessesUseCasesInput {
    UseCaseGetBusinesses: GetBusinessesUseCase;
    UseCaseGetBusinessConfiguredResources: GetBusinessConfiguredResourcesUseCase;
    UseCaseActivateResource: ActivateResourceUseCase;
    UseCaseDeactivateResource: DeactivateResourceUseCase;
}

export class BusinessesUseCases implements BusinessesUseCasesInput {
    public UseCaseGetBusinesses: GetBusinessesUseCase;
    public UseCaseGetBusinessConfiguredResources: GetBusinessConfiguredResourcesUseCase;
    public UseCaseActivateResource: ActivateResourceUseCase;
    public UseCaseDeactivateResource: DeactivateResourceUseCase;

    constructor(
        businessesRepository: IBusinessesRepository,
        configuredResourcesRepository: IBusinessConfiguredResourcesRepository
    ) {
        this.UseCaseGetBusinesses = new GetBusinessesUseCase(businessesRepository);
        this.UseCaseGetBusinessConfiguredResources = new GetBusinessConfiguredResourcesUseCase(configuredResourcesRepository);
        this.UseCaseActivateResource = new ActivateResourceUseCase(configuredResourcesRepository);
        this.UseCaseDeactivateResource = new DeactivateResourceUseCase(configuredResourcesRepository);
    }

    get getBusinesses() { return this.UseCaseGetBusinesses; }
    get getBusinessConfiguredResources() { return this.UseCaseGetBusinessConfiguredResources; }
    get activateResource() { return this.UseCaseActivateResource; }
    get deactivateResource() { return this.UseCaseDeactivateResource; }
}

export * from './get-businesses.use-case';
export * from './get-business-configured-resources.use-case';
export * from './activate-resource.use-case';
export * from './deactivate-resource.use-case';
