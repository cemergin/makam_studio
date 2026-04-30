// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// PWA install-prompt banner.
//
// Service-worker registration + update toast lives in
// `components/UpdateBanner.tsx` in the consuming app — that's the
// single SW lifecycle owner. This component handles only the
// `beforeinstallprompt` flow (Add to Home Screen). They are mounted
// from different roots (main.tsx vs App.tsx) but no longer compete
// over registerSW().
//
// PARAMETERIZATION:
//   - storage key for "user dismissed install prompt" — pass
//     `storageKey` (default mirrors BeatForge's so existing installs
//     keep their dismissed flag).
//   - All user-facing strings — pass `texts` to override.
//   - Style — uses inline styles with `var(...)` CSS-variable
//     references. Define `--bg-2`, `--fg`, `--line`, `--accent`,
//     `--muted`, `--sans` in your stylesheet. Or override the styles
//     entirely by forking this file.

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DEFAULT_STORAGE_KEY = 'bf_install_prompt';

interface PWAStatusTexts {
  promptMessage: string;
  installButton: string;
  dismissButton: string;
}

const DEFAULT_TEXTS: PWAStatusTexts = {
  promptMessage: 'Install this app for faster access + offline use.',
  installButton: 'Install',
  dismissButton: 'Not now',
};

interface PWAStatusProps {
  storageKey?: string;
  texts?: Partial<PWAStatusTexts>;
}

function shouldShowInstall(storageKey: string): boolean {
  try {
    const v = localStorage.getItem(storageKey);
    if (!v) return true;
    const { dismissedAt } = JSON.parse(v) as { dismissedAt: number };
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
    return Date.now() - dismissedAt > thirtyDays;
  } catch {
    return true;
  }
}

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  background: 'var(--bg-2)',
  color: 'var(--fg)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  boxShadow: '0 8px 30px -10px rgba(0,0,0,0.2)',
  fontFamily: 'var(--sans)',
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '6px 12px',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
};
const mutedButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'transparent',
  color: 'var(--muted)',
};

export function PWAStatus({ storageKey = DEFAULT_STORAGE_KEY, texts }: PWAStatusProps = {}) {
  const t = { ...DEFAULT_TEXTS, ...texts };
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    const onInstallable = (e: Event) => {
      e.preventDefault();
      if (shouldShowInstall(storageKey)) setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onInstallable);
    return () => window.removeEventListener('beforeinstallprompt', onInstallable);
  }, [storageKey]);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'dismissed') dismissInstall();
    setInstallEvent(null);
  };

  const dismissInstall = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ dismissedAt: Date.now() }));
    } catch {
      // localStorage unavailable (private browsing, quota) — non-fatal.
    }
    setInstallDismissed(true);
  };

  if (!installEvent || installDismissed) return null;

  return (
    <div style={toastStyle}>
      <span>{t.promptMessage}</span>
      <button style={buttonStyle} onClick={install}>{t.installButton}</button>
      <button style={mutedButtonStyle} onClick={dismissInstall}>{t.dismissButton}</button>
    </div>
  );
}
