// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Open hi-hat voice — same recipe as triggerHatClosed but longer decay.

import { _renderHat, type HatTrigger } from './hat-closed';

export type { HatTrigger } from './hat-closed';

export function triggerHatOpen(t: HatTrigger): void {
  _renderHat(t, 0.32);
}
