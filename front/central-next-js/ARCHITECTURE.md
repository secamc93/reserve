# Arquitectura Hexagonal (Puertos y Adaptadores) - Rupü Next.js

## 🏗️ Estructura de la Arquitectura

```
src/
├── internal/               # 🎯 INTERNO (Núcleo de Negocio)
│   ├── domain/             # 🎯 DOMINIO
│   │   ├── entities/       # Entidades del dominio
│   │   │   ├── User.ts    # Usuario, Roles, Permisos
│   │   │   └── Auth.ts    # Credenciales, Respuestas de Auth
│   │   └── ports/         # 🚪 PUERTOS (Interfaces)
│   │       └── AuthRepository.ts # Contrato para autenticación
│   │
│   ├── application/        # 📋 APLICACIÓN
│   │   ├── usecases/      # Casos de uso de la aplicación
│   │   │   └── AuthUseCase.ts # Lógica de negocio de autenticación
│   │   └── services/      # Servicios de aplicación
│   │       └── AuthService.ts # Orquestador de casos de uso
│   │
│   └── infrastructure/     # 🔌 INFRAESTRUCTURA
│       ├── primary/        # Adaptadores Primarios (UI, API)
│       │   └── HttpClient.ts # Cliente HTTP para API
│       └── secondary/      # Adaptadores Secundarios (DB, External APIs)
│           └── AuthRepositoryImpl.ts # Implementación del repositorio
│
├── presentation/           # 🎨 PRESENTACIÓN (UI/Next.js)
│   ├── components/        # Componentes React
│   └── hooks/            # Hooks personalizados
├── app/                   # 🚀 APP ROUTER (Next.js)
│   ├── auth/
│   │   └── login/
│   └── page.tsx
│
├── config/                # ⚙️ CONFIGURACIÓN
│   └── env.ts            # Variables de entorno
│
└── types/                 # 📝 TIPOS GLOBALES
    └── global.ts         # Tipos compartidos
```

## 🔄 Flujo de Datos

### 1. **Presentación → Aplicación**
```typescript
// Hook (Presentación)
const { login } = useAuth();

// Servicio (Aplicación)
const authService = new AuthService(baseURL);
```

### 2. **Aplicación → Dominio**
```typescript
// Servicio (Aplicación)
const authUseCase = new AuthUseCase(authRepository);

// Caso de Uso (Aplicación)
async login(credentials: LoginCredentials): Promise<LoginResponse>
```

### 3. **Aplicación → Infraestructura**
```typescript
// Caso de Uso (Aplicación)
const result = await this.authRepository.login(credentials);

// Repositorio (Infraestructura)
const response = await this.httpClient.post('/api/v1/auth/login', credentials);
```

## 🎯 Beneficios de la Arquitectura

### ✅ **Separación Clara de Responsabilidades**
- **Internal (Hexágono)**: Todo el negocio, independiente de frameworks
  - **Domain**: Entidades y puertos (interfaces)
  - **Application**: Casos de uso y servicios
  - **Infrastructure**: Adaptadores (implementaciones)
- **Presentation**: Todo lo relacionado con UI/Next.js
  - **Components**: Componentes React
  - **Hooks**: Hooks personalizados
  - **App**: App Router de Next.js

### ✅ **Dos Grandes Bloques Claros**
- **Internal → Negocio**: Lógica de negocio pura y reutilizable
- **Presentation → UI**: Interfaz de usuario y framework específico

### ✅ **Testabilidad**
```typescript
// Fácil de testear con mocks
const mockAuthRepository = {
  login: jest.fn().mockResolvedValue({ success: true })
};
const authUseCase = new AuthUseCase(mockAuthRepository);
```

### ✅ **Independencia de Frameworks**
- El dominio no depende de Next.js
- Fácil migración a otros frameworks
- Lógica de negocio reutilizable

### ✅ **Escalabilidad**
- Nuevos repositorios sin afectar el dominio
- Nuevos casos de uso sin afectar la infraestructura
- Fácil agregar nuevas funcionalidades

## 🔧 Implementación de Capas

### **1. Dominio (Core Business)**
```typescript
// Entidades
export interface User {
  id: number;
  name: string;
  email: string;
}

// Puertos (Interfaces)
export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
}
```

### **2. Aplicación (Casos de Uso)**
```typescript
// Casos de Uso
export class AuthUseCase {
  constructor(private authRepository: AuthRepository) {}
  
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Lógica de negocio pura
  }
}
```

