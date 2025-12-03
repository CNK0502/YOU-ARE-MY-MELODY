import React, { useState, useEffect, useCallback } from 'react';
import { NoteData, NoteName } from '../types';
import { ALL_NOTES, THAI_NOTE_NAMES, MATCHING_GAME_DURATION_SEC } from '../constants';
import { MusicStaff } from './MusicStaff';
import { audioService } from '../services/audioService';

interface MatchingGameProps {
  onGameOver: (finalScore: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Card {
  id: string;
  type: 'note' | 'text';
  content: NoteData | NoteName;
  matchId: string; // Used to check if two cards match (e.g., NoteName "C")
  isFlipped: boolean;
  isMatched: boolean;
}

const MATCH_PAIRS_COUNT = 6; // 6 Pairs = 12 Cards

// Color mapping for "Inside" the grid (Face Up)
// Using bright, mixed pastel tones
const CARD_THEMES: Record<string, string> = {
  [NoteName.C]: 'bg-rose-100 border-rose-300 text-rose-900',
  [NoteName.D]: 'bg-orange-100 border-orange-300 text-orange-900',
  [NoteName.E]: 'bg-amber-100 border-amber-300 text-amber-900',
  [NoteName.F]: 'bg-emerald-100 border-emerald-300 text-emerald-900',
  [NoteName.G]: 'bg-sky-100 border-sky-300 text-sky-900',
  [NoteName.A]: 'bg-violet-100 border-violet-300 text-violet-900',
  [NoteName.B]: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900',
};

export const MatchingGame: React.FC<MatchingGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MATCHING_GAME_DURATION_SEC);
  const [streak, setStreak] = useState(0);

  // Initialize Game Round
  const startRound = useCallback(() => {
    // 1. Select random notes
    const shuffledNotes = [...ALL_NOTES].sort(() => 0.5 - Math.random());
    const selectedNotes = shuffledNotes.slice(0, MATCH_PAIRS_COUNT);

    // 2. Create Pairs
    const newCards: Card[] = [];
    selectedNotes.forEach(note => {
      // Card A: Staff
      newCards.push({
        id: `note-${note.id}-${Math.random()}`,
        type: 'note',
        content: note,
        matchId: note.name,
        isFlipped: false,
        isMatched: false
      });
      // Card B: Text (English + Thai)
      newCards.push({
        id: `text-${note.id}-${Math.random()}`,
        type: 'text',
        content: note.name,
        matchId: note.name,
        isFlipped: false,
        isMatched: false
      });
    });

    // 3. Shuffle Cards
    setCards(newCards.sort(() => 0.5 - Math.random()));
  }, []);

  useEffect(() => {
    startRound();
  }, [startRound]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onGameOver(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [score, onGameOver]);

  // Card Click Handler
  const handleCardClick = (card: Card) => {
    // Validation
    if (isProcessing || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    // Flip logic
    const newCards = cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    // Play flip sound
    audioService.playTone(600, 'sine', 0.05);

    // Check Match
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [card1, card2] = newFlipped;
      
      if (card1.matchId === card2.matchId) {
        // MATCH!
        handleMatch(card1.matchId);
      } else {
        // NO MATCH
        handleMismatch();
      }
    }
  };

  const handleMatch = (noteName: string) => {
    // Play Success Sound
    setTimeout(() => audioService.playCorrect(), 200);

    // Calculate Score (Base + Streak)
    const points = 10 + (streak * 2);
    const newScore = score + points;
    setScore(newScore);
    onScoreUpdate(newScore);
    setStreak(s => s + 1);

    setTimeout(() => {
      setCards(prev => prev.map(c => 
        c.matchId === noteName ? { ...c, isMatched: true } : c
      ));
      setFlippedCards([]);
      setIsProcessing(false);

      // Check if board cleared
      const allMatched = cards.every(c => c.matchId === noteName || c.isMatched);
      if (allMatched) {
        // Bonus for clearing board
        const finalScore = newScore + 50;
        setScore(finalScore);
        onScoreUpdate(finalScore);
        audioService.playTone(880, 'triangle', 0.3);
        setTimeout(startRound, 500); // Start next round
      }
    }, 500);
  };

  const handleMismatch = () => {
    audioService.playIncorrect();
    setStreak(0);
    setTimeout(() => {
      setCards(prev => prev.map(c => 
        c.isMatched ? c : { ...c, isFlipped: false }
      ));
      setFlippedCards([]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-4xl mx-auto pb-20">
      
      {/* Timer Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden border border-gray-300">
        <div 
          className={`h-full transition-all duration-1000 linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-400 to-purple-400'}`}
          style={{ width: `${(timeLeft / MATCHING_GAME_DURATION_SEC) * 100}%` }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
        {cards.map(card => {
          // Get specific color theme for this note
          const themeClass = CARD_THEMES[card.matchId] || 'bg-white border-indigo-200 text-indigo-900';

          return (
            <div 
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative aspect-square cursor-pointer perspective-1000 group
                ${card.isMatched ? 'opacity-0 pointer-events-none transition-opacity duration-500' : ''}
              `}
            >
              <div className={`
                w-full h-full transition-transform duration-500 transform-style-3d shadow-md
                ${card.isFlipped ? 'rotate-y-180' : 'hover:-translate-y-1 hover:shadow-lg'}
              `}>
                
                {/* Card Back (Face Down) - Uniform Bright Design */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl border-2 border-white/30 flex items-center justify-center">
                  <span className="text-4xl text-white/90 drop-shadow-md">♫</span>
                </div>

                {/* Card Front (Face Up) - Mixed Bright Colors */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 flex items-center justify-center overflow-hidden ${themeClass}`}>
                   {card.type === 'note' ? (
                     <div className="w-full h-full p-1 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl m-1">
                       <MusicStaff currentNote={card.content as NoteData} variant="compact" />
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center">
                       <span className="text-3xl sm:text-5xl font-black mb-1 drop-shadow-sm">
                         {card.content as string}
                       </span>
                       <span className="text-lg sm:text-2xl font-bold opacity-90">
                         {THAI_NOTE_NAMES[card.content as NoteName]}
                       </span>
                     </div>
                   )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
