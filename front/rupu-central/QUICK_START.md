# 🚀 Guía Rápida - Rupu Central

## ¿Cómo Agregar un Nuevo Módulo?

### 1. Crear la Estructura
```bash
mkdir -p src/modules/mi-modulo/{domain,application,infrastructure/{actions,repositories},ui}
```

### 2. Crear las Capas

#### Domain (Entidades y Puertos)
```typescript
// src/modules/mi-modulo/domain/entities/mi-entidad.ts
export interface MiEntidad {
  id: string;
  nombre: string;
}

// src/modules/mi-modulo/domain/ports/mi-repository.ts
export interface IMiRepository {
  findById(id: string): Promise<MiEntidad | null>;
}
```

#### Application (Casos de Uso)
```typescript
// src/modules/mi-modulo/application/mi-caso-uso.use-case.ts
import { IMiRepository } from '../domain/ports/mi-repository';

export class MiCasoUsoUseCase {
  constructor(private repo: IMiRepository) {}
  
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
```

#### Infrastructure (Actions y Repositories)
```typescript
// src/modules/mi-modulo/infrastructure/repositories/mi-repository.impl.ts
import { IMiRepository } from '../../domain/ports/mi-repository';

export class MiRepositoryImpl implements IMiRepository {
  async findById(id: string) {
    // Implementación con DB
  }
}

// src/modules/mi-modulo/infrastructure/actions/mi-action.ts
'use server';

import { MiCasoUsoUseCase } from '../../application/mi-caso-uso.use-case';
import { MiRepositoryImpl } from '../repositories/mi-repository.impl';

export async function miAction(id: string) {
  const repo = new MiRepositoryImpl();
  const useCase = new MiCasoUsoUseCase(repo);
  return useCase.execute(id);
}
```

#### UI (Componentes)
```typescript
// src/modules/mi-modulo/ui/mi-componente.tsx
'use client';

export function MiComponente({ data }: { data: any }) {
  return <div>{data.nombre}</div>;
}
```

### 3. Crear la Página en App Router
```typescript
// src/app/mi-ruta/page.tsx
import { MiComponente } from '@modules/mi-modulo/ui/mi-componente';
import { miAction } from '@modules/mi-modulo/infrastructure/actions';

export default async function MiPagina() {
  const resultado = await miAction('123');
  return <MiComponente data={resultado} />;
}
```

## 📋 Checklist para Nuevas Features

- [ ] ¿Creaste las entidades en `domain/entities/`?
- [ ] ¿Definiste los puertos (interfaces) en `domain/ports/`?
- [ ] ¿Implementaste los casos de uso en `application/`?
- [ ] ¿Creaste los repositorios en `infrastructure/repositories/`?
- [ ] ¿Creaste las actions en `infrastructure/actions/`?
- [ ] ¿Agregaste permisos en `config/rbac.ts`?
- [ ] ¿Validaste permisos en las actions?
- [ ] ¿Creaste componentes UI reutilizables?
- [ ] ¿Exportaste lo público en `index.ts`?
- [ ] ¿Probaste con `npm run build`?

## 🎯 Reglas Importantes

### ✅ SÍ Hacer
- ✅ Importar actions desde Server Components
- ✅ Pasar actions como props a Client Components
- ✅ Validar permisos en las actions
- ✅ Usar path aliases (@modules/*, @shared/*)
- ✅ Mantener domain sin dependencias externas
- ✅ Poner toda lógica técnica en infrastructure

### ❌ NO Hacer
- ❌ Importar actions directamente en Client Components
- ❌ Poner lógica de negocio en `app/`
- ❌ Mezclar capas (domain importando infrastructure)
- ❌ Exportar repositorios en barrels públicos
- ❌ Usar `any` (usar `unknown` o tipos específicos)

## 🔍 Ejemplos Rápidos

### Ejemplo 1: Crear una Action Simple
```typescript
'use server';

export async function obtenerDatosAction() {
  return { mensaje: 'Hola desde el servidor' };
}
```

### Ejemplo 2: Action con Validación de Permisos
```typescript
'use server';

import { hasPermission, Permission, Role } from '@config/rbac';

export async function accionProtegidaAction(userRole: Role) {
  if (!hasPermission(userRole, Permission.MI_PERMISO)) {
    return { success: false, error: 'Sin permisos' };
  }
  
  // Lógica aquí
  return { success: true, data: {} };
}
```

### Ejemplo 3: Client Component que Usa Action
```typescript
'use client';

export function MiFormulario({ onSubmit }: { onSubmit: (data: any) => Promise<any> }) {
  const handleSubmit = async () => {
    const resultado = await onSubmit({ campo: 'valor' });
    console.log(resultado);
  };
  
  return <button onClick={handleSubmit}>Enviar</button>;
}
```

### Ejemplo 4: Server Component que Pasa Action
```typescript
import { MiFormulario } from '@modules/mi-modulo/ui/mi-formulario';
import { miAction } from '@modules/mi-modulo/infrastructure/actions';

export default function MiPagina() {
  return <MiFormulario onSubmit={miAction} />;
}
```

## 📊 Estructura de Archivos Típica

```
/modules/mi-modulo
├── domain/
│   ├── entities/
│   │   └── mi-entidad.entity.ts
│   ├── ports/
│   │   └── mi-repository.ts
│   └── index.ts
├── application/
│   ├── mi-caso-uso.use-case.ts
│   └── index.ts
├── infrastructure/
│   ├── actions/
│   │   ├── mi-action.ts
│   │   └── index.ts
│   ├── repositories/
│   │   └── mi-repository.impl.ts
│   └── index.ts
├── ui/
│   ├── mi-componente.tsx
│   └── index.ts
└── index.ts (barrel)
```

## 🛠️ Debugging

### Ver estructura actual
```bash
find src/modules -type f | sort
```

### Verificar build
```bash
npm run build
```

### Verificar linting
```bash
npm run lint
```

## 📚 Documentación Completa

- **ARCHITECTURE.md** - Arquitectura detallada
- **REFACTORING_NOTES.md** - Notas de refactorización
- **ESTRUCTURA_FINAL.md** - Diagrama visual completo

---

**¡Listo para desarrollar!** 🚀

