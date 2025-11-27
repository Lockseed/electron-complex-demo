/**
 *
 * @param {string} key
 */
export function parseProcessArgv(key) {
  try {
    const arg = process.argv.find((arg) => arg.startsWith(key));
    return arg ? JSON.parse(arg.split('=')[1]) : null;
  } catch (_) {
    //
    return null;
  }
}

/**
 *
 * @param {[string, string[]][]|null} apiMap
 * @param {(channel: string, ...args: any[]) => Promise<any>} caller
 * @param {object} [options={}]
 * @param {string} [options.tag]
 * @returns {Record<string, Record<string, (...args: any[]) => Promise<any> >> | {}}
 */
export function createRemoteAPI(apiMap, caller, options = {}) {
  const tag = options?.tag || 'unknown';

  if (!apiMap || !Array.isArray(apiMap)) {
    console.warn(`[createRemoteAPI][${tag}] Invalid apiMap.`);
    return {};
  }

  // { serviceA: { handlerA1, handlerA2, ... }, serviceB: { ... } }
  return apiMap.reduce((apiObj, [namespace, handlerNames]) => {
    if (!Array.isArray(handlerNames)) {
      console.error(`[createRemoteAPI][${tag}] Invalid handlerNames for namespace: ${namespace}`);
      return apiObj;
    } else if (
      handlerNames.length >= 1 &&
      handlerNames.some((handlerName) => typeof handlerName !== 'string')
    ) {
      console.error(`[createRemoteAPI][${tag}] Invalid handlerName for namespace: ${namespace}`);
      return apiObj;
    }

    // apiObj["serviceA"] = { handlerA1: callerA1, handerA2: callerA2, ... }
    apiObj[namespace] = handlerNames.reduce((callerObj, handlerName) => {
      const channel = `${namespace}::${handlerName}`;
      callerObj[handlerName] = (...args) => caller(channel, ...args);
      return callerObj;
    }, {});

    return apiObj;
  }, {});
}

/**
 * @typedef {(...args: any[]) => void} RmoteEventListener
 */

/**
 * @typedef {(listener: RmoteEventListener) => () => void} RemoteEventSubscription
 * @example
 * // onSomeEvent is a RemoteEventSubscription
 * const unsub = onSomeEvent((...args) => {
 *   console.log("Some event received: ", args);
 * });
 */

/**
 *
 * @param {[string, string[]][]|null} eventMap
 * @param {(channel: string) => RemoteEventSubscription} register
 * @param {object} [options={}]
 * @param {string} [options.tag]
 * @returns {Record<string, Record<string, RemoteEventSubscription>> | {}}
 */
export function createRemoteEvent(eventMap, register, options = {}) {
  const tag = options?.tag || 'unknown';

  if (!eventMap || !Array.isArray(eventMap)) {
    console.warn(`[createRemoteEvent][${tag}] Invalid eventMap.`);
    return {};
  }

  return eventMap.reduce((eventObj, [namespace, eventNames]) => {
    if (!Array.isArray(eventNames)) {
      console.error(`[createRemoteEvent][${tag}] Invalid eventNames for namespace: ${namespace}`);
      return eventObj;
    } else if (
      eventNames.length >= 1 &&
      eventNames.some((eventName) => typeof eventName !== 'string')
    ) {
      console.error(`[createRemoteEvent][${tag}] Invalid eventName for namespace: ${namespace}`);
      return eventObj;
    }

    // eventObj["serviceA"] = { eventA1: registerA1, eventA2: registerA2, ... }
    eventObj[namespace] = eventNames.reduce((registerObj, eventName) => {
      const channel = `${namespace}::${eventName}`;
      registerObj[eventName] = register(channel);
      return registerObj;
    }, {});

    return eventObj;
  }, {});
}

// const eventRegisterPair = eventNames.map((eventName) => {
//   const channel = `${namespace}::${eventName}`;
//   /** @type {(listener: (...args: any[]) => void) => () => void} */
//   const register = (listener) => {
//     eventEmitter.addListener(channel, listener);
//     console.log("[genMainProcessEvents] Event listener registered: ", channel);
//     return function unregister() {
//       eventEmitter.removeListener(channel, listener);
//       console.log("[genMainProcessEvents] Event listener unregistered: ", channel);
//     }
//   };

//   return [eventName, register]
// });
// // { eventName1: registerFunction1, eventName2: registerFunction2, ...}
// const eventRegisterMap = Object.fromEntries(eventRegisterPair);
// // [namespaces, {eventName1: registerFunction1, eventName2: registerFunction2, ...}]
// return [namespace, eventRegisterMap];
// });

// const events = Object.fromEntries(namespaceEventRegisterMapPairs);
// console.log("[genMainProcessEvents] Main process events generated: ", events);
