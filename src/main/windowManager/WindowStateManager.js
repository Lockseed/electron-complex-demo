import { screen } from "electron";
import { debounce } from "lodash-es";

/**
 * @typedef {Object} WindowState
 * @property {number} width
 * @property {number} height
 * @property {number} x
 * @property {number} y
 */


export default class WindowStateManager {
  /** @type {Electron.BrowserWindow} */ #winRef;
  /** @type {WindowState} */ #state;
  /** @type {(state: any) => void} */ #saveState;
  /** @type {() => any} */ #loadState;

  /**
   * 
   * @param {object} options 
   * @param {() => any} options.loadState
   * @param {(state: any) => void} options.saveState
   * @param {WindowState} options.defaultState
   */
  constructor(options) {
    this.#saveState = options.saveState;
    this.#loadState = options.loadState;
    this.defaultState = options.defaultState;

    // 初始化加载数据
    this.#state = this.#loadState();
    this.#ensureWindowVisibleOnSomeDisplay();
    console.log("[WindowStateManager] Load state", this.#state);
  }

  get x() { return this.#state.x; }
  get y() { return this.#state.y; }
  get width() { return this.#state.width; }
  get height() { return this.#state.height; }

  /**
   * 
   * @param {Electron.BrowserWindow} win 
   */
  manage(win) {
    this.#winRef = win;
    this.#winRef.on("resize", this.#stateChangeHandler);
    this.#winRef.on("move", this.#stateChangeHandler);
    this.#winRef.on("close", this.#windowCloseHandler);
    this.#winRef.on("closed", this.#windowClosedHandler);
  }

  unmanage() {
    this.#winRef = null;
  }

  /**
   * 
   * @param {Electron.BrowserWindow} win 
   */
  #isNormal(win) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  } 

  #updateState() {
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
      console.error("[WindowStateManager] updateState error", error);
    }
  }

  #resetStateToDefault() {
    if (this.defaultState) {
      this.#state = this.defaultState;
    }
  }

  #ensureWindowVisibleOnSomeDisplay() {
    const visible = screen.getAllDisplays().some(display => {
      const bounds = display.bounds;
      return (
        this.#state.x >= bounds.x &&
        this.#state.y >= bounds.y &&
        this.#state.x + this.#state.width <= bounds.x + bounds.width &&
        this.#state.y + this.#state.height <= bounds.y + bounds.height
      )
    });

    if (!visible) {
      return this.#resetStateToDefault();
    }
  }

  #debounceUpdateState = debounce(this.#updateState.bind(this), 300);

  #stateChangeHandler = this.#debounceUpdateState.bind(this);
  #windowCloseHandler = this.#updateState.bind(this);
  #windowClosedHandler = () => {
    // console.log("[WindowStateManager] Before save state", this.#state);
    this.#saveState(this.#state);
    this.unmanage();
  }
}
