# Dependencies Management

Este documento explica la gestión de dependencias en el servidor.

## Estructura Dependencies

```go
type Dependencies struct {
    Handlers         *routes.Handlers
    JWTService       ports.IJWTService
    AuthUseCase      usecaseauth.IUseCaseAuth
    ServiceFactory   *factory.ServiceFactory
    RepositoryFactory *repository.RepositoryFactory
    UseCaseFactory   *usecasefactory.UseCaseFactory
    HandlerFactory   *factoryhanlder.HandlerFactory
}
```

## Beneficios del Struct Dependencies

### ✅ Encapsulación
- **Todas las dependencias** en un solo lugar
- **Fácil transporte** entre funciones
- **Acceso organizado** a todos los componentes

### ✅ Flexibilidad
- **Acceso directo** a factories si es necesario
- **Acceso a componentes** específicos
- **Fácil extensión** para nuevas dependencias

### ✅ Mantenibilidad
- **Un solo punto** de creación de dependencias
- **Fácil debugging** de dependencias
- **Código más limpio** y organizado

## Flujo de Creación

```
NewDependencies()
├── factory.NewServiceFactory()
├── repository.NewRepositoryFactory()
├── usecasefactory.NewUseCaseFactory()
└── factoryhanlder.NewHandlerFactory()
```

## Uso en el Código

```go
// Crear dependencias
dependencies := NewDependencies(database, logger, environment)

// Usar en servidor HTTP
httpServer, err := startHttpServer(ctx, logger, dependencies, environment)

// Acceso directo a componentes
handlers := dependencies.Handlers
jwtService := dependencies.JWTService
authUseCase := dependencies.AuthUseCase
```

## Compatibilidad

La función `setupDependencies()` se mantiene para compatibilidad con código existente, pero se recomienda usar `NewDependencies()` para nuevo código. 