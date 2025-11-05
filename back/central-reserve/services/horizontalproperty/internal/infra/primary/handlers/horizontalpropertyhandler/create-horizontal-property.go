package horizontalpropertyhandler

import (
	"net/http"
	"strings"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// contains helper para buscar substring
func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}

// CreateHorizontalProperty godoc
//
//	@Summary		Crear una nueva propiedad horizontal
//	@Description	Crea una nueva propiedad horizontal. IMPORTANTE: Los datos se envían como FormData (multipart/form-data), NO como JSON, porque incluye carga de archivos de imagen
//	@Tags			Propiedades Horizontales
//	@Accept			multipart/form-data
//	@Produce		json
//	@Security		BearerAuth
//	@Param			name						formData	string	true	"Nombre"			default("Conjunto Residencial Los Pinos")
//	@Param			code						formData	string	false	"Código único (opcional, se genera del nombre)"		default("conjunto-residencial-los-pinos")
//	@Param			timezone					formData	string	false	"Zona horaria (opcional, default: America/Bogota)"		default("America/Bogota")
//	@Param			address						formData	string	true	"Dirección"			default("Carrera 15 #45-67")
//	@Param			description					formData	string	false	"Descripción"		default("Conjunto residencial familiar")
//	@Param			total_units					formData	int		false	"Total de unidades (opcional, default: 0)"	default(0)
//	@Param			total_floors				formData	int		false	"Total de pisos (opcional)"	default(0)
//	@Param			has_elevator				formData	bool	false	"Tiene ascensor"	default(true)
//	@Param			has_parking					formData	bool	false	"Tiene parqueadero"	default(true)
//	@Param			has_pool					formData	bool	false	"Tiene piscina"		default(true)
//	@Param			has_gym						formData	bool	false	"Tiene gimnasio"	default(true)
//	@Param			has_social_area				formData	bool	false	"Tiene área social"	default(true)
//	@Param			logo_file					formData	file	false	"Logo (PNG/JPG, max 10MB)"
//	@Param			navbar_image_file			formData	file	false	"Imagen navbar (PNG/JPG, max 10MB)"
//	@Param			primary_color				formData	string	false	"Color primario"					default("#1f2937")
//	@Param			secondary_color				formData	string	false	"Color secundario"					default("#3b82f6")
//	@Param			tertiary_color				formData	string	false	"Color terciario"					default("#10b981")
//	@Param			quaternary_color			formData	string	false	"Color cuaternario"					default("#fbbf24")
//	@Param			custom_domain				formData	string	false	"Dominio personalizado"				default("lospinos.com")
//	@Param			create_units				formData	bool	false	"Crear unidades automáticamente"	default(true)
//	@Param			unit_prefix					formData	string	false	"Prefijo unidades"					default("Apto")
//	@Param			unit_type					formData	string	false	"Tipo unidad"						default("apartment")
//	@Param			units_per_floor				formData	int		false	"Unidades por piso"					default(12)
//	@Param			start_unit_number			formData	int		false	"Número inicial"					default(101)
//	@Param			create_required_committees	formData	bool	false	"Crear comités requeridos"			default(true)
//	@Success		201							{object}	response.HorizontalPropertySuccessResponse
//	@Failure		400							{object}	object
//	@Failure		409							{object}	object
//	@Failure		500							{object}	object
//	@Router			/horizontal-properties [post]
func (h *HorizontalPropertyHandler) CreateHorizontalProperty(c *gin.Context) {
	var req request.CreateHorizontalPropertyRequest

	// Bind multipart/form-data request (incluye archivos)
	if err := c.ShouldBind(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error binding form-data request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de entrada inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Validate request
	validate := validator.New()
	if err := validate.Struct(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validating request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Errores de validación",
			Error:   err.Error(),
		})
		return
	}

	// Map request to domain DTO
	dto := mapper.MapCreateRequestToDTO(&req)

	// Call use case
	result, err := h.horizontalPropertyUseCase.CreateHorizontalProperty(c.Request.Context(), dto)
	if err != nil {
		h.logger.Error().Err(err).Str("name", req.Name).Str("code", dto.Code).Msg("Error creating horizontal property")

		// Handle specific domain errors
		errMsg := err.Error()
		switch {
		case contains(errMsg, "duplicate key") && contains(errMsg, "uni_business_code"):
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El código '" + dto.Code + "' ya está en uso",
				Error:   "Ya existe una propiedad horizontal con este código. Por favor, use un nombre diferente o especifique un código personalizado.",
			})
		case contains(errMsg, "duplicate key") && contains(errMsg, "uni_business_custom_domain"):
			domainValue := dto.Code // Usar el código generado como referencia
			if dto.CustomDomain != "" {
				domainValue = dto.CustomDomain
			}
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El dominio personalizado ya está en uso",
				Error:   "El dominio '" + domainValue + "' ya está registrado. Por favor, use un nombre diferente.",
			})
		case contains(errMsg, "ya existe una propiedad horizontal con este código"):
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El código de la propiedad horizontal ya existe",
				Error:   err.Error(),
			})
		case contains(errMsg, "el dominio personalizado ya está en uso"):
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El dominio personalizado ya está en uso",
				Error:   err.Error(),
			})
		case errMsg == "tipo de negocio no encontrado":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "Tipo de negocio no válido",
				Error:   err.Error(),
			})
		case errMsg == "el tipo de negocio debe ser de propiedad horizontal":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El tipo de negocio debe ser de propiedad horizontal",
				Error:   err.Error(),
			})
		case errMsg == "el negocio padre especificado no existe":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El negocio padre especificado no existe",
				Error:   err.Error(),
			})
		case errMsg == "el ID del negocio padre no es válido":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El ID del negocio padre no es válido",
				Error:   err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{
				Success: false,
				Message: "Error interno del servidor",
				Error:   err.Error(),
			})
		}
		return
	}

	// Map domain DTO to response
	responseData := mapper.MapDTOToResponse(result)

	// Return success response
	c.JSON(http.StatusCreated, response.HorizontalPropertySuccessResponse{
		Success: true,
		Message: "Propiedad horizontal creada exitosamente",
		Data:    *responseData,
	})

	h.logger.Info().
		Uint("id", result.ID).
		Str("name", result.Name).
		Str("code", result.Code).
		Msg("Propiedad horizontal creada exitosamente")
}
