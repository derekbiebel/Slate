import { useRef } from 'react';
import { getLetterValue } from '../lib/scoring';

export default function LetterTile({ letter, placed, onTap, trayIndex, onDragStart }) {
  const tileRef = useRef(null);

  const handlePointerDown = (e) => {
    if (placed) return;
    if (onDragStart) {
      onDragStart(trayIndex, letter, e);
    }
  };

  return (
    <div
      ref={tileRef}
      onPointerDown={handlePointerDown}
      onClick={placed ? undefined : onTap}
      className="flex flex-col items-center justify-center rounded-lg border transition-opacity duration-200 select-none"
      style={{
        width: 50,
        height: 54,
        background: '#E8E5DF',
        borderColor: '#D5D0C8',
        opacity: placed ? 0.2 : 1,
        cursor: placed ? 'default' : 'grab',
        touchAction: 'none',
      }}
    >
      <span className="text-lg font-medium leading-none text-black">
        {letter}
      </span>
      <span className="text-[10px] font-light text-black/25 mt-0.5">
        {getLetterValue(letter)}
      </span>
    </div>
  );
}
