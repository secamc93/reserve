# 🚀 Proyecto Base Backend en Go

Este repositorio sirve como una plantilla robusta y escalable para iniciar proyectos de backend en Go. Incluye una arquitectura limpia, configuración para dos tipos de servidores (HTTP y gRPC), conexión a base de datos, y flujos de trabajo de desarrollo automatizados.

---

## ✨ Características Principales

- **🌐 Servidor HTTP**: Implementado con [Gin](https://gin-gonic.com/), uno de los frameworks más rápidos y populares de Go.
- **🔌 Servidor gRPC**: Listo para comunicación de alto rendimiento entre microservicios.
- **🗄️ Base de Datos**: Configurado para [PostgreSQL](https://www.postgresql.org/), con un repositorio listo para usar.
- **📄 Documentación de API**:
    - **OpenAPI (Swagger)** para el servidor HTTP, totalmente interactiva.
    - **HTML Estático** para los servicios gRPC, con estilos personalizados.
- **⚙️ Tareas Automatizadas**: Un `Makefile` para simplificar tareas comunes como la generación de documentación.
- **📝 Logging Estructurado**: Logs claros y consistentes para facilitar la depuración.
- **🔑 Gestión de Entorno**: Carga de configuración desde archivos `.env`.
- **🐳 Soporte para Docker**: Preparado para ser contenedorizado.

---

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener instalado lo siguiente:

- **Go**: Versión 1.18 o superior.
- **Make**: Para ejecutar los comandos del `Makefile`.
- **Docker**: (Opcional) Si deseas levantar la base de datos PostgreSQL con Docker.

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para poner en marcha el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd central_reserve
    ```

2.  **Configurar las variables de entorno:**
    Copia el archivo de ejemplo y edítalo con tu configuración local (puertos, credenciales de la base de datos, etc.).
    ```bash
    cp .env.example .env
    nano .env
    ```

3.  **Instalar dependencias:**
    ```bash
    go mod tidy
    ```

4.  **Levantar la base de datos (Opcional):**
    Si usas Docker, puedes iniciar una instancia de PostgreSQL con:
    ```bash
    # (Asegúrate de tener un docker-compose.yml en la carpeta /docker)
    docker-compose -f docker/docker-compose.yml up -d
    ```

5.  **Ejecutar la aplicación:**
    ```bash
    go run ./cmd/main.go
    ```
    ¡El servidor debería estar corriendo! Los logs de inicio te mostrarán las URLs disponibles.

---

## 🛠️ Comandos Disponibles

Hemos configurado un `Makefile` para simplificar algunas tareas:

-   **`make docs`**: Regenera toda la documentación de la API gRPC (lee los `.proto`, aplica estilos y personalizaciones).
-   **`make clean`**: Elimina los binarios de compilación y la documentación generada.

---

## 📚 Documentación de API

Una vez que el servidor esté corriendo, puedes acceder a la documentación en las siguientes rutas:

-   **HTTP (OpenAPI)**:
    -   Visita `http://localhost:[PUERTO_HTTP]/docs`

-   **gRPC (Estática)**:
    -   Visita `http://localhost:[PUERTO_HTTP]/grpc-docs`

*(Reemplaza `[PUERTO_HTTP]` por el puerto que configuraste en tu archivo `.env`)*
