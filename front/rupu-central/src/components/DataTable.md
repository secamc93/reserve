# Data Table Component

Componente de tabla de datos con filtros, paginación y acciones. Creado basándose en el diseño de Pencil (sistema de diseño Lunaris).

## 🎨 Características de diseño

- **Paleta de colores azul**: Utiliza tonos de azul (#1E88E5, #42A5F5, #64B5F6) del sistema Lunaris
- **Chips de filtros coloridos**: Azul, verde y naranja para diferentes tipos de filtros
- **Badges de estado**: Verde (Activo), Naranja (Pendiente), Rojo (Inactivo)
- **Border radius**: 12px para el contenedor principal, 8px y 16px para elementos internos
- **Iconos Lucide React**: Integración completa con lucide-react
- **Fuente Geist**: Tipografía moderna y legible

## 📦 Instalación

El componente requiere las siguientes dependencias:

```bash
npm install lucide-react
```

## 🚀 Uso básico

```tsx
import { DataTable } from '@/components/DataTable';

const data = [
  {
    id: '001',
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    estado: 'Activo'
  }
];

const filters = [
  { id: 'f1', label: 'Estado: Activo', color: 'blue' }
];

<DataTable
  data={data}
  filters={filters}
  onAdd={() => console.log('Agregar')}
  onEdit={(row) => console.log('Editar', row)}
  onDelete={(row) => console.log('Eliminar', row)}
  onFilterRemove={(id) => console.log('Remover filtro', id)}
  onClearAllFilters={() => console.log('Limpiar filtros')}
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => console.log('Página', page)}
/>
```

## 📚 Props

### DataTableProps

| Prop | Tipo | Descripción | Opcional |
|------|------|-------------|----------|
| `data` | `DataTableRow[]` | Array de datos a mostrar en la tabla | No |
| `filters` | `FilterChip[]` | Array de filtros aplicados | Sí (default: `[]`) |
| `onAdd` | `() => void` | Callback al hacer clic en "Agregar" | Sí |
| `onEdit` | `(row: DataTableRow) => void` | Callback al editar una fila | Sí |
| `onDelete` | `(row: DataTableRow) => void` | Callback al eliminar una fila | Sí |
| `onFilterRemove` | `(filterId: string) => void` | Callback al remover un filtro | Sí |
| `onClearAllFilters` | `() => void` | Callback al limpiar todos los filtros | Sí |
| `currentPage` | `number` | Página actual | Sí (default: `1`) |
| `totalPages` | `number` | Total de páginas | Sí (default: `10`) |
| `onPageChange` | `(page: number) => void` | Callback al cambiar de página | Sí |

### DataTableRow

```typescript
interface DataTableRow {
  id: string;
  nombre: string;
  email: string;
  estado: 'Activo' | 'Pendiente' | 'Inactivo';
}
```

### FilterChip

```typescript
interface FilterChip {
  id: string;
  label: string;
  color: 'blue' | 'green' | 'orange';
}
```

## 🎨 Estructura visual

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (bg: #1E88E5)                                        │
│ ┌──────────┬──────────────┬────────────┬─────────┐         │
│ │ Filtros: │ Dropdown     │ Chip 1     │ Limpiar │ Agregar │
│ │          │              │ Chip 2     │ todo    │         │
│ │          │              │ Chip 3     │         │         │
│ └──────────┴──────────────┴────────────┴─────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ TABLE HEADER (bg: #64B5F6)                                  │
│ ID    │ Nombre   │ Email            │ Estado  │ Acciones   │
├───────┼──────────┼──────────────────┼─────────┼────────────┤
│ Row 1 (bg: #E3F2FD)                                         │
│ 001   │ Juan P.  │ juan@email.com   │ ●Activo │ ✎ 🗑       │
├───────┼──────────┼──────────────────┼─────────┼────────────┤
│ Row 2 (bg: #FFFFFF)                                         │
│ 002   │ María G. │ maria@email.com  │ ●Activo │ ✎ 🗑       │
├───────┼──────────┼──────────────────┼─────────┼────────────┤
│ Row 3 (bg: #E3F2FD)                                         │
│ 003   │ Carlos L.│ carlos@email.com │ ⬤Pend.  │ ✎ 🗑       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ FOOTER (bg: #F5F5F5)                                        │
│ Mostrando 3 resultados        ◄ 1 2 3 ... 10 ►             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Colores del sistema

### Header principal
- Background: `#1E88E5`
- Texto: `#FFFFFF`

### Header de tabla
- Background: `#64B5F6`
- Texto: `#FFFFFF`

### Filas alternadas
- Fila par: `#E3F2FD`
- Fila impar: `#FFFFFF`

### Chips de filtros
- **Azul**: bg `#E3F2FD`, texto `#1565C0`, botón `#1976D2`
- **Verde**: bg `#E8F5E9`, texto `#2E7D32`, botón `#4CAF50`
- **Naranja**: bg `#FFF3E0`, texto `#E65100`, botón `#FF9800`

### Badges de estado
- **Activo**: `#81C784` (verde)
- **Pendiente**: `#FFB74D` (naranja)
- **Inactivo**: `#E57373` (rojo)

### Botones de acción
- **Editar**: bg `#E3F2FD`, icono `#42A5F5`
- **Eliminar**: bg `#FFEBEE`, icono `#E57373`

## 💡 Ejemplo completo

```tsx
'use client';

import React, { useState } from 'react';
import { DataTable, DataTableRow, FilterChip } from '@/components/DataTable';

export default function MiPagina() {
  const [data, setData] = useState<DataTableRow[]>([
    {
      id: '001',
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      estado: 'Activo'
    },
    {
      id: '002',
      nombre: 'María García',
      email: 'maria.garcia@email.com',
      estado: 'Activo'
    },
    {
      id: '003',
      nombre: 'Carlos López',
      email: 'carlos.lopez@email.com',
      estado: 'Pendiente'
    }
  ]);

  const [filters, setFilters] = useState<FilterChip[]>([
    { id: 'f1', label: 'Estado: Activo', color: 'blue' },
    { id: 'f2', label: 'Fecha: Última semana', color: 'green' },
    { id: 'f3', label: 'Nombre: A-M', color: 'orange' }
  ]);

  const [currentPage, setCurrentPage] = useState(1);

  const handleAdd = () => {
    const newId = String(data.length + 1).padStart(3, '0');
    setData([
      ...data,
      {
        id: newId,
        nombre: 'Nuevo Usuario',
        email: 'nuevo@email.com',
        estado: 'Pendiente'
      }
    ]);
  };

  const handleEdit = (row: DataTableRow) => {
    // Implementar lógica de edición
    console.log('Editar:', row);
  };

  const handleDelete = (row: DataTableRow) => {
    setData(data.filter((item) => item.id !== row.id));
  };

  const handleFilterRemove = (filterId: string) => {
    setFilters(filters.filter((f) => f.id !== filterId));
  };

  const handleClearAllFilters = () => {
    setFilters([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Aquí cargarías los datos de la nueva página
  };

  return (
    <div className="p-8">
      <DataTable
        data={data}
        filters={filters}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilterRemove={handleFilterRemove}
        onClearAllFilters={handleClearAllFilters}
        currentPage={currentPage}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

## 🔧 Personalización

### Modificar colores

Si necesitas cambiar los colores, busca estas secciones en el componente:

```tsx
// Colores de chips
const chipColors = {
  blue: { bg: 'bg-[#E3F2FD]', ... },
  green: { bg: 'bg-[#E8F5E9]', ... },
  orange: { bg: 'bg-[#FFF3E0]', ... }
};

// Colores de badges
const statusColors = {
  Activo: 'bg-[#81C784]',
  Pendiente: 'bg-[#FFB74D]',
  Inactivo: 'bg-[#E57373]'
};
```

### Agregar más columnas

Para agregar columnas adicionales, modifica:

1. La interfaz `DataTableRow`
2. El header de la tabla
3. Las celdas en el mapeo de datos

## 📄 Licencia

Componente creado basándose en el diseño de Pencil (sistema Lunaris).

## 🤝 Contribuciones

Para contribuir, asegúrate de mantener la consistencia con el sistema de diseño Lunaris.

---

**Diseñado en Pencil** | **Implementado con React + Tailwind CSS** | **Iconos por Lucide React**
