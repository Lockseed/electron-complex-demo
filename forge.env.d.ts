declare global {

  // 由 electron-forge 注入的全局变量
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
  const MAIN_WINDOW_VITE_NAME: string;

  const SECONDARY_WINDOW_VITE_DEV_SERVER_URL: string;
  const SECONDARY_WINDOW_VITE_NAME: string;
}

export {}