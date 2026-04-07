## ADDED Requirements

### Requirement: Árbol visual interactivo con react-d3-tree
El sistema SHALL renderizar el árbol de referidos del usuario usando react-d3-tree. El árbol SHALL soportar zoom, pan y colapso de nodos.

#### Scenario: Árbol se renderiza desde el nodo del usuario actual
- **WHEN** el usuario accede al dashboard
- **THEN** el árbol visual muestra al usuario actual como nodo raíz de su vista, con sus referidos hacia abajo

#### Scenario: Nodos son colapsables
- **WHEN** el usuario hace clic en un nodo que tiene hijos
- **THEN** los hijos se ocultan/muestran alternadamente (toggle collapse)

#### Scenario: Zoom y pan disponibles
- **WHEN** el árbol tiene más nodos de los que caben en pantalla
- **THEN** el usuario puede hacer scroll para zoom y arrastrar para navegar por el árbol

### Requirement: Badge de hijos ocultos en nodo límite
Los nodos en el nivel visual 15 que tengan hijos registrados SHALL mostrar un badge indicando el número de hijos directos no renderizados.

#### Scenario: Nodo en nivel 15 con hijos muestra badge
- **WHEN** un nodo en profundidad visual 15 tiene al menos un hijo registrado
- **THEN** el nodo muestra visualmente un contador (ej: "+8") indicando cuántos hijos tiene que no se muestran

#### Scenario: Nodo en nivel 15 sin hijos no muestra badge
- **WHEN** un nodo en profundidad visual 15 no tiene hijos registrados
- **THEN** el nodo se muestra sin badge, como cualquier nodo hoja normal

### Requirement: Nodo muestra información básica del usuario
Cada nodo del árbol SHALL mostrar el nombre o email del usuario y su avatar genérico.

#### Scenario: Nodo renderiza datos del usuario
- **WHEN** el árbol se renderiza
- **THEN** cada nodo muestra el avatar genérico y el email (o nombre si disponible) del usuario correspondiente

### Requirement: Diseño visual con paleta amarillo suave y blanco
La interfaz SHALL usar una paleta de colores que combine tonos suaves de amarillo y blanco. Los nodos del árbol SHALL reflejar esta paleta.

#### Scenario: Paleta de colores consistente
- **WHEN** el usuario visualiza el dashboard y el árbol
- **THEN** todos los elementos de UI usan la paleta definida de amarillo suave (#FFF9C4, #FFF176, #FFEE58) y blanco (#FFFFFF, #FAFAFA)
