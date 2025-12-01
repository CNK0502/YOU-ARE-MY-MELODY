import React from 'react';
import { NoteName } from '../types';
import { THAI_NOTE_NAMES } from '../constants';

interface ControlsProps {
  onGuess: (note: NoteName) => void;
  disabled: boolean;
}

const BUTTONS = [NoteName.C, NoteName.D, NoteName.E, NoteName.F, NoteName.G, NoteName.A, NoteName.B];

export const Controls: React.FC<ControlsProps> = ({ onGuess, disabled }) => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:flex sm:justify-center sm:gap-4 mt-6 w-full px-4 max-w-3xl">
      {BUTTONS.map((note) => (
        <button
          key={note}
          onClick={() => onGuess(note)}
          disabled={disabled}
          className={`
            relative overflow-hidden group
            h-20 sm:h-24 w-full sm:w-24
            rounded-xl shadow-[0_4px_0_rgb(0,0,0,0.2)] active:shadow-none active:translate-y-[4px]
            flex flex-col items-center justify-center
            transition-all duration-150 ease-in-out
            ${disabled ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-indigo-500 hover:bg-indigo-400'}
          `}
        >
          <span className="text-2xl sm:text-3xl font-bold text-white z-10">{note}</span>
          <span className="text-sm sm:text-base font-normal text-indigo-100 z-10">{THAI_NOTE_NAMES[note]}</span>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
};
