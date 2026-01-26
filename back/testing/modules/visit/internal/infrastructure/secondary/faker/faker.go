package faker

import (
	"fmt"
	"math/rand"
	"time"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

// Nombres colombianos comunes
var firstNames = []string{
	"Carlos", "Andrés", "Juan", "Miguel", "José", "Luis", "David", "Santiago",
	"María", "Ana", "Laura", "Carolina", "Camila", "Valentina", "Daniela", "Sofía",
	"Pedro", "Fernando", "Ricardo", "Diego", "Alejandro", "Sebastián", "Nicolás",
	"Paula", "Andrea", "Marcela", "Diana", "Patricia", "Claudia", "Mónica",
}

var lastNames = []string{
	"García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez",
	"Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz",
	"Morales", "Reyes", "Jiménez", "Ruiz", "Álvarez", "Mendoza", "Castillo",
	"Vargas", "Romero", "Castro", "Ortiz", "Guerrero", "Medina", "Rojas", "Herrera",
}

var emailDomains = []string{
	"gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "mail.com",
}

var purposes = []string{
	"Visita familiar",
	"Entrega de paquete",
	"Reunión de trabajo",
	"Mantenimiento",
	"Visita social",
	"Entrega de documentos",
	"Servicio técnico",
	"Mudanza",
	"Reparación",
	"Instalación de servicios",
}

var assetDescriptions = []string{
	"Laptop Dell",
	"Caja de herramientas",
	"Documentos sellados",
	"Equipo de medición",
	"Paquete de Amazon",
	"Maleta de viaje",
	"Cámara fotográfica",
	"Equipo de sonido",
	"Material de construcción",
	"Electrodoméstico",
}

// Faker genera datos de prueba
type Faker struct{}

// New crea una nueva instancia de Faker
func New() *Faker {
	return &Faker{}
}

// GenerateDNI genera un número de cédula colombiana ficticio (10 dígitos)
func (f *Faker) GenerateDNI() string {
	// Cédulas colombianas: 8-10 dígitos, empezando típicamente con 1, 8, o números bajos
	prefixes := []string{"10", "11", "12", "80", "79", "52", "53", "41", "42"}
	prefix := prefixes[rand.Intn(len(prefixes))]

	// Completar con dígitos aleatorios hasta 10 dígitos
	remaining := 10 - len(prefix)
	for i := 0; i < remaining; i++ {
		prefix += fmt.Sprintf("%d", rand.Intn(10))
	}

	return prefix
}

// GenerateFullName genera un nombre completo
func (f *Faker) GenerateFullName() string {
	firstName := firstNames[rand.Intn(len(firstNames))]
	lastName1 := lastNames[rand.Intn(len(lastNames))]
	lastName2 := lastNames[rand.Intn(len(lastNames))]
	return fmt.Sprintf("%s %s %s", firstName, lastName1, lastName2)
}

// GenerateFirstName genera un nombre
func (f *Faker) GenerateFirstName() string {
	return firstNames[rand.Intn(len(firstNames))]
}

// GenerateLastName genera un apellido
func (f *Faker) GenerateLastName() string {
	return lastNames[rand.Intn(len(lastNames))]
}

// GeneratePhone genera un número de teléfono colombiano
func (f *Faker) GeneratePhone() string {
	// Celulares colombianos: 3XX XXX XXXX
	prefixes := []string{"300", "301", "302", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323", "350", "351"}
	prefix := prefixes[rand.Intn(len(prefixes))]

	number := ""
	for i := 0; i < 7; i++ {
		number += fmt.Sprintf("%d", rand.Intn(10))
	}

	return prefix + number
}

// GenerateEmail genera un email basado en el nombre
func (f *Faker) GenerateEmail(fullName string) string {
	// Simplificar nombre para email
	domain := emailDomains[rand.Intn(len(emailDomains))]
	randomNum := rand.Intn(999)

	// Usar primera letra y apellido
	firstName := firstNames[rand.Intn(len(firstNames))]
	lastName := lastNames[rand.Intn(len(lastNames))]

	return fmt.Sprintf("%s.%s%d@%s",
		toLowerCase(firstName),
		toLowerCase(lastName),
		randomNum,
		domain)
}

// GeneratePurpose genera un propósito de visita
func (f *Faker) GeneratePurpose() string {
	return purposes[rand.Intn(len(purposes))]
}

// GenerateAssetDescription genera una descripción de activo
func (f *Faker) GenerateAssetDescription() string {
	return assetDescriptions[rand.Intn(len(assetDescriptions))]
}

// GenerateAssetBrand genera una marca de activo
func (f *Faker) GenerateAssetBrand() string {
	brands := []string{"Dell", "HP", "Lenovo", "Samsung", "LG", "Sony", "Apple", "Asus", "Bosch", "Makita", "DeWalt", "Stanley"}
	return brands[rand.Intn(len(brands))]
}

// GenerateQuantity genera una cantidad aleatoria (1-5)
func (f *Faker) GenerateQuantity() int {
	return rand.Intn(5) + 1
}

// GenerateNumberOfVisitors genera número de visitantes (1-4)
func (f *Faker) GenerateNumberOfVisitors() int {
	return rand.Intn(4) + 1
}

// ScheduledDateTime contiene fecha y hora programadas consistentes
type ScheduledDateTime struct {
	Date      string
	StartTime string
}

// GenerateScheduledDateTime genera fecha y hora consistentes para una visita
// Ambos en formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) que espera el backend
func (f *Faker) GenerateScheduledDateTime() ScheduledDateTime {
	daysAhead := rand.Intn(7) + 1 // 1-7 días adelante
	hour := rand.Intn(12) + 8     // 8am - 8pm
	minute := rand.Intn(4) * 15   // 0, 15, 30, 45

	baseDate := time.Now().UTC().AddDate(0, 0, daysAhead)

	// Fecha a medianoche UTC
	scheduledDate := time.Date(baseDate.Year(), baseDate.Month(), baseDate.Day(), 0, 0, 0, 0, time.UTC)
	// Hora de inicio en el mismo día
	scheduledTime := time.Date(baseDate.Year(), baseDate.Month(), baseDate.Day(), hour, minute, 0, 0, time.UTC)

	return ScheduledDateTime{
		Date:      scheduledDate.Format("2006-01-02T15:04:05Z"),
		StartTime: scheduledTime.Format("2006-01-02T15:04:05Z"),
	}
}

// GenerateScheduledDate genera una fecha programada en formato ISO 8601
// DEPRECATED: Usar GenerateScheduledDateTime para consistencia
func (f *Faker) GenerateScheduledDate() string {
	return f.GenerateScheduledDateTime().Date
}

// GenerateScheduledTime genera una hora programada en formato UTC (Z)
// DEPRECATED: Usar GenerateScheduledDateTime para consistencia
func (f *Faker) GenerateScheduledTime() string {
	return f.GenerateScheduledDateTime().StartTime
}

// GenerateGate genera un nombre de puerta/acceso
func (f *Faker) GenerateGate() string {
	gates := []string{"Principal", "Vehicular", "Peatonal", "Parqueadero", "Torre A", "Torre B", "Acceso Norte", "Acceso Sur"}
	return gates[rand.Intn(len(gates))]
}

// GenerateEntryMethod genera un método de entrada válido
// Valores válidos según el backend: qr_code, manual, ocr, lpr
func (f *Faker) GenerateEntryMethod() string {
	methods := []string{"qr_code", "manual", "ocr", "lpr"}
	return methods[rand.Intn(len(methods))]
}

// Visitor representa datos generados de un visitante
type Visitor struct {
	DNI      string
	FullName string
	Phone    string
	Email    string
}

// GenerateVisitor genera un visitante completo
func (f *Faker) GenerateVisitor() Visitor {
	fullName := f.GenerateFullName()
	return Visitor{
		DNI:      f.GenerateDNI(),
		FullName: fullName,
		Phone:    f.GeneratePhone(),
		Email:    f.GenerateEmail(fullName),
	}
}

// Companion representa datos generados de un acompañante
type Companion struct {
	DNI      string
	FullName string
}

// GenerateCompanion genera un acompañante
func (f *Faker) GenerateCompanion() Companion {
	return Companion{
		DNI:      f.GenerateDNI(),
		FullName: f.GenerateFullName(),
	}
}

func toLowerCase(s string) string {
	result := ""
	for _, c := range s {
		if c >= 'A' && c <= 'Z' {
			result += string(c + 32)
		} else if c == 'á' {
			result += "a"
		} else if c == 'é' {
			result += "e"
		} else if c == 'í' {
			result += "i"
		} else if c == 'ó' {
			result += "o"
		} else if c == 'ú' {
			result += "u"
		} else if c == 'ñ' {
			result += "n"
		} else {
			result += string(c)
		}
	}
	return result
}
