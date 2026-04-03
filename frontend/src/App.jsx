import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import LetterTray from './components/LetterTray';
import ScoreDisplay from './components/ScoreDisplay';
import ActionButtons from './components/ActionButtons';
import RevealScreen from './components/RevealScreen';
import { calculateScore, getLetterValue } from './lib/scoring';
import { recordGame } from './lib/stats';
import { fireConfetti } from './lib/confetti';
import StatsScreen from './components/StatsScreen';
import HowToPlay from './components/HowToPlay';

// In production, point to the deployed backend. In dev, Vite proxy handles it.
const API_BASE = import.meta.env.VITE_API_URL || '';

function getOrCreateUserId() {
  let id = localStorage.getItem('slate_userId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('slate_userId', id);
  }
  return id;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getSavedResult() {
  try {
    const key = `slate_result_${getTodayKey()}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveResult(result, word) {
  const key = `slate_result_${getTodayKey()}`;
  localStorage.setItem(key, JSON.stringify({ result, word }));
}

export default function App() {
  const [puzzle, setPuzzle] = useState(null); // { letters, board, distribution?, seed? }
  const [boardSlots, setBoardSlots] = useState([null, null, null, null, null]);
  const [slotSources, setSlotSources] = useState([null, null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('');
  const [invalidSlots, setInvalidSlots] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [revealResult, setRevealResult] = useState(null);
  const [revealWord, setRevealWord] = useState('');
  const [isPractice, setIsPractice] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('slate_seen_help'));

  // Drag state
  const [dragging, setDragging] = useState(null); // { trayIndex, letter }
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoverSlot, setHoverSlot] = useState(null);
  const slotRefs = useRef([null, null, null, null, null]);
  const dragStartPos = useRef(null);
  const hasMoved = useRef(false);

  const userId = getOrCreateUserId();

  // Long-press logo to reset today's result (for testing)
  const longPressTimer = useRef(null);
  const handleLogoDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      const key = `slate_result_${getTodayKey()}`;
      localStorage.removeItem(key);
      setRevealResult(null);
      setRevealWord('');
      setBoardSlots([null, null, null, null, null]);
      setSlotSources([null, null, null, null, null]);
    }, 1500); // hold for 1.5 seconds
  }, []);
  const handleLogoUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const fetchRandomPuzzle = useCallback(async () => {
    try {
      const r = await fetch(API_BASE + '/api/puzzle/random');
      const data = await r.json();
      setPuzzle(data);
      setIsPractice(true);
    } catch {}
  }, []);

  // Load a random puzzle on mount
  useEffect(() => {
    fetchRandomPuzzle();
  }, []);

  const placedIndices = slotSources.filter((s) => s !== null);
  const score = puzzle ? calculateScore(boardSlots, puzzle.board) : 0;
  const filledCount = boardSlots.filter(Boolean).length;

  // Place a letter at a specific slot
  const placeLetterAt = useCallback((trayIndex, slot) => {
    if (!puzzle) return;
    setBoardSlots((prev) => {
      const next = [...prev];
      next[slot] = puzzle.letters[trayIndex];
      return next;
    });
    setSlotSources((prev) => {
      const next = [...prev];
      next[slot] = trayIndex;
      return next;
    });
    setInvalidMessage('');
    setInvalidSlots([]);
  }, [puzzle]);

  // Tap to place — fills next empty slot from left
  const handleTileTap = useCallback(
    (trayIndex) => {
      if (!puzzle) return;
      const emptySlot = boardSlots.indexOf(null);
      if (emptySlot === -1) return;
      placeLetterAt(trayIndex, emptySlot);
    },
    [puzzle, boardSlots, placeLetterAt],
  );

  // Tap a board slot to remove just that letter
  const handleSlotTap = useCallback((slotIndex) => {
    if (boardSlots[slotIndex] === null) return;
    setBoardSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setSlotSources((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setInvalidMessage('');
    setInvalidSlots([]);
  }, [boardSlots]);

  const handleClear = useCallback(() => {
    setBoardSlots([null, null, null, null, null]);
    setSlotSources([null, null, null, null, null]);
    setInvalidMessage('');
    setInvalidSlots([]);
  }, []);

  // ---- DRAG & DROP ----
  const findSlotAtPosition = useCallback((x, y) => {
    for (let i = 0; i < 5; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // Generous hit area
      const pad = 10;
      if (
        x >= rect.left - pad &&
        x <= rect.right + pad &&
        y >= rect.top - pad &&
        y <= rect.bottom + pad
      ) {
        return i;
      }
    }
    return null;
  }, []);

  const handleDragStart = useCallback((trayIndex, letter, e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragStartPos.current = { x: clientX, y: clientY };
    hasMoved.current = false;
    setDragging({ trayIndex, letter });
    setDragPos({ x: clientX, y: clientY });
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      e.preventDefault();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      // Check if we've moved enough to count as a drag
      if (!hasMoved.current && dragStartPos.current) {
        const dx = clientX - dragStartPos.current.x;
        const dy = clientY - dragStartPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 8) {
          hasMoved.current = true;
        }
      }

      setDragPos({ x: clientX, y: clientY });
      const slot = findSlotAtPosition(clientX, clientY);
      setHoverSlot(slot !== null && boardSlots[slot] === null ? slot : null);
    };

    const handleEnd = (e) => {
      const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? 0;

      if (!hasMoved.current) {
        // Didn't drag — treat as tap (appends to end)
        handleTileTap(dragging.trayIndex);
      } else {
        // Dropped — place on any empty slot
        const slot = findSlotAtPosition(clientX, clientY);
        if (slot !== null && boardSlots[slot] === null) {
          placeLetterAt(dragging.trayIndex, slot);
        }
      }

      setDragging(null);
      setHoverSlot(null);
      dragStartPos.current = null;
      hasMoved.current = false;
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [dragging, boardSlots, findSlotAtPosition, handleTileTap, placeLetterAt]);

  // ---- SUBMIT ----
  const handleSubmit = useCallback(async () => {
    if (filledCount < 2 || submitting) return;
    setSubmitting(true);
    setInvalidMessage('');
    setInvalidSlots([]);

    const word = boardSlots.filter(Boolean).join('');
    const placement = [];
    for (let i = 0; i < 5; i++) {
      if (boardSlots[i]) placement.push(i);
    }

    // Check for gaps
    for (let i = 1; i < placement.length; i++) {
      if (placement[i] !== placement[i - 1] + 1) {
        setInvalidMessage('NO GAPS — LETTERS MUST BE CONSECUTIVE');
        setInvalidSlots(placement);
        setShaking(true);
        setTimeout(() => { setShaking(false); setInvalidSlots([]); }, 400);
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(API_BASE + '/api/score/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          placement,
          letters: puzzle.letters,
          board: puzzle.board,
          distribution: puzzle.distribution,
        }),
      });
      const data = await res.json();

      if (data.error || !res.ok) {
        setInvalidMessage(data.error || 'NOT A VALID WORD');
        setInvalidSlots(placement);
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
          setInvalidSlots([]);
        }, 400);
      } else {
        // Record stats
        const stats = recordGame(data.score, data.percentile, word, data.bestWord || '');
        data.stats = stats;

        setRevealResult(data);
        setRevealWord(word);

        // Confetti if player got the best word
        if (stats.wasPerfect) {
          setTimeout(() => fireConfetti(), 600);
        }
      }
    } catch {
      setInvalidMessage('Connection error');
    } finally {
      setSubmitting(false);
    }
  }, [boardSlots, filledCount, submitting, userId]);

  const handleNewGame = useCallback(async () => {
    setRevealResult(null);
    setRevealWord('');
    setBoardSlots([null, null, null, null, null]);
    setSlotSources([null, null, null, null, null]);
    setInvalidMessage('');
    setInvalidSlots([]);
    await fetchRandomPuzzle();
  }, [fetchRandomPuzzle]);

  // Show reveal screen
  if (revealResult) {
    return <RevealScreen result={revealResult} word={revealWord} onPlayAgain={handleNewGame} />;
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F3EF' }}>
        <span className="text-black/20 text-sm font-light" style={{ letterSpacing: '4px' }}>
          LOADING
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center select-none overflow-hidden"
      style={{
        background: '#F5F3EF',
        touchAction: 'none',
        height: '100dvh',
        maxHeight: '-webkit-fill-available',
      }}
    >
      <Header
        onLogoDown={handleLogoDown}
        onLogoUp={handleLogoUp}
        onStatsClick={() => setShowStats(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      <div className="flex-1 flex flex-col items-center justify-between w-full px-4 min-h-0">
        {/* Top section: score + board */}
        <div className="flex flex-col items-center">
          <ScoreDisplay score={score} />

          <div className={shaking ? 'shake-animation' : ''}>
            <Board
              slots={boardSlots}
              boardTypes={puzzle.board}
              onSlotTap={handleSlotTap}
              invalidSlots={invalidSlots}
              hoverSlot={hoverSlot}
              slotRefs={slotRefs}
            />
          </div>

          {invalidMessage ? (
            <div
              className="text-xs font-light mt-2 text-center"
              style={{ color: '#f87171', letterSpacing: '3px' }}
            >
              {invalidMessage}
            </div>
          ) : (
            <div
              className="text-[10px] font-light mt-2 text-center text-black/15"
              style={{ letterSpacing: '2px' }}
            >
              DRAG OR TAP TILES TO THE BOARD
            </div>
          )}
        </div>

        {/* Bottom section: letter tray + buttons (thumb zone) */}
        <div className="flex flex-col items-center pb-3">
          <LetterTray
            letters={puzzle.letters}
            placedIndices={placedIndices}
            onTileTap={handleTileTap}
            onDragStart={handleDragStart}
          />

          <ActionButtons
            canSubmit={filledCount >= 2}
            onClear={handleClear}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>

      {/* Modals */}
      {showStats && <StatsScreen onClose={() => setShowStats(false)} />}
      {showHelp && <HowToPlay onClose={() => { setShowHelp(false); localStorage.setItem('slate_seen_help', '1'); }} />}

      {/* Floating drag ghost */}
      {dragging && hasMoved.current && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center rounded-lg border"
          style={{
            width: 54,
            height: 58,
            background: '#C9A84C',
            borderColor: '#B8953A',
            left: dragPos.x - 27,
            top: dragPos.y - 29,
            transform: 'scale(1.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <span className="text-lg font-medium leading-none" style={{ color: '#fff' }}>
            {dragging.letter}
          </span>
          <span className="text-[10px] font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {getLetterValue(dragging.letter)}
          </span>
        </div>
      )}
    </div>
  );
}
