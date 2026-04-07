## 1. Infraestructura y configuración inicial

- [x] 1.1 Inicializar proyecto Next.js con App Router y TypeScript (`npx create-next-app`)
- [x] 1.2 Configurar Vitest con soporte para TypeScript y path aliases
- [x] 1.3 Configurar Playwright para tests E2E
- [x] 1.4 Crear `docker-compose.yml` con servicios: Next.js (:3000), PostgreSQL (:5432), pgAdmin (:5050)
- [x] 1.5 Crear `Dockerfile` para el servicio Next.js
- [x] 1.6 Configurar variables de entorno (`.env.example`, `.env.local`)
- [x] 1.7 Instalar dependencias: `next-auth`, `pg`, `react-d3-tree`, `bcryptjs`, `nanoid`
- [x] 1.8 Configurar Tailwind CSS con la paleta de colores amarillo suave y blanco

## 2. Base de datos: esquema y migraciones

- [x] 2.1 Crear script de migración para tabla `users` (id, email, password_hash, referral_code, avatar_url, is_root, created_at)
- [x] 2.2 Crear script de migración para tabla `referral_tree` (user_id, parent_id)
- [x] 2.3 Crear script de migración para tabla `referral_ancestors` (ancestor_id, descendant_id, depth)
- [x] 2.4 Crear índices en `referral_ancestors`: `(ancestor_id, depth)` y `(descendant_id)`
- [x] 2.5 Crear tabla `sessions` requerida por NextAuth.js v5
- [x] 2.6 Crear seed script para usuario root (idempotente: no duplicar si ya existe)

## 3. Shared Kernel (DDD)

- [x] 3.1 Crear Value Object `UserId` con validación y tests unitarios
- [x] 3.2 Crear `Result<T>` para manejo de errores sin excepciones
- [x] 3.3 Crear clase base `DomainEvent` con timestamp y eventId
- [x] 3.4 Escribir tests unitarios para UserId y Result<T>

## 4. Bounded Context: Identity

- [x] 4.1 Crear Value Object `Email` con validación de formato y tests unitarios
- [x] 4.2 Crear Value Object `PasswordHash` con método de comparación y tests unitarios
- [x] 4.3 Crear Value Object `ReferralCode` con generación (nanoid) y validación, y tests unitarios
- [x] 4.4 Crear entidad `User` (aggregate root) con todos sus VOs y tests unitarios
- [x] 4.5 Definir interfaz `IUserRepository` en dominio
- [x] 4.6 Implementar `PostgresUserRepository` usando pg
- [x] 4.7 Escribir tests de integración para `PostgresUserRepository` contra PostgreSQL real

## 5. Bounded Context: Referral

- [x] 5.1 Crear entidad `ReferralNode` con depth, parentId, y validación de invariantes
- [x] 5.2 Crear Domain Service `NetworkVisibilityService` con método `canSee(viewer, nodeId)`
- [x] 5.3 Escribir tests unitarios para `ReferralNode` y `NetworkVisibilityService`
- [x] 5.4 Definir interfaces `IReferralTreeRepository` y `IReferralAncestorsRepository`
- [x] 5.5 Implementar `PostgresReferralTreeRepository` (insert en adjacency + closure table)
- [x] 5.6 Implementar lógica de inserción en closure table: copiar ancestros del padre + fila propia
- [x] 5.7 Escribir tests de integración para repositorios de árbol

## 6. Use Cases

- [x] 6.1 Implementar `RegisterUserViaReferral`: validar código → crear User → crear ReferralNode → insertar en closure
- [x] 6.2 Escribir tests unitarios para `RegisterUserViaReferral` (happy path + errores)
- [x] 6.3 Implementar `GetVisibleNetwork`: retorna subárbol del usuario respetando visibilidad
- [x] 6.4 Escribir tests unitarios para `GetVisibleNetwork` (usuario normal vs root)
- [x] 6.5 Implementar `GetNetworkStats`: GROUP BY depth en closure table, retorna conteo por nivel
- [x] 6.6 Escribir tests unitarios para `GetNetworkStats`
- [x] 6.7 Implementar `AuthenticateUser`: validar credenciales, retornar User o error

## 7. Autenticación con NextAuth.js v5

- [x] 7.1 Configurar NextAuth.js v5 con Credentials provider
- [x] 7.2 Conectar `AuthenticateUser` use case al Credentials provider
- [x] 7.3 Configurar adapter para sesiones en PostgreSQL
- [x] 7.4 Crear middleware de Next.js para proteger rutas `/dashboard/*`
- [x] 7.5 Redirigir usuarios autenticados fuera de `/login` y `/register`

## 8. API Routes (Next.js Route Handlers)

- [x] 8.1 Crear `POST /api/users/register` que invoca `RegisterUserViaReferral`
- [x] 8.2 Crear `GET /api/network` que invoca `GetVisibleNetwork` para el usuario autenticado
- [x] 8.3 Crear `GET /api/network/stats` que invoca `GetNetworkStats` para el usuario autenticado
- [x] 8.4 Agregar verificación de visibilidad en `/api/network` (403 si no es subárbol del viewer)

## 9. Páginas y componentes UI

- [x] 9.1 Crear layout raíz con paleta amarillo suave y blanco (Tailwind config)
- [x] 9.2 Crear página `/register` con formulario (email, password, ref code pre-cargado desde query param)
- [x] 9.3 Crear página `/login` con formulario de credenciales
- [x] 9.4 Crear layout del dashboard con sidebar o header de navegación
- [x] 9.5 Crear componente `ReferralLinkCard`: muestra código, link completo y botón copiar con feedback visual
- [x] 9.6 Crear componente `NetworkStatsPanel`: tabla con nivel y conteo, total al final
- [x] 9.7 Crear componente `ReferralTreeView` usando react-d3-tree con custom node renderer
- [x] 9.8 Implementar custom node renderer: avatar genérico, email del usuario, badge de hijos ocultos en nivel 15
- [x] 9.9 Implementar badge de "+N hijos" en nodos en el límite visual de profundidad 15
- [x] 9.10 Crear página `/dashboard` que compone `ReferralLinkCard`, `NetworkStatsPanel` y `ReferralTreeView`
- [x] 9.11 Crear componente de avatar genérico SVG o icono por defecto

## 10. Tests E2E con Playwright

- [x] 10.1 Test E2E: flujo completo de registro con código válido
- [x] 10.2 Test E2E: intento de registro sin código de referido
- [x] 10.3 Test E2E: intento de registro con código inválido
- [x] 10.4 Test E2E: login exitoso y acceso al dashboard
- [x] 10.5 Test E2E: login con credenciales incorrectas
- [x] 10.6 Test E2E: visualización del árbol con al menos 2 niveles
- [x] 10.7 Test E2E: copiar link de referido (verificar portapapeles o feedback visual)

## 11. Docker y despliegue local

- [x] 11.1 Verificar que `docker-compose up` levanta todos los servicios correctamente
- [x] 11.2 Verificar que las migraciones se ejecutan automáticamente al iniciar (entrypoint script)
- [x] 11.3 Verificar que el seed del usuario root funciona y es idempotente
- [x] 11.4 Documentar en README los comandos para levantar el entorno local
