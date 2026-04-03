import { getLetterValue } from '../lib/scoring';

const MULTIPLIER_COLORS = {
  DL: '#4ade80',
  TL: '#60a5fa',
};

const MULTIPLIER_LABELS = {
  DL: '2L',
  TL: '3L',
};

export default function Board({ slots, boardTypes, onSlotTap, invalidSlots, hoverSlot, slotRefs }) {
  return (
    <div className="flex justify-center gap-2">
      {slots.map((letter, i) => {
        const type = boardTypes[i];
        const isInvalid = invalidSlots?.includes(i);
        const isHover = hoverSlot === i && !letter;
        return (
          <div
            key={i}
            ref={(el) => { if (slotRefs) slotRefs.current[i] = el; }}
            onClick={() => letter && onSlotTap(i)}
            className={`board-slot flex flex-col items-center justify-center rounded-lg border transition-all duration-150 ${
              letter ? 'cursor-pointer' : 'cursor-default'
            } ${letter ? 'tile-snap' : ''} ${isInvalid ? 'slot-flash-red' : ''}`}
            style={{
              width: 58,
              height: 66,
              background: isInvalid
                ? 'rgba(248, 113, 113, 0.15)'
                : isHover
                ? 'rgba(201, 168, 76, 0.2)'
                : '#E8E5DF',
              borderColor: isInvalid
                ? '#f87171'
                : isHover
                ? '#C9A84C'
                : '#D5D0C8',
              transform: isHover ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            {letter ? (
              <>
                <span className="text-xl font-medium leading-none text-black">
                  {letter}
                </span>
                <span className="text-[10px] font-light text-black/30 mt-0.5">
                  {getLetterValue(letter)}
                </span>
              </>
            ) : (
              type !== 'normal' && (
                <span
                  className="text-xs font-medium"
                  style={{ color: MULTIPLIER_COLORS[type] }}
                >
                  {MULTIPLIER_LABELS[type]}
                </span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
