# Sistema de Referidos

Plataforma de referidos con árbol jerárquico visual. Registro solo por invitación, cada usuario ve su propia red hacia abajo.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** con Closure Table para el árbol de referidos
- **NextAuth.js v5** con database sessions
- **react-d3-tree** para visualización del árbol
- **DDD** + **TDD** (Vitest + Playwright)

## Levantar entorno local con Docker

```bash
# 1. Copiar variables de entorno
cp .env.example .env.local

# 2. Levantar todos los servicios
docker-compose up

# Servicios disponibles:
#   App:     http://localhost:3000
#   pgAdmin: http://localhost:5050
#             email: admin@referidos.local / password: admin
```

El contenedor ejecuta automáticamente las migraciones y el seed del usuario root al iniciar.

### Credenciales del usuario root (por defecto)

```
Email:    root@referidos.local
Password: root-change-me
```

Cambia estas variables en el `docker-compose.yml` o en `.env.local`:
```
ROOT_EMAIL=tu@email.com
ROOT_PASSWORD=tu-password-seguro
```

## Desarrollo local (sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Edita DATABASE_URL para apuntar a tu PostgreSQL local

# 3. Correr migraciones y seed
npm run db:migrate
npm run db:seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

## Tests

```bash
# Tests unitarios e integración
npm test

# Tests en modo watch
npm run test:watch

# Tests E2E (requiere servidor corriendo)
npm run test:e2e
```

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router (páginas y API routes)
├── components/             # Componentes UI reutilizables
├── lib/                    # Configuración global (DB pool, auth)
├── middleware.ts           # Protección de rutas
├── modules/
│   ├── identity/           # Bounded Context: usuarios y autenticación
│   │   ├── domain/         # Entidades, VOs, interfaces de repositorio
│   │   ├── application/    # Use cases
│   │   └── infrastructure/ # Implementaciones PostgreSQL
│   ├── referral/           # Bounded Context: árbol de referidos
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── shared/kernel/      # UserId, Result<T>, DomainEvent
└── test/
    ├── setup.ts            # Configuración de Vitest
    └── e2e/                # Tests Playwright
```
