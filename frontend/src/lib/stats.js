const STATS_KEY = 'slate_stats';

function getStats() {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return {
    gamesPlayed: 0,
    wins: 0, // 90th percentile or above
    currentStreak: 0,
    longestStreak: 0,
    perfectGames: 0, // got the #1 word
    history: [], // last 30 games: { score, percentile, word, wasPerfect }
  };
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordGame(score, percentile, word, bestWord) {
  const stats = getStats();
  stats.gamesPlayed++;

  const won = percentile >= 90;
  if (won) {
    stats.wins++;
    stats.currentStreak++;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  const wasPerfect = word.toUpperCase() === bestWord.toUpperCase();
  if (wasPerfect) stats.perfectGames++;

  stats.history.push({ score, percentile, word, wasPerfect });
  if (stats.history.length > 30) stats.history.shift();

  saveStats(stats);
  return { ...stats, wasPerfect };
}

export function loadStats() {
  return getStats();
}
