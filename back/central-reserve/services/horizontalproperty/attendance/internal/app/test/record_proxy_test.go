package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/attendance/internal/app"
	"central_reserve/services/horizontalproperty/attendance/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
)

const (
	propiedad = uint(1)
	lista     = uint(50)
	registro  = uint(900)
	unidad    = uint(126)
)

// repoConRegistro arma un repo con un registro de la lista `lista` (propiedad `propiedad`) que
// simula la tabla: guarda el apoderado asignado y los creados/editados/borrados.
type estado struct {
	record   domain.AttendanceRecord
	proxies  map[uint]domain.Proxy
	nextID   uint
	borrados []uint
	updates  int
}

func repoConRegistro(proxyID *uint) (*mocks.AttendanceRepositoryMock, *estado) {
	st := &estado{
		record:  domain.AttendanceRecord{ID: registro, AttendanceListID: lista, PropertyUnitID: unidad, ProxyID: proxyID},
		proxies: map[uint]domain.Proxy{},
		nextID:  10,
	}
	if proxyID != nil {
		st.proxies[*proxyID] = domain.Proxy{ID: *proxyID, BusinessID: propiedad, PropertyUnitID: unidad, ProxyName: "Viejo", ProxyDni: "111"}
	}
	repo := &mocks.AttendanceRepositoryMock{}
	repo.GetAttendanceRecordByIDFn = func(ctx context.Context, id uint) (*domain.AttendanceRecord, error) {
		if id != registro {
			return nil, errors.New("registro de asistencia no encontrado")
		}
		r := st.record
		return &r, nil
	}
	repo.GetAttendanceListBusinessIDFn = func(ctx context.Context, l uint) (uint, error) {
		if l == lista {
			return propiedad, nil
		}
		return 0, nil
	}
	repo.GetProxyByIDFn = func(ctx context.Context, id uint) (*domain.Proxy, error) {
		p := st.proxies[id]
		return &p, nil
	}
	repo.CreateProxyFn = func(ctx context.Context, p domain.Proxy) (*domain.Proxy, error) {
		p.ID = st.nextID
		st.nextID++
		st.proxies[p.ID] = p
		return &p, nil
	}
	repo.UpdateProxyFn = func(ctx context.Context, id uint, p domain.Proxy) (*domain.Proxy, error) {
		st.updates++
		st.proxies[id] = p
		return &p, nil
	}
	repo.DeleteProxyFn = func(ctx context.Context, id uint) error {
		st.borrados = append(st.borrados, id)
		return nil
	}
	repo.SetAttendanceRecordProxyFn = func(ctx context.Context, id uint, pid *uint) (*domain.AttendanceRecord, error) {
		st.record.ProxyID = pid
		st.record.AttendedAsOwner = false
		st.record.AttendedAsProxy = pid != nil
		r := st.record
		return &r, nil
	}
	repo.UpdateAttendanceRecordsByPropertyUnitFn = func(ctx context.Context, pu uint, pid *uint) error {
		panic("el apoderado de un registro no debe copiarse a las demás listas de la unidad")
	}
	return repo, st
}

func TestAssignRecordProxy_CreaApoderadoYMarcaPresenteComoApoderado(t *testing.T) {
	repo, st := repoConRegistro(nil)
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())

	dto, err := uc.AssignRecordProxy(context.Background(), propiedad, registro, "  María   Gómez ", "52123456")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if !dto.AttendedAsProxy || dto.AttendedAsOwner || dto.ProxyID == nil || dto.ProxyName != "María Gómez" {
		t.Fatalf("registro inesperado: %+v", dto)
	}
	p := st.proxies[*dto.ProxyID]
	if p.BusinessID != propiedad || p.PropertyUnitID != unidad || p.ProxyDni != "52123456" || p.ProxyName != "María Gómez" {
		t.Fatalf("apoderado creado con datos inesperados: %+v", p)
	}
}

func TestAssignRecordProxy_SinDocumentoGeneraIdentificador(t *testing.T) {
	repo, st := repoConRegistro(nil)
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	dto, err := uc.AssignRecordProxy(context.Background(), 0, registro, "Pedro", "")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if st.proxies[*dto.ProxyID].ProxyDni == "" {
		t.Fatal("el documento del apoderado es obligatorio en la tabla: debe generarse uno")
	}
}

