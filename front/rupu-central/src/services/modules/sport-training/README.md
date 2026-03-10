# Sport Training Module - Frontend Implementation

## 📋 Resumen

Implementación completa de la **Fase 1 (MVP)** del módulo Sport Training Academy siguiendo arquitectura hexagonal estricta.

### ✅ Módulos Implementados

1. **Shared/Catalog** - Catálogos maestros
2. **Players** - Gestión de jugadores
3. **Coaches** - Gestión de entrenadores

---

## 📁 Estructura del Proyecto

```
sport-training/
├── shared/                          # Módulo compartido
│   ├── domain/
│   │   └── entities/               # 5 entidades (SkillLevel, SessionType, etc.)
│   └── infrastructure/
│       └── repositories/           # CatalogRepository
│
├── players/                         # Módulo de jugadores
│   ├── domain/
│   │   ├── entities/               # Player, Guardian, PlayerGuardian
│   │   └── ports/                  # IPlayersRepository
│   ├── infrastructure/
│   │   ├── repositories/           # PlayersRepository + response types
│   │   └── actions/                # 3 server actions (create, update, delete)
│   └── ui/                         # 2 componentes (Table, Modal)
│
└── coaches/                         # Módulo de entrenadores
    ├── domain/
    │   ├── entities/               # Coach, CoachSpecialtyAssignment
    │   └── ports/                  # ICoachesRepository
    ├── infrastructure/
    │   ├── repositories/           # CoachesRepository + response types
    │   └── actions/                # 4 server actions
    └── ui/                         # 2 componentes (Table, Modal)
```

---

## 🌐 Rutas Implementadas (Next.js 16)

### Páginas Creadas

```
/app/sport-training/
├── page.tsx                         # Redirige a /players
├── players/
│   ├── page.tsx                    # Lista de jugadores (paginada)
│   └── [id]/page.tsx               # Detalle de jugador
├── coaches/
│   ├── page.tsx                    # Lista de entrenadores (paginada)
│   └── [id]/page.tsx               # Detalle de entrenador
└── settings/
    └── page.tsx                    # Vista de catálogos maestros
```

**Total:** 6 páginas funcionales

---

## 🎨 Componentes UI

### Reutilizados de `/shared/ui`
- ✅ Table (con paginación)
- ✅ Modal / FormModal
- ✅ Button
- ✅ Input / Select
- ✅ Badge
- ✅ Spinner
- ✅ ConfirmModal

### Creados Específicamente (Client Components)
1. **PlayersTable** - Tabla de jugadores con acciones
2. **CreatePlayerModal** - Formulario de creación de jugador
3. **CoachesTable** - Tabla de entrenadores con acciones
4. **CreateCoachModal** - Formulario de creación de entrenador

**Total:** 4 componentes custom + ~7 componentes compartidos

---

## 🔌 Endpoints del Backend Conectados

### Catalog (Shared)
- `GET /sport-training/skill-levels`
- `GET /sport-training/session-types`
- `GET /sport-training/booking-statuses`
- `GET /sport-training/attendance-statuses`
- `GET /sport-training/coach-specialties`

### Players
- `GET /sport-training/players` (paginado)
- `GET /sport-training/players/:id`
- `POST /sport-training/players`
- `PUT /sport-training/players/:id`
- `DELETE /sport-training/players/:id`

### Coaches
- `GET /sport-training/coaches` (paginado)
- `GET /sport-training/coaches/:id`
- `POST /sport-training/coaches`
- `PUT /sport-training/coaches/:id`
- `DELETE /sport-training/coaches/:id`
- `POST /sport-training/coaches/:id/specialties`

**Total:** 16 endpoints implementados

---

## ✅ Checklist de Arquitectura Hexagonal

### Domain Layer
- [x] Solo interfaces TypeScript (sin imports de React/Next/fetch)
- [x] Entities sin tags JSON
- [x] Ports definen contratos de repositorio
- [x] DTOs separados para Create/Update/List
- [x] Respuestas paginadas con `PaginatedResponse<T>`

### Infrastructure Layer
- [x] Server Actions con `'use server'` directive
- [x] Repositorios implementan puertos de domain
- [x] Mappers convierten snake_case (backend) ↔ camelCase (frontend)
- [x] fetch() con `cache: 'no-store'` para datos paginados
- [x] revalidatePath() después de mutaciones

### UI Layer
- [x] Client Components con `'use client'` directive
- [x] NO instancian repositorios (solo llaman Server Actions)
- [x] Reutilizan componentes compartidos
- [x] Props tipadas con interfaces

---

## 🚀 Cómo Probar

### 1. Verificar Compilación

```bash
cd front/rupu-central
npm run build
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

### 3. Navegar a las Rutas

- **Players:** http://localhost:3000/sport-training/players
- **Coaches:** http://localhost:3000/sport-training/coaches
- **Settings:** http://localhost:3000/sport-training/settings

### 4. Funcionalidades Probables

✅ **Players:**
- Listar jugadores con paginación
- Crear nuevo jugador (modal)
- Ver detalle de jugador
- Eliminar jugador (confirmación)

✅ **Coaches:**
- Listar entrenadores con paginación
- Crear nuevo entrenador (modal)
- Ver detalle de entrenador
- Eliminar entrenador (confirmación)

✅ **Settings:**
- Visualizar catálogos maestros (read-only)

---

## 📊 Métricas de Implementación

| Métrica | Cantidad |
|---------|----------|
| **Archivos TypeScript** | 43 |
| **Páginas Next.js** | 6 |
| **Componentes UI** | 4 custom + 7 shared |
| **Server Actions** | 7 |
| **Repositorios** | 3 (Catalog, Players, Coaches) |
| **Entidades Domain** | 10 |
| **Endpoints Backend** | 16 |

---

## 🔮 Próximos Pasos (Fases 2-4)

### Fase 2: Apoderados + Grupos
- [ ] Guardians UI (asignar apoderados a jugadores)
- [ ] Training Groups Module (grupos de entrenamiento)
- [ ] Páginas de gestión de grupos

### Fase 3: Sesiones + Reservas
- [ ] Sessions Module (sesiones individuales y grupales)
- [ ] Bookings Module (reservas con flujo de aprobación)
- [ ] Calendario de sesiones (custom component)

### Fase 4: Asistencia + Reportes
- [ ] Attendance Module (registro de asistencia)
- [ ] Dashboard con métricas clave
- [ ] Reportes de asistencia e ingresos

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript 5.x
- **UI Components:** Custom + Shared (Tailwind CSS)
- **State Management:** React Hooks (useState, useEffect)
- **HTTP Client:** Fetch API (native)
- **Logging:** HTTP Request/Response Logger
- **Architecture:** Hexagonal (Ports & Adapters)

---

## 📝 Notas Importantes

1. **Autenticación:** Usa `TokenStorage.getToken()` y `TokenStorage.getActiveBusiness()`
2. **Paginación:** Todas las listas implementan paginación obligatoria
3. **Validación:** Las validaciones se hacen en el backend
4. **Cache:** `cache: 'no-store'` en todos los fetch de datos paginados
5. **Revalidación:** `revalidatePath()` después de cada mutación

---

**Última actualización:** 2026-02-14
**Autor:** Claude Code (Fase 1 MVP completada)
