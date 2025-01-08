import { ipcRenderer } from "electron";

import { IPC_API_CHANNEL_NAME } from "@/common/constants.js";


function genMainProcessAPIs() {
  console.log("[genMainProcessAPIs] Generating main process APIs...");

  const /** @type {[string, string[]][]|null} */ apiMap = (() => {
    console.log("[genMainProcessAPIs] process.argv: ", process.argv);
    const key = "--main-process-api-map";
    const arg = process.argv.find(arg => arg.startsWith(key));
    return arg ? JSON.parse(arg.split("=")[1]) : null;
  })();

  console.log("[genMainProcessAPIs] API map: ", apiMap);

  // check map
  if (!apiMap || !Array.isArray(apiMap)) {
    console.warn("[genMainProcessAPIs] Invalid apiMap.");
    return {};
  }

  // 为了方便后续处理将数据对象展开为数组
  const namespaceHandlerObjectPairs = apiMap.map(([namespace, handlerNames]) => {
    // check handler names
    if (!Array.isArray(handlerNames)) {
      console.error(`[genMainProcessAPIs] Invalid handlerNames for namespace: ${namespace}`);
      return [namespace, {}];
    } else if (handlerNames.length >= 1 && handlerNames.some(handlerName => typeof handlerName !== 'string')) {
      console.error(`[genMainProcessAPIs] Invalid handlerName for namespace: ${namespace}`);
      return [namespace, {}];
    }

    // [handlerA1, handlerA2, ...] => [[handlerA1, handlerA1Function], [handlerA2, handlerA2Function], ...]
    const handlerNameFunctionPairs = handlerNames.map(handlerName => {
      const channel = `${namespace}::${handlerName}`;
      return [handlerName, (...args) => ipcRenderer.invoke(IPC_API_CHANNEL_NAME, channel, ...args)];
    });

    //[namespaceA, { handlerA1: handlerA1Function, handlerA2: handlerA2Function, ...}]
    return [namespace, Object.fromEntries(handlerNameFunctionPairs)];
  });

  // { namespaceA: { handlerA1: handlerA1Function, handlerA2: handlerA2Function, ...}, namespaceB: { handlerB1: handlerB1Function, handlerB2: handlerB2Function,
  const apis =  Object.fromEntries(namespaceHandlerObjectPairs);

  console.log("[genMainProcessAPIs] Main process APIs generated: ", apis);
  return apis;
}

function genWokerProcessAPIs() {
  return {}
}

export function genRemoteAPIs() {
  return {
    ...genMainProcessAPIs(),
    ...genWokerProcessAPIs()
  }
}