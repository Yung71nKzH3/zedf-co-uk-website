// High score and game stats local storage manager

export interface GameStat {
  highScore: number;
  gamesPlayed: number;
  lastPlayed: string;
}

export function getHighScore(gameId: string): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(`zedf_highscore_${gameId}`);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function saveHighScore(gameId: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  
  const currentHigh = getHighScore(gameId);
  const isNewHigh = score > currentHigh;
  
  if (isNewHigh) {
    localStorage.setItem(`zedf_highscore_${gameId}`, score.toString());
  }

  // Increment games played
  const playedVal = localStorage.getItem(`zedf_played_${gameId}`);
  const playedCount = playedVal ? parseInt(playedVal, 10) || 0 : 0;
  localStorage.setItem(`zedf_played_${gameId}`, (playedCount + 1).toString());
  localStorage.setItem(`zedf_lastplayed_${gameId}`, new Date().toISOString());

  return isNewHigh;
}

export function getGameStats(gameId: string): GameStat {
  if (typeof window === 'undefined') {
    return { highScore: 0, gamesPlayed: 0, lastPlayed: '' };
  }
  const highScore = getHighScore(gameId);
  const playedVal = localStorage.getItem(`zedf_played_${gameId}`);
  const gamesPlayed = playedVal ? parseInt(playedVal, 10) || 0 : 0;
  const lastPlayed = localStorage.getItem(`zedf_lastplayed_${gameId}`) || '';

  return { highScore, gamesPlayed, lastPlayed };
}
