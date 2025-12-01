import { NoteData, NoteName, LevelConfig } from './types';

// Staff Position: 0 is Middle C (C4).
// Lines are at positions: 2 (E4), 4 (G4), 6 (B4), 8 (D5), 10 (F5)
// Spaces are at positions: 3 (F4), 5 (A4), 7 (C5), 9 (E5)

export const ALL_NOTES: NoteData[] = [
  { id: 'C4', name: NoteName.C, octave: 4, frequency: 261.63, staffPosition: 0 },
  { id: 'D4', name: NoteName.D, octave: 4, frequency: 293.66, staffPosition: 1 },
  { id: 'E4', name: NoteName.E, octave: 4, frequency: 329.63, staffPosition: 2 },
  { id: 'F4', name: NoteName.F, octave: 4, frequency: 349.23, staffPosition: 3 },
  { id: 'G4', name: NoteName.G, octave: 4, frequency: 392.00, staffPosition: 4 },
  { id: 'A4', name: NoteName.A, octave: 4, frequency: 440.00, staffPosition: 5 },
  { id: 'B4', name: NoteName.B, octave: 4, frequency: 493.88, staffPosition: 6 },
  { id: 'C5', name: NoteName.C, octave: 5, frequency: 523.25, staffPosition: 7 },
  { id: 'D5', name: NoteName.D, octave: 5, frequency: 587.33, staffPosition: 8 },
  { id: 'E5', name: NoteName.E, octave: 5, frequency: 659.25, staffPosition: 9 },
  { id: 'F5', name: NoteName.F, octave: 5, frequency: 698.46, staffPosition: 10 },
  { id: 'G5', name: NoteName.G, octave: 5, frequency: 783.99, staffPosition: 11 },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, minNoteIndex: 0, maxNoteIndex: 4, requiredScore: 10, description: "Basics: C4 to G4" },
  { level: 2, minNoteIndex: 2, maxNoteIndex: 8, requiredScore: 15, description: "Staff Lines: E4 to D5" },
  { level: 3, minNoteIndex: 0, maxNoteIndex: 11, requiredScore: 20, description: "Full Range: C4 to G5" },
];

export const THAI_NOTE_NAMES: Record<NoteName, string> = {
  [NoteName.C]: 'โด',
  [NoteName.D]: 'เร',
  [NoteName.E]: 'มี',
  [NoteName.F]: 'ฟา',
  [NoteName.G]: 'ซอล',
  [NoteName.A]: 'ลา',
  [NoteName.B]: 'ที',
};

export const GAME_DURATION_SEC = 60;
export const MATCHING_GAME_DURATION_SEC = 60;
