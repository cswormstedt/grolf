-- ============================================================
-- PLAYERS
-- ============================================================
CREATE TABLE players (
    id VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    index NUMERIC(4,1) NOT NULL
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    par INTEGER NOT NULL,
    rating NUMERIC(4,1) NOT NULL,
    slope INTEGER NOT NULL
);

-- ============================================================
-- COURSE HOLES (pars + handicaps)
-- ============================================================
CREATE TABLE course_holes (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
    par INTEGER NOT NULL,
    handicap INTEGER NOT NULL,
    UNIQUE(course_id, hole_number)
);

-- ============================================================
-- ROUNDS (1, 2, 3)
-- ============================================================
CREATE TABLE rounds (
    id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 3),
    course_id VARCHAR(50) REFERENCES courses(id)
);

-- ============================================================
-- ROUND GROUP ASSIGNMENTS
-- Two groups per round: g1 and g2
-- ============================================================
CREATE TABLE round_groups (
    id SERIAL PRIMARY KEY,
    round_id INTEGER REFERENCES rounds(id) ON DELETE CASCADE,
    group_number INTEGER NOT NULL CHECK (group_number IN (1, 2)),
    player_id VARCHAR(10) REFERENCES players(id),
    UNIQUE(round_id, group_number, player_id)
);

-- ============================================================
-- GROSS SCORES (per player, per round, per hole)
-- ============================================================
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    round_id INTEGER REFERENCES rounds(id) ON DELETE CASCADE,
    player_id VARCHAR(10) REFERENCES players(id),
    hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
    gross_score INTEGER CHECK (gross_score >= 1),
    UNIQUE(round_id, player_id, hole_number)
);

-- ============================================================
-- Useful Indexes
-- ============================================================
CREATE INDEX idx_scores_round_player ON scores(round_id, player_id);
CREATE INDEX idx_round_groups_round ON round_groups(round_id);
