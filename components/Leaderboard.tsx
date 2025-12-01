import React, { useMemo } from 'react';
import { ScoreRecord, GameMode } from '../types';
import { storageService } from '../services/storageService';

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const allScores = useMemo(() => storageService.getScores(), []);
  
  // Helper to format mode name
  const formatMode = (mode: GameMode) => {
    switch (mode) {
      case GameMode.PRACTICE: return 'Practice';
      case GameMode.TIMED: return 'Time Attack';
      case GameMode.LEVELS: return 'Levels';
      case GameMode.MATCHING: return 'Matching';
      default: return mode;
    }
  };

  // Get top 3 specifically for highlighting
  const topScores = allScores.slice(0, 3);
  const otherScores = allScores.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-indigo-50">
        
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="text-gray-500 hover:text-indigo-600 font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back to Menu
          </button>
          <h1 className="text-3xl font-bold text-slate-800">🏆 Hall of Fame</h1>
        </div>

        {allScores.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl mb-2">No scores yet!</p>
            <p>Play a game to set a record.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Podium style lists */}
            <div className="grid gap-4">
               {topScores.map((record, idx) => (
                 <div key={record.id} className="relative flex items-center bg-gradient-to-r from-indigo-50 to-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                    <div className={`
                      w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold mr-4 shadow-sm
                      ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                      ${idx === 1 ? 'bg-gray-300 text-gray-800' : ''}
                      ${idx === 2 ? 'bg-amber-600 text-amber-100' : ''}
                    `}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800">{record.playerName}</h3>
                      <p className="text-sm text-slate-500">{formatMode(record.mode)} • {new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-2xl font-black text-indigo-600">
                      {record.score}
                    </div>
                 </div>
               ))}
            </div>

            {/* Rest of the list */}
            {otherScores.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-2 font-medium">Rank</th>
                      <th className="pb-2 font-medium">Player</th>
                      <th className="pb-2 font-medium">Mode</th>
                      <th className="pb-2 font-medium text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-600">
                    {otherScores.map((record, idx) => (
                      <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-3 pl-2 font-mono text-gray-400">#{idx + 4}</td>
                        <td className="py-3 font-semibold">{record.playerName}</td>
                        <td className="py-3">{formatMode(record.mode)}</td>
                        <td className="py-3 text-right font-bold text-indigo-600 pr-2">{record.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
