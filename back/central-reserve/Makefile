# Makefile para gestionar tareas comunes del proyecto

.PHONY: docs clean

# ==============================================================================
# DOCUMENTACIÓN gRPC
# ------------------------------------------------------------------------------
# Genera la documentación HTML estática para los servicios gRPC.
#
# Este comando realiza dos pasos:
# 1. Usa `protoc-gen-doc` para generar un `index.html` base a partir de los
#    archivos .proto.
# 2. Usa `sed` para inyectar una referencia a nuestra hoja de estilos
#    personalizada (`custom-styles.css`) dentro del <head> del HTML generado.
#    Esto nos permite mantener los estilos separados y persistentes.
#
# Uso:
#   make docs
#
docs:
	@echo "1. Generando HTML base desde .proto..."
	@protoc -I internal/infra/primary/grpc/proto \
	  --doc_out=internal/infra/primary/grpc/docs \
	  --doc_opt=html,index.html \
	  internal/infra/primary/grpc/proto/holamundo/holamundo.proto

	@echo "2. Eliminando estilos por defecto y enlazando CSS personalizado..."
	@sed -i -e '/<style>/,/<\/style>/d' internal/infra/primary/grpc/docs/index.html
	@sed -i -e '/<head>/a \ \ \ \ <link rel="stylesheet" type="text/css" href="custom-styles.css"/>' internal/infra/primary/grpc/docs/index.html

	@echo "3. Personalizando contenido HTML (títulos, textos, iconos)..."
	@sed -i 's|<title>Protocol Documentation</title>|<title>Documentación API gRPC</title>|' internal/infra/primary/grpc/docs/index.html
	@sed -i 's|<h1 id="title">Protocol Documentation</h1>|<h1 id="title">📜 Documentación de API gRPC</h1><p style="text-align: center; font-size: 1.1em; color: #b0b0b0; margin: 2em 0;">Esta es la documentación autogenerada para los servicios gRPC de la aplicación. <br>Aquí encontrarás una lista completa de todos los servicios, métodos y estructuras de mensajes definidos en los archivos <code>.proto</code>.</p>|' internal/infra/primary/grpc/docs/index.html
	@sed -i 's|<h2>Table of Contents</h2>|<h2>📋 Tabla de Contenido</h2>|' internal/infra/primary/grpc/docs/index.html
	@sed -i 's|<h2 id="scalar-value-types">Scalar Value Types</h2>|<h2 id="scalar-value-types">🔢 Tipos de Valores Escalares</h2>|' internal/infra/primary/grpc/docs/index.html
	@sed -i 's|<a href="#title">Top</a>|<a href="#title">Arriba</a>|g' internal/infra/primary/grpc/docs/index.html

	@echo "4. Añadiendo enlaces de descarga para los archivos .proto..."
	@sed -i 's|\(<h2 id="holamundo/holamundo.proto">.*</h2>\)|\1<a href="/proto-files/holamundo/holamundo.proto" download style="font-size: 0.6em; margin-left: 2em; text-decoration: none;">📥 Descargar .proto</a>|' internal/infra/primary/grpc/docs/index.html
	@echo "✅ Documentación generada y personalizada."

# ==============================================================================
# LIMPIEZA
# ------------------------------------------------------------------------------
# Elimina los archivos generados por la compilación y la documentación.
#
# Uso:
#   make clean
#
clean:
	@echo "Limpiando archivos generados..."
	@rm -f server
	@rm -f internal/infra/primary/grpc/docs/index.html
	@echo "✅ Limpieza completada." 