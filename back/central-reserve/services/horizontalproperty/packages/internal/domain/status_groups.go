package domain

import (
	"strings"
	"time"
)

// Grupos de estados de paquete que usa la portería.
const (
	PackageGroupPending   = "pending"
	PackageGroupDelivered = "delivered"
	PackageGroupClosed    = "closed"
)

// PackageOverdueAfter es la antigüedad desde la que un paquete por entregar se marca como atrasado.
const PackageOverdueAfter = 72 * time.Hour

// PackageStatusGroups devuelve los códigos de estado de cada grupo.
var PackageStatusGroups = map[string][]string{
	PackageGroupPending:   {"received", "in_storage", "notified"},
	PackageGroupDelivered: {"delivered"},
	PackageGroupClosed:    {"returned", "lost"},
}

// NormalizePackageStatusGroup devuelve el grupo válido o "" (todos) si no se reconoce.
func NormalizePackageStatusGroup(group string) string {
	g := strings.ToLower(strings.TrimSpace(group))
	if _, ok := PackageStatusGroups[g]; ok {
		return g
	}
	return ""
}

// ColombiaLocation es la zona horaria de las propiedades (UTC-5, sin horario de verano).
var ColombiaLocation = time.FixedZone("America/Bogota", -5*3600)

// StartOfDay devuelve las 00:00 del día de `t` en la hora de Colombia.
func StartOfDay(t time.Time) time.Time {
	local := t.In(ColombiaLocation)
	return time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, ColombiaLocation)
}
