import LetterTile from './LetterTile';

export default function LetterTray({ letters, placedIndices, onTileTap, onDragStart }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-[280px] mx-auto mt-6">
      {letters.map((letter, i) => (
        <LetterTile
          key={i}
          letter={letter}
          trayIndex={i}
          placed={placedIndices.includes(i)}
          onTap={() => onTileTap(i)}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
}
