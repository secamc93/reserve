package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func excelBytes(t *testing.T, rows [][]string) []byte {
	t.Helper()
	f := excelize.NewFile()
	sheet := f.GetSheetName(0)
	for i, row := range rows {
		for j, v := range row {
			c, _ := excelize.CoordinatesToCellName(j+1, i+1)
			_ = f.SetCellStr(sheet, c, v)
		}
	}
	buf, err := f.WriteToBuffer()
	if err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

// postImport envía el Excel como super admin (business 0 en el token) con los campos dados.
func postImport(t *testing.T, repo *mocks.MockPropertyUnitRepository, query string, fields map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	body := &bytes.Buffer{}
	w := multipart.NewWriter(body)
	for k, v := range fields {
		_ = w.WriteField(k, v)
	}
	part, _ := w.CreateFormFile("file", "unidades.xlsx")
	_, _ = part.Write(excelBytes(t, [][]string{{"Número", "Coeficiente"}, {"126", "0,5"}, {"127", ""}}))
	_ = w.Close()

	h := handlers.New(app.New(repo, mocks.NewMockLogger()), mocks.NewMockLogger())
	r := gin.New()
	r.POST("/import", func(c *gin.Context) {
		c.Set("business_id", uint(0))
		c.Set("auth_info", &middleware.AuthInfo{UserID: 1, BusinessID: 0})
		h.ImportPropertyUnitsExcel(c)
	})
	req := httptest.NewRequest(http.MethodPost, "/import"+query, body)
	req.Header.Set("Content-Type", w.FormDataContentType())
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

func TestImportPropertyUnitsHandler_DryRun(t *testing.T) {
	created := 0
	var askedBusiness uint
	repo := &mocks.MockPropertyUnitRepository{
		ListExistingUnitsFunc: func(ctx context.Context, businessID uint) ([]domain.ExistingUnitDTO, error) {
			askedBusiness = businessID
			return nil, nil
		},
		CreatePropertyUnitFunc: func(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
			created++
			return unit, nil
		},
	}

	// business_id por query (super admin) y dry_run en el formulario.
	rec := postImport(t, repo, "?business_id=7", map[string]string{"dry_run": "true"})
	if rec.Code != http.StatusOK {
		t.Fatalf("esperaba 200, obtuvo %d: %s", rec.Code, rec.Body.String())
	}
	var body struct {
		Data struct {
			Ready  int `json:"ready"`
			Errors int `json:"errors"`
			Rows   []struct {
				Row    int    `json:"row"`
				Status string `json:"status"`
			} `json:"rows"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Data.Ready != 1 || body.Data.Errors != 1 || len(body.Data.Rows) != 2 || body.Data.Rows[1].Status != "empty_coefficient" {
		t.Fatalf("vista previa inesperada: %s", rec.Body.String())
	}
	if created != 0 {
		t.Fatal("dry_run no debe crear unidades")
	}
	if askedBusiness != 7 {
		t.Fatalf("el super admin debía usar el business_id de la query (7), usó %d", askedBusiness)
	}

	// Sin dry_run sí importa.
	rec = postImport(t, repo, "?business_id=7", nil)
	if rec.Code != http.StatusOK || created != 1 {
		t.Fatalf("esperaba importar 1 unidad; code=%d created=%d body=%s", rec.Code, created, rec.Body.String())
	}
}
