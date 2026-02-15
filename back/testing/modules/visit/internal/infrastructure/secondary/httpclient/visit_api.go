package httpclient

import (
	"context"
	"encoding/json"
	"fmt"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/shared/client"
)

// APIErrorResponse representa la estructura de error de la API
type APIErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

// extractAPIError extrae el mensaje de error del body de la respuesta
func extractAPIError(body []byte, statusCode int) error {
	if len(body) == 0 {
		return fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, statusCode)
	}

	// Intentar parsear como estructura de error estándar
	var errResp APIErrorResponse
	if err := json.Unmarshal(body, &errResp); err == nil {
		if errResp.Error != "" {
			return fmt.Errorf("%w: HTTP %d - %s", domain.ErrInvalidResponse, statusCode, errResp.Error)
		}
		if errResp.Message != "" {
			return fmt.Errorf("%w: HTTP %d - %s", domain.ErrInvalidResponse, statusCode, errResp.Message)
		}
	}

	// Intentar como JSON genérico
	var rawJSON map[string]interface{}
	if err := json.Unmarshal(body, &rawJSON); err == nil {
		if errMsg, ok := rawJSON["error"].(string); ok {
			return fmt.Errorf("%w: HTTP %d - %s", domain.ErrInvalidResponse, statusCode, errMsg)
		}
		if errMsg, ok := rawJSON["message"].(string); ok {
			return fmt.Errorf("%w: HTTP %d - %s", domain.ErrInvalidResponse, statusCode, errMsg)
		}
	}

	return fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, statusCode)
}

// VisitAPI implementa VisitAPIPort usando el cliente HTTP
type VisitAPI struct {
	client *client.Client
}

// New crea una nueva instancia de VisitAPI
func New(httpClient *client.Client) *VisitAPI {
	return &VisitAPI{
		client: httpClient,
	}
}

