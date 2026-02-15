# Handlers Layer - Mappers

Esta carpeta contiene funciones de mapeo entre requests/responses HTTP y DTOs de dominio.

**Nota**: Actualmente el mapeo está inline en los handlers.

Para mejorar la organización y reutilización, considera crear archivos:
- `request_mapper.go` - Transforma request HTTP → DTO de dominio
- `response_mapper.go` - Transforma entidad de dominio → response HTTP

Ejemplo:
```go
package mappers

func CreateParkingZoneRequestToDTO(req request.CreateParkingZoneRequest, businessID uint) domain.CreateParkingZoneDTO {
    return domain.CreateParkingZoneDTO{
        BusinessID:  businessID,
        Name:        req.Name,
        Code:        req.Code,
        Description: req.Description,
        Location:    req.Location,
    }
}
```
