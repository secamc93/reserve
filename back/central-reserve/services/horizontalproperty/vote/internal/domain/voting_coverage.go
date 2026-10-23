package domain

import "time"

// colombia es la hora de Colombia (UTC-5, sin horario de verano): un día de votación es un día
// calendario de Colombia.
var colombia = time.FixedZone("COT", -5*60*60)

// VotingDate es el día calendario (AAAA-MM-DD, Colombia) de un instante.
func VotingDate(t time.Time) string {
	return t.In(colombia).Format("2006-01-02")
}

// VotingCoverage son los hechos de cobro de la propiedad de una votación en una fecha. Los trae el
// repositorio; la decisión es Covered().
type VotingCoverage struct {
	Found          bool // la votación (y su grupo) existe
	Unavailable    bool // las tablas del cobro no están migradas: no se bloquea a nadie
	PropertyExempt bool
	AdminExempt    bool
	HasMembership  bool
	HasDay         bool
}

// Covered dice si se puede votar: la propiedad (o su administradora) está exenta, tiene membresía
// vigente o compró ese día. Una votación inexistente no se bloquea aquí: la rechazan las demás
// validaciones.
func (c VotingCoverage) Covered() bool {
	return !c.Found || c.Unavailable || c.PropertyExempt || c.AdminExempt || c.HasMembership || c.HasDay
}
