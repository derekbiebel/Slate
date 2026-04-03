export default function Header({ onLogoDown, onLogoUp }) {
  return (
    <header className="w-full pt-3 pb-1 flex justify-center shrink-0">
      <img
        src="/logo.png"
        alt="Slate"
        className="h-10 w-auto"
        style={{ mixBlendMode: 'multiply' }}
        onPointerDown={onLogoDown}
        onPointerUp={onLogoUp}
        onPointerCancel={onLogoUp}
      />
    </header>
  );
}
