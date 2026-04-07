## ADDED Requirements

### Requirement: Conteo de referidos agrupado por nivel relativo
El sistema SHALL calcular y mostrar el número de referidos que tiene el usuario en cada nivel relativo a su posición (nivel 1 = referidos directos, nivel 2 = referidos de sus referidos, etc.).

#### Scenario: Usuario con referidos en múltiples niveles
- **WHEN** el usuario accede al panel de estadísticas
- **THEN** el sistema muestra una fila por cada nivel donde tiene al menos un referido, con el conteo correspondiente (ej: "Nivel 1: 3", "Nivel 2: 12", "Nivel 3: 7")

#### Scenario: Total de referidos
- **WHEN** el sistema muestra las estadísticas por nivel
- **THEN** también muestra el total acumulado de todos los referidos en todos los niveles

#### Scenario: Usuario sin referidos
- **WHEN** un usuario sin referidos accede al panel de estadísticas
- **THEN** el sistema muestra "0 referidos" sin filas de niveles

#### Scenario: Query eficiente con closure table
- **WHEN** el sistema calcula estadísticas para el usuario U
- **THEN** ejecuta una sola query: `SELECT depth, COUNT(*) FROM referral_ancestors WHERE ancestor_id = U AND depth > 0 GROUP BY depth ORDER BY depth`

### Requirement: Estadísticas visibles solo de la red propia
El sistema SHALL calcular estadísticas únicamente sobre los descendientes del usuario autenticado, respetando la política de visibilidad.

#### Scenario: Estadísticas no incluyen nodos fuera del subárbol
- **WHEN** el usuario U solicita sus estadísticas
- **THEN** los conteos solo incluyen usuarios que son descendientes de U, nunca de otras ramas ni ancestros
