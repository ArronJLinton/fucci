-- +goose Up

-- Performance indexes for existing tables

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Teams table indexes  
CREATE INDEX IF NOT EXISTS idx_teams_league_id ON teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country);

-- Leagues table indexes
CREATE INDEX IF NOT EXISTS idx_leagues_country ON leagues(country);
CREATE INDEX IF NOT EXISTS idx_leagues_level ON leagues(level);

-- Team managers table indexes
CREATE INDEX IF NOT EXISTS idx_team_managers_user_id ON team_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_team_managers_league_id ON team_managers(league_id);
CREATE INDEX IF NOT EXISTS idx_team_managers_team_id ON team_managers(team_id);

-- Player profiles table indexes
CREATE INDEX IF NOT EXISTS idx_player_profiles_user_id ON player_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_player_profiles_team_id ON player_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_player_profiles_is_verified ON player_profiles(is_verified);

-- Verifications table indexes
CREATE INDEX IF NOT EXISTS idx_verifications_player_profile_id ON verifications(player_profile_id);
CREATE INDEX IF NOT EXISTS idx_verifications_verifier_user_id ON verifications(verifier_user_id);

-- Debates table indexes (these might already exist, but we add them for completeness)
CREATE INDEX IF NOT EXISTS idx_debates_match_id ON debates(match_id);
CREATE INDEX IF NOT EXISTS idx_debates_deleted_at ON debates(deleted_at);

-- Vote table indexes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Comment table indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_match_id ON media(match_id);

-- +goose Down

-- Drop all indexes
DROP INDEX IF EXISTS idx_media_match_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_votes_user_id;
DROP INDEX IF EXISTS idx_debates_deleted_at;
DROP INDEX IF EXISTS idx_debates_match_id;
DROP INDEX IF EXISTS idx_verifications_verifier_user_id;
DROP INDEX IF EXISTS idx_verifications_player_profile_id;
DROP INDEX IF EXISTS idx_player_profiles_is_verified;
DROP INDEX IF EXISTS idx_player_profiles_team_id;
DROP INDEX IF EXISTS idx_player_profiles_user_id;
DROP INDEX IF EXISTS idx_team_managers_team_id;
DROP INDEX IF EXISTS idx_team_managers_league_id;
DROP INDEX IF EXISTS idx_team_managers_user_id;
DROP INDEX IF EXISTS idx_leagues_level;
DROP INDEX IF EXISTS idx_leagues_country;
DROP INDEX IF EXISTS idx_teams_country;
DROP INDEX IF EXISTS idx_teams_league_id;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_email;

