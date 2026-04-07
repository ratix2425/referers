## ADDED Requirements

### Requirement: Registro requiere código de referido válido
El sistema SHALL rechazar cualquier intento de registro que no incluya un código de referido correspondiente a un usuario existente. No existe registro libre.

#### Scenario: Registro con código válido
- **WHEN** un visitante accede a `/register?ref=VALID_CODE` y completa el formulario con email y contraseña
- **THEN** el sistema crea el nuevo usuario, lo vincula como hijo del usuario dueño del código, y genera un código de referido único para el nuevo usuario

#### Scenario: Registro sin código de referido
- **WHEN** un visitante accede a `/register` sin parámetro `ref`
- **THEN** el sistema muestra un error indicando que el código de referido es obligatorio y no permite continuar

#### Scenario: Registro con código inexistente
- **WHEN** un visitante envía el formulario con un código de referido que no pertenece a ningún usuario
- **THEN** el sistema retorna error "Código de referido inválido" y no crea el usuario

#### Scenario: Registro con email ya registrado
- **WHEN** un visitante intenta registrarse con un email que ya existe en el sistema
- **THEN** el sistema retorna error "El email ya está registrado" y no crea el usuario

### Requirement: Generación de código de referido al registrarse
El sistema SHALL generar automáticamente un código de referido único para cada nuevo usuario en el momento de su registro. El código SHALL ser inmutable y no expira.

#### Scenario: Código generado es único
- **WHEN** se crea un nuevo usuario
- **THEN** su código de referido no colisiona con ningún código existente en el sistema

#### Scenario: Código persiste indefinidamente
- **WHEN** un usuario se registra
- **THEN** su código de referido es el mismo en todas las sesiones futuras y no tiene fecha de expiración

### Requirement: Un código puede ser usado por múltiples personas
El sistema SHALL permitir que el mismo código de referido sea usado por múltiples personas para registrarse, sin límite de usos.

#### Scenario: Múltiples registros con el mismo código
- **WHEN** tres visitantes distintos se registran usando el mismo código de referido
- **THEN** los tres quedan registrados como hijos directos del usuario dueño del código

### Requirement: Avatar genérico por defecto
El sistema SHALL asignar una imagen de perfil genérica a todo usuario nuevo. No SHALL existir opción de subir imagen de perfil.

#### Scenario: Usuario nuevo tiene avatar genérico
- **WHEN** se crea un nuevo usuario
- **THEN** su perfil muestra un avatar genérico predeterminado sin requerir ninguna acción del usuario
