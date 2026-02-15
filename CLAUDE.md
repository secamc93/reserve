# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rupü (Reserve)** is a PropTech monorepo platform for comprehensive property management. The system is modular and follows **strict Hexagonal Architecture** for both backend (Go) and frontend (Next.js).

**Current State:** Multi-business system supporting:
- Restaurants (reservations, menus, operations)
- Horizontal Properties (condominiums, units, residents, parking, security, voting)
- Sport Training (players, coaches, bookings, attendance)

---

## Repository Structure

```
/reserve (monorepo root)
├── /back/
│   ├── central-reserve/        # Main Go API (Port 3050)
│   │   ├── cmd/main.go         # Entry point
│   │   ├── services/           # Modules (auth, horizontalproperty, etc.)
│   │   └── shared/             # Shared utilities, docs, middleware
│   └── dbpostgres/             # Database migrations & models
│       └── app/infra/models/   # GORM models (source of truth)
├── /front/
│   ├── rupu-central/           # Next.js 16 dashboard (Port 3000)
│   └── website/                # Astro landing page (Port 4321)
├── /mobile/rupu/               # Flutter mobile app
├── /infra/                     # Infrastructure & DevOps
│   ├── compose-prod/
│   ├── nginx/
│   └── scripts/
├── /.claude/rules/             # Architecture rules (READ THESE FIRST)
├── /Makefile                   # Centralized commands
└── /QUICK_START.md             # Quick reference
```

---

## Critical Architecture Rules

**BEFORE writing ANY code, READ these files:**

1. **`.claude/rules/architecture.md`** - Hexagonal Architecture rules (Backend Go + Frontend Next.js)
2. **`.claude/rules/repository-isolation.md`** - Module independence (NO shared repositories)
3. **`.claude/rules/github-workflow.md`** - GitHub operations (use `gh` CLI, NOT MCP)

### Key Architectural Principles

#### Backend (Go) - Hexagonal Architecture

**Directory Structure (MANDATORY):**
```
services/[module]/
├── bundle.go                    # Module initialization
└── internal/
    ├── domain/                  # PURE - NO external dependencies
    │   ├── entities/            # NO TAGS (no json, no gorm)
    │   ├── dtos/                # Data Transfer Objects
    │   ├── ports/               # Interfaces (IRepository, IUseCase)
    │   └── errors/              # Domain errors
    ├── app/                     # Use Cases
    │   ├── constructor.go       # SINGLE constructor: New()
    │   ├── [use-case].go        # One file per use case
    │   └── mappers/             # OPTIONAL - Domain ↔ App transformations
    └── infra/
        ├── primary/handlers/    # HTTP handlers
        │   ├── constructor.go   # SINGLE constructor: New()
        │   ├── router.go        # REQUIRED - RegisterRoutes()
        │   ├── request/         # REQUIRED - HTTP DTOs with tags
        │   ├── response/        # REQUIRED - HTTP DTOs with tags
        │   └── mappers/         # REQUIRED - HTTP ↔ Domain transformations
        └── secondary/repository/
            ├── constructor.go
            ├── repository.go
            └── mappers/         # REQUIRED - DB ↔ Domain transformations
```

**Critical Rules:**
- **Domain Layer Purity**: ZERO external dependencies. NO tags (`json:`, `gorm:`). Only: `context`, `time`, `errors`, `fmt`, `uuid`
- **One Constructor Per Layer**: Each layer has ONE `constructor.go` with ONE `New()` function
- **GORM Models**: ALWAYS use models from `github.com/secamc93/probability/back/migration/shared/models` (via local module replace in go.mod)
- **Repository Isolation**: Modules NEVER share repositories. Replicate query methods locally
- **Mandatory Pagination**: ALL list endpoints MUST implement pagination
- **Routes Centralization**: All routes in `handlers/router.go` with `RegisterRoutes()` method

#### Frontend (Next.js) - Server-First Architecture

**CRITICAL:** All HTTP requests happen on the SERVER (Server Components or Server Actions).

**Directory Structure:**
```
services/[module]/
├── domain/
│   ├── types.ts                 # Pure TypeScript interfaces
│   └── ports.ts                 # Repository interfaces
├── app/
│   └── use-cases.ts             # Business logic
├── infra/
│   ├── repository/              # HTTP client (fetch)
│   └── actions/                 # REQUIRED - Server Actions for mutations
└── ui/
    ├── components/              # Client Components (interactive only)
    └── hooks/
```

**Key Rules:**
- Server Components for data fetching
- Server Actions for mutations (`POST`, `PUT`, `DELETE`)
- Client Components ONLY for interactivity (`onClick`, `useState`)
- Mandatory pagination using `searchParams`

---

## Essential Commands

### Makefile Centralizado (Root)

**Most important commands:**

