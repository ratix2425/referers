## ADDED Requirements

### Requirement: Login con email y contraseña
El sistema SHALL autenticar usuarios mediante email y contraseña usando NextAuth.js v5 con Credentials provider. La sesión SHALL persistirse en la base de datos PostgreSQL.

#### Scenario: Login exitoso
- **WHEN** un usuario registrado envía su email y contraseña correctos
- **THEN** el sistema crea una sesión en base de datos, establece una cookie de sesión y redirige al dashboard

#### Scenario: Login con credenciales incorrectas
- **WHEN** un usuario envía email o contraseña incorrectos
- **THEN** el sistema retorna error "Credenciales inválidas" sin revelar cuál campo es incorrecto

#### Scenario: Login con usuario inexistente
- **WHEN** se intenta login con un email que no existe en el sistema
- **THEN** el sistema retorna el mismo error genérico "Credenciales inválidas"

### Requirement: Sesiones persistidas en base de datos
El sistema SHALL almacenar sesiones en PostgreSQL (no JWT en cookie). Las sesiones SHALL ser revocables.

#### Scenario: Sesión persiste entre recargas
- **WHEN** un usuario autenticado recarga la página
- **THEN** permanece autenticado sin necesidad de volver a ingresar credenciales

#### Scenario: Logout invalida la sesión
- **WHEN** un usuario autenticado hace logout
- **THEN** la sesión es eliminada de la base de datos y la cookie invalidada; el usuario es redirigido al login

### Requirement: Protección de rutas autenticadas
El sistema SHALL redirigir al login cualquier acceso a rutas protegidas sin sesión válida.

#### Scenario: Acceso sin autenticación al dashboard
- **WHEN** un visitante no autenticado intenta acceder a `/dashboard`
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Acceso autenticado a rutas públicas
- **WHEN** un usuario autenticado accede a `/login` o `/register`
- **THEN** el sistema lo redirige al dashboard

### Requirement: Arquitectura de auth extensible
El sistema SHALL estar diseñado para agregar providers OAuth (Google, GitHub, etc.) en el futuro sin cambios estructurales.

#### Scenario: Configuración modular de providers
- **WHEN** se agrega un nuevo OAuth provider a la configuración de NextAuth.js
- **THEN** el sistema lo soporta sin cambios en la lógica de sesiones ni en la base de datos
