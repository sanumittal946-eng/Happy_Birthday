import React from 'react';

/**
 * Pure CSS floating balloons background.
 * Animates strictly on transform (translateY + translateX sway) on the compositor thread.
 * Max 5 balloons, low opacity, never blocks content.
 */
export default function FloatingBalloonsBg() {
  const balloons = [
    { id: 1, left: '12%', delay: '0s', duration: '14s', bg: '#fbcfe8', heart: true },
    { id: 2, left: '32%', delay: '5s', duration: '17s', bg: '#e9d5ff', heart: false },
    { id: 3, left: '60%', delay: '2s', duration: '15s', bg: '#fed7aa', heart: true },
    { id: 4, left: '82%', delay: '8s', duration: '18s', bg: '#fecdd3', heart: true },
    { id: 5, left: '46%', delay: '11s', duration: '16s', bg: '#f5d0fe', heart: false },
  ];

  return (
    <div className="balloons-bg-container" aria-hidden="true">
      {balloons.map((b) => (
        <div
          key={b.id}
          className="css-floating-balloon"
          style={{
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.duration,
            backgroundColor: b.bg,
          }}
        >
          {b.heart && <span className="balloon-heart-mark">♥</span>}
          <div className="balloon-knot-css" style={{ borderBottomColor: b.bg }} />
          <div className="balloon-string-css" />
        </div>
      ))}
    </div>
  );
}
