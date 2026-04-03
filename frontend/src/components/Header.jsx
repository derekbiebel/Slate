export default function Header({ onLogoDown, onLogoUp, onStatsClick, onHelpClick }) {
  return (
    <header className="w-full pt-3 pb-1 flex items-center justify-between shrink-0 px-4">
      {onHelpClick ? (
        <button
          onClick={onHelpClick}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-light active:opacity-50"
          style={{ color: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.12)' }}
        >
          ?
        </button>
      ) : (
        <div className="w-8" />
      )}

      <img
        src="/logo.png"
        alt="Slate"
        className="h-10 w-auto opacity-80"
        style={{}}
        onPointerDown={onLogoDown}
        onPointerUp={onLogoUp}
        onPointerCancel={onLogoUp}
      />

      {onStatsClick ? (
        <button
          onClick={onStatsClick}
          className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-50"
          style={{ color: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.12)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="8" width="3" height="6" rx="0.5" />
            <rect x="6.5" y="4" width="3" height="10" rx="0.5" />
            <rect x="12" y="2" width="3" height="12" rx="0.5" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}
    </header>
  );
}
