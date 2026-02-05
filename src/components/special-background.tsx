"use client";

const AngelicBackground = () => (
  <div className="special-bg-container angelic-bg">
    <div className="particles"></div>
    <div className="light-ray ray-1" style={{ '--angle': '10deg' } as React.CSSProperties}></div>
    <div className="light-ray ray-2" style={{ '--angle': '-15deg' } as React.CSSProperties}></div>
    <div className="light-ray ray-3" style={{ '--angle': '5deg' } as React.CSSProperties}></div>
    <div className="light-ray ray-4" style={{ '--angle': '25deg' } as React.CSSProperties}></div>
  </div>
);

const CabbageBackground = () => (
  <div className="special-bg-container cabbage-bg">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="veggie"
        style={{
          left: `${Math.random() * 100}vw`,
          fontSize: `${Math.random() * 2 + 1.5}rem`,
          animationDuration: `${Math.random() * 10 + 15}s`,
          animationDelay: `-${Math.random() * 25}s`,
          '--x-start': `${Math.random() * 20 - 10}vw`,
          '--x-end': `${Math.random() * 20 - 10}vw`,
        } as React.CSSProperties}
      >
        {['🥬', '🥕', '🥦', '🍅', '🍔'][i % 5]}
      </div>
    ))}
  </div>
);


export function SpecialBackground({ type }: { type: 'angelic' | 'cabbage' }) {
    if (type === 'angelic') {
        return <AngelicBackground />;
    }
    if (type === 'cabbage') {
        return <CabbageBackground />;
    }
    return null;
}