```bash
# See all available commands
make help

# Backend
make run-centralback          # Run backend (Go API on :3050)
make build-centralback        # Compile backend
make test-centralback         # Run tests
make test-coverage-centralback # Coverage with HTML report
make podman-dev              # Run full dev environment (API + DB + Redis + NATS)
make podman-stop             # Stop all containers

# Migrations
make run-migrations          # Run database migrations
make migrate-up              # Apply pending migrations
make migrate-status          # View migration status

# Frontend
make run-centralfront        # Run Next.js frontend (:3000)
make run-website             # Run Astro website (:4321)

# Full Stack
make run-all                 # Instructions to run ALL services
make stop-all                # Stop all services
make health-check            # Verify health of all services
make info                    # System information

# Quick aliases
make dev-back                # = run-centralback
make dev-front               # = run-centralfront
```

📚 **Full documentation:** [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md)

### Backend Commands (from back/central-reserve/)

```bash
# Development
make run                     # go run ./cmd/main.go
make build                   # Build binary
make test                    # All tests
make test-coverage           # Coverage HTML report
make deps                    # go mod tidy

# Podman/Docker
make podman-dev             # Full environment
make podman-logs            # View logs
make podman-stop            # Stop containers

# Documentation
make docs                   # Generate Swagger (all modules)
make docs-auth              # Auth module only
make docs-properties        # Properties module only

# Database
make db-reset               # ⚠️ DESTRUCTIVE - Reset database

# Health
make health                 # curl http://localhost:3050/health
```

### Frontend Commands (from front/rupu-central/)

```bash
pnpm dev                    # Development server (Turbopack)
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm clean                  # Clean .next
pnpm clean:all              # Clean .next + node_modules
```

---

## Database & Models

**CRITICAL:** Backend uses GORM with PostgreSQL.

### ALWAYS Use Shared Models

```go
// ✅ CORRECT
import "github.com/secamc93/probability/back/migration/shared/models"

var users []models.User
err := r.db.Find(&users).Error  // GORM infers table from model
```

```go
// ❌ INCORRECT - NEVER do this
err := r.db.Table("users").Find(&users).Error  // Direct table name
```

**Why:** GORM models are centralized in `/back/dbpostgres/app/infra/models/` (mirrored to `/back/models/`). The `central-reserve` module has a go.mod replace directive: `replace dbpostgres => ../dbpostgres`.

### Database Schemas

Each business domain gets its own PostgreSQL schema:
- `horizontal_property` - Condominiums, units, residents
- `sport_training` - Players, coaches, bookings
- `restaurants` - Tables, reservations, menus

### Model Naming Conventions

- Prefix models with domain abbreviation to avoid collisions
- Example: `STPlayer`, `STGuardian`, `STBookingStatus` (ST = Sport Training)
- Table names: `sport_training.players`, `sport_training.coaches`
- Index names: `idx_st_player_name`

### Migrations

Located in `/back/dbpostgres/`:
- AutoMigrate: `app/usecases/migration_usecase.go`
- Import pattern: `import "dbpostgres/app/infra/models"`

---

## Module Implementation Pattern

### Adding a New Backend Module

1. **Create Directory Structure** (see architecture above)
2. **Domain First:** Entities (NO tags), Ports, DTOs, Errors
3. **Application Layer:** Use cases, mappers
4. **Infrastructure:** Repository (GORM models), Handlers (Gin), Mappers
5. **Bundle Registration:**
   ```go
   // services/[module]/bundle.go
   func New(router *gin.RouterGroup, db db.IDatabase, logger log.ILogger, ...) {
       repo := repository.New(db, environment)
       useCase := app.New(repo, logger)
       handler := handlers.New(useCase, logger)
       handler.RegisterRoutes(router)
   }
   ```
6. **Register in Main:**
   ```go
   // cmd/internal/server/server.go
   module.New(router.Group("/api/v1/module"), database, logger)
   ```

---

## GitHub Operations

**IMPORTANT:** Use `gh` CLI, NOT GitHub MCP server.

```bash
# Verify authentication
gh auth status

# Pull Requests
gh pr list --state open
gh pr view <number>
gh pr create --title "Title" --body "Description" --base main

# Issues
gh issue list
gh issue create --title "Title" --body "Description"

# Workflows
gh workflow list
gh run list --workflow=backend-ci-cd.yml
```

**Reason:** GitHub MCP server has authentication issues. `gh` CLI is reliable and pre-configured for account `secamc93`.

---

## CI/CD & Deployment

**Infrastructure:** AWS ECR + EC2 with Podman

### GitHub Actions Workflows

Located in `.github/workflows/`:

- **`backend-ci-cd.yml`**: Triggers on `back/central-reserve/**`
  - Builds with Podman (ARM64)
  - Pushes to ECR: `public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest`
  - Deploys to EC2 via SSH
  - Health check (12 retries)

