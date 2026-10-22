package entities

import "time"

// colombia es la hora de Colombia (UTC-5, sin horario de verano): los días de votación se cuentan
// en el calendario local de la asamblea.
var colombia = time.FixedZone("COT", -5*60*60)

// VotingDays cuenta los días calendario (hora de Colombia) entre el inicio y el cierre, ambos
// incluidos. Siempre es al menos 1.
func VotingDays(start, end time.Time) int {
	s := start.In(colombia)
	e := end.In(colombia)
	sd := time.Date(s.Year(), s.Month(), s.Day(), 0, 0, 0, 0, time.UTC)
	ed := time.Date(e.Year(), e.Month(), e.Day(), 0, 0, 0, 0, time.UTC)
	days := int(ed.Sub(sd).Hours()/24) + 1
	if days < 1 {
		return 1
	}
	return days
}