// CreateVisitor crea un nuevo visitante
func (v *VisitAPI) CreateVisitor(ctx context.Context, visitor domain.Visitor) (*domain.Visitor, error) {
	request := map[string]any{
		"dni":       visitor.DNI,
		"full_name": visitor.FullName,
		"phone":     visitor.Phone,
	}
	if visitor.Email != "" {
		request["email"] = visitor.Email
	}

	resp, err := v.client.POST("/horizontal-properties/visits/visitors", request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 201 && resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	var response struct {
		Success bool `json:"success"`
		Data    struct {
			ID       uint   `json:"id"`
			DNI      string `json:"dni"`
			FullName string `json:"full_name"`
			Phone    string `json:"phone"`
			Email    string `json:"email"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	return &domain.Visitor{
		ID:       response.Data.ID,
		DNI:      response.Data.DNI,
		FullName: response.Data.FullName,
		Phone:    response.Data.Phone,
		Email:    response.Data.Email,
	}, nil
}

// SearchVisitorByDNI busca un visitante por DNI
func (v *VisitAPI) SearchVisitorByDNI(ctx context.Context, dni string) (*domain.Visitor, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/search-visitor?dni=%s", dni)
	resp, err := v.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() == 404 {
		return nil, domain.ErrVisitorNotFound
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	var response struct {
		Success bool `json:"success"`
		Data    struct {
			ID       uint   `json:"id"`
			DNI      string `json:"dni"`
			FullName string `json:"full_name"`
			Phone    string `json:"phone"`
			Email    string `json:"email"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	return &domain.Visitor{
		ID:       response.Data.ID,
		DNI:      response.Data.DNI,
		FullName: response.Data.FullName,
		Phone:    response.Data.Phone,
		Email:    response.Data.Email,
	}, nil
}

// CreateVisit crea una nueva visita
func (v *VisitAPI) CreateVisit(ctx context.Context, visit domain.Visit) (*domain.Visit, error) {
	request := map[string]any{
		"visitor_id":           visit.VisitorID,
		"property_unit_id":     visit.PropertyUnitID,
		"visit_type_id":        visit.VisitTypeID,
		"scheduled_date":       visit.ScheduledDate,
		"scheduled_start_time": visit.ScheduledStartTime,
		"purpose":              visit.Purpose,
		"number_of_visitors":   visit.NumberOfVisitors,
		"notify_resident":      visit.NotifyResident,
		"notify_security":      visit.NotifySecurity,
	}

	resp, err := v.client.POST("/horizontal-properties/visits", request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 201 && resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	var response struct {
		Success bool `json:"success"`
		Data    struct {
			ID     uint   `json:"id"`
			QRCode string `json:"qr_code"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	visit.ID = response.Data.ID
	visit.QRCode = response.Data.QRCode

	return &visit, nil
}

// UpdateVisit actualiza una visita existente
// Solo envía campos que tienen valores (el backend acepta actualizaciones parciales)
func (v *VisitAPI) UpdateVisit(ctx context.Context, visitID uint, visit domain.Visit) (*domain.Visit, error) {
	request := make(map[string]any)

	// Solo agregar campos que tienen valores
	if visit.PropertyUnitID > 0 {
		request["property_unit_id"] = visit.PropertyUnitID
	}
	if visit.VisitTypeID > 0 {
		request["visit_type_id"] = visit.VisitTypeID
	}
	if visit.ScheduledDate != "" {
		request["scheduled_date"] = visit.ScheduledDate
	}
	if visit.ScheduledStartTime != "" {
		request["scheduled_start_time"] = visit.ScheduledStartTime
	}
	if visit.Purpose != "" {
		request["purpose"] = visit.Purpose
	}
	if visit.NumberOfVisitors > 0 {
		request["number_of_visitors"] = visit.NumberOfVisitors
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d", visitID)
	resp, err := v.client.PUT(path, request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() == 404 {
		return nil, domain.ErrVisitNotFound
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	visit.ID = visitID
	return &visit, nil
}

// DeleteVisit elimina una visita
func (v *VisitAPI) DeleteVisit(ctx context.Context, visitID uint) error {
	path := fmt.Sprintf("/horizontal-properties/visits/%d", visitID)
	resp, err := v.client.DELETE(path)
	if err != nil {
		return domain.ErrAPIConnection
	}

	if resp.GetStatusCode() == 404 {
		return domain.ErrVisitNotFound
	}

	if resp.GetStatusCode() != 200 && resp.GetStatusCode() != 204 {
		return extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return nil
}

// ListVisits lista todas las visitas
func (v *VisitAPI) ListVisits(ctx context.Context) ([]domain.Visit, error) {
	resp, err := v.client.GET("/horizontal-properties/visits")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	var response struct {
		Success bool `json:"success"`
		Data    []struct {
			ID         uint   `json:"id"`
			VisitorID  uint   `json:"visitor_id"`
			Purpose    string `json:"purpose"`
			StatusName string `json:"status_name"`
			TypeName   string `json:"type_name"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	visits := make([]domain.Visit, len(response.Data))
	for i, item := range response.Data {
		visits[i] = domain.Visit{
			ID:        item.ID,
			VisitorID: item.VisitorID,
			Purpose:   item.Purpose,
		}
	}

	return visits, nil
}

// GetVisitByID obtiene una visita por ID
func (v *VisitAPI) GetVisitByID(ctx context.Context, visitID uint) (*domain.Visit, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/%d", visitID)
	resp, err := v.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() == 404 {
		return nil, domain.ErrVisitNotFound
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return &domain.Visit{ID: visitID}, nil
}

// GetVisitByQR obtiene una visita por código QR
func (v *VisitAPI) GetVisitByQR(ctx context.Context, qrCode string) (*domain.Visit, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/qr/%s", qrCode)
	resp, err := v.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() == 404 {
		return nil, domain.ErrVisitNotFound
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return &domain.Visit{QRCode: qrCode}, nil
}

// RegisterEntry registra la entrada de una visita
func (v *VisitAPI) RegisterEntry(ctx context.Context, visitID uint, request domain.EntryRequest) error {
	req := map[string]string{
		"gate":   request.Gate,
		"method": request.Method,
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/register-entry", visitID)
	resp, err := v.client.POST(path, req)
	if err != nil {
		return domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 200 {
		return extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return nil
}

// RegisterExit registra la salida de una visita
func (v *VisitAPI) RegisterExit(ctx context.Context, visitID uint, request domain.ExitRequest) error {
	req := map[string]string{
		"gate": request.Gate,
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/register-exit", visitID)
	resp, err := v.client.POST(path, req)
	if err != nil {
		return domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 200 {
		return extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return nil
}

// ListCompanions lista los acompañantes de una visita
func (v *VisitAPI) ListCompanions(ctx context.Context, visitID uint) ([]domain.Companion, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/%d/companions", visitID)
	resp, err := v.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return []domain.Companion{}, nil
}

// CreateCompanion crea un acompañante
func (v *VisitAPI) CreateCompanion(ctx context.Context, visitID uint, companion domain.Companion) (*domain.Companion, error) {
	request := map[string]any{
		"companion_dni":  companion.DNI,
		"companion_name": companion.FullName,
	}
	if companion.Phone != "" {
		request["companion_phone"] = companion.Phone
	}
	if companion.Relationship != "" {
		request["relationship"] = companion.Relationship
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/companions", visitID)
	resp, err := v.client.POST(path, request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 201 && resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	companion.VisitID = visitID
	return &companion, nil
}

// DeleteCompanion elimina un acompañante de una visita
func (v *VisitAPI) DeleteCompanion(ctx context.Context, visitID uint, companionID uint) error {
	path := fmt.Sprintf("/horizontal-properties/visits/%d/companions/%d", visitID, companionID)
	resp, err := v.client.DELETE(path)
	if err != nil {
		return domain.ErrAPIConnection
	}

	if resp.GetStatusCode() == 404 {
		return domain.ErrCompanionNotFound
	}

	if resp.GetStatusCode() != 200 && resp.GetStatusCode() != 204 {
		return extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	return nil
}

// RegisterAssets registra activos de una visita
func (v *VisitAPI) RegisterAssets(ctx context.Context, visitID uint, asset domain.Asset) (*domain.Asset, error) {
	// El backend espera un array de assets
	assetItem := map[string]any{
		"asset_name": asset.Description,
	}
	if asset.Serial != "" {
		assetItem["asset_serial"] = asset.Serial
	}
	if asset.Brand != "" {
		assetItem["asset_brand"] = asset.Brand
	}

	request := map[string]any{
		"assets": []map[string]any{assetItem},
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/assets", visitID)
	resp, err := v.client.POST(path, request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 201 && resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	asset.VisitID = visitID
	return &asset, nil
}

// ListVisitTypes lista los tipos de visita
func (v *VisitAPI) ListVisitTypes(ctx context.Context) ([]domain.VisitType, error) {
	resp, err := v.client.GET("/horizontal-properties/visits/types")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	var response struct {
		Success bool `json:"success"`
		Data    []struct {
			ID   uint   `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	types := make([]domain.VisitType, len(response.Data))
	for i, t := range response.Data {
		types[i] = domain.VisitType{
			ID:   t.ID,
			Name: t.Name,
		}
	}

	return types, nil
}

// ListVisitStatuses lista los estados de visita
func (v *VisitAPI) ListVisitStatuses(ctx context.Context) ([]domain.VisitStatus, error) {
	resp, err := v.client.GET("/horizontal-properties/visits/statuses")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.GetStatusCode() != 200 {
		return nil, extractAPIError(resp.GetBody(), resp.GetStatusCode())
	}

	var response struct {
		Success bool `json:"success"`
		Data    []struct {
			ID   uint   `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	statuses := make([]domain.VisitStatus, len(response.Data))
	for i, s := range response.Data {
		statuses[i] = domain.VisitStatus{
			ID:   s.ID,
			Name: s.Name,
		}
	}

	return statuses, nil
}
