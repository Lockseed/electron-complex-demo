import { app } from 'electron';
// import Conf from "conf/dist/source";
import Store from 'electron-store';

// import logger from "@/main/logger.js";

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
}

type GlobalStoreSchema = {
  mainWindowState?: WindowState;
  [key: string]: unknown;
};

type GlobalStore = Store<GlobalStoreSchema>;

const resolvers = Promise.withResolvers<GlobalStore>();
export const whenGlobalStoreReady = resolvers.promise;

let globalStore: GlobalStore | undefined;

export function initGlobalStore(): void {
  globalStore = new Store<GlobalStoreSchema>({
    name: 'global-config',
    cwd: app.getPath('userData'),
  });
  resolvers.resolve(globalStore);
}

export function openGlobalStoreFile(): Promise<void> {
  if (!globalStore) {
    throw new Error('GlobalStore not initialized');
  }
  return globalStore.openInEditor();
}

export function setMainWindowState(windowState: WindowState): void {
  if (!globalStore) throw new Error('GlobalStore not initialized');
  globalStore.set('mainWindowState', windowState);
}

export function getMainWindowState(
  defaultState: WindowState = { width: 800, height: 600, x: 20, y: 20 }
): WindowState {
  if (!globalStore) throw new Error('GlobalStore not initialized');
  return globalStore.get('mainWindowState', defaultState);
}