### **2. Infraestructura (Adaptadores)**
```typescript
// Adaptador Secundario
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private httpClient: HttpClient) {}
  
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Implementación técnica
  }
}
```

### **3. Aplicación (Orquestación)**
```typescript
// Servicio de Aplicación
export class AuthService {
  constructor(baseURL: string) {
    const authRepository = new AuthRepositoryImpl(new HttpClient(baseURL));
    this.authUseCase = new AuthUseCase(authRepository);
  }
}
```

### **4. Presentación (UI)**
```typescript
// Hook de Presentación
export const useAuth = () => {
  const authService = new AuthService(config.API_BASE_URL);
  
  const login = async (email: string, password: string) => {
    return authService.login({ email, password });
  };
  
  return { login };
};
```

## 🚀 Ventajas para el Proyecto Rupü

### **1. Migración Fácil**
- El dominio se mantiene igual al proyecto original
- Solo cambian los adaptadores de infraestructura
- Lógica de negocio reutilizable

### **2. Nuevas Funcionalidades**
```typescript
// Agregar nuevo repositorio
export interface ReservationRepository {
  createReservation(reservation: Reservation): Promise<Reservation>;
}

// Agregar nuevo caso de uso
export class ReservationUseCase {
  constructor(private reservationRepository: ReservationRepository) {}
  
  async createReservation(reservation: Reservation): Promise<Reservation> {
    // Validaciones de negocio
    // Reglas de negocio
    return this.reservationRepository.createReservation(reservation);
  }
}
```

### **3. Testing Estratégico**
```typescript
// Test del dominio sin dependencias externas
describe('AuthUseCase', () => {
  it('should login successfully', async () => {
    const mockRepo = { login: jest.fn().mockResolvedValue({ success: true }) };
    const useCase = new AuthUseCase(mockRepo);
    
    const result = await useCase.login({ email: 'test@test.com', password: '123' });
    
    expect(result.success).toBe(true);
  });
});
```

## 📈 Escalabilidad

### **Agregar Nuevos Módulos**
1. **Crear entidades** en `internal/domain/entities/`
2. **Definir puertos** en `internal/domain/ports/`
3. **Implementar casos de uso** en `internal/application/usecases/`
4. **Crear adaptadores** en `internal/infrastructure/`
5. **Agregar servicios** en `internal/application/services/`
6. **Crear componentes** en `presentation/`

### **Ejemplo: Módulo de Reservas**
```
internal/
├── domain/
│   ├── entities/
│   │   └── Reservation.ts
│   └── ports/
│       └── ReservationRepository.ts
├── infrastructure/
│   └── secondary/
│       └── ReservationRepositoryImpl.ts
└── application/
    ├── usecases/
    │   └── ReservationUseCase.ts
    └── services/
        └── ReservationService.ts

presentation/
├── components/
│   └── ReservationForm.tsx
└── hooks/
    └── useReservation.ts
```

## 🚀 Funcionalidades Implementadas

### ✅ Autenticación
- **Login/Logout**: Sistema completo de autenticación
- **Gestión de tokens**: Almacenamiento seguro en localStorage
- **Validación de permisos**: Control de acceso basado en roles
- **Hook personalizado**: `useAuth` para gestión de estado

### ✅ Calendario de Reservas
- **Vista de calendario**: Visualización mensual de reservas
- **Creación de reservas**: Modal para crear nuevas reservas
- **Gestión de estados**: Confirmar, cancelar y actualizar reservas
- **Filtros y búsqueda**: Por fecha, estado y cliente
- **Interfaz dual**: Modal con lista y detalles de reservas
- **Hook personalizado**: `useReservations` para gestión de estado

### ✅ Dashboard
- **Página principal**: Dashboard con enlaces a funcionalidades
- **Navegación**: Enlaces a login y calendario
- **Información arquitectural**: Explicación de la arquitectura hexagonal

## 🎯 Próximos Pasos

1. **Implementar más módulos** siguiendo la misma arquitectura
2. **Agregar validaciones** en el dominio
3. **Implementar manejo de errores** centralizado
4. **Crear tests unitarios** para cada capa
5. **Agregar documentación** de API con Swagger
6. **Implementar cache** en la capa de infraestructura

Esta arquitectura garantiza que el proyecto Rupü sea **mantenible**, **escalable** y **testeable** a largo plazo. 