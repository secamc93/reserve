package middleware

import (
	"context"
	"sync"
	"time"

	"central_reserve/shared/db"
)

// roleResourceLookup consulta los recursos de un rol que están activos en el negocio
// (role_permissions → permission → resource ∩ business_resource_configured activo), igual que
// /auth/roles-permissions. Cachea el resultado unos segundos para no consultar en cada petición.
type roleResourceLookup struct {
	database db.IDatabase
	ttl      time.Duration

	mu    sync.Mutex
	cache map[[2]uint]cachedResources
}

type cachedResources struct {
	names   []string
	expires time.Time
}

// NewRoleResourceLookup crea la consulta de recursos por rol contra la BD.
func NewRoleResourceLookup(database db.IDatabase) IRoleResourceLookup {
	return &roleResourceLookup{database: database, ttl: 30 * time.Second, cache: map[[2]uint]cachedResources{}}
}

func (l *roleResourceLookup) GetRoleResourceNames(ctx context.Context, roleID, businessID uint) ([]string, error) {
	key := [2]uint{roleID, businessID}
	l.mu.Lock()
	if entry, ok := l.cache[key]; ok && time.Now().Before(entry.expires) {
		l.mu.Unlock()
		return entry.names, nil
	}
	l.mu.Unlock()

	var names []string
	err := l.database.Conn(ctx).
		Table("role_permissions rp").
		Distinct("r.name").
		Joins("JOIN permission p ON p.id = rp.permission_id AND p.deleted_at IS NULL").
		Joins("JOIN resource r ON r.id = p.resource_id AND r.deleted_at IS NULL").
		Joins("JOIN business_resource_configured brc ON brc.resource_id = r.id AND brc.business_id = ? AND brc.active = true AND brc.deleted_at IS NULL", businessID).
		Where("rp.role_id = ?", roleID).
		Pluck("r.name", &names).Error
	if err != nil {
		return nil, err
	}

	l.mu.Lock()
	l.cache[key] = cachedResources{names: names, expires: time.Now().Add(l.ttl)}
	l.mu.Unlock()
	return names, nil
}
