export default function ActionButtons({
  canSubmit,
  onClear,
  onSubmit,
  submitting,
}) {
  return (
    <div className="flex justify-center gap-3 mt-5 mb-2 shrink-0 w-full max-w-[320px] mx-auto px-4">
      <button
        onClick={onClear}
        className="flex-1 py-3.5 rounded-lg text-xs font-light border transition-colors duration-200 active:opacity-70"
        style={{
          letterSpacing: '4px',
          background: 'transparent',
          borderColor: '#D5D0C8',
          color: '#999',
          minHeight: 48,
        }}
      >
        CLEAR
      </button>
      <button
        onClick={canSubmit ? onSubmit : undefined}
        disabled={!canSubmit || submitting}
        className="flex-1 py-3.5 rounded-lg text-xs font-medium border transition-all duration-200 active:opacity-70"
        style={{
          letterSpacing: '4px',
          background: canSubmit ? '#C9A84C' : '#E8E5DF',
          borderColor: canSubmit ? '#C9A84C' : '#D5D0C8',
          color: canSubmit ? '#fff' : '#ccc',
          cursor: canSubmit ? 'pointer' : 'default',
          opacity: submitting ? 0.6 : 1,
          minHeight: 48,
        }}
      >
        {submitting ? '...' : 'SUBMIT'}
      </button>
    </div>
  );
}
