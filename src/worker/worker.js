console.log("Worker loaded");
import { WORKER_NEW_CONNECTION_CHANNEL_NAME } from "@/common/constants.js";
import { registerWorkerAPIs } from "./handlers.js";
import { registerWorkerEvents } from "./events.js";
import "./rpc.js";


process.parentPort.on("message", ({ data, ports }) => {
  if (data === WORKER_NEW_CONNECTION_CHANNEL_NAME && ports.length > 0) {
    const workerPort = ports[0];
    const rpc = registerWorkerAPIs(workerPort);
    registerWorkerEvents(rpc);
    workerPort.start();
  }
});
