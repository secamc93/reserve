package secondary

import (
	"context"
	"fmt"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/shared"
)

// VisitAPIAdapter implementa VisitAPIPort usando HTTPClient
type VisitAPIAdapter struct {
	client *shared.HTTPClient
}

// NewVisitAPIAdapter crea una nueva instancia de VisitAPIAdapter
func NewVisitAPIAdapter(client *shared.HTTPClient) *VisitAPIAdapter {
	return &VisitAPIAdapter{
		client: client,
	}
}

// CreateVisitor crea un nuevo visitante
func (a *VisitAPIAdapter) CreateVisitor(ctx context.Context, visitor domain.Visitor) (*domain.Visitor, error) {
	request := map[string]any{
		"dni":       visitor.DNI,
		"full_name": visitor.FullName,
		"phone":     visitor.Phone,
	}
	if visitor.Email != "" {
		request["email"] = visitor.Email
	}

	resp, err := a.client.POST("/horizontal-properties/visits/visitors", request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 201 && resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
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
func (a *VisitAPIAdapter) SearchVisitorByDNI(ctx context.Context, dni string) (*domain.Visitor, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/search-visitor?dni=%s", dni)
	resp, err := a.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode == 404 {
		return nil, domain.ErrVisitorNotFound
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
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
func (a *VisitAPIAdapter) CreateVisit(ctx context.Context, visit domain.Visit) (*domain.Visit, error) {
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

	resp, err := a.client.POST("/horizontal-properties/visits", request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 201 && resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
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

// ListVisits lista todas las visitas
func (a *VisitAPIAdapter) ListVisits(ctx context.Context) ([]domain.Visit, error) {
	resp, err := a.client.GET("/horizontal-properties/visits")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
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
	for i, v := range response.Data {
		visits[i] = domain.Visit{
			ID:        v.ID,
			VisitorID: v.VisitorID,
			Purpose:   v.Purpose,
		}
	}

	return visits, nil
}

// GetVisitByID obtiene una visita por ID
func (a *VisitAPIAdapter) GetVisitByID(ctx context.Context, visitID uint) (*domain.Visit, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/%d", visitID)
	resp, err := a.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode == 404 {
		return nil, domain.ErrVisitNotFound
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	// Por simplicidad, devolvemos una visita básica
	return &domain.Visit{ID: visitID}, nil
}

// GetVisitByQR obtiene una visita por código QR
func (a *VisitAPIAdapter) GetVisitByQR(ctx context.Context, qrCode string) (*domain.Visit, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/qr/%s", qrCode)
	resp, err := a.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode == 404 {
		return nil, domain.ErrVisitNotFound
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	return &domain.Visit{QRCode: qrCode}, nil
}

// RegisterEntry registra la entrada de una visita
func (a *VisitAPIAdapter) RegisterEntry(ctx context.Context, visitID uint, request domain.EntryRequest) error {
	req := map[string]string{
		"gate":   request.Gate,
		"method": request.Method,
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/register-entry", visitID)
	resp, err := a.client.POST(path, req)
	if err != nil {
		return domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	return nil
}

// RegisterExit registra la salida de una visita
func (a *VisitAPIAdapter) RegisterExit(ctx context.Context, visitID uint, request domain.ExitRequest) error {
	req := map[string]string{
		"gate": request.Gate,
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/register-exit", visitID)
	resp, err := a.client.POST(path, req)
	if err != nil {
		return domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	return nil
}

// ListCompanions lista los acompañantes de una visita
func (a *VisitAPIAdapter) ListCompanions(ctx context.Context, visitID uint) ([]domain.Companion, error) {
	path := fmt.Sprintf("/horizontal-properties/visits/%d/companions", visitID)
	resp, err := a.client.GET(path)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	return []domain.Companion{}, nil
}

// CreateCompanion crea un acompañante
func (a *VisitAPIAdapter) CreateCompanion(ctx context.Context, visitID uint, companion domain.Companion) (*domain.Companion, error) {
	request := map[string]any{
		"dni":       companion.DNI,
		"full_name": companion.FullName,
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/companions", visitID)
	resp, err := a.client.POST(path, request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 201 && resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	companion.VisitID = visitID
	return &companion, nil
}

// RegisterAssets registra activos de una visita
func (a *VisitAPIAdapter) RegisterAssets(ctx context.Context, visitID uint, asset domain.Asset) (*domain.Asset, error) {
	request := map[string]any{
		"description": asset.Description,
		"quantity":    asset.Quantity,
	}

	path := fmt.Sprintf("/horizontal-properties/visits/%d/assets", visitID)
	resp, err := a.client.POST(path, request)
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 201 && resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	asset.VisitID = visitID
	return &asset, nil
}

// ListVisitTypes lista los tipos de visita
func (a *VisitAPIAdapter) ListVisitTypes(ctx context.Context) ([]domain.VisitType, error) {
	resp, err := a.client.GET("/horizontal-properties/visits/types")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
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
func (a *VisitAPIAdapter) ListVisitStatuses(ctx context.Context) ([]domain.VisitStatus, error) {
	resp, err := a.client.GET("/horizontal-properties/visits/statuses")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
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
