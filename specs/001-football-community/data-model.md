# Data Model: Football Community Platform

**Date**: 2025-01-23  
**Feature**: Football Community Platform  
**Database**: PostgreSQL with Redis caching

## Entity Overview

The data model supports 7 core entities with relationships that enable the platform's key features: live match tracking, AI-powered debates, community team management, and social engagement.

## Core Entities

### 1. User

**Purpose**: Platform users with role-based access control

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'fan',
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE user_role AS ENUM ('fan', 'team_manager', 'admin');
```

**Relationships**:

- One-to-many with `user_follows` (followed teams/matches)
- One-to-many with `debate_responses` (user contributions)
- One-to-many with `stories` (user-generated content)
- One-to-many with `reports` (content reports)

**Validation Rules**:

- Email must be valid format and unique
- Password must meet security requirements
- Display name must be 1-100 characters
- Role must be one of: fan, team_manager, admin

**State Transitions**:

- `pending` → `verified` (email verification)
- `active` → `suspended` → `active` (admin actions)

### 2. Team

**Purpose**: Professional and community football teams

```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(10),
    logo_url TEXT,
    banner_url TEXT,
    team_type team_type NOT NULL,
    league_id UUID REFERENCES leagues(id),
    founded_year INTEGER,
    home_venue VARCHAR(200),
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE team_type AS ENUM ('professional', 'community');
```

**Relationships**:

- Many-to-one with `leagues` (team belongs to league)
- One-to-many with `players` (team has players)
- One-to-many with `matches` (team participates in matches)
- Many-to-many with `users` via `user_follows` (users follow teams)
- One-to-many with `team_managers` (team management)

**Validation Rules**:

- Name must be 1-200 characters
- Short name must be 1-10 characters
- Founded year must be valid (1800-2025)
- Team type must be professional or community

### 3. Player

**Purpose**: Individual players with statistics and team associations

```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    jersey_number INTEGER,
    date_of_birth DATE,
    nationality VARCHAR(100),
    height_cm INTEGER,
    weight_kg INTEGER,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- Many-to-one with `teams` (player belongs to team)
- One-to-many with `player_stats` (player statistics)
- Many-to-many with `users` via `user_follows` (users follow players)

**Validation Rules**:

- First and last name must be 1-100 characters
- Jersey number must be 1-99
- Date of birth must be valid
- Height must be 150-220 cm
- Weight must be 50-150 kg

### 4. Match

**Purpose**: Football matches with live data and statistics

```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID REFERENCES teams(id) NOT NULL,
    away_team_id UUID REFERENCES teams(id) NOT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
```

**Relationships**:

- Many-to-one with `teams` (home and away teams)
- Many-to-one with `leagues` (match belongs to league)
- One-to-many with `match_events` (goals, cards, substitutions)
- One-to-many with `debates` (AI-generated debates)
- One-to-many with `stories` (match-related stories)
- Many-to-many with `users` via `user_follows` (users follow matches)

**Validation Rules**:

- Home and away teams must be different
- Match date must be in the future for scheduled matches
- Scores must be non-negative integers
- Match minute must be 0-120

**State Transitions**:

- `scheduled` → `live` → `finished`
- `scheduled` → `postponed` → `scheduled`
- `scheduled` → `cancelled`

### 5. Debate

**Purpose**: AI-generated discussion topics with user engagement

```sql
CREATE TABLE debates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    side_a_title VARCHAR(100) NOT NULL,
    side_b_title VARCHAR(100) NOT NULL,
    side_a_description TEXT NOT NULL,
    side_b_description TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT TRUE,
    generation_prompt TEXT,
    bias_score DECIMAL(3,2), -- 0.00 to 1.00
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- Many-to-one with `matches` (debate about specific match)
- One-to-many with `debate_responses` (user responses)
- One-to-many with `debate_votes` (user voting)

**Validation Rules**:

- Title must be 1-300 characters
- Description must be 1-2000 characters
- Side titles must be 1-100 characters
- Bias and quality scores must be 0.00-1.00

### 6. Story

**Purpose**: Ephemeral media content (24-hour lifespan)

```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    match_id UUID REFERENCES matches(id),
    team_id UUID REFERENCES teams(id),
    content_type story_type NOT NULL,
    media_url TEXT NOT NULL,
    caption TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE story_type AS ENUM ('photo', 'video', 'text');
