export default function Header({ onLogoDown, onLogoUp, onStatsClick }) {
  return (
    <header className="w-full pt-3 pb-1 flex items-center justify-center shrink-0 relative px-4">
      <img
        src="/logo.png"
        alt="Slate"
        className="h-10 w-auto opacity-80"
        style={{ mixBlendMode: 'multiply' }}
        onPointerDown={onLogoDown}
        onPointerUp={onLogoUp}
        onPointerCancel={onLogoUp}
      />
      {onStatsClick && (
        <button
          onClick={onStatsClick}
          className="absolute right-4 text-xs font-light active:opacity-50"
          style={{ color: 'rgba(0,0,0,0.3)', letterSpacing: '2px' }}
        >
          STATS
        </button>
      )}
    </header>
  );
}
