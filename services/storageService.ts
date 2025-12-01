import { ScoreRecord, GameMode } from '../types';

const STORAGE_KEY = 'melody_master_scores';

export const storageService = {
  getScores(): ScoreRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load scores", e);
      return [];
    }
  },

  saveScore(record: Omit<ScoreRecord, 'id' | 'date'>) {
    const scores = this.getScores();
    const newRecord: ScoreRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    scores.push(newRecord);
    
    // Sort by score descending and keep top 50
    scores.sort((a, b) => b.score - a.score);
    const trimmedScores = scores.slice(0, 50);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedScores));
    } catch (e) {
      console.error("Failed to save score", e);
    }
  },

  getHighScoresByMode(mode: GameMode): ScoreRecord[] {
    return this.getScores().filter(s => s.mode === mode);
  }
};
