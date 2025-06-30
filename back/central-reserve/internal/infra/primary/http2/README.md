# 🌐 Servidor HTTP (Gin)

Este directorio contiene toda la lógica relacionada con el servidor HTTP de la aplicación, implementado con el framework [Gin](https://gin-gonic.com/).

## 🏛️ Estructura de Directorios

La estructura está diseñada para ser modular y escalable:

-   `routers.go`: El punto de entrada principal del enrutador. Define middlewares globales y agrupa las rutas de los diferentes "dominios" o "módulos".
-   `docs/`: Contiene la configuración y el código para generar la documentación interactiva OpenAPI (Swagger).
-   `middleware/`: Contiene los middlewares personalizados de la aplicación (ej. logging, CORS).
-   `handlers/`: Contiene los diferentes módulos de la API. Cada módulo tiene su propia subcarpeta.
    -   `[nombre_del_modulo]/`:
        -   `*.go`: Archivos con la lógica de los manejadores (controllers). Aquí es donde se escriben las anotaciones de OpenAPI.
        -   `constructor.go`: Define la estructura del manejador y sus dependencias.
        -   `[nombre_del_modulo]router/`: Un sub-paquete que define las rutas específicas para este módulo y las asocia con sus manejadores.

---

## 📄 Documentación de API con OpenAPI (Swagger)

La documentación se genera automáticamente a partir de comentarios especiales (anotaciones) en el código de los manejadores. Esto asegura que la documentación siempre esté sincronizada con el código.

### ¿Cómo añadir una nueva API y su documentación?

Sigue estos 4 pasos para añadir una nueva ruta (por ejemplo, `POST /api/v1/usuarios`):

1.  **Crear el Manejador**:
    Dentro de la carpeta del módulo correspondiente (ej. `handlers/usuarios/`), añade una nueva función. Lo más importante es que incluyas el bloque de comentarios con las anotaciones de OpenAPI antes de la función.

    ```go
    // @Summary      Crear un nuevo usuario
    // @Description  Crea un nuevo usuario en el sistema con la información proporcionada.
    // @Tags         Usuarios
    // @Accept       json
    // @Produce      json
    // @Param        usuario  body      models.NuevoUsuarioRequest  true  "Datos del nuevo usuario"
    // @Success      201  {object}  models.UsuarioCreadoResponse
    // @Failure      400  {object}  map[string]string "Error: Datos inválidos"
    // @Failure      500  {object}  map[string]string "Error: Interno del servidor"
    // @Router       /api/v1/usuarios [post]
    func (h *UsuariosHandler) CrearUsuario(c *gin.Context) {
        // ... tu lógica aquí ...
    }
    ```

2.  **Añadir el manejador a la interfaz**:
    Asegúrate de que la nueva función esté declarada en la interfaz de tu manejador (ej. `IUsuariosHandler`) para que sea accesible.

3.  **Registrar la Ruta**:
    Ve al archivo `router.go` de tu módulo (ej. `handlers/usuarios/usuariosrouter/router.go`) y añade la nueva ruta, asociándola con la función que acabas de crear.

    ```go
    func Routes(v1Group *gin.RouterGroup, handler IUsuariosHandler) {
        usuarios := v1Group.Group("/usuarios")
        {
            // ... otras rutas ...
            usuarios.POST("", handler.CrearUsuario) // <-- Nueva ruta
        }
    }
    ```

4.  **Actualizar la Documentación (Comando)**:
    Finalmente, para que tus nuevos comentarios aparezcan en la documentación de Swagger, ejecuta el siguiente comando desde la raíz del proyecto:

    ```bash
    swag init -g ./cmd/main.go --output ./internal/infra/primary/http2/docs/
    ```
    ¡Y eso es todo! La próxima vez que inicies el servidor y visites `/docs`, tu nueva API estará allí, perfectamente documentada. 