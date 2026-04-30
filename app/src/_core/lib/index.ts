// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.

export {
  logError,
  logWarn,
  setLogPrefix,
  subscribeLog,
  type LogEntry,
} from './log';

export {
  readUrlState,
  type ReadUrlStateOpts,
  type UrlState,
} from './url-state';

export { ErrorBoundary, ErrorToasts } from './errors';
export { PWAStatus } from './pwa';

export {
  makeIdListStore,
  readKeyedRecord,
  readNumber,
  readStringArray,
  writeKeyedRecord,
  writeNumber,
  writeStringArray,
} from './storage';

export {
  makeDatabase,
  safeLoadAll,
  type DexieVersionedStores,
  type LoadedRow,
} from './db';
