-- Tablas requeridas por NextAuth.js v5 con database sessions adapter
CREATE TABLE IF NOT EXISTS accounts (
  id                  TEXT NOT NULL,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT NOT NULL PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);
