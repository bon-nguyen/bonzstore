---
name: project-architecture
description: |
  Full-stack monorepo architecture guide for projects using React (Vite) + NestJS + Prisma + PostgreSQL.
  Use this skill when: starting a new project with the same tech stack, implementing a new feature end-to-end,
  reviewing code structure, or onboarding to an existing codebase. Contains canonical patterns for
  folder structure, API design, data flow, component patterns, and CI/CD deployment.
---

# Project Architecture Guide (Vite + NestJS + Prisma Monorepo)

This document describes the full technical architecture used across projects sharing this tech stack.
Follow these patterns **exactly** when implementing new features or bootstrapping a new project.

---

## 1. Monorepo Structure

```text
root/
├── apps/
│   ├── api/          # NestJS Backend
│   └── web/          # React (Vite) Frontend
├── package.json       # Root: Turborepo scripts
├── turbo.json         # Turbo pipeline config (ui: "stream")
├── docker-compose.yml          # Local Dev: runs Postgres + Redis only
├── docker-compose.prod.yml     # Production: pulls pre-built images
├── .github/workflows/
│   ├── dev.yml                 # CI: Lint + Test on push to `development`
│   └── deploy-testing.yml      # CD: Build images + SSH deploy on push to `main`
└── .agents/skills/             # AI assistant documentation
```

**Root `package.json` scripts:**

```json
{
  "dev": "docker compose up -d postgres redis && turbo run dev",
  "build": "turbo run build",
  "lint": "turbo run lint"
}
```

---

## 2. Backend Architecture (NestJS - `apps/api`)

### 2.1 Folder Structure

```text
apps/api/src/
├── main.ts                   # Bootstrap: CORS, Swagger, Helmet, Compression, GlobalPipes
├── app.module.ts             # Root module with ConfigModule + Joi validation
├── common/
│   ├── decorators/           # @Public(), @CurrentUser(), @Roles()
│   ├── dto/                  # Shared DTOs (PaginationQueryDto)
│   ├── filters/              # AllExceptionsFilter (global)
│   ├── guards/               # JwtAuthGuard, RolesGuard
│   └── interceptors/         # LoggingInterceptor, TransformInterceptor, TimeoutInterceptor
├── database/
│   ├── prisma.module.ts
│   └── prisma.service.ts     # Wraps PrismaClient, use `this.prisma.client.xxx`
└── modules/
    ├── auth/
    ├── users/
    ├── factories/
    ├── equipments/
    ├── checklists/
    ├── roles/
    ├── health/
    └── queue/                # BullMQ via Redis
```

### 2.2 Module Pattern (Canonical)

Every feature module follows this exact structure:

```text
modules/[feature]/
├── [feature].module.ts     # @Module({ imports: [PrismaModule], controllers, providers, exports })
├── [feature].controller.ts # @Controller('[feature]'), @ApiTags, @Public or @UseGuards
├── [feature].service.ts    # @Injectable(), Logger, PrismaService
└── dto/
    ├── create-[feature].dto.ts
    ├── update-[feature].dto.ts
    ├── [feature]-query.dto.ts   # extends PaginationQueryDto with custom filters
    └── [feature]-response.dto.ts
```

### 2.3 API Controller Pattern

```typescript
@ApiTags('factories')
@Controller('factories')
@Public()  // Remove when auth is enforced; use @UseGuards(JwtAuthGuard) instead
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @Get('stats')               // MUST be before /:id to avoid route conflict
  async getStats() { ... }

  @Get()
  async findAll(@Query() query: FactoryQueryDto) { ... }

  @Get(':id')
  async findOne(@Param('id') id: string) { ... }

  @Post()
  async create(@Body() dto: CreateFactoryDto) { ... }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFactoryDto) { ... }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) { ... }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() dto: BulkDeleteDto) { ... }
}
```

### 2.4 Service Pattern

```typescript
@Injectable()
export class FactoriesService {
  private readonly logger = new Logger(FactoriesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FactoryQueryDto) {
    const { skip, take, sortBy, sortOrder, status, search } = query;
    const where: any = {};
    // Build where clause...
    const [data, total] = await Promise.all([  // Always parallel!
      this.prisma.client.factory.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder }, include: { _count: { select: { equipments: true } } } }),
      this.prisma.client.factory.count({ where }),
    ]);
    return {
      data: data.map(this.transformEntity),
      meta: { page, limit, total, totalPages, hasNextPage, hasPreviousPage },
    };
  }

  private transformEntity(entity: any) {  // Always transform DB model → frontend shape
    return { id: entity.id, ..., equipmentCount: entity._count?.equipments || 0 };
  }
}
```

### 2.5 DTO Patterns

**Query DTO** (extends base pagination):

```typescript
export class FactoryQueryDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 10;
  @IsOptional() sortBy?: string = "createdAt";
  @IsOptional() sortOrder?: "asc" | "desc" = "desc";
  @IsOptional() search?: string;
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: FactoryStatus[];

  get skip() {
    return (this.page - 1) * this.limit;
  }
  get take() {
    return this.limit;
  }
}
```

