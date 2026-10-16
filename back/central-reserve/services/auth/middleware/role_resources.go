package middleware

import (
	"context"
	"sync"
	"time"

	"central_reserve/shared/db"
)

// roleResourceLookup consulta los recursos (con sus acciones) de un rol que están activos en el
// negocio (role_permissions → permission → resource/action ∩ business_resource_configured
// activo), igual que /auth/roles-permissions. Cachea unos segundos para no consultar siempre.
type roleResourceLookup struct {
	database db.IDatabase
	ttl      time.Duration

	mu    sync.Mutex
	cache map[[2]uint]cachedResources
}

type cachedResources struct {
	actions map[string][]string
	expires time.Time
}

// NewRoleResourceLookup crea la consulta de recursos por rol contra la BD.
func NewRoleResourceLookup(database db.IDatabase) IRoleResourceLookup {
	return &roleResourceLookup{database: database, ttl: 30 * time.Second, cache: map[[2]uint]cachedResources{}}
}

func (l *roleResourceLookup) GetRoleResourceActions(ctx context.Context, roleID, businessID uint) (map[string][]string, error) {
	key := [2]uint{roleID, businessID}
	l.mu.Lock()
	if entry, ok := l.cache[key]; ok && time.Now().Before(entry.expires) {
		l.mu.Unlock()
		return entry.actions, nil
	}
	l.mu.Unlock()

	var rows []struct {
		Resource string
		Action   string
	}
	err := l.database.Conn(ctx).
		Table("role_permissions rp").
		Select("DISTINCT r.name AS resource, a.name AS action").
		Joins("JOIN permission p ON p.id = rp.permission_id AND p.deleted_at IS NULL").
		Joins("JOIN resource r ON r.id = p.resource_id AND r.deleted_at IS NULL").
		Joins("JOIN action a ON a.id = p.action_id AND a.deleted_at IS NULL").
		Joins("JOIN business_resource_configured brc ON brc.resource_id = r.id AND brc.business_id = ? AND brc.active = true AND brc.deleted_at IS NULL", businessID).
		Where("rp.role_id = ?", roleID).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	actions := make(map[string][]string, len(rows))
	for _, row := range rows {
		actions[row.Resource] = append(actions[row.Resource], row.Action)
	}

	l.mu.Lock()
	l.cache[key] = cachedResources{actions: actions, expires: time.Now().Add(l.ttl)}
	l.mu.Unlock()
	return actions, nil
}