```

**Relationships**:

- Many-to-one with `users` (story creator)
- Many-to-one with `matches` (optional match association)
- Many-to-one with `teams` (optional team association)
- One-to-many with `story_views` (view tracking)

**Validation Rules**:

- Media URL must be valid
- Caption must be ≤ 500 characters
- Expires at must be 24 hours from creation
- Content type must be photo, video, or text

**State Transitions**:

- `active` → `expired` (automatic after 24 hours)

### 7. Community

**Purpose**: Grassroots football groups and local engagement

```sql
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    logo_url TEXT,
    banner_url TEXT,
    member_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- One-to-many with `teams` (community has teams)
- Many-to-many with `users` via `community_members` (community members)

## Supporting Entities

### User Follows

**Purpose**: Track user subscriptions to teams, players, and matches

```sql
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    followable_type followable_type NOT NULL,
    followable_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, followable_type, followable_id)
);

CREATE TYPE followable_type AS ENUM ('team', 'player', 'match');
```

### Debate Responses

**Purpose**: User contributions to debates

```sql
CREATE TABLE debate_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID REFERENCES debates(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    side_chosen VARCHAR(10) CHECK (side_chosen IN ('side_a', 'side_b')),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Match Events

**Purpose**: Track match events (goals, cards, substitutions)

```sql
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) NOT NULL,
    event_type event_type NOT NULL,
    minute INTEGER NOT NULL,
    player_id UUID REFERENCES players(id),
    team_id UUID REFERENCES teams(id) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE event_type AS ENUM ('goal', 'yellow_card', 'red_card', 'substitution', 'penalty');
```

### Reports

**Purpose**: User reports for content moderation

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) NOT NULL,
    reportable_type reportable_type NOT NULL,
    reportable_id UUID NOT NULL,
    reason report_reason NOT NULL,
    description TEXT,
    status report_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE reportable_type AS ENUM ('debate', 'debate_response', 'story', 'user');
CREATE TYPE report_reason AS ENUM ('spam', 'harassment', 'inappropriate_content', 'fake_team', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
```

## Indexes

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Team queries
CREATE INDEX idx_teams_type ON teams(team_type);
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_teams_active ON teams(is_active);

-- Match queries
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);

-- Follow relationships
CREATE INDEX idx_user_follows_user ON user_follows(user_id);
CREATE INDEX idx_user_follows_followable ON user_follows(followable_type, followable_id);

-- Debate engagement
CREATE INDEX idx_debate_responses_debate ON debate_responses(debate_id);
CREATE INDEX idx_debate_responses_user ON debate_responses(user_id);

-- Story queries
CREATE INDEX idx_stories_expires ON stories(expires_at);
CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_match ON stories(match_id);
```

## Data Validation

### Business Rules

1. **User Management**:

   - Team managers require admin verification before access
   - Users can only have one role at a time
   - Inactive users cannot create content

2. **Match Data**:

   - Live matches must have valid team IDs
   - Scores cannot be negative
   - Match events must occur within valid time range

3. **Content Moderation**:

   - AI-generated debates must pass bias detection
   - User content must pass toxicity screening
   - Stories automatically expire after 24 hours

4. **Offline Sync**:
   - User actions queued when offline
   - Conflict resolution for concurrent edits
   - Data freshness indicators for cached content

## Caching Strategy

### Redis Cache Keys

```redis
# Match data (5 days TTL)
match:{match_id} -> match object
matches:live -> list of live match IDs
matches:upcoming -> list of upcoming match IDs

# Debate data (1 hour TTL)
debate:{debate_id} -> debate object
debates:match:{match_id} -> list of debate IDs

# User data (24 hours TTL)
user:{user_id} -> user object
user_follows:{user_id} -> list of followed items

# Team data (24 hours TTL)
team:{team_id} -> team object
team_players:{team_id} -> list of player IDs
```

## Migration Strategy

### Version 1.0 Schema

1. Create core tables (users, teams, players, matches)
2. Add relationship tables (user_follows, team_managers)
3. Add content tables (debates, stories, reports)
4. Create indexes for performance
5. Set up Redis cache structure

### Future Enhancements

- Player statistics aggregation
- Advanced analytics tables
- Notification preferences
- Team management permissions
- Content recommendation engine
