package mapper

import (
	"central_reserve/services/tables/internal/domain"
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/response"
)

// TableToResponse convierte una entidad Table del dominio a TableResponse
func TableToResponse(table domain.Table) response.TableResponse {
	return response.TableResponse{
		ID:         table.ID,
		BusinessID: table.BusinessID,
		Number:     table.Number,
		Capacity:   table.Capacity,
		IsActive:   table.DeletedAt == nil, // Si DeletedAt es nil, está activa
		CreatedAt:  table.CreatedAt,
		UpdatedAt:  table.UpdatedAt,
	}
}

// TablePtrToResponse convierte un puntero a entidad Table del dominio a TableResponse
func TablePtrToResponse(table *domain.Table) response.TableResponse {
	if table == nil {
		return response.TableResponse{}
	}
	return TableToResponse(*table)
}

// TablesToResponse convierte un slice de entidades Table a slice de TableResponse
func TablesToResponse(tables []domain.Table) []response.TableResponse {
	responses := make([]response.TableResponse, len(tables))
	for i, table := range tables {
		responses[i] = TableToResponse(table)
	}
	return responses
}

// BuildGetTablesResponse construye la respuesta completa para obtener múltiples mesas
func BuildGetTablesResponse(tables []domain.Table, message string) response.GetTablesResponse {
	return response.GetTablesResponse{
		Success: true,
		Message: message,
		Data:    TablesToResponse(tables),
	}
}

// BuildGetTableResponse construye la respuesta completa para obtener una mesa
func BuildGetTableResponse(table domain.Table, message string) response.GetTableResponse {
	return response.GetTableResponse{
		Success: true,
		Message: message,
		Data:    TableToResponse(table),
	}
}

// BuildGetTablePtrResponse construye la respuesta completa para obtener una mesa desde un puntero
func BuildGetTablePtrResponse(table *domain.Table, message string) response.GetTableResponse {
	return response.GetTableResponse{
		Success: true,
		Message: message,
		Data:    TablePtrToResponse(table),
	}
}

// BuildCreateTableResponse construye la respuesta completa para crear una mesa
func BuildCreateTableResponse(table domain.Table, message string) response.CreateTableResponse {
	return response.CreateTableResponse{
		Success: true,
		Message: message,
		Data:    TableToResponse(table),
	}
}

// BuildCreateTablePtrResponse construye la respuesta completa para crear una mesa desde un puntero
func BuildCreateTablePtrResponse(table *domain.Table, message string) response.CreateTableResponse {
	return response.CreateTableResponse{
		Success: true,
		Message: message,
		Data:    TablePtrToResponse(table),
	}
}

// BuildCreateTableStringResponse construye la respuesta para crear mesa cuando solo tenemos string
func BuildCreateTableStringResponse(message string) response.CreateTableResponse {
	return response.CreateTableResponse{
		Success: true,
		Message: message,
		Data:    response.TableResponse{}, // Empty table response por ahora
	}
}

// BuildUpdateTableResponse construye la respuesta completa para actualizar una mesa
func BuildUpdateTableResponse(table domain.Table, message string) response.UpdateTableResponse {
	return response.UpdateTableResponse{
		Success: true,
		Message: message,
		Data:    TableToResponse(table),
	}
}

// BuildUpdateTablePtrResponse construye la respuesta completa para actualizar una mesa desde un puntero
func BuildUpdateTablePtrResponse(table *domain.Table, message string) response.UpdateTableResponse {
	return response.UpdateTableResponse{
		Success: true,
		Message: message,
		Data:    TablePtrToResponse(table),
	}
}

// BuildUpdateTableStringResponse construye la respuesta para actualizar mesa cuando solo tenemos string
func BuildUpdateTableStringResponse(message string) response.UpdateTableResponse {
	return response.UpdateTableResponse{
		Success: true,
		Message: message,
		Data:    response.TableResponse{}, // Empty table response por ahora
	}
}

// BuildDeleteTableResponse construye la respuesta completa para eliminar una mesa
func BuildDeleteTableResponse(message string) response.DeleteTableResponse {
	return response.DeleteTableResponse{
		Success: true,
		Message: message,
	}
}

// BuildErrorResponse construye una respuesta de error
func BuildErrorResponse(error string, message string) response.ErrorResponse {
	return response.ErrorResponse{
		Success: false,
		Error:   error,
		Message: message,
	}
}
