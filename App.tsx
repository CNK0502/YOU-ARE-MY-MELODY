import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MusicStaff } from './components/MusicStaff';
import { Controls } from './components/Controls';
import { Modal } from './components/Modal';
import { MatchingGame } from './components/MatchingGame';
import { Leaderboard } from './components/Leaderboard';
import { GameMode, NoteData, NoteName } from './types';
import { ALL_NOTES, LEVELS, GAME_DURATION_SEC } from './constants';
import { audioService } from './services/audioService';
import { storageService } from './services/storageService';

// Icons
const IconClock = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconStar = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconMusic = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconGrid = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconTrophy = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;

function App() {
  // State
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [currentNote, setCurrentNote] = useState<NoteData>(ALL_NOTES[0]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [gameActive, setGameActive] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  
  // Score Saving
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Game Logic Helpers ----

  const getRandomNote = useCallback(() => {
    let pool = ALL_NOTES;

    if (mode === GameMode.LEVELS) {
      const config = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
      pool = ALL_NOTES.slice(config.minNoteIndex, config.maxNoteIndex + 1);
    }
    // For Practice & Timed, use full range by default

    let newNote = pool[Math.floor(Math.random() * pool.length)];
    // Avoid same note twice
    if (pool.length > 1 && newNote.id === currentNote.id) {
       newNote = pool[Math.floor(Math.random() * pool.length)];
    }
    return newNote;
  }, [mode, currentLevel, currentNote]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setStreak(0);
    setFeedback('none');
    setTimeLeft(GAME_DURATION_SEC);
    setShowGameOver(false);
    setScoreSaved(false);
    setPlayerName('');
    
    if (selectedMode === GameMode.LEVELS) {
      setCurrentLevel(1);
    }

    setGameActive(true);
    
    // Init sound context
    audioService.playTone(0, 'sine', 0.001); 

    // Initial Note for guessing modes
    if (selectedMode !== GameMode.MATCHING) {
      setTimeout(() => {
          setCurrentNote(getRandomNote());
      }, 0);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < LEVELS.length) {
      setCurrentLevel(prev => prev + 1);
      setScore(0);
      setStreak(0);
      setShowGameOver(false); 
      setGameActive(true);
      setCurrentNote(getRandomNote());
    } else {
      setMode(GameMode.MENU);
    }
  };

  const handleGameOver = (finalScore?: number) => {
    setGameActive(false);
    if (finalScore !== undefined) setScore(finalScore);
    if (timerRef.current) clearInterval(timerRef.current as any);
    setShowGameOver(true);
  };

  // ---- Timer Hook (Only for Timed Guess Mode) ----
  useEffect(() => {
    if (mode === GameMode.TIMED && gameActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as any);
    };
  }, [mode, gameActive]);

  // ---- Interaction ----

  const handleGuess = (noteName: NoteName) => {
    if (!gameActive || feedback !== 'none') return;

    if (noteName === currentNote.name) {
      setFeedback('correct');
      audioService.playCorrect();
      audioService.playTone(currentNote.frequency, 'triangle', 0.3);
      
      setScore(s => s + 1);
      setStreak(s => s + 1);

      if (mode === GameMode.LEVELS) {
        const config = LEVELS.find(l => l.level === currentLevel);
        if (config && (score + 1) >= config.requiredScore) {
            setTimeout(() => {
                setGameActive(false);
                setShowGameOver(true); // Level Complete
            }, 500);
            return;
        }
      }

      setTimeout(() => {
        setFeedback('none');
        setCurrentNote(getRandomNote());
      }, 800);

    } else {
      setFeedback('wrong');
      audioService.playIncorrect();
      setStreak(0);
      setTimeout(() => {
        setFeedback('none');
      }, 500);
    }
  };

  const saveScore = () => {
    if (!playerName.trim()) return;
    storageService.saveScore({
      playerName: playerName.trim(),
      score: score,
      mode: mode
    });
    setScoreSaved(true);
  };

  // ---- Rendering ----

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#020617] text-white relative overflow-hidden">
        
        {/* Night Sky Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]" />
        
        {/* Stars */}
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse" />
        <div className="absolute top-1/4 left-1/3 w-0.5 h-0.5 bg-blue-100 rounded-full opacity-60" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full opacity-50" />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-1/3 right-10 w-0.5 h-0.5 bg-purple-100 rounded-full opacity-80" />
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white rounded-full opacity-40" />

        {/* Nebulas/Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center text-center">
        
        <div className="mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl mb-6 ring-1 ring-white/10">
                <IconMusic className="w-12 h-12 text-indigo-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Melody Master
            </h1>
            <p className="text-indigo-200/80 text-lg max-w-md mx-auto">
                Master the treble clef with Thai & English notes.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
            {/* Practice - Bright Sky/Blue */}
            <button 
                onClick={() => startGame(GameMode.PRACTICE)}
                className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-sky-500/30 hover:-translate-y-1"
            >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    {/* Changed Emoji to Star */}
                    <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Practice</h3>
                <span className="text-xs font-medium text-sky-100 uppercase tracking-wider group-hover:text-white transition-colors">Unlimited</span>
            </button>

            {/* Time Attack - Bright Cyan/Teal */}
            <button 
                onClick={() => startGame(GameMode.TIMED)}
                className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-cyan-400 to-teal-600 hover:from-cyan-300 hover:to-teal-500 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1"
            >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-inner">
                     <IconClock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Time Attack</h3>
                <span className="text-xs font-medium text-cyan-100 uppercase tracking-wider group-hover:text-white transition-colors">60 Seconds</span>
            </button>

            {/* Matching - Bright Indigo/Blue */}
            <button 
                onClick={() => startGame(GameMode.MATCHING)}
                className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-indigo-400 to-blue-600 hover:from-indigo-300 hover:to-blue-500 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1"
            >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-inner">
                     <IconGrid className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Matching</h3>
                <span className="text-xs font-medium text-indigo-100 uppercase tracking-wider group-hover:text-white transition-colors">Memory Game</span>
            </button>

            {/* Levels - Bright Teal/Blue */}
            <button 
                onClick={() => startGame(GameMode.LEVELS)}
                className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-blue-400 to-sky-600 hover:from-blue-300 hover:to-sky-500 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
            >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-inner">
                     <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Level Mode</h3>
                <span className="text-xs font-medium text-blue-100 uppercase tracking-wider group-hover:text-white transition-colors">Progression</span>
            </button>
        </div>

        <button 
            onClick={() => setMode(GameMode.LEADERBOARD)}
            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all text-sm font-semibold tracking-wide border border-transparent hover:border-white/10"
        >
            <IconTrophy className="w-4 h-4" />
            VIEW HALL OF FAME
        </button>

      </div>
    </div>
  );

  if (mode === GameMode.MENU) return renderMenu();
  if (mode === GameMode.LEADERBOARD) return <Leaderboard onBack={() => setMode(GameMode.MENU)} />;

  // --- Main Game Render ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Header / HUD */}
      <header className="w-full max-w-4xl mx-auto p-4 flex justify-between items-center text-slate-700">
        <button onClick={() => setMode(GameMode.MENU)} className="p-2 hover:bg-slate-200 rounded-full transition">
           <span className="font-bold text-sm text-slate-500">EXIT</span>
        </button>
        
        <div className="flex gap-4 sm:gap-6 font-bold text-xl">
            <div className="flex items-center gap-2 bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100">
                <IconStar className="w-5 h-5 text-yellow-400" />
                <span className={feedback === 'correct' ? 'text-green-600 animate-pulse' : ''}>{score}</span>
            </div>
            {mode === GameMode.TIMED && (
                 <div className={`flex items-center gap-2 bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100 ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                    <IconClock className="w-5 h-5" />
                    <span>{timeLeft}s</span>
                </div>
            )}
            {mode === GameMode.LEVELS && (
                 <div className="flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full shadow-sm text-sm">
                    LEVEL {currentLevel}
                </div>
            )}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center p-2 sm:p-4 relative">
        
        {mode === GameMode.MATCHING ? (
          <MatchingGame 
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
          />
        ) : (
          // Standard Note Guessing Game
          <>
            {/* Feedback Indicator */}
            <div className={`absolute top-4 left-0 right-0 text-center pointer-events-none z-10`}>
                 <div className={`inline-block text-4xl font-bold transition-all duration-300 transform ${feedback === 'none' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    {feedback === 'correct' && <span className="text-green-500 drop-shadow-sm bg-white/80 px-4 py-1 rounded-full">Perfect! 🎵</span>}
                    {feedback === 'wrong' && <span className="text-red-500 drop-shadow-sm bg-white/80 px-4 py-1 rounded-full">Try Again</span>}
                 </div>
            </div>

            {/* Staff */}
            <div className={`w-full max-w-2xl mt-4 transition-all duration-300 ${feedback === 'correct' ? 'scale-105' : ''}`}>
                <MusicStaff currentNote={currentNote} showHint={mode === GameMode.PRACTICE} />
            </div>

            {/* Controls */}
            <div className="w-full mt-4 sm:mt-8 pb-8">
                 <Controls onGuess={handleGuess} disabled={feedback !== 'none' || !gameActive} />
            </div>

            {/* Streak Badge */}
            {streak > 2 && (
                 <div className="absolute top-20 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold animate-bounce shadow-sm border border-orange-200">
                     🔥 {streak} Streak!
                 </div>
            )}
          </>
        )}

      </main>

      {/* Game Over / Level Complete Modal */}
      {showGameOver && (
        <Modal
          title={mode === GameMode.LEVELS && currentLevel < LEVELS.length ? `Level ${currentLevel} Complete!` : "Game Over"}
          primaryLabel={mode === GameMode.LEVELS && currentLevel < LEVELS.length ? "Next Level" : "Play Again"}
          onPrimary={() => {
            if (mode === GameMode.LEVELS && currentLevel < LEVELS.length) {
                 handleNextLevel();
            } else {
                startGame(mode);
            }
          }}
          secondaryLabel="Menu"
          onSecondary={() => setMode(GameMode.MENU)}
        >
            <div className="flex flex-col gap-2 items-center">
                <p className="text-6xl font-black text-indigo-600 mb-2">{score}</p>
                <p className="text-sm uppercase tracking-wide text-gray-400 mb-6">Final Score</p>
                
                {/* Score Saving UI */}
                {(mode !== GameMode.PRACTICE && score > 0) && (
                  <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                    {!scoreSaved ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Save to Leaderboard</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter your name"
                            maxLength={12}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <button 
                            onClick={saveScore}
                            disabled={!playerName.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-indigo-700 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-green-600 font-semibold flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Score Saved!
                      </div>
                    )}
                  </div>
                )}
            </div>
        </Modal>
      )}

    </div>
  );
}

export default App;