import { getProperty, setProperty, hasProperty, deleteProperty } from './dotPathProps.js';
import type { JsonRecord } from './remote-contracts.js';
import { isPlainObject } from './utils.js';
import { isEqual, cloneDeep } from 'lodash-es';

interface InMemoryStoreOptions {
  defaults?: JsonRecord;
}

function createPlainObject(): JsonRecord {
  return Object.create(null) as JsonRecord;
}

export default class InMemoryStore {
  #events = new EventTarget();
  #defaultStore: JsonRecord;
  #store: JsonRecord;

  constructor(options: InMemoryStoreOptions = {}) {
    this.#defaultStore = Object.assign(createPlainObject(), options.defaults);
    this.#store = Object.assign(createPlainObject(), options.defaults);
    console.log('[InMemoryStore] Created', this.#store);
  }

  get store(): JsonRecord {
    return cloneDeep(this.#store);
  }

  set store(newStore: JsonRecord) {
    this.#store = Object.assign(createPlainObject(), newStore);
    this.#events.dispatchEvent(new Event('change'));
  }

  get<T = unknown>(key: string): T | undefined;
  get<T = unknown>(key: string, defaultValue: T): T;
  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    return getProperty(this.#store, key, defaultValue);
  }

  set(keyOrObj: string | JsonRecord, value?: unknown): void {
    if (typeof keyOrObj === 'string') {
      setProperty(this.#store, keyOrObj, value);
    } else if (isPlainObject(keyOrObj)) {
      for (const [key, value] of Object.entries(keyOrObj)) {
        setProperty(this.#store, key, value);
      }
    }
    this.#events.dispatchEvent(new Event('change'));
  }

  has(key: string): boolean {
    return hasProperty(this.#store, key);
  }

  delete(key: string): void {
    const store = this.#store;
    deleteProperty(store, key);
    this.#store = store;
  }

  clear(): void {
    this.#store = createPlainObject();
  }

  reset(): void {
    this.#store = Object.assign(createPlainObject(), this.#defaultStore);
  }

  watch<T = unknown>(
    key: string,
    callback: (newValue: T | undefined, oldValue: T | undefined) => void
  ): () => void {
    if (typeof key !== 'string') {
      throw new TypeError('Invalid key');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('Invalid callback');
    }
    return this.#handleChange(() => this.get<T>(key), callback);
  }

  watchAll(callback: (newValue: JsonRecord, oldValue: JsonRecord) => void): () => void {
    if (typeof callback !== 'function') {
      throw new TypeError('Invalid callback');
    }
    return this.#handleChange(() => this.#store, callback);
  }

  #handleChange<T>(getter: () => T, callback: (newValue: T, oldValue: T) => void): () => void {
    let oldValue = getter();
    const onChange = () => {
      const newValue = getter();

      if (isEqual(oldValue, newValue)) {
        return;
      }
      const previousValue = oldValue;
      oldValue = newValue;
      callback.call(this, newValue, previousValue);
    };

    this.#events.addEventListener('change', onChange);

    return () => {
      this.#events.removeEventListener('change', onChange);
    };
  }

  *[Symbol.iterator](): IterableIterator<[string, unknown]> {
    for (const key in this.#store) {
      yield [key, this.#store[key]];
    }
  }
}
