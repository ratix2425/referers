## ADDED Requirements

### Requirement: Modelo de árbol con Closure Table
El sistema SHALL mantener el árbol de referidos usando una Closure Table (`referral_ancestors`) combinada con Adjacency List (`referral_tree`). Cada fila en `referral_ancestors` representa una relación ancestro-descendiente con su profundidad.

#### Scenario: Inserción de nodo nuevo en el árbol
- **WHEN** un nuevo usuario se registra con el código de referido del usuario P
- **THEN** el sistema inserta en `referral_tree` la fila `(nuevo_usuario, P)` e inserta en `referral_ancestors` todas las filas correspondientes: la relación del nodo consigo mismo (depth=0) más una fila por cada ancestro de P incrementando depth en 1

#### Scenario: Consulta de subárbol por usuario
- **WHEN** el sistema necesita obtener todos los descendientes del usuario U
- **THEN** una sola query sobre `referral_ancestors WHERE ancestor_id = U AND depth > 0` retorna todos los descendientes con su profundidad relativa

### Requirement: Profundidad visual máxima de 15 niveles
El sistema SHALL limitar la visualización del árbol a 15 niveles de profundidad desde el nodo raíz de la vista del usuario. Los nodos más allá del nivel 15 NO SHALL aparecer como nodos en el árbol visual.

#### Scenario: Nodo en el límite visual muestra badge de hijos
- **WHEN** un nodo se encuentra exactamente en el nivel 15 de profundidad relativa al viewer y tiene hijos registrados más allá de ese nivel
- **THEN** el nodo muestra un badge con el conteo de sus hijos directos, indicando que hay nodos no renderizados

#### Scenario: Registro más allá del nivel 15 es permitido
- **WHEN** un usuario en nivel 15 comparte su código de referido y alguien se registra con él
- **THEN** el registro se completa exitosamente; el nuevo usuario existe en la base de datos aunque no aparezca en el árbol visual

### Requirement: Usuario root sin nodo padre
El sistema SHALL soportar exactamente un usuario root cuyo nodo en `referral_tree` no tiene `parent_id` (valor NULL). El usuario root SHALL crearse mediante un seed script manual.

#### Scenario: Seed crea usuario root
- **WHEN** se ejecuta el script de seed
- **THEN** se crea un usuario con `is_root = true` y `parent_id = NULL` en `referral_tree`, con una entrada en `referral_ancestors` solo con la relación consigo mismo (depth=0)

#### Scenario: Solo existe un usuario root
- **WHEN** el seed se ejecuta más de una vez
- **THEN** el sistema detecta que ya existe un root y no crea duplicados (idempotente)
