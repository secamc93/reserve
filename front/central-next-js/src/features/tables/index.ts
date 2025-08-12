// Domain
export * from './domain/Table';

// Ports
export * from './ports/TableRepository';

// Application
export * from './application/GetTablesUseCase';
export * from './application/GetTableByIdUseCase';
export * from './application/CreateTableUseCase';
export * from './application/UpdateTableUseCase';
export * from './application/DeleteTableUseCase';

// Infrastructure
export * from './adapters/http/TableService';
export * from './adapters/http/TableRepositoryHttp';

// UI Components
export { default as TablesPage } from './ui/pages/TablesPage';
export { default as TablesStats } from './ui/components/TablesStats';
export { default as TablesTable } from './ui/components/TablesTable';
export { default as TableModal } from './ui/components/TableModal';
export { default as DeleteConfirmModal } from './ui/components/DeleteConfirmModal';

// Hooks
export * from './ui/hooks/useTables'; 