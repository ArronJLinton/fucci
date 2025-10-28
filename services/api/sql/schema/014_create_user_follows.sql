-- +goose Up

-- Create followable_type ENUM for polymorphic follows
DO $$ BEGIN
    CREATE TYPE followable_type AS ENUM ('team', 'player', 'match');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followable_type followable_type NOT NULL,
    followable_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, followable_type, followable_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followable ON user_follows(followable_type, followable_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

-- +goose Down

DROP INDEX IF EXISTS idx_user_follows_created_at;
DROP INDEX IF EXISTS idx_user_follows_followable;
DROP INDEX IF EXISTS idx_user_follows_user_id;
DROP TABLE IF EXISTS user_follows;
DROP TYPE IF EXISTS followable_type;