### 2.6 `main.ts` Global Setup (Always Apply)

```typescript
app.setGlobalPrefix('api');
app.enableCors({ origin: [...], credentials: true });
app.use(helmet());
app.use(compression());
app.useGlobalFilters(new AllExceptionsFilter());
app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor(), new TransformInterceptor(), new ClassSerializerInterceptor(reflector));
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
app.enableShutdownHooks();
```

### 2.7 Prisma Configuration

- Client generated to `./prisma/generated/prisma`
- Access via `PrismaService.client` (not directly `new PrismaClient()`)
- Config file: `apps/api/prisma.config.ts` → reads `DATABASE_URL` from env
- **Docker build fix**: Set `DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"` inline when running `npx prisma generate` in Dockerfile (avoids PrismaConfigEnvError during build)
- Migration command: `npx prisma migrate deploy` runs in the Docker CMD on startup

---

## 3. Frontend Architecture (React + Vite - `apps/web`)

### 3.1 Folder Structure

```text
apps/web/src/
├── App.tsx                   # Root: QueryClientProvider > ThemeProvider > BrowserRouter > Routes
├── main.tsx
├── index.css                 # Global CSS: Tailwind + CSS variables (theme tokens)
├── api/
│   ├── client.ts             # Axios instance with request/response interceptors, Bearer token
│   ├── endpoints/            # [entity].api.ts — one file per resource
│   └── types/                # TypeScript types for API shapes
├── components/
│   ├── layout/               # MainLayout, AppSidebar, AppHeader, MobileHeader, BottomNav
│   └── ui/                   # Shadcn/UI components
├── features/                 # Feature-first organization (main working area)
│   ├── [feature]/
│   │   ├── components/       # Feature-specific UI components
│   │   ├── hooks/            # React Query hooks (useFactories, useCreateFactory, etc.)
│   │   └── handlers/         # Business event handlers
│   └── shared/               # Cross-feature components: ResponsiveTable, StatusBadge, PageHeader
├── pages/                    # Route-level page components (thin wrappers)
├── hooks/                    # Global hooks: use-mobile, use-data-table-state
├── config/
│   └── env.ts                # Zod-validated env config (VITE_API_URL only)
└── lib/
    └── utils.ts              # cn() and other utilities
```

### 3.2 API Layer Pattern

**`src/api/endpoints/[entity].api.ts`** — Pure functions talking to REST API:

```typescript
import { apiClient } from "../client";
export const factoriesApi = {
  getAll: (params?: FactoryQueryParams) => apiClient.get("/factories", { params }),
  getById: (id: string) => apiClient.get(`/factories/${id}`),
  create: (data: CreateFactoryDto) => apiClient.post("/factories", data),
  update: (id: string, data: UpdateFactoryDto) => apiClient.patch(`/factories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/factories/${id}`),
  bulkDelete: (ids: string[]) => apiClient.post("/factories/bulk-delete", { ids }),
  getStats: () => apiClient.get("/factories/stats"),
};
```

**`apiClient`** in `src/api/client.ts`:

- Base URL from `env.API_URL` (compiled from `VITE_API_URL` at build time)
- Attaches `Authorization: Bearer <token>` from `localStorage.getItem('auth_token')`
- Response interceptor unwraps `response.data` directly
- Handles 401 (clear token), 403 (log denied)

### 3.3 React Query Hooks Pattern

**`src/features/[feature]/hooks/use[Entity]s.ts`** — Read hooks (useQuery):

```typescript
export function useFactories(params?: FactoryQueryParams) {
  return useQuery({
    queryKey: ["factories", params],
    queryFn: () => factoriesApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
```

**Mutation hooks** (useMutation):

```typescript
export function useCreateFactory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFactoryDto) => factoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] }); // Invalidate list
      toast.success("Tạo nhà máy thành công");
    },
    onError: (error) => toast.error("Tạo thất bại"),
  });
}
```

**Available hook types per feature:**

- `use[Entity]s(params)` — paginated list
- `use[Entity](id)` — single item
- `use[Entity]Stats()` — dashboard stats
- `useCreate[Entity]()` — POST mutation
- `useUpdate[Entity]()` — PATCH mutation
- `useDelete[Entity]()` — DELETE mutation
- `useBulkDelete[Entity]s()` — POST bulk-delete mutation
- `use[Entity]Columns()` — TanStack Table column definitions
- `use[Entity]Form()` — React Hook Form + Zod validation logic
- `use[Entity]TableState()` — URL-synced table state (sorting, pagination, filters)

### 3.4 Theme & CSS System

- Uses **Tailwind CSS** with custom CSS variable tokens
- Theme: `light` (default) + `dark` (industrial CMMS theme)
- Primary color: **Teal/Cyan** (`--primary: 168 76% 36%`)
- Dark background: `220 20% 14%`
- Provider: `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>` (next-themes)
- Toggle: `ThemeToggle` component in `features/shared/ThemeToggle.tsx`

**Key CSS class patterns:**

```css
.table-header-cell    /* Table header cells */
.table-row-interactive /* Hoverable table row */
```

