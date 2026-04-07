-- Closure Table: almacena todas las relaciones ancestro-descendiente con su profundidad
CREATE TABLE IF NOT EXISTS referral_ancestors (
  ancestor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  descendant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  depth         INTEGER NOT NULL CHECK (depth >= 0),
  PRIMARY KEY (ancestor_id, descendant_id)
);

-- Índices para las queries más frecuentes
CREATE INDEX IF NOT EXISTS idx_ra_ancestor_depth ON referral_ancestors(ancestor_id, depth);
CREATE INDEX IF NOT EXISTS idx_ra_descendant ON referral_ancestors(descendant_id);