func TestAssignRecordProxy_EditaElApoderadoExistente(t *testing.T) {
	existente := uint(7)
	repo, st := repoConRegistro(&existente)
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	dto, err := uc.AssignRecordProxy(context.Background(), propiedad, registro, "Nuevo Nombre", "")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if st.updates != 1 || len(st.proxies) != 1 || *dto.ProxyID != existente {
		t.Fatalf("esperaba editar el apoderado %d sin crear otro: %+v", existente, st.proxies)
	}
	if p := st.proxies[existente]; p.ProxyName != "Nuevo Nombre" || p.ProxyDni != "111" {
		t.Fatalf("debe cambiar el nombre y conservar el documento si no se envía: %+v", p)
	}
}

func TestAssignRecordProxy_OtraPropiedadNoEncuentraElRegistro(t *testing.T) {
	repo, st := repoConRegistro(nil)
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	_, err := uc.AssignRecordProxy(context.Background(), propiedad+1, registro, "Intruso", "")
	if !errors.Is(err, domain.ErrAttendanceRecordNotFound) {
		t.Fatalf("esperaba ErrAttendanceRecordNotFound, obtuve %v", err)
	}
	if len(st.proxies) != 0 || st.record.ProxyID != nil {
		t.Fatal("no debe crear ni asignar apoderados en registros de otra propiedad")
	}
	if _, err := uc.RemoveRecordProxy(context.Background(), propiedad+1, registro); !errors.Is(err, domain.ErrAttendanceRecordNotFound) {
		t.Fatalf("quitar: esperaba ErrAttendanceRecordNotFound, obtuve %v", err)
	}
}

func TestAssignRecordProxy_NombreObligatorio(t *testing.T) {
	repo, _ := repoConRegistro(nil)
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	if _, err := uc.AssignRecordProxy(context.Background(), propiedad, registro, "   ", "1"); !errors.Is(err, domain.ErrProxyNameRequired) {
		t.Fatalf("esperaba ErrProxyNameRequired, obtuve %v", err)
	}
}

func TestRemoveRecordProxy_DesvinculaYBorraElApoderado(t *testing.T) {
	existente := uint(7)
	repo, st := repoConRegistro(&existente)
	st.record.AttendedAsProxy = true
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	dto, err := uc.RemoveRecordProxy(context.Background(), propiedad, registro)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if dto.ProxyID != nil || dto.AttendedAsProxy || dto.AttendedAsOwner {
		t.Fatalf("la unidad debe quedar sin apoderado ni asistencia: %+v", dto)
	}
	if len(st.borrados) != 1 || st.borrados[0] != existente {
		t.Fatalf("esperaba borrar el apoderado %d, borrados=%v", existente, st.borrados)
	}
}

func TestMarkAttendanceSimple_ConApoderadoMarcaComoApoderado(t *testing.T) {
	existente := uint(7)
	repo, _ := repoConRegistro(&existente)
	var owner, proxy bool
	repo.UpdateAttendanceRecordSimpleFn = func(ctx context.Context, id uint, o, p bool) (*domain.AttendanceRecord, error) {
		owner, proxy = o, p
		return &domain.AttendanceRecord{ID: id, AttendedAsOwner: o, AttendedAsProxy: p}, nil
	}
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	if _, err := uc.MarkAttendanceSimple(context.Background(), registro, true); err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if owner || !proxy {
		t.Fatalf("con apoderado debe marcar como apoderado (owner=%v proxy=%v)", owner, proxy)
	}
}

func TestMarkAttendanceSimple_SinApoderadoMarcaComoPropietario(t *testing.T) {
	repo, _ := repoConRegistro(nil)
	var owner, proxy bool
	repo.UpdateAttendanceRecordSimpleFn = func(ctx context.Context, id uint, o, p bool) (*domain.AttendanceRecord, error) {
		owner, proxy = o, p
		return &domain.AttendanceRecord{ID: id, AttendedAsOwner: o, AttendedAsProxy: p}, nil
	}
	uc := app.NewAttendanceUseCase(repo, mocks.NewMockLogger())
	if _, err := uc.MarkAttendanceSimple(context.Background(), registro, true); err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if !owner || proxy {
		t.Fatalf("sin apoderado debe marcar como propietario (owner=%v proxy=%v)", owner, proxy)
	}
}
