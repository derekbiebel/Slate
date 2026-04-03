export default function HowToPlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(245, 243, 239, 0.95)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-xl border p-6 overflow-y-auto"
        style={{ background: '#F5F3EF', borderColor: '#D5D0C8', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-xs font-light text-center mb-5"
          style={{ letterSpacing: '5px', color: 'rgba(0,0,0,0.3)' }}
        >
          HOW TO PLAY
        </div>

        <div className="space-y-4 text-sm font-light" style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.7 }}>
          <p>
            Form the <strong style={{ color: '#1A1A1A' }}>highest-scoring word</strong> you can from the given letters.
          </p>

          <div
            className="rounded-lg p-3"
            style={{ background: '#E8E5DF' }}
          >
            <div className="text-[10px] font-light mb-2" style={{ letterSpacing: '3px', color: 'rgba(0,0,0,0.3)' }}>
              THE BOARD
            </div>
            <p className="text-xs">
              Place your word on the 5-slot board. Letters must be <strong style={{ color: '#1A1A1A' }}>consecutive</strong> — no gaps.
            </p>
          </div>

          <div
            className="rounded-lg p-3"
            style={{ background: '#E8E5DF' }}
          >
            <div className="text-[10px] font-light mb-2" style={{ letterSpacing: '3px', color: 'rgba(0,0,0,0.3)' }}>
              MULTIPLIERS
            </div>
            <p className="text-xs">
              <span style={{ color: '#4ade80', fontWeight: 500 }}>2L</span> doubles a letter's value.{' '}
              <span style={{ color: '#60a5fa', fontWeight: 500 }}>3L</span> triples it.
              Place high-value letters on multipliers for maximum points.
            </p>
          </div>

          <div
            className="rounded-lg p-3"
            style={{ background: '#E8E5DF' }}
          >
            <div className="text-[10px] font-light mb-2" style={{ letterSpacing: '3px', color: 'rgba(0,0,0,0.3)' }}>
              SCORING
            </div>
            <p className="text-xs">
              Letters are worth 1–10 points (like Scrabble). Your score is ranked against every possible word — aim for the{' '}
              <strong style={{ color: '#1A1A1A' }}>90th percentile</strong> to keep your streak alive.
            </p>
          </div>

          <div
            className="rounded-lg p-3"
            style={{ background: '#E8E5DF' }}
          >
            <div className="text-[10px] font-light mb-2" style={{ letterSpacing: '3px', color: 'rgba(0,0,0,0.3)' }}>
              CONTROLS
            </div>
            <p className="text-xs">
              <strong style={{ color: '#1A1A1A' }}>Drag</strong> a tile to a specific board slot, or <strong style={{ color: '#1A1A1A' }}>tap</strong> to place in the next open slot.
              Tap a board letter to remove it.
            </p>
          </div>

          <div className="text-xs text-center pt-1" style={{ color: 'rgba(0,0,0,0.25)' }}>
            Words must be 2–5 letters from the available set.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-lg text-xs font-medium border active:opacity-70"
          style={{
            letterSpacing: '4px',
            background: '#C9A84C',
            borderColor: '#C9A84C',
            color: '#fff',
          }}
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}
