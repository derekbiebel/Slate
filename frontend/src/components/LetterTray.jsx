import LetterTile from './LetterTile';

export default function LetterTray({ letters, placedIndices, onTileTap, onDragStart }) {
  return (
    <div className="grid grid-cols-4 gap-2 mx-auto mt-6" style={{ width: 'fit-content' }}>
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
