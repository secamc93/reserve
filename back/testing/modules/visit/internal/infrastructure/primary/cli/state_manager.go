package cli

// StateManager gestiona el estado de IDs reutilizables durante la sesión
type StateManager struct {
	businessID         uint
	lastVisitorID      uint
	lastVisitID        uint
	lastPropertyUnitID uint
}

// NewStateManager crea una nueva instancia de StateManager
func NewStateManager() *StateManager {
	return &StateManager{}
}

func (sm *StateManager) SetBusinessID(id uint) {
	sm.businessID = id
}

func (sm *StateManager) GetBusinessID() uint {
	return sm.businessID
}

func (sm *StateManager) SetLastVisitorID(id uint) {
	sm.lastVisitorID = id
}

func (sm *StateManager) GetLastVisitorID() uint {
	return sm.lastVisitorID
}

func (sm *StateManager) SetLastVisitID(id uint) {
	sm.lastVisitID = id
}

func (sm *StateManager) GetLastVisitID() uint {
	return sm.lastVisitID
}

func (sm *StateManager) SetLastPropertyUnitID(id uint) {
	sm.lastPropertyUnitID = id
}

func (sm *StateManager) GetLastPropertyUnitID() uint {
	return sm.lastPropertyUnitID
}
