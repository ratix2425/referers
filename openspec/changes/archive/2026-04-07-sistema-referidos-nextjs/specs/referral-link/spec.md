## ADDED Requirements

### Requirement: Código de referido único por usuario
El sistema SHALL asignar a cada usuario un código de referido único en el momento de su registro. El código SHALL ser inmutable y no expira.

#### Scenario: Código es único en el sistema
- **WHEN** se genera un código de referido para un nuevo usuario
- **THEN** el código no existe previamente en la tabla `users.referral_code`

#### Scenario: Código no cambia nunca
- **WHEN** el usuario consulta su código en diferentes sesiones a lo largo del tiempo
- **THEN** siempre obtiene el mismo código

### Requirement: Link de referido compartible
El sistema SHALL construir un link completo de registro usando el código del usuario, con el formato `{BASE_URL}/register?ref={referral_code}`.

#### Scenario: Link se genera correctamente
- **WHEN** el usuario visualiza su link de referido en el dashboard
- **THEN** el link tiene el formato correcto y apunta al formulario de registro pre-cargado con su código

### Requirement: Botón de copiar link
El sistema SHALL proveer un botón que copie el link de referido del usuario al portapapeles con un solo clic.

#### Scenario: Clic en copiar
- **WHEN** el usuario hace clic en el botón de copiar link
- **THEN** el link completo es copiado al portapapeles y se muestra una confirmación visual breve (ej: "¡Copiado!")

#### Scenario: Confirmación desaparece automáticamente
- **WHEN** aparece la confirmación de copiado
- **THEN** el mensaje desaparece automáticamente después de 2-3 segundos volviendo al estado original del botón
