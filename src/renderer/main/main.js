import '../css/index.css';
import { kindOf } from "@/common/utils.js";
import log from "@/renderer/js/logger.js";
import add from "@/renderer/js/add.js";

console.log('👋 This message is being logged by "renderer/main/index.js", included via Vite');
console.log('kindOf Promise is', kindOf(Promise.resolve()));
console.log('kindOf add is', kindOf(add));
log.info("main window loaded");
