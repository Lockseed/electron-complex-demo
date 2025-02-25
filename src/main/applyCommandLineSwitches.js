import { app } from "electron";
import isDev from "./isDev.js";
import logger from "./logger.js";
import { anyToString } from "@/common/utils.js";


export default function applyCommandLineSwitches() {
  let /** @type {string[]} */ jsFlags= [];
  const rendererMaxMemory = process.env.ELECTRON_RENDERER_MAX_MEMORY;
  if (isDev && rendererMaxMemory) {
    jsFlags.push(`--max-old-space-size=${rendererMaxMemory}`);
  }

  if (jsFlags.length > 0) {
    app.commandLine.appendSwitch("js-flags", jsFlags.join(" "));
    logger.info(`[applyCommandLineSwitches] Apply jsFlags to renderer: ${anyToString(jsFlags)}`);
  }

  app.commandLine.appendSwitch("disable-gpu");
}