package domain

import "strings"

// Estados de una visita tal como los ve la portería.
const (
	VisitStateInside    = "inside"
	VisitStateExpected  = "expected"
	VisitStateLeft      = "left"
	VisitStateCancelled = "cancelled"
)

// VisitStateGroups devuelve los códigos de visit_statuses de cada estado de portería.
var VisitStateGroups = map[string][]string{
	VisitStateInside:    {"in_progress"},
	VisitStateExpected:  {"pending", "authorized"},
	VisitStateLeft:      {"completed"},
	VisitStateCancelled: {"cancelled", "rejected", "expired"},
}

// NormalizeVisitState devuelve el estado válido o "" (todos) si no se reconoce.
func NormalizeVisitState(state string) string {
	s := strings.ToLower(strings.TrimSpace(state))
	if _, ok := VisitStateGroups[s]; ok {
		return s
	}
	return ""
}
