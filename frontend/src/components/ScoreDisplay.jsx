export default function ScoreDisplay({ score }) {
  return (
    <div className="text-center my-3 shrink-0">
      <div
        className="font-light transition-colors duration-200"
        style={{
          fontSize: 'clamp(48px, 12vw, 68px)',
          lineHeight: 1,
          color: score > 0 ? '#C9A84C' : '#D5D0C8',
        }}
      >
        {score}
      </div>
    </div>
  );
}
