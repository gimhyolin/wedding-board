// arcture 스타일 — 굵기 대비로 브랜드감 표현
// "Wedding" bold + "Board" light, 같은 라인

export default function WeddingBoardLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-0 select-none ${className}`}>
      <span
        style={{
          fontFamily: "'Outfit', 'DM Sans', sans-serif",
          fontWeight: 800,
          fontSize: '1.15rem',
          letterSpacing: '-0.04em',
          color: '#0f172a',
          lineHeight: 1,
        }}
      >
        Wedding
      </span>
      <span
        style={{
          fontFamily: "'Outfit', 'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: '1.15rem',
          letterSpacing: '-0.04em',
          color: '#0f172a',
          lineHeight: 1,
          marginLeft: '0.22em',
        }}
      >
        Board
      </span>
    </span>
  );
}
