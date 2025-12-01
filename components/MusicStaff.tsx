import React, { useMemo } from 'react';
import { NoteData } from '../types';

interface MusicStaffProps {
  currentNote: NoteData;
  showHint?: boolean;
  variant?: 'default' | 'compact';
}

const STAFF_LINE_Y_START = 120; // Position of the bottom line (E4)
const LINE_SPACING = 20; // Pixels between lines/spaces
const NOTE_RADIUS_X = 14;
const NOTE_RADIUS_Y = 12;

export const MusicStaff: React.FC<MusicStaffProps> = ({ currentNote, showHint, variant = 'default' }) => {
  
  // Calculate Y position based on staffPosition
  const noteY = useMemo(() => {
    const stepsFromE4 = currentNote.staffPosition - 2; // E4 is index 2
    return STAFF_LINE_Y_START - (stepsFromE4 * (LINE_SPACING / 2));
  }, [currentNote]);

  // Ledger lines logic
  const ledgerLines = useMemo(() => {
    const lines = [];
    // Below staff
    if (currentNote.staffPosition < 2) {
        if (currentNote.staffPosition === 0) { // C4
             lines.push(STAFF_LINE_Y_START + LINE_SPACING);
        }
    }
    // Above staff
    if (currentNote.staffPosition >= 12) {
        lines.push(STAFF_LINE_Y_START - (4 * LINE_SPACING) - LINE_SPACING);
    }
    return lines;
  }, [currentNote]);

  const isStemDown = currentNote.staffPosition >= 6; // B4 and above usually stem down

  // Compact mode adjustments
  const containerClasses = variant === 'compact' 
    ? "w-full h-full flex items-center justify-center" 
    : "relative w-full max-w-md mx-auto flex justify-center py-8 select-none";
  
  const svgClasses = variant === 'compact' 
    ? "w-full h-full" 
    : "w-full h-auto drop-shadow-xl";

  const showBg = variant === 'default';

  return (
    <div className={containerClasses}>
      <svg 
        viewBox="0 0 300 220" 
        className={svgClasses}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background for contrast - only in default mode */}
        {showBg && (
           <rect x="10" y="10" width="280" height="200" rx="10" fill="white" fillOpacity="0.9" />
        )}

        {/* Staff Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line 
            key={i}
            x1="40" 
            y1={STAFF_LINE_Y_START - (i * LINE_SPACING)} 
            x2="260" 
            y2={STAFF_LINE_Y_START - (i * LINE_SPACING)} 
            stroke="#334155" 
            strokeWidth="2" 
          />
        ))}

        {/* Treble Clef (Noto Music Font) */}
        <text 
            x="60" 
            y={STAFF_LINE_Y_START} 
            fontFamily="'Noto Music', sans-serif" 
            fontSize="80" 
            fill="#1e293b"
            dominantBaseline="alphabetic"
        >
            𝄞
        </text>

        {/* Ledger Lines */}
        {ledgerLines.map((y, idx) => (
           <line 
            key={`ledger-${idx}`}
            x1="130" 
            y1={y} 
            x2="170" 
            y2={y} 
            stroke="#334155" 
            strokeWidth="2" 
          />
        ))}

        {/* The Note */}
        <g transform={`translate(150, ${noteY})`}>
           {/* Note Head */}
           <ellipse 
             cx="0" 
             cy="0" 
             rx={NOTE_RADIUS_X} 
             ry={NOTE_RADIUS_Y} 
             transform="rotate(-15)"
             fill="#0f172a" 
           />
           {/* Note Stem */}
           <line 
             x1={isStemDown ? -NOTE_RADIUS_X + 1 : NOTE_RADIUS_X - 1} 
             y1={isStemDown ? 5 : -5} 
             x2={isStemDown ? -NOTE_RADIUS_X + 1 : NOTE_RADIUS_X - 1} 
             y2={isStemDown ? 65 : -65} 
             stroke="#0f172a" 
             strokeWidth="2.5" 
             strokeLinecap="round"
           />
        </g>

      </svg>
      
      {/* Optional Hint Overlay */}
      {showHint && variant === 'default' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xl font-bold shadow-lg animate-pulse mt-24">
                {currentNote.name}
            </div>
        </div>
      )}
    </div>
  );
};
