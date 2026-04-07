## ADDED Requirements

### Requirement: Usuario ve solo su subárbol hacia abajo
El sistema SHALL mostrar a cada usuario únicamente los nodos que son descendientes suyos en el árbol de referidos. Un usuario NO SHALL ver a su propio nodo padre, ancestros, ni nodos de otras ramas.

#### Scenario: Usuario ve sus referidos directos e indirectos
- **WHEN** el usuario U solicita ver su red
- **THEN** el sistema retorna todos los usuarios en `referral_ancestors WHERE ancestor_id = U AND depth > 0`

#### Scenario: Usuario no ve nodos fuera de su subárbol
- **WHEN** el usuario U intenta acceder a la información del nodo de su padre o de un nodo en otra rama
- **THEN** el sistema retorna error 403 o simplemente no incluye esos nodos en ninguna respuesta

#### Scenario: Usuario sin referidos ve árbol vacío
- **WHEN** un usuario que aún no ha referido a nadie solicita ver su red
- **THEN** el sistema retorna un árbol vacío con mensaje indicando que aún no tiene referidos

### Requirement: Usuario root ve el árbol completo
El sistema SHALL permitir al usuario con `is_root = true` ver todos los nodos del sistema sin restricción de visibilidad.

#### Scenario: Root obtiene todos los nodos
- **WHEN** el usuario root solicita ver su red
- **THEN** el sistema retorna todos los usuarios registrados organizados en el árbol completo desde su posición

#### Scenario: Root no aparece como nodo en la vista de usuarios normales
- **WHEN** un usuario normal solicita ver su red
- **THEN** el nodo del usuario root NO aparece como nodo en su árbol; la vista del usuario empieza desde su propio nodo

### Requirement: Verificación de visibilidad en API
El sistema SHALL verificar en cada endpoint de red que el usuario autenticado solo puede solicitar datos de su propio subárbol.

#### Scenario: Usuario intenta ver red de otro usuario
- **WHEN** un usuario autenticado hace una petición con el userId de otro usuario que no es descendiente suyo
- **THEN** el sistema retorna 403 Forbidden
