package mapper

import (
	"regexp"
	"strings"
	"unicode"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

// slugify convierte un string a formato slug (URL-friendly)
// Ejemplo: "Conjunto Los Pinos" → "conjunto-los-pinos"
func slugify(s string) string {
	// Convertir a minúsculas
	s = strings.ToLower(s)

	// Remover acentos y diacríticos
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	s, _, _ = transform.String(t, s)

	// Reemplazar espacios y caracteres especiales por guiones
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	s = reg.ReplaceAllString(s, "-")

	// Remover guiones al inicio y final
	s = strings.Trim(s, "-")

	// Limitar longitud a 50 caracteres
	if len(s) > 50 {
		s = s[:50]
		s = strings.TrimRight(s, "-")
	}

	return s
}

// MapCreateRequestToDTO mapea request de creación a DTO de dominio
func MapCreateRequestToDTO(req *request.CreateHorizontalPropertyRequest) domain.CreateHorizontalPropertyDTO {
	// Preparar opciones de setup si algún campo está activado
	var setupOptions *domain.HorizontalPropertySetupOptions
	if req.CreateUnits || req.CreateRequiredCommittees {
		setupOptions = &domain.HorizontalPropertySetupOptions{
			CreateUnits:              req.CreateUnits,
			UnitPrefix:               req.UnitPrefix,
			UnitType:                 req.UnitType,
			UnitsPerFloor:            req.UnitsPerFloor,
			StartUnitNumber:          req.StartUnitNumber,
			CreateRequiredCommittees: req.CreateRequiredCommittees,
		}
	}

	// Aplicar valores por defecto
	timezone := req.Timezone
	if timezone == "" {
		timezone = "America/Bogota" // Default para Colombia
	}

	// Generar código automáticamente si está vacío
	code := req.Code
	if code == "" {
		code = slugify(req.Name)
	}

	// Generar custom_domain automáticamente si está vacío
	customDomain := req.CustomDomain
	if customDomain == "" {
		customDomain = slugify(req.Name)
	}

	return domain.CreateHorizontalPropertyDTO{
		Name:             req.Name,
		Code:             code,
		ParentBusinessID: req.ParentBusinessID,
		Timezone:         timezone,
		Address:          req.Address,
		Description:      req.Description,
		LogoFile:         req.LogoFile,
		NavbarImageFile:  req.NavbarImageFile,
		PrimaryColor:     req.PrimaryColor,
		SecondaryColor:   req.SecondaryColor,
		TertiaryColor:    req.TertiaryColor,
		QuaternaryColor:  req.QuaternaryColor,
		CustomDomain:     customDomain,
		TotalUnits:       req.TotalUnits,
		TotalFloors:      req.TotalFloors,
		HasElevator:      req.HasElevator,
		HasParking:       req.HasParking,
		HasPool:          req.HasPool,
		HasGym:           req.HasGym,
		HasSocialArea:    req.HasSocialArea,
		SetupOptions:     setupOptions,
	}
}

// MapUpdateRequestToDTO mapea request de actualización a DTO de dominio
func MapUpdateRequestToDTO(req *request.UpdateHorizontalPropertyRequest) domain.UpdateHorizontalPropertyDTO {
	return domain.UpdateHorizontalPropertyDTO{
		Name:             req.Name,
		Code:             req.Code,
		ParentBusinessID: req.ParentBusinessID,
		Timezone:         req.Timezone,
		Address:          req.Address,
		Description:      req.Description,
		LogoFile:         req.LogoFile,
		NavbarImageFile:  req.NavbarImageFile,
		PrimaryColor:     req.PrimaryColor,
		SecondaryColor:   req.SecondaryColor,
		TertiaryColor:    req.TertiaryColor,
		QuaternaryColor:  req.QuaternaryColor,
		CustomDomain:     req.CustomDomain,
		TotalUnits:       req.TotalUnits,
		TotalFloors:      req.TotalFloors,
		HasElevator:      req.HasElevator,
		HasParking:       req.HasParking,
		HasPool:          req.HasPool,
		HasGym:           req.HasGym,
		HasSocialArea:    req.HasSocialArea,
		IsActive:         req.IsActive,
	}
}

// MapListRequestToDTO mapea request de lista a DTO de filtros
func MapListRequestToDTO(req *request.ListHorizontalPropertiesRequest) domain.HorizontalPropertyFiltersDTO {
	return domain.HorizontalPropertyFiltersDTO{
		Name:     req.Name,
		Code:     req.Code,
		IsActive: req.IsActive,
		Page:     req.Page,
		PageSize: req.PageSize,
		OrderBy:  req.OrderBy,
		OrderDir: req.OrderDir,
	}
}

// MapDTOToResponse mapea DTO de dominio a response
func MapDTOToResponse(dto *domain.HorizontalPropertyDTO) *response.HorizontalPropertyResponse {
	// Inicializar slices vacíos (nunca nil)
	propertyUnits := make([]response.PropertyUnitResponse, 0)
	committees := make([]response.CommitteeResponse, 0)

	// Mapear unidades de propiedad
	if len(dto.PropertyUnits) > 0 {
		propertyUnits = make([]response.PropertyUnitResponse, len(dto.PropertyUnits))
		for i, unit := range dto.PropertyUnits {
			propertyUnits[i] = response.PropertyUnitResponse{
				ID:          unit.ID,
				Number:      unit.Number,
				Floor:       unit.Floor,
				Block:       unit.Block,
				UnitType:    unit.UnitType,
				Area:        unit.Area,
				Bedrooms:    unit.Bedrooms,
				Bathrooms:   unit.Bathrooms,
				Description: unit.Description,
				IsActive:    unit.IsActive,
			}
		}
	}

	// Mapear comités
	if len(dto.Committees) > 0 {
		committees = make([]response.CommitteeResponse, len(dto.Committees))
		for i, committee := range dto.Committees {
			committees[i] = response.CommitteeResponse{
				ID:              committee.ID,
				CommitteeTypeID: committee.CommitteeTypeID,
				TypeName:        committee.TypeName,
				TypeCode:        committee.TypeCode,
				Name:            committee.Name,
				StartDate:       committee.StartDate,
				EndDate:         committee.EndDate,
				IsActive:        committee.IsActive,
				Notes:           committee.Notes,
			}
		}
	}

	return &response.HorizontalPropertyResponse{
		ID:               dto.ID,
		Name:             dto.Name,
		Code:             dto.Code,
		BusinessTypeID:   dto.BusinessTypeID,
		BusinessTypeName: dto.BusinessTypeName,
		ParentBusinessID: dto.ParentBusinessID,
		Timezone:         dto.Timezone,
		Address:          dto.Address,
		Description:      dto.Description,
		LogoURL:          dto.LogoURL,
		PrimaryColor:     dto.PrimaryColor,
		SecondaryColor:   dto.SecondaryColor,
		TertiaryColor:    dto.TertiaryColor,
		QuaternaryColor:  dto.QuaternaryColor,
		NavbarImageURL:   dto.NavbarImageURL,
		CustomDomain:     dto.CustomDomain,
		TotalUnits:       dto.TotalUnits,
		TotalFloors:      dto.TotalFloors,
		HasElevator:      dto.HasElevator,
		HasParking:       dto.HasParking,
		HasPool:          dto.HasPool,
		HasGym:           dto.HasGym,
		HasSocialArea:    dto.HasSocialArea,
		PropertyUnits:    propertyUnits,
		Committees:       committees,
		IsActive:         dto.IsActive,
		CreatedAt:        dto.CreatedAt,
		UpdatedAt:        dto.UpdatedAt,
	}
}

// MapPaginatedDTOToResponse mapea DTO paginado a response
func MapPaginatedDTOToResponse(dto *domain.PaginatedHorizontalPropertyDTO) *response.PaginatedHorizontalPropertyResponse {
	data := make([]response.HorizontalPropertyListResponse, len(dto.Data))
	for i, item := range dto.Data {
		data[i] = response.HorizontalPropertyListResponse{
			ID:               item.ID,
			Name:             item.Name,
			Code:             item.Code,
			BusinessTypeName: item.BusinessTypeName,
			Address:          item.Address,
			TotalUnits:       item.TotalUnits,
			IsActive:         item.IsActive,
			CreatedAt:        item.CreatedAt,
		}
	}

	return &response.PaginatedHorizontalPropertyResponse{
		Data:       data,
		Total:      dto.Total,
		Page:       dto.Page,
		PageSize:   dto.PageSize,
		TotalPages: dto.TotalPages,
	}
}
