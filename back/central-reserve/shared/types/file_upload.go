package types

import "io"

// FileUpload representa un archivo subido sin depender de detalles de transporte HTTP
// Este tipo se usa en toda la aplicación para abstraer archivos independientemente del framework
type FileUpload struct {
	Filename    string    // Nombre del archivo
	Size        int64     // Tamaño en bytes
	ContentType string    // MIME type
	Content     io.Reader // Contenido del archivo
}
