import { useEffect, useState } from 'react';
import { getLetterValue } from '../lib/scoring';

const MULTIPLIER_COLORS = {
  DL: '#4ade80',
  TL: '#60a5fa',
};

const MULTIPLIER_LABELS = {
  DL: '2L',
  TL: '3L',
};

export default function RevealScreen({ result, word, onPlayAgain }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (!result) return;
    const target = result.score;
    const steps = 35;
    const interval = 1000 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayScore(Math.round((step / steps) * target));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [result]);

  if (!result) return null;

  const {
    score, percentile, streakContinues, streak,
    top5, totalWords,
    board, bestWord, bestScore, bestPlacement,
  } = result;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopy = async () => {
    const streakLine = streakContinues
      ? `\u{1F525} Streak: ${streak || 0} days`
      : 'Streak lost';
    const text = `SLATE \u2014 ${today}\n${word} \u00B7 ${score}pts \u00B7 ${percentile}th percentile\n${streakLine}\nslate.game`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for mobile Safari
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const percentileColor = percentile >= 90 ? '#4ade80' : '#f87171';

  // Build the optimal board display
  const optimalBoard = [null, null, null, null, null];
  if (bestWord && bestPlacement) {
    const letters = bestWord.toUpperCase().split('');
    for (let i = 0; i < letters.length; i++) {
      optimalBoard[bestPlacement[i]] = letters[i];
    }
  }

  return (
    <div
      className="flex flex-col items-center overflow-y-auto px-6 pt-8 pb-12 transition-all duration-500 ease-out"
      style={{
        background: '#F5F3EF',
        height: '100dvh',
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'scale(1) translateY(0)'
          : 'scale(0.95) translateY(20px)',
      }}
    >
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Slate"
        className="h-8 w-auto mb-6 shrink-0"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Word */}
      <div className="flex gap-3 mb-4 shrink-0">
        {word.split('').map((ch, i) => (
          <span
            key={i}
            className="text-2xl font-medium"
            style={{ color: '#C9A84C', letterSpacing: '4px' }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Score */}
      <div
        className="font-light mb-4 shrink-0"
        style={{ fontSize: 'clamp(48px, 14vw, 68px)', lineHeight: 1, color: '#C9A84C' }}
      >
        {displayScore}
      </div>

      {/* Percentile */}
      <div className="mb-3 text-center shrink-0">
        <span className="text-3xl font-light" style={{ color: percentileColor }}>
          {percentile}
        </span>
        <span
          className="text-xs font-light ml-1"
          style={{ color: percentileColor }}
        >
          th percentile
        </span>
      </div>

      {/* Streak */}
      <div className="mb-6 text-center shrink-0">
        {streakContinues ? (
          <span className="text-sm font-light" style={{ color: '#4ade80' }}>
            {'\u{1F525}'} Streak: {streak || 1} days
          </span>
        ) : (
          <span className="text-sm font-light" style={{ color: '#f87171' }}>
            Streak lost
          </span>
        )}
      </div>

      {/* Best Play Section */}
      {bestWord && board && (
        <div className="w-full max-w-[300px] mb-6 shrink-0">
          <div
            className="text-[10px] font-light text-black/25 mb-2 text-center"
            style={{ letterSpacing: '4px' }}
          >
            BEST PLAY
          </div>

          <div className="flex justify-center gap-1.5 mb-2">
            {optimalBoard.map((letter, i) => {
              const type = board[i];
              const hasLetter = letter !== null;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center rounded-md border"
                  style={{
                    width: 44,
                    height: 52,
                    background: hasLetter ? 'rgba(201, 168, 76, 0.1)' : '#E8E5DF',
                    borderColor: hasLetter ? 'rgba(201, 168, 76, 0.4)' : '#D5D0C8',
                  }}
                >
                  {hasLetter ? (
                    <>
                      <span
                        className="text-sm font-medium leading-none"
                        style={{ color: '#C9A84C' }}
                      >
                        {letter}
                      </span>
                      <span
                        className="text-[7px] font-light mt-0.5"
                        style={{
                          color: type === 'TL'
                            ? '#60a5fa'
                            : type === 'DL'
                            ? '#4ade80'
                            : 'rgba(0,0,0,0.2)',
                        }}
                      >
                        {getLetterValue(letter)}{type === 'TL' ? '\u00D73' : type === 'DL' ? '\u00D72' : ''}
                      </span>
                    </>
                  ) : (
                    type !== 'normal' && (
                      <span
                        className="text-[9px] font-medium"
                        style={{ color: MULTIPLIER_COLORS[type], opacity: 0.35 }}
                      >
                        {MULTIPLIER_LABELS[type]}
                      </span>
                    )
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <span className="text-xs font-light" style={{ color: 'rgba(201, 168, 76, 0.7)' }}>
              {bestWord.toUpperCase()}
            </span>
            <span className="text-xs font-light text-black/20 ml-2">
              {bestScore} pts
            </span>
          </div>
        </div>
      )}

      {/* Top 5 */}
      <div className="w-full max-w-[240px] mb-2 shrink-0">
        <div
          className="text-[10px] font-light text-black/25 mb-2 text-center"
          style={{ letterSpacing: '4px' }}
        >
          TOP WORDS
        </div>
        {top5?.map((entry, i) => {
          const isPlayer = entry.word.toUpperCase() === word.toUpperCase();
          return (
            <div
              key={i}
              className="flex justify-between py-1 border-b"
              style={{ borderColor: '#E8E5DF' }}
            >
              <span
                className="text-xs font-light"
                style={{
                  color: isPlayer ? '#C9A84C' : 'rgba(0,0,0,0.4)',
                  letterSpacing: '2px',
                }}
              >
                {entry.word.toUpperCase()}
              </span>
              <span
                className="text-xs font-light"
                style={{ color: isPlayer ? '#C9A84C' : 'rgba(0,0,0,0.2)' }}
              >
                {entry.score}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-light text-black/15 mb-6 shrink-0">
        {totalWords} valid words found
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="px-6 py-3 rounded-lg text-xs font-light border transition-all duration-200 active:opacity-70 shrink-0"
        style={{
          letterSpacing: '4px',
          background: copied ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
          borderColor: copied ? '#C9A84C' : '#D5D0C8',
          color: copied ? '#C9A84C' : 'rgba(0,0,0,0.4)',
          minHeight: 48,
        }}
      >
        {copied ? 'COPIED!' : 'COPY RESULT'}
      </button>

      {/* New game button */}
      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="mt-4 px-6 py-3 rounded-lg text-xs font-medium border transition-all duration-200 active:opacity-70 shrink-0"
          style={{
            letterSpacing: '4px',
            background: '#C9A84C',
            borderColor: '#C9A84C',
            color: '#fff',
            minHeight: 48,
          }}
        >
          NEW GAME
        </button>
      )}
    </div>
  );
}
