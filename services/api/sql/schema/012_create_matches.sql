-- +goose Up

-- Create match_status ENUM type
DO $$ BEGIN
    CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_match_id VARCHAR(50) UNIQUE NOT NULL, -- ID from API-Football
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    league_id UUID REFERENCES leagues(id),
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(200),
    status match_status NOT NULL DEFAULT 'scheduled',
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    match_minute INTEGER DEFAULT 0,
    referee VARCHAR(200),
    attendance INTEGER,
    weather_conditions VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_different_teams CHECK (home_team_id != away_team_id),
    CONSTRAINT check_non_negative_scores CHECK (home_score >= 0 AND away_score >= 0),
    CONSTRAINT check_match_minute CHECK (match_minute >= 0 AND match_minute <= 120)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_match_id);

-- +goose Down

DROP INDEX IF EXISTS idx_matches_external_id;
DROP INDEX IF EXISTS idx_matches_status;
DROP INDEX IF EXISTS idx_matches_date;
DROP INDEX IF EXISTS idx_matches_league;
DROP INDEX IF EXISTS idx_matches_away_team;
DROP INDEX IF EXISTS idx_matches_home_team;
DROP TABLE IF EXISTS matches;
DROP TYPE IF EXISTS match_status;

