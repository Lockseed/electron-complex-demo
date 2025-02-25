import { join } from "path";
import { app, utilityProcess, MessageChannelMain } from "electron";
import { AsyncCall } from "async-call-rpc";

import logger from "./logger.js";
import isDev from "./isDev.js";
import { registerBeforeQuitTask } from "./beforeQuitTasks.js";
import { toLogFormat } from "@/common/errors.js";
import { WORKER_NEW_CONNECTION_CHANNEL_NAME } from "@/common/constants.js";


/** @type {PromiseWithResolvers<Electron.UtilityProcess>} */ 
let resolvers = Promise.withResolvers();
export let whenWorkerReady = resolvers.promise;
let processing = false;

/** @type {import("../common/types.js").RpcServerWorkerToMain | undefined} */ 
export let rpcMainSide;

/**
 * 创建 worker process 处理 IO/CPU 占用较高的任务
 * @returns {Promise<Electron.UtilityProcess>}
 */
export function setupWorkerProcess() {
  if (processing) {
    logger.warn("[workerManager][setupWorkerProcess] Already processing.");
    return whenWorkerReady;
  }

  processing = true;
  logger.info("[workerManager][setupWorkerProcess] Start.");

  try {
    const WORKER_FILE_PATH = join(import.meta.dirname, "worker.mjs");
    const worker = utilityProcess.fork(WORKER_FILE_PATH, [], {
      serviceName: "worker-process",
      execArgv: isDev ? ["--inspect=5859"] : [],
    });
  
    logger.info("[workerManager][setupWorkerProcess] Fork.");
  
    registerBeforeQuitTask(() => {
      worker.kill();
      return;
    });
  
    worker.once("spawn", () => {
      logger.info(`[workerManager][setupWorkerProcess] Worker process spawned. PID: ${worker.pid}`);

      rpcMainSide = createRpcMainSide(worker);
  
      resolvers.resolve(worker);
    });
  } catch (error) {
    logger.error("[workerManager][setupWorkerProcess] Error:", toLogFormat(error));
    resolvers.reject(error);
  }
  
  return whenWorkerReady.finally(() => {
    logger.info("[workerManager][setupWorkerProcess] Done.");
    processing = false;
  });
}

const mainProcessSideImplementation = {
  getPath(name) {
    console.log("[workerManager][setupWorkerProcess] getPath", name);
    return app.getPath(name);
  }
};

/**
 * 创建 main <--> worker 的 RPC 通信
 * @param {Electron.UtilityProcess} worker 
 * @returns {import("../common/types.js").RpcServerWorkerToMain}
 */
export function createRpcMainSide(worker) {
  logger.info(`[createRpcMainSide] Create RPC main side for worker process. PID: ${worker.pid}`);
  return AsyncCall(mainProcessSideImplementation, {
    channel: {
      on(listener) {
        const f = (data) => listener(data);
        worker.on("message", f);
        return () => {
          worker.off("message", f);
        };
      },
      send(data) {
        worker.postMessage(data);
      },
    },
  });
}

/**
 * 创建用于沟通 renderer <--> worker 的消息通道
 * 这个通道后续会被用来创建 RPC
 * @param {Electron.WebContents} webContents 
 */
export async function connectWorkerToRenderer(webContents) {
  logger.info("[connectWorkerToRenderer] Connect worker to renderer. id:", webContents.id);
  const worker = await whenWorkerReady;
  const { port1: workerPort, port2: rendererPort } = new MessageChannelMain();

  worker.postMessage(WORKER_NEW_CONNECTION_CHANNEL_NAME, [workerPort]);
  webContents.postMessage(WORKER_NEW_CONNECTION_CHANNEL_NAME, null, [rendererPort]);

  webContents.on("destroyed", () => {
    try {
      workerPort.close();
      rendererPort.close();
    } catch (error) {
      logger.error(`[connectToRenderer] Close worker-renderer connection when renderer destroyed with error.`, toLogFormat(error));
    }
  })
}