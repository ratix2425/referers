## Context

Proyecto nuevo sin sistema existente. Se construye una plataforma de referidos con árbol jerárquico desde cero usando Next.js App Router, PostgreSQL y arquitectura DDD. El árbol puede crecer hasta 15 niveles de profundidad visual con ancho ilimitado en cada nivel. La visibilidad de cada usuario está restringida a su propio subárbol.

## Goals / Non-Goals

**Goals:**
- Registro restringido por código de referido válido
- Árbol de referidos con Closure Table para queries O(1) de visibilidad
- Visualización interactiva del árbol con react-d3-tree
- Autenticación extensible (NextAuth.js v5) preparada para OAuth futuro
- Arquitectura DDD con bounded contexts separados y testable con TDD
- Docker Compose completo para desarrollo local

**Non-Goals:**
- Upload de imágenes de perfil (avatar genérico por defecto)
- Búsqueda de usuarios dentro del árbol
- Notificaciones o emails
- Sistema de recompensas o gamificación
- Panel de administración más allá del usuario root
- Mobile app

## Decisions

### 1. PostgreSQL: Closure Table para el árbol de referidos

**Decisión**: Usar Closure Table (`referral_ancestors`) combinada con Adjacency List (`referral_tree`).

**Alternativas consideradas**:
- *Adjacency List + CTEs recursivos*: Simple pero O(n) en cada consulta de subárbol; con 15 niveles y ancho ilimitado puede ser costoso.
- *Materialized Path*: Frágil si el árbol se reorganiza; no aplicable aquí.
- *Closure Table*: Una sola query con JOIN para obtener cualquier subárbol o contar nodos por nivel.

**Rationale**: La operación más frecuente es `getVisibleNetwork(userId)` — obtener todo el subárbol del usuario actual. Con Closure Table esto es:
```sql
SELECT descendant_id, depth FROM referral_ancestors
WHERE ancestor_id = :userId AND depth > 0
```
Una query, sin recursión. El costo de inserción (máximo 16 rows por usuario nuevo) es negligible.

### 2. Autenticación: NextAuth.js v5 con Database Sessions

**Decisión**: NextAuth.js v5 (Auth.js), Credentials provider, sesiones persistidas en PostgreSQL.

**Alternativas consideradas**:
- *JWT sessions*: Sin DB lookup por request, pero no revocables. Si un usuario abusa del sistema de referidos, no se puede invalidar su sesión activa.
- *Implementación custom*: Control total pero reinventar la rueda; migración a OAuth compleja después.
- *NextAuth.js v5 + DB sessions*: Revocable, auditable, extensible. Agregar Google/GitHub OAuth en el futuro es solo añadir un provider en la config.

**Rationale**: Seguridad (revocación) y extensibilidad futura pesan más que el marginal overhead de un DB lookup por request.

### 3. Visualización: react-d3-tree

**Decisión**: `react-d3-tree` para el árbol visual interactivo.

**Alternativas consideradas**:
- *Mermaid flowchart*: No interactivo, no colapsable, mal rendimiento con árboles grandes.
- *React Flow*: Excelente pero diseñado para grafos genéricos; nodos de árbol requieren lógica custom.
- *D3 directo*: Control total pero complejidad alta; curva de aprendizaje significativa.
- *react-d3-tree*: Diseñado específicamente para árboles jerárquicos, soporte nativo de colapso, zoom/pan, y custom node rendering.

**Rationale**: `react-d3-tree` resuelve exactamente este caso sin complejidad extra. El custom node rendering permite agregar el badge de "hijos ocultos" en nodos del nivel 15.

### 4. Arquitectura: DDD con Bounded Contexts

**Decisión**: Dos bounded contexts principales — `identity` y `referral` — con shared kernel.

```
src/modules/
├── identity/           # User, autenticación
│   ├── domain/
│   │   ├── entities/User.ts
│   │   └── value-objects/  Email, PasswordHash, ReferralCode
│   ├── application/use-cases/
│   └── infrastructure/repositories/
├── referral/           # Árbol, visibilidad, stats
│   ├── domain/
│   │   ├── entities/ReferralNode.ts
│   │   └── services/NetworkVisibilityService.ts
│   ├── application/use-cases/
│   └── infrastructure/repositories/
└── shared/kernel/      # UserId, DomainEvent, Result<T>
```

**Rationale**: El dominio de identidad (quién eres) y el de referidos (dónde estás en el árbol) cambian por razones distintas. Separados desde el inicio evita acoplamiento que sería costoso deshacer.

### 5. Testing: Vitest + Playwright

**Decisión**: Vitest para unit e integration tests, Playwright para E2E.

**Rationale**: Vitest es compatible nativamente con el ecosistema Vite/Next.js y tiene mejor DX que Jest para TypeScript. Los tests de dominio no necesitan DB; los de repositorio usan PostgreSQL real (sin mocks) para evitar divergencias entre test y producción.

### 6. Nivel 15: límite visual, no de datos

**Decisión**: El registro funciona más allá del nivel 15. Los nodos en el límite visual muestran un badge con el conteo de hijos directos que no se renderizan.

**Rationale**: Bloquear el registro sería un freno al crecimiento orgánico. El límite visual protege el rendimiento del renderizado (react-d3-tree con miles de nodos en pantalla). El badge mantiene la transparencia sin sacrificar rendimiento.

## Risks / Trade-offs

- **Closure Table crece cuadráticamente** → Con 15 niveles y ancho N, `referral_ancestors` puede ser grande. Mitigación: índices en `(ancestor_id, depth)` y `(descendant_id)`. Particionar si escala mucho.
- **root ve árbol completo** → Si hay miles de nodos, la query del root es costosa. Mitigación: paginación lazy o carga por subtree en el futuro; por ahora, scope inicial es pequeño.
- **react-d3-tree con DOM grande** → Renderizar cientos de nodos puede degradar el rendimiento. Mitigación: colapso de nodos por defecto a partir de cierto nivel, zoom/pan para navegación.
- **NextAuth.js v5 en App Router** → v5 está en beta/RC activa; puede tener cambios de API. Mitigación: fijar versión exacta en package.json y revisar changelog antes de actualizar.

## Migration Plan

Proyecto nuevo — no hay migración de datos existentes.

**Orden de deploy inicial:**
1. Levantar PostgreSQL y correr migraciones
2. Correr seed script para crear usuario root
3. Deploy de Next.js app
4. Verificar registro con código del root

**Rollback**: Al ser un proyecto nuevo, rollback = no deploying.

## Open Questions

- ¿El usuario root tiene acceso a un panel especial o usa el mismo dashboard con vista expandida?
- ¿Se necesitará algún tipo de rate limiting en el endpoint de registro para evitar abuso del código de referido?
