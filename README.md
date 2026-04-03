# Slate

A daily word game. Score words on a 5-slot board with letter multipliers.

## Project Structure

```
slate/
├── frontend/        React + Vite + Tailwind (placeholder UI)
├── backend/
│   ├── src/
│   │   ├── routes/      Express API routes
│   │   ├── engine/      Scoring engine (puzzle gen, word list, scorer)
│   │   ├── db/          SQLite schema
│   │   └── server.js    Express server (port 3001)
│   ├── data/            SOWPODS word list + SQLite DB
│   └── package.json
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm start        # runs on port 3001
npm run dev      # runs with --watch for auto-reload
npm test         # runs the engine test
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # runs on port 5173, proxies /api to backend
```

## API Endpoints

- `GET  /api/puzzle/today` — get today's puzzle (letters + board)
- `POST /api/score` — submit a word: `{ word, placement, userId? }`
- `GET  /api/reveal?userId=` — reveal top words (after submitting)
- `POST /api/user/register` — register: `{ email }`
- `GET  /api/user/:id/streak` — get user streak info
- `GET  /api/health` — health check

## Game Rules

- Each day a new puzzle is generated: 10 random letters and a 5-slot board
- Board slots can be normal, DL (double letter), or TL (triple letter)
- Form a word (2-5 letters) from the available letters
- Place it on the board to maximize your score
- Scoring uses Scrabble letter values with board multipliers
- Reach the 90th percentile to continue your streak
