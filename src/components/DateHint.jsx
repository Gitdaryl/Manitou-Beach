import React from 'react';
import { dateSanityHint } from '../utils/dateSanity';

// A warm nudge under a date field, not a red error. It never blocks the form -
// the organizer might genuinely mean an odd date, and shouting at someone who
// mistyped a year is a good way to lose an event listing.
export default function DateHint({ iso }) {
  const hint = dateSanityHint(iso);
  if (!hint) return null;
  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        margin: '8px 0 0', padding: '10px 12px', borderRadius: 8,
        background: 'rgba(212,132,90,0.12)', border: '1px solid rgba(212,132,90,0.3)',
        fontSize: 13, lineHeight: 1.55, color: '#E8A87C',
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <span aria-hidden="true">👋</span>
      <span>{hint}</span>
    </div>
  );
}
