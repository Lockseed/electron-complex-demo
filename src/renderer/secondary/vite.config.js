import { mergeConfig } from "vite";
import defaultConfig from "../../../vite.renderer.config.mjs";

export default mergeConfig(defaultConfig, {
  root: import.meta.dirname
});