### 3.5 Layout Pattern (Responsive)

```
Desktop: AppSidebar (fixed left, collapsible to 64px) + AppHeader (top) + main content
Mobile:  MobileHeader (top, with back button) + main content + BottomNav (fixed bottom)
```

`useIsMobile()` hook drives layout switching. On mobile, `<PageTransition>` wraps `<Outlet>`.

### 3.6 ResponsiveTable Component

Located at `features/shared/ResponsiveTable.tsx`. Renders a full desktop table OR mobile card stack.

```typescript
interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  mobileRender?: (item: T) => ReactNode; // Optional mobile override
  showOnMobile?: boolean;
  isPrimary?: boolean; // Bold top-left on card
  isSecondary?: boolean; // Second title on card
}
```

### 3.7 Environment Variables

- **`VITE_API_URL`** — Only Vite env var. Must be set at **build time** (baked into static JS bundle).
- Never set at runtime on VPS; it must be in GitHub Secrets so the CI/CD build can inject it.
- Validated via Zod in `src/config/env.ts`.

---

## 4. Shared Data Patterns

### 4.1 Pagination Response Shape (Always)

```json
{
  "data": [...],
  "meta": {
    "page": 1, "limit": 10, "total": 42,
    "totalPages": 5, "hasNextPage": true, "hasPreviousPage": false
  }
}
```

### 4.2 Status Enums

- **Always uppercase in DB and API**: `ACTIVE`, `INACTIVE`, `MAINTENANCE`, `LOCKED`
- Frontend StatusBadge renders lowercase display labels

### 4.3 Entity ID

- All entities use UUID (`@default(uuid())`) as string primary key

---

## 5. Deployment Architecture

### 5.1 Docker Setup

- **Local Dev**: `docker-compose.yml` runs only Postgres + Redis. API and Web run via `yarn dev` (Turborepo).
- **Production**: `docker-compose.prod.yml` pulls pre-built images. No `build:` directives—only `image:`.
  - Container naming: `cmms-api-${TENANT_NAME}`, `cmms-web-${TENANT_NAME}`
  - Networks: internal `app-network` + external `global-proxy-network`

### 5.2 CI/CD Pipeline

**`.github/workflows/dev.yml`**: Triggered on push to `development` or PR to `development`/`main`.

- Runs: Lint → Unit Tests → E2E Tests (with Postgres + Redis services)
- Currently disabled with `if: false` (skip when needed)

**`.github/workflows/deploy-testing.yml`**: Triggered on push to `main`.

- Builds API image → pushes to DockerHub as `[username]/cmms-api:latest`
- Builds Web image (with `VITE_API_URL` build arg) → pushes as `[username]/cmms-web:latest`
- SSHs into VPS → `cd /opt/deployments/clients/[app] && docker compose pull && docker compose up -d --remove-orphans`

### 5.3 VPS Multi-Tenant Layout

```text
/opt/deployments/
├── proxy/                    # Nginx Proxy Manager (jc21/nginx-proxy-manager)
│   └── docker-compose.yml    # Ports: 80, 81 (admin), 443
└── clients/
    └── [tenant-name]/        # One folder per customer
        ├── docker-compose.yml  # Copy of docker-compose.prod.yml
        └── .env               # chmod 600 — DB, JWT, CORS secrets
```

### 5.4 Required GitHub Secrets

| Secret                | Used In | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| `DOCKERHUB_USERNAME`  | deploy  | DockerHub account name                       |
| `DOCKERHUB_TOKEN`     | deploy  | DockerHub access token (not password)        |
| `VITE_API_URL`        | build   | Frontend API base URL (baked into JS bundle) |
| `SERVER_HOST`         | deploy  | VPS public IP                                |
| `SERVER_USERNAME`     | deploy  | SSH user (`root` or `ubuntu`)                |
| `SERVER_SSH_PASSWORD` | deploy  | SSH password                                 |
| `SERVER_SSH_KEY`      | deploy  | SSH private key (PEM format)                 |

### 5.5 VPS `.env` Required Variables

```env
DOCKERHUB_USERNAME=xxx
TENANT_NAME=xxx           # Used in container_name suffix
DB_NAME=xxx_prod_db
DB_USER=xxx_admin
DB_PASSWORD=xxx
JWT_SECRET=xxx
CORS_ORIGIN=https://domain.com
```

---

## 6. Adding a New Feature (End-to-End Checklist)

### Backend

1. Add model to `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_[feature]`
3. Create `src/modules/[feature]/` with: module, controller, service, and 4 DTOs
4. Register module in `app.module.ts`
5. Add Swagger tags in `main.ts`

### Frontend

1. Create types in `src/api/types/[entity].types.ts`
2. Create `src/api/endpoints/[entity].api.ts`
3. Create `src/features/[feature]/hooks/` with useQuery and useMutation hooks
4. Create page component in `src/pages/[EntityList].tsx` and `[EntityForm].tsx`
5. Add routes in `src/App.tsx`
6. Add nav link in `AppSidebar` and `BottomNav` navigation arrays
