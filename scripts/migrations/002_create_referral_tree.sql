CREATE TABLE IF NOT EXISTS referral_tree (
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_tree_parent ON referral_tree(parent_id);
