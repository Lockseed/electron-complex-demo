// 处理任何 webContents 出现导航或者跳转到新 url 时的行为逻辑
// 如果 URL protocol 命中当前应用的 deeplink protocol 则转到 deeplink 处理逻辑
// 如果当前时开发状态且 url protocol 为 http 或者 https 不做处理
// 其他情况使用外部打开
import { shell } from "electron";
import logger from "./logger.js";
import { toLogFormat } from "@/common/errors.js";
import { tryParseUrl } from "./utils.js";

export default async function handleUrl(url) {
  logger.info("[handleUrl] url: ", url);
  const parsedUrl = tryParseUrl(url);
  if (!parsedUrl) {
    return;
  }

  const { protocol, hostname } = parsedUrl;

  // 开发模式的 HMR 无需特殊处理
  if (protocol === "http:" || protocol === "https:") {
    if (hostname === "localhost") {
      return;
    }
  }

  try {
    await shell.openExternal(url);
  } catch (error) {
    logger.error("[handleUrl] Failed to open external URL ", toLogFormat(error));
  }
}