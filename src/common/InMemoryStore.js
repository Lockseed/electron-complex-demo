import { getProperty, setProperty, hasProperty, deleteProperty } from './dotPathProps.js';
import { isPlainObject } from './utils.js';
import { isEqual, cloneDeep } from 'lodash-es';

function createPlainObject() {
  return Object.create(null);
}

/**
 * @class InMemoryStore
 * @param {Object} [options]
 * @param {Object} [options.defaults]
 */
export default class InMemoryStore {
  #events = new EventTarget();
  /** @type {Object} */ #defaultStore;
  /** @type {Object} */ #store;

  constructor(options = {}) {
    this.#defaultStore = Object.assign(createPlainObject(), options.defaults);
    this.#store = Object.assign(createPlainObject(), options.defaults);
    console.log('[InMemoryStore] Created', this.#store);
  }

  get store() {
    return cloneDeep(this.#store);
  }

  set store(newStore) {
    this.#store = Object.assign(createPlainObject(), newStore);
    this.#events.dispatchEvent(new Event('change'));
  }

  /**
   *
   * @param {string} key
   * @param {any} defaultValue
   * @returns
   */
  get(key, defaultValue) {
    return getProperty(this.#store, key, defaultValue);
  }

  /**
   *
   * @param {string | Object} keyOrObj
   * @param {any} value
   */
  set(keyOrObj, value) {
    if (isPlainObject(keyOrObj)) {
      for (const [key, value] of Object.entries(keyOrObj)) {
        setProperty(this.#store, key, value);
      }
    } else {
      setProperty(this.#store, keyOrObj, value);
    }
    this.#events.dispatchEvent(new Event('change'));
  }

  /**
   *
   * @param {string} key
   * @returns
   */
  has(key) {
    return hasProperty(this.#store, key);
  }

  delete(key) {
    const store = this.#store;
    deleteProperty(store, key);
    this.#store = store;
  }

  clear() {
    this.#store = createPlainObject();
  }

  reset() {
    this.#store = Object.assign(createPlainObject(), this.#defaultStore);
  }

  /**
   *
   * @param {string} key
   * @param {(newValue: any, oldValue: any) => void} callback
   */
  watch(key, callback) {
    if (typeof key !== 'string') {
      throw new TypeError('Invalid key');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('Invalid callback');
    }
    return this.#handleChange(() => this.get(key), callback);
  }

  /**
   *
   * @param {(newValue: any, oldValue: any) => void} callback
   */
  watchAll(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Invalid callback');
    }
    return this.#handleChange(() => this.#store, callback);
  }

  /**
   *
   * @param {() => any} getter
   * @param {(newValue: any, oldValue: any) => void} callback
   * @returns {() => void}
   */
  #handleChange(getter, callback) {
    let oldValue = getter();
    const onChange = () => {
      const newValue = getter();

      if (isEqual(oldValue, newValue)) {
        return;
      }
      oldValue = newValue;
      callback.call(this, newValue, oldValue);
    };

    this.#events.addEventListener('change', onChange);

    return () => {
      this.#events.removeEventListener('change', onChange);
    };
  }

  *[Symbol.iterator]() {
    for (const key in this.#store) {
      yield [key, this.#store[key]];
    }
  }
}
