## ADDED Requirements

### Requirement: Carga de nodo refleja profundidad real en el árbol
Al cargar un nodo existente desde el repositorio, el sistema SHALL retornar la profundidad real del nodo (su distancia desde la raíz), no el valor `depth = 0` de la fila de auto-referencia en la closure table.

#### Scenario: Nodo raíz retorna depth 0
- **WHEN** se llama `findByUserId` para el usuario root (sin `parent_id`)
- **THEN** el nodo retornado tiene `depth = 0`

#### Scenario: Nodo de nivel 1 retorna depth 1
- **WHEN** se llama `findByUserId` para un usuario que fue referido directamente por el root
- **THEN** el nodo retornado tiene `depth = 1`

#### Scenario: Nodo de nivel 2 retorna depth 2
- **WHEN** se llama `findByUserId` para un usuario que es nieto del root (nivel 2 en el árbol)
- **THEN** el nodo retornado tiene `depth = 2` y no lanza un error de dominio

#### Scenario: Usuario inexistente retorna null
- **WHEN** se llama `findByUserId` para un `userId` que no existe en `referral_tree`
- **THEN** el repositorio retorna `null`
