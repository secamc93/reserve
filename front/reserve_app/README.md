# 🏪 Sistema de Gestión de Reservas - Restaurante

Sistema interno de gestión de reservas para restaurantes, implementado con **React** y **Arquitectura Hexagonal**.

## 🚀 Descripción

Esta aplicación está diseñada para el personal interno del restaurante (encargados, administradores) para gestionar las reservas de clientes. Permite:

- ✅ Visualizar todas las reservas
- 🔍 Filtrar reservas por estado, cliente, mesa y fechas
- 🔄 Cambiar estados de reservas (Pendiente, Confirmado, Cancelado)
- 📊 Ver estadísticas en tiempo real
- 📱 Interfaz responsive y moderna

## 🏗️ Arquitectura Hexagonal (Ports & Adapters)

La aplicación está estructurada siguiendo los principios de la arquitectura hexagonal:

```
src/
├── domain/                    # Capa de Dominio
│   ├── entities/             # Entidades del negocio
│   │   └── Reserva.js       # Entidad Reserva con lógica de negocio
│   └── repositories/        # Interfaces de repositorios
│       └── ReservaRepository.js
├── application/             # Capa de Aplicación
│   ├── use-cases/          # Casos de uso
│   │   └── GetReservasUseCase.js
│   └── services/           # Servicios de aplicación
├── infrastructure/         # Capa de Infraestructura
│   ├── api/               # Clientes HTTP
│   │   └── HttpClient.js
│   └── adapters/          # Adaptadores
│       └── ApiReservaRepository.js
└── presentation/          # Capa de Presentación
    ├── components/       # Componentes React
    │   ├── ReservaCard.js
    │   ├── ReservaFilters.js
    │   └── *.css
    ├── hooks/           # Hooks personalizados
    │   └── useReservas.js
    └── pages/           # Páginas principales
        ├── GestionReservas.js
        └── *.css
```

### 🔧 Capas de la Arquitectura

#### 1. **Dominio (Domain)**
- **Entidades**: Modelos de negocio con lógica (`Reserva`)
- **Repositorios**: Interfaces para acceso a datos
- **Reglas de negocio**: Lógica pura sin dependencias externas

#### 2. **Aplicación (Application)**
- **Casos de uso**: Orquestación de la lógica de negocio
- **Servicios**: Coordinación entre capas
- **DTOs**: Objetos de transferencia de datos

#### 3. **Infraestructura (Infrastructure)**
- **Adaptadores**: Implementaciones de repositorios
- **API Clients**: Comunicación con servicios externos
- **Persistencia**: Acceso a base de datos (API REST)

#### 4. **Presentación (Presentation)**
- **Componentes React**: UI components
- **Hooks**: Lógica de estado y efectos
- **Páginas**: Composición de componentes

## 🔌 API Configuration

La aplicación se conecta a la API REST:

**Base URL**: `http://localhost:3050`
**Endpoint**: `/api/v1/reserves`

### Parámetros de Filtrado

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status_id` | integer | ID del estado de reserva |
| `client_id` | integer | ID del cliente |
| `table_id` | integer | ID de la mesa |
| `start_date` | string | Fecha de inicio (RFC3339) |
| `end_date` | string | Fecha de fin (RFC3339) |

### Estructura de Respuesta

```json
{
  "data": [
    {
      "reserva_id": 10,
      "start_at": "2024-07-04T15:00:00-05:00",
      "end_at": "2024-07-04T17:00:00-05:00",
      "number_of_guests": 4,
      "estado_codigo": "pendiente",
      "estado_nombre": "Pendiente",
      "cliente_nombre": "Sebastian Camacho",
      "cliente_email": "sebastian.camacho@email.com",
      "cliente_telefono": "3001234567",
      "restaurante_nombre": "Trattoria la bella",
      // ... más campos
    }
  ],
  "total": 4,
  "success": true,
  "message": "Reservas obtenidas exitosamente"
}
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- API Backend ejecutándose en `http://localhost:3050`

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd reserve_app

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

### Scripts Disponibles

```bash
npm start        # Ejecutar en modo desarrollo
npm run build    # Construir para producción
npm test         # Ejecutar pruebas
npm run eject    # Exponer configuración de Webpack
```

## 📱 Características de la Interfaz

### 🎯 Dashboard Principal
- **Estadísticas en tiempo real**: Total de reservas, pendientes, confirmadas
- **Filtros avanzados**: Por estado, cliente, mesa, fechas
- **Filtros rápidos**: Botones para casos comunes

### 🃏 Tarjetas de Reserva
- **Información completa**: Cliente, fecha, horario, restaurante
- **Cambio de estado**: Botones para confirmar/cancelar
- **Diseño responsive**: Adaptable a móviles

### 🔍 Sistema de Filtrado
- **Filtros múltiples**: Combinación de criterios
- **Búsqueda en tiempo real**: Actualización automática
- **Filtros rápidos**: Acceso a vistas comunes

## 🎨 Tecnologías Utilizadas

- **React 18**: Framework principal
- **CSS3**: Estilos modernos con gradientes y animaciones
- **Fetch API**: Comunicación con backend
- **ES6+ Modules**: Estructura modular
- **CSS Grid & Flexbox**: Layouts responsive

## 📋 Estados de Reserva

- **🟡 Pendiente**: Reserva creada, esperando confirmación
- **🟢 Confirmado**: Reserva confirmada por el restaurante
- **🔴 Cancelado**: Reserva cancelada

## 🔒 Beneficios de la Arquitectura Hexagonal

1. **Separación de responsabilidades**: Cada capa tiene una función específica
2. **Testabilidad**: Lógica de negocio aislada y fácil de testear
3. **Flexibilidad**: Cambiar implementaciones sin afectar otras capas
4. **Mantenibilidad**: Código organizado y fácil de modificar
5. **Escalabilidad**: Estructura preparada para crecimiento

## 🌟 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Asignación automática de mesas
- [ ] Historial de cambios
- [ ] Métricas avanzadas

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ usando React y Arquitectura Hexagonal**
