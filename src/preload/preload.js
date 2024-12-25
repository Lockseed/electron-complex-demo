// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import sleep from "../common/sleep.js";
import { kindOf } from "../common/utils";

(async() => {
  await sleep(1000);
  console.log("Kind of Promise is", kindOf(Promise.resolve()));
})();