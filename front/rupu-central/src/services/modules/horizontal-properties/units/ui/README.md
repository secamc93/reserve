# Property Units - Componente DataTable

Integración del componente DataTable de Pencil (sistema de diseño Lunaris) con el módulo de Property Units.

## 🎨 Diseño

El componente `PropertyUnitsDataTable` sigue fielmente el diseño creado en Pencil, con:
- **Paleta azul**: Tonos de azul (#1E88E5, #42A5F5, #64B5F6) del sistema Lunaris
- **Border radius**: 12px para el contenedor principal
- **Iconos Lucide React**: Integración completa
- **Fuente Geist**: Tipografía moderna

## 📦 Componentes

### PropertyUnitsDataTable
Componente principal que muestra la tabla de unidades con:
- Header azul con sistema de filtros
- Chips de filtros coloridos (azul, verde, naranja)
- Botones "Agregar" e "Importar"
- Tabla con 9 columnas
- Paginación completa
- Badges de estado (Activa/Inactiva)
- Botones de acción (Editar/Eliminar)

### PropertyUnitsTable
Componente wrapper que integra:
- Lógica de negocio (llamadas a APIs)
- Gestión de estado
- Modales (crear, editar, importar)
- Alertas y confirmaciones
- Sistema de filtros
- Tokens de autenticación

## 🔧 Estructura de archivos

```
units/ui/
├── property-units-table.tsx          # Wrapper con lógica de negocio
├── property-units-data-table.tsx     # Componente visual puro (Pencil)
├── create-property-unit-modal.tsx    # Modal para crear unidades
├── edit-property-unit-modal.tsx      # Modal para editar unidades
├── import-units-modal.tsx            # Modal para importar desde Excel
└── index.ts                          # Exportaciones
```

## 📊 Columnas de la tabla

1. **Número**: Identificador de la unidad
2. **Tipo**: Apartamento, Casa, Oficina, etc.
3. **Piso**: Número de piso
4. **Bloque**: Identificador del bloque
5. **Área (m²)**: Superficie en metros cuadrados
6. **Habitaciones**: Número de habitaciones
7. **Coeficiente**: Coeficiente de copropiedad (6 decimales)
8. **Estado**: Badge verde (Activa) o rojo (Inactiva)
9. **Acciones**: Botones de Editar y Eliminar

## 🎯 Sistema de filtros

Los filtros se convierten automáticamente al formato del DataTable:

```typescript
// Filtros aplicados en property-units-table.tsx
{
  number?: string;           // "101", "A-201", etc.
  unitType?: string;         // "apartment", "house", etc.
  floor?: number;            // 1, 2, 3, etc.
  block?: string;            // "A", "B", "1", etc.
  isActive?: boolean;        // true/false
}

// Se convierten a PropertyUnitFilter[]
[
  {
    id: "filter-0",
    key: "number",
    label: "Número: 101",
    value: "101",
    color: "blue"
  },
  // ...
]
```

### Colores de chips de filtros

- **Azul**: Número, Bloque
- **Verde**: Tipo, Estado Activo
- **Naranja**: Piso, Estado Inactivo

## 🚀 Uso

El componente se usa automáticamente cuando se carga la página de unidades:

```tsx
import { PropertyUnitsTable } from '@/services/modules/horizontal-properties/units/ui';

<PropertyUnitsTable businessId={businessId} />
```

## ⚙️ Props de PropertyUnitsDataTable

| Prop | Tipo | Descripción |
|------|------|-------------|
| `data` | `PropertyUnit[]` | Array de unidades |
| `filters` | `PropertyUnitFilter[]` | Filtros aplicados |
| `onAdd` | `() => void` | Callback para agregar unidad |
| `onImport` | `() => void` | Callback para importar Excel |
| `onEdit` | `(unit) => void` | Callback para editar unidad |
| `onDelete` | `(unit) => void` | Callback para eliminar unidad |
| `onFilterRemove` | `(key) => void` | Callback para remover filtro |
| `onClearAllFilters` | `() => void` | Callback para limpiar filtros |
| `currentPage` | `number` | Página actual |
| `totalPages` | `number` | Total de páginas |
| `totalItems` | `number` | Total de items |
| `pageSize` | `number` | Items por página |
| `onPageChange` | `(page) => void` | Callback de paginación |
| `loading` | `boolean` | Estado de carga |

## 🔄 Flujo de datos

```
PropertyUnitsTable (wrapper)
    ↓
    ├─ Gestiona estado y lógica
    ├─ Llama a APIs
    ├─ Convierte filtros al formato DataTable
    └─ Pasa props a PropertyUnitsDataTable
        ↓
        PropertyUnitsDataTable (visual)
        ├─ Renderiza header con filtros
        ├─ Renderiza tabla
        ├─ Renderiza paginación
        └─ Emite eventos hacia arriba
```

## 🎨 Colores del sistema

### Header
- Background: `#1E88E5`
- Texto: `#FFFFFF`

### Tabla
- Header: `#64B5F6`
- Fila par: `#E3F2FD`
- Fila impar: `#FFFFFF`

### Badges de estado
- Activa: `#81C784` (verde)
- Inactiva: `#E57373` (rojo)

### Botones de acción
- Editar: bg `#E3F2FD`, icono `#42A5F5`
- Eliminar: bg `#FFEBEE`, icono `#E57373`

## 📝 Notas de implementación

1. **Filtros**: El componente wrapper convierte los filtros del formato original al formato del DataTable
2. **Paginación**: Se renderiza dinámicamente basándose en totalPages
3. **Loading**: Muestra un mensaje de carga mientras se obtienen los datos
4. **Columnas fijas**: 9 columnas con anchos específicos para mantener consistencia
5. **Filas alternadas**: Automáticas con colores diferentes

## 🔍 Diferencias con el componente Table anterior

| Característica | Table anterior | PropertyUnitsDataTable |
|----------------|----------------|------------------------|
| Diseño | Generic/Bootstrap | Pencil/Lunaris |
| Colores | Variables CSS | Colores hexadecimales fijos |
| Filtros | DynamicFilters component | Chips coloridos integrados |
| Paginación | Selector de items por página | Navegación simple con números |
| Header | Gris estándar | Azul vibrante (#1E88E5) |
| Iconos | Heroicons | Lucide React |
| Estado | Badge genérico | Badge con colores específicos |

## 🐛 Troubleshooting

### Error: "Module not found: lucide-react"
```bash
npm install lucide-react
```

### Los filtros no se muestran correctamente
Verifica que los filtros se conviertan al formato `PropertyUnitFilter[]` con:
- `id`: String único
- `key`: Clave del filtro
- `label`: Texto a mostrar
- `value`: Valor del filtro
- `color`: 'blue' | 'green' | 'orange'

### La tabla no se actualiza después de crear/editar
Asegúrate de llamar a `loadUnits()` en los callbacks `onSuccess` de los modales.

## 📚 Referencias

- **Diseño original**: Pencil (archivo: reserve-pencil.pen, componente ID: tS3oV)
- **Sistema de diseño**: Lunaris
- **Iconos**: [Lucide React](https://lucide.dev)
- **Framework**: Next.js 16.1.1

---

**Diseñado en Pencil** | **Implementado con React + Tailwind CSS**
