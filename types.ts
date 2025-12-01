export enum GameMode {
  MENU = 'MENU',
  PRACTICE = 'PRACTICE',
  TIMED = 'TIMED',
  LEVELS = 'LEVELS',
  MATCHING = 'MATCHING',
  LEADERBOARD = 'LEADERBOARD'
}

export enum NoteName {
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  A = 'A',
  B = 'B'
}

export interface NoteData {
  id: string;
  name: NoteName;
  octave: number;
  frequency: number;
  staffPosition: number; // Relative integer position. 0 = Middle C (C4), 1 = D4, etc.
}

export interface LevelConfig {
  level: number;
  minNoteIndex: number; // Index in our SORTED_NOTES array
  maxNoteIndex: number;
  requiredScore: number;
  description: string;
}

export interface ScoreRecord {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  date: string;
}