- **`frontend-ci-cd.yml`**: Triggers on `front/rupu-central/**`
  - Builds Next.js with Turbopack
  - Pushes to ECR: `frontend-latest`
  - Deploys to EC2 with health check (15 retries)

- **`nginx-ci-cd.yml`**: Nginx proxy with SSL/TLS
- **`deploy-all.yml`**: Manual trigger for coordinated deployment

---

## Development Workflow

### Standard Flow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/module-name
   ```

2. **Read architecture rules** (`.claude/rules/architecture.md`)

3. **Implement following hexagonal pattern:** Domain → App → Infra

4. **Test locally:**
   ```bash
   make run-centralback  # Backend
   make run-centralfront # Frontend
   make health-check     # Verify
   ```

5. **Generate Swagger docs:**
   ```bash
   make docs-[module]
   ```

6. **Commit with conventional commits:**
   ```bash
   git add .
   git commit -m "feat: add [module] CRUD endpoints

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

7. **Push and create PR:**
   ```bash
   git push -u origin feature/module-name
   gh pr create --title "feat: [module]" --body "Description" --base main
   ```

### Updating Feature Branch with Main

```bash
git checkout feature/branch-name
git fetch origin
git merge main --no-edit
git push origin feature/branch-name
```

**If conflicts > 50 files:** Consider rescuing specific code to a new branch from updated `main`.

---

## Services Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Backend API | 3050 | http://localhost:3050 | Go REST API |
| Swagger Docs | 3050 | http://localhost:3050/docs | API Documentation |
| Frontend | 3000 | http://localhost:3000 | Next.js Dashboard |
| Website | 4321 | http://localhost:4321 | Astro Landing |
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache |
| NATS | 4222 | localhost:4222 | Message broker |
| NATS Dashboard | 8111 | http://localhost:8111 | NATS UI |
| Adminer | 8080 | http://localhost:8080 | PostgreSQL UI |

---

## Testing Conventions

Tests are located in `/back/testing/modules/[module]/` (NOT alongside source files).

**Structure:**
```
internal/app/test/
├── [usecase]_test.go
└── mocks/
    ├── mock_logger.go
    ├── mock_repository.go
```

**Conventions:**
- Use external test package: `package app_test` (not `package app`)
- Use public `New()` constructor
- Logger mock: `MockLogger` with Func fields, `NewMockLogger()` using `zerolog.Nop()`
- Repository mocks: Func fields for each interface method, return zero values when nil

---

## Common Pitfalls

### Backend

❌ Domain with tags or framework imports
❌ Multiple constructors (NewUserHandler, NewOrderHandler)
❌ Using `.Table("users")` instead of GORM models
❌ Creating local `models/` folders
❌ Sharing repositories between modules
❌ List endpoints without pagination
❌ Missing request/, response/, or mappers/ folders

### Frontend

❌ Fetch in domain layer
❌ Client Components with data fetching
❌ Mutations without Server Actions
❌ List views without pagination via searchParams
❌ Instantiating repositories in Client Components

---

## Verification Commands

```bash
# Backend checks
grep -r 'json:"' internal/domain/              # Should be empty (no tags in domain)
grep -r "gorm\|gin" internal/domain/            # Should be empty (no framework imports)
grep -r '\.Table(' internal/infra/secondary/    # Should be empty (use GORM models)
find services -path "*/repository/models" -type d | wc -l  # Should be 0

# Frontend checks
grep -r "fetch\|axios" src/services/*/domain/   # Should be empty (no HTTP in domain)
grep -l "'use client'" src/**/*.tsx | xargs grep -l "fetch("  # Should be empty
```

---

## Environment Variables

### Backend (back/central-reserve/.env)

Required:
- `APP_ENV` - development/production
- `HTTP_PORT` - API port (default: 3050)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

See `.env.example` for complete list.

### Frontend (front/rupu-central/.env)

Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL

---

## Resources

- **Main README:** [README.md](README.md) - System overview
- **Quick Start:** [QUICK_START.md](QUICK_START.md) - Quick reference
- **Makefile Guide:** [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md) - Complete Makefile documentation
- **Architecture Rules:** [.claude/rules/architecture.md](.claude/rules/architecture.md) - Hexagonal Architecture
- **Repository Isolation:** [.claude/rules/repository-isolation.md](.claude/rules/repository-isolation.md) - Module independence
- **GitHub Workflow:** [.claude/rules/github-workflow.md](.claude/rules/github-workflow.md) - GitHub operations
- **Backend README:** [back/central-reserve/README.md](back/central-reserve/README.md) - Backend details
- **ECR Gallery:** https://gallery.ecr.aws/d3a6d4r1/cam/reserve

---

**Last Updated:** 2026-02-14
**Project:** Reserve (Rupü)
**Stack:** Go + Next.js 16 + PostgreSQL + Redis + NATS
