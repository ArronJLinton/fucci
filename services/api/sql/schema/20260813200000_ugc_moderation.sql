-- +goose Up
-- App Store Guideline 1.2: terms acceptance, user blocks, report triage helpers.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS terms_version TEXT;

CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_blocks_no_self CHECK (blocker_id <> blocked_user_id),
    CONSTRAINT user_blocks_unique UNIQUE (blocker_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_user_id ON user_blocks (blocked_user_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_status_created
    ON content_reports (status, created_at DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_content_reports_status_created;
DROP INDEX IF EXISTS idx_user_blocks_blocked_user_id;
DROP INDEX IF EXISTS idx_user_blocks_blocker_id;
DROP TABLE IF EXISTS user_blocks;
ALTER TABLE users DROP COLUMN IF EXISTS terms_version;
ALTER TABLE users DROP COLUMN IF EXISTS terms_accepted_at;
