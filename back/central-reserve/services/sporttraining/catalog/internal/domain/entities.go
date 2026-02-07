package domain

// PlayerSkillLevel - Nivel de habilidad de jugador
type PlayerSkillLevel struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Level       int
	Color       string
	IsActive    bool
}

// CoachSpecialty - Especialidad de entrenador
type CoachSpecialty struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
	IsActive    bool
}

// TrainingSessionType - Tipo de sesión de entrenamiento
type TrainingSessionType struct {
	ID               uint
	Name             string
	Code             string
	Description      string
	DefaultDuration  int
	DefaultPrice     *float64
	AllowsIndividual bool
	AllowsGroup      bool
	Icon             string
	Color            string
	IsActive         bool
}

// BookingStatus - Estado de reserva
type BookingStatus struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Color       string
	Icon        string
	IsFinal     bool
	IsActive    bool
}

// AttendanceStatus - Estado de asistencia
type AttendanceStatus struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Color       string
	Icon        string
	IsActive    bool
}
