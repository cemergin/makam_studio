// KeyboardOverlay — small bottom-of-screen panel that shows:
//   1. A live "key tape" of which physical keys are currently held.
//   2. A static cheat-sheet of the layout (3 rows + flower + space + shift).
//
// Reads window keydown/keyup directly. Independent of useKeyboardInput
// (which handles actual audio dispatch); this component only mirrors the
// raw key state for visual feedback.

import { useEffect, useState } from 'react';

const SCALE_KEYS = ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyA','KeyS','KeyD','KeyF','KeyG','KeyQ','KeyW','KeyE','KeyR','KeyT'];
const FLOWER_KEYS = ['KeyJ','KeyH','KeyN','KeyM','KeyK','KeyU','KeyI','KeyL'];
const SPECIAL_KEYS = ['Space','ShiftLeft','ShiftRight'];
const ALL_KEYS = new Set([...SCALE_KEYS, ...FLOWER_KEYS, ...SPECIAL_KEYS]);

const LABEL: Record<string, string> = {
  KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B',
  KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G',
  KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T',
  KeyJ: 'J', KeyH: 'H', KeyN: 'N', KeyM: 'M', KeyK: 'K', KeyU: 'U', KeyI: 'I', KeyL: 'L',
  Space: '␣', ShiftLeft: '⇧', ShiftRight: '⇧',
};

export function KeyboardOverlay() {
  const [held, setHeld] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (!ALL_KEYS.has(e.code) || e.repeat) return;
      setHeld((prev) => {
        if (prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
    };
    const onUp = (e: KeyboardEvent) => {
      setHeld((prev) => {
        if (!prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };
    const onBlur = () => setHeld(new Set());
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const KeyCap = ({ code, role }: { code: string; role: 'scale' | 'flower' | 'special' }) => (
    <span
      className={[
        'kbo__key',
        `kbo__key--${role}`,
        held.has(code) ? 'kbo__key--held' : '',
      ].filter(Boolean).join(' ')}
    >
      {LABEL[code] ?? code}
    </span>
  );

  return (
    <div className="kbo" aria-label="Keyboard layout + live input">
      <div className="kbo__group" aria-label="Scale rows">
        <div className="kbo__row">
          {['KeyQ','KeyW','KeyE','KeyR','KeyT'].map((c) => <KeyCap key={c} code={c} role="scale" />)}
          <span className="kbo__row-label">high</span>
        </div>
        <div className="kbo__row">
          {['KeyA','KeyS','KeyD','KeyF','KeyG'].map((c) => <KeyCap key={c} code={c} role="scale" />)}
          <span className="kbo__row-label">karar</span>
        </div>
        <div className="kbo__row">
          {['KeyZ','KeyX','KeyC','KeyV','KeyB'].map((c) => <KeyCap key={c} code={c} role="scale" />)}
          <span className="kbo__row-label">low</span>
        </div>
      </div>
      <div className="kbo__group" aria-label="Modifier flower">
        <div className="kbo__row">
          <KeyCap code="KeyU" role="flower" /><KeyCap code="KeyI" role="flower" />
          <span className="kbo__hint">+2 / +3</span>
        </div>
        <div className="kbo__row">
          <KeyCap code="KeyJ" role="flower" /><KeyCap code="KeyK" role="flower" />
          <span className="kbo__hint">canonical / +1</span>
        </div>
        <div className="kbo__row">
          <KeyCap code="KeyH" role="flower" /><KeyCap code="KeyN" role="flower" /><KeyCap code="KeyM" role="flower" />
          <span className="kbo__hint">−1 / −2 / −3</span>
        </div>
        <div className="kbo__row">
          <KeyCap code="KeyL" role="flower" />
          <span className="kbo__hint">pin / unpin active string</span>
        </div>
      </div>
      <div className="kbo__group" aria-label="Specials">
        <div className="kbo__row">
          <KeyCap code="Space" role="special" />
          <span className="kbo__hint">drone hold</span>
        </div>
        <div className="kbo__row">
          <KeyCap code="ShiftLeft" role="special" />
          <span className="kbo__hint">+5 transpose</span>
        </div>
      </div>
    </div>
  );
}
