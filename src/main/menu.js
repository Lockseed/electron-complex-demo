import { app, Menu, MenuItem, shell } from "electron";
import { t } from "i18next";
import { isMacOS } from "./utils.js";
import logger from "./logger.js";
import isDev from "./isDev.js";
import { openGlobalStoreFile } from "./store/global.js";

export function setupApplicationMenu() {
  function buildApplicationMenu() {
    /**
     * App Menu 仅用于 MacOS
     * @returns {Electron.MenuItem | null}
     */
    function getAppMenu() {
      if (!isMacOS) return null;
      return new MenuItem({
        label: app.name,
        submenu: [
          { role: 'about', label: t('appMenu.about', { appName: app.name }) },
          { label: t('appMenu.preferences'), accelerator: 'CmdOrCtrl+,', click: () => logger.info('Open preferences') },
          { type: 'separator' },
          { role: 'services', label: t('appMenu.services') },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit', label: t('appMenu.quit', { appName: app.name }) },
        ]
      });
    }

    /**
     * 仅用于开发模式下的菜单
     * @returns {Electron.MenuItem | null}
     */
    function getDebugMenu() {
      if (!isDev) return null;
      return new MenuItem({
        label: t('appMenu.debug'),
        submenu: [
          { role: 'reload', label: t('appMenu.reload') },
          { role: 'forceReload', label: t('appMenu.forceReload') },
          { role: 'toggleDevTools', label: t('appMenu.toggleDevTools') },
          { type: 'separator' },
          { 
            label: t('appMenu.openGlobalStore'), 
            click: () => openGlobalStoreFile().catch(e => logger.error(e)) 
          },
        ]
      });
    }
  
    /** @type {Array<(Electron.MenuItemConstructorOptions) | (Electron.MenuItem)>} */ 
    const template = [
      getAppMenu(),
      new MenuItem({
        label: t('appMenu.edit'),
        submenu: [
          { role: 'undo', label: t('appMenu.undo') },
          { role: 'redo', label: t('appMenu.redo') },
          { type: 'separator' },
          { role: 'cut', label: t('appMenu.cut') },
          { role: 'copy', label: t('appMenu.copy') },
          { role: 'paste', label: t('appMenu.paste') },
          { role: 'selectAll', label: t('appMenu.selectAll') },
        ]
      }),
      new MenuItem({ role: 'windowMenu', label: t('appMenu.window') }),
      getDebugMenu(),
      new MenuItem({ 
        role: 'help', 
        label: t('appMenu.help'),
        submenu: [
          { label: t('appMenu.openRepo'), click: () => shell.openExternal('https://github.com/Lockseed/electron-complex-demo') },
        ]
      }),
      // TODO: 其他 MenuItems 文件 / 编辑 / 识图 / 调试...
    ].filter(Boolean);
  
    Menu.setApplicationMenu(
      Menu.buildFromTemplate(template)
    );
  }

  buildApplicationMenu();

  // TODO: 当某些事件发生时会触发重新构建菜单
}