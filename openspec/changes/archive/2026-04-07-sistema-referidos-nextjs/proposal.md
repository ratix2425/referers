## Why

Las redes de referidos son un mecanismo de crecimiento orgánico efectivo, pero construir un sistema que sea transparente para los participantes —mostrando visualmente su red y su impacto— requiere una arquitectura cuidadosa. Este proyecto crea desde cero una plataforma de referidos con árbol jerárquico visual, acceso restringido por invitación y visibilidad controlada por posición en el árbol.

## What Changes

- Nuevo sistema web completo construido en Next.js (App Router)
- Registro de usuarios exclusivamente mediante código de referido válido
- Cada usuario recibe un código de referido único y permanente al registrarse
- Árbol de referidos visual e interactivo (hasta 15 niveles de profundidad visual)
- Dashboard con estadísticas de red por nivel y árbol colapsable
- Usuario root con visibilidad total del árbol (creado via seed script)
- Autenticación con NextAuth.js v5, Credentials provider y sesiones en PostgreSQL
- Base de datos PostgreSQL con Closure Table para consultas de árbol eficientes
- Arquitectura DDD con bounded contexts separados
- Suite de tests completa (Vitest + Playwright) siguiendo TDD
- Docker Compose para entorno de desarrollo local completo

## Capabilities

### New Capabilities

- `user-registration`: Registro por invitación con código de referido obligatorio; generación de código propio al completar el registro
- `user-authentication`: Login/logout con sesiones persistentes en base de datos; soporte futuro para OAuth sin cambios estructurales
- `referral-tree`: Modelo de árbol jerárquico con Closure Table; inserción de nodos y cálculo de ancestros; profundidad ilimitada en datos, visual hasta nivel 15
- `network-visibility`: Política de visibilidad basada en posición: cada usuario ve solo su subárbol; el root ve el árbol completo
- `tree-visualization`: Árbol visual interactivo con react-d3-tree; nodos colapsables, zoom/pan; badge de hijos ocultos en nodo límite de nivel 15
- `network-stats`: Panel de estadísticas con conteo de referidos agrupado por nivel relativo al usuario actual
- `referral-link`: Generación y copia de link de referido personalizado por usuario

### Modified Capabilities

_(ninguna — proyecto nuevo)_

## Impact

- **Dependencias nuevas**: Next.js, NextAuth.js v5, react-d3-tree, PostgreSQL, Vitest, Playwright, Docker
- **Base de datos**: Esquema nuevo con tablas `users`, `referral_tree`, `referral_ancestors`, `sessions`
- **Infraestructura**: Docker Compose con servicios Next.js, PostgreSQL y pgAdmin
- **No hay sistema existente** que migrar o compatibilidad que mantener
