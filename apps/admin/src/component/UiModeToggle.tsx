'use client';

import { RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type UiMode = 'modern' | 'classic';

const STORAGE_KEY = 'meditest_admin_ui_mode';

export default function UiModeToggle() {
  const [mode, setMode] = useState<UiMode>('modern');

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as UiMode | null;
    const initialMode = savedMode === 'classic' ? 'classic' : 'modern';
    setMode(initialMode);
    document.documentElement.setAttribute('data-admin-ui', initialMode);
  }, []);

  const changeMode = (nextMode: UiMode) => {
    setMode(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
    document.documentElement.setAttribute('data-admin-ui', nextMode);
  };

  return (
    <div className="admin-mode-toggle" aria-label="Admin UI mode">
      <button
        type="button"
        aria-pressed={mode === 'modern'}
        onClick={() => changeMode('modern')}
        className={mode === 'modern' ? 'active' : ''}
        title="Modern UI"
      >
        <Sparkles aria-hidden className="h-3.5 w-3.5" />
        <span>Modern</span>
      </button>
      <button
        type="button"
        aria-pressed={mode === 'classic'}
        onClick={() => changeMode('classic')}
        className={mode === 'classic' ? 'active' : ''}
        title="Classic UI"
      >
        <RotateCcw aria-hidden className="h-3.5 w-3.5" />
        <span>Classic</span>
      </button>
    </div>
  );
}
