CREATE TABLE IF NOT EXISTS puzzles (
    date TEXT PRIMARY KEY,
    letters TEXT NOT NULL,
    board TEXT NOT NULL,
    distribution TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puzzle_date TEXT NOT NULL,
    user_id TEXT,
    word TEXT NOT NULL,
    placement TEXT NOT NULL,
    score INTEGER NOT NULL,
    percentile REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(puzzle_date, user_id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
