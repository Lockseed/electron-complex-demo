// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import "electron-log/preload.js";
import { kindOf, sleep } from "@/common/utils.js";

(async() => {
  await sleep(1000);
  console.log("Kind of Promise is", kindOf(Promise.resolve()));
})();