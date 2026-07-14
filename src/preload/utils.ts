import type {
  RemoteAPIMap,
  RemoteEventMap,
  RemoteEventSubscription,
} from '@/common/remote-contracts.js';

interface RemoteFactoryOptions {
  tag?: string;
}

type RemoteCaller = (channel: string, ...args: unknown[]) => Promise<unknown>;
type RemoteApiObject = Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
type RemoteEventObject = Record<string, Record<string, RemoteEventSubscription>>;

export function parseProcessArgv<T = unknown>(key: string): T | null {
  try {
    const arg = process.argv.find((arg) => arg.startsWith(key));
    return arg ? (JSON.parse(arg.split('=')[1]) as T) : null;
  } catch (_) {
    //
    return null;
  }
}

export function createRemoteAPI(
  apiMap: RemoteAPIMap | null,
  caller: RemoteCaller,
  options: RemoteFactoryOptions = {}
): RemoteApiObject {
  const tag = options?.tag || 'unknown';

  if (!apiMap || !Array.isArray(apiMap)) {
    console.warn(`[createRemoteAPI][${tag}] Invalid apiMap.`);
    return {};
  }

  // { serviceA: { handlerA1, handlerA2, ... }, serviceB: { ... } }
  return apiMap.reduce<RemoteApiObject>((apiObj, [namespace, handlerNames]) => {
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
    apiObj[namespace] = handlerNames.reduce<
      Record<string, (...args: unknown[]) => Promise<unknown>>
    >((callerObj, handlerName) => {
      const channel = `${namespace}::${handlerName}`;
      callerObj[handlerName] = (...args) => caller(channel, ...args);
      return callerObj;
    }, {});

    return apiObj;
  }, {});
}

export function createRemoteEvent(
  eventMap: RemoteEventMap | null,
  register: (channel: string) => RemoteEventSubscription,
  options: RemoteFactoryOptions = {}
): RemoteEventObject {
  const tag = options?.tag || 'unknown';

  if (!eventMap || !Array.isArray(eventMap)) {
    console.warn(`[createRemoteEvent][${tag}] Invalid eventMap.`);
    return {};
  }

  return eventMap.reduce<RemoteEventObject>((eventObj, [namespace, eventNames]) => {
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
    eventObj[namespace] = eventNames.reduce<Record<string, RemoteEventSubscription>>(
      (registerObj, eventName) => {
        const channel = `${namespace}::${eventName}`;
        registerObj[eventName] = register(channel);
        return registerObj;
      },
      {}
    );

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
