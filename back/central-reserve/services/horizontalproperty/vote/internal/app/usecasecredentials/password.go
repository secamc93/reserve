package usecasecredentials

import (
	"crypto/rand"
	"math/big"
	"strings"
)

// passwordAlphabet no incluye caracteres que se confunden al leerlos impresos (0/O, 1/I/L).
const passwordAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

// PasswordLength es la longitud de la contraseña: 31^6 ≈ 887 millones de combinaciones.
const PasswordLength = 6

// RandomPassword genera una contraseña aleatoria con crypto/rand.
func RandomPassword() (string, error) {
	var b strings.Builder
	max := big.NewInt(int64(len(passwordAlphabet)))
	for i := 0; i < PasswordLength; i++ {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			return "", err
		}
		b.WriteByte(passwordAlphabet[n.Int64()])
	}
	return b.String(), nil
}

// NormalizePassword deja la contraseña escrita por el votante en el formato guardado: sin
// espacios y en mayúsculas.
func NormalizePassword(s string) string {
	return strings.ToUpper(strings.Join(strings.Fields(s), ""))
}
