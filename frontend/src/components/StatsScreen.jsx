import { loadStats } from '../lib/stats';

export default function StatsScreen({ onClose }) {
  const stats = loadStats();
  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(245, 243, 239, 0.95)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] rounded-xl border p-6"
        style={{ background: '#F5F3EF', borderColor: '#D5D0C8' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-xs font-light text-center mb-6"
          style={{ letterSpacing: '5px', color: 'rgba(0,0,0,0.3)' }}
        >
          STATISTICS
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { value: stats.gamesPlayed, label: 'Played' },
            { value: winPct + '%', label: 'Win %' },
            { value: stats.currentStreak, label: 'Streak' },
            { value: stats.longestStreak, label: 'Best' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-2xl font-medium"
                style={{ color: '#1A1A1A' }}
              >
                {stat.value}
              </div>
              <div
                className="text-[8px] font-light mt-1"
                style={{ color: 'rgba(0,0,0,0.35)', letterSpacing: '1px' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Perfect games */}
        <div
          className="text-center py-3 mb-4 rounded-lg"
          style={{ background: '#E8E5DF' }}
        >
          <div className="text-lg font-medium" style={{ color: '#C9A84C' }}>
            {stats.perfectGames}
          </div>
          <div
            className="text-[8px] font-light"
            style={{ color: 'rgba(0,0,0,0.3)', letterSpacing: '2px' }}
          >
            PERFECT GAMES
          </div>
        </div>

        {/* Recent history */}
        {stats.history.length > 0 && (
          <>
            <div
              className="text-[9px] font-light mb-2"
              style={{ letterSpacing: '3px', color: 'rgba(0,0,0,0.25)' }}
            >
              RECENT
            </div>
            <div className="flex gap-1 flex-wrap mb-4">
              {stats.history.slice(-20).map((g, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  title={`${g.word} — ${g.percentile}th`}
                  style={{
                    background: g.wasPerfect
                      ? '#C9A84C'
                      : g.percentile >= 90
                      ? '#4ade80'
                      : '#f87171',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg text-xs font-light border active:opacity-70"
          style={{
            letterSpacing: '4px',
            background: 'transparent',
            borderColor: '#D5D0C8',
            color: 'rgba(0,0,0,0.4)',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
