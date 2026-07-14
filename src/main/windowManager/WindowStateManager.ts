import { screen } from 'electron';
import { debounce } from 'lodash-es';

import type { WindowState } from '../store/global.js';

interface WindowStateManagerOptions {
  loadState: () => WindowState;
  saveState: (state: WindowState) => void;
  defaultState: WindowState;
}

export default class WindowStateManager {
  #winRef: Electron.BrowserWindow | null = null;
  #state: WindowState;
  #saveState: (state: WindowState) => void;
  #loadState: () => WindowState;
  #defaultState: WindowState;

  constructor(options: WindowStateManagerOptions) {
    this.#saveState = options.saveState;
    this.#loadState = options.loadState;
    this.#defaultState = options.defaultState;

    // 初始化加载数据
    this.#state = this.#loadState();
    this.#ensureWindowVisibleOnSomeDisplay();
    console.log('[WindowStateManager] Load state', this.#state);
  }

  get x() {
    return this.#state.x;
  }
  get y() {
    return this.#state.y;
  }
  get width() {
    return this.#state.width;
  }
  get height() {
    return this.#state.height;
  }

  /**
   *
   * @param {Electron.BrowserWindow} win
   */
  manage(win: Electron.BrowserWindow): void {
    this.#winRef = win;
    this.#winRef.on('resize', this.#stateChangeHandler);
    this.#winRef.on('move', this.#stateChangeHandler);
    this.#winRef.on('close', this.#windowCloseHandler);
    this.#winRef.on('closed', this.#windowClosedHandler);
  }

  unmanage(): void {
    this.#winRef = null;
  }

  #isNormal(win: Electron.BrowserWindow): boolean {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  }

  #updateState(): void {
    try {
      if (!this.#winRef) return;
      if (!this.#isNormal(this.#winRef)) return;

      const windowBounds = this.#winRef.getBounds();
      this.#state = {
        x: windowBounds.x,
        y: windowBounds.y,
        width: windowBounds.width,
        height: windowBounds.height,
      };
    } catch (error) {
      console.error('[WindowStateManager] updateState error', error);
    }
  }

  #resetStateToDefault(): void {
    this.#state = this.#defaultState;
  }

  #ensureWindowVisibleOnSomeDisplay(): void {
    const visible = screen.getAllDisplays().some((display) => {
      const bounds = display.bounds;
      return (
        this.#state.x >= bounds.x &&
        this.#state.y >= bounds.y &&
        this.#state.x + this.#state.width <= bounds.x + bounds.width &&
        this.#state.y + this.#state.height <= bounds.y + bounds.height
      );
    });

    if (!visible) {
      return this.#resetStateToDefault();
    }
  }

  #debounceUpdateState = debounce(this.#updateState.bind(this), 300);

  #stateChangeHandler = this.#debounceUpdateState.bind(this);
  #windowCloseHandler = this.#updateState.bind(this);
  #windowClosedHandler = (): void => {
    // console.log("[WindowStateManager] Before save state", this.#state);
    this.#saveState(this.#state);
    this.unmanage();
  };
}
