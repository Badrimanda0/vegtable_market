'use client';

import { resetDatabase } from './actions';
import { useState } from 'react';

export default function ResetButton() {
  const [clicksToUnlock, setClicksToUnlock] = useState(2);

  if (clicksToUnlock > 0) {
    return (
      <button 
        onClick={() => setClicksToUnlock(c => c - 1)}
        className="btn" 
        style={{ background: 'var(--text-muted)', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        🔒 Unlock Reset ({clicksToUnlock} clicks left)
      </button>
    );
  }

  return (
    <button 
      onDoubleClick={async () => {
        if (confirm('Are you ABSOLUTELY sure you want to delete all data? This cannot be undone.')) {
          await resetDatabase();
          alert('Database reset successfully.');
          setClicksToUnlock(2);
        }
      }} 
      onClick={() => alert('Please double-click this button if you really want to reset the database.')}
      className="btn" 
      style={{ background: 'var(--danger)', color: 'white', transition: 'all 0.2s' }}
      title="Double click to reset"
    >
      ⚠️ Reset Database (Double Click)
    </button>
  );
}
