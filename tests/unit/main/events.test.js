import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IPC_EVENT_CHANNEL_NAME } from '../../../src/common/constants.js';

const electronMock = vi.hoisted(() => ({
  app: {
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

const registerBeforeQuitTaskMock = vi.hoisted(() => vi.fn());
const sendToAllWindowsMock = vi.hoisted(() => vi.fn());

const debugEventsMock = vi.hoisted(() => {
  const onTriggerRendererProcessGone = vi.fn((_cb) => vi.fn());
  /** @type {any} */ (onTriggerRendererProcessGone).sendEvent = vi.fn();
  return {
    onTriggerRendererProcessGone,
  };
});

const remoteStoreEventsMock = vi.hoisted(() => ({
  onGlobalStoreChanged: vi.fn((_cb) => vi.fn()),
}));

vi.mock('electron', () => electronMock);

vi.mock('../../../src/main/beforeQuitTasks.js', () => ({
  registerBeforeQuitTask: registerBeforeQuitTaskMock,
}));

vi.mock('../../../src/main/windowManager/index.js', () => ({
  sendToAllWindows: sendToAllWindowsMock,
}));

vi.mock('../../../src/main/debug/index.js', () => ({
  events: debugEventsMock,
}));

vi.mock('../../../src/main/store/index.js', () => ({
  events: remoteStoreEventsMock,
}));

async function loadEventsModule() {
  return await import('../../../src/main/events.js');
}

describe('main events', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('exposes the registered event map', async () => {
    const { getMainProcessEventMap } = await loadEventsModule();

    expect(getMainProcessEventMap()).toEqual([
      ['appEvents', ['onAppActivate']],
      ['debug', ['onTriggerRendererProcessGone']],
      ['remoteStore', ['onGlobalStoreChanged']],
    ]);
  });

  it('registers all remote events and stores their unregister callbacks', async () => {
    const { registerRemoteEvents } = await loadEventsModule();

    registerRemoteEvents();

    expect(electronMock.app.on).toHaveBeenCalledWith('activate', expect.any(Function));
    expect(debugEventsMock.onTriggerRendererProcessGone).toHaveBeenCalledWith(expect.any(Function));
    expect(remoteStoreEventsMock.onGlobalStoreChanged).toHaveBeenCalledWith(expect.any(Function));
    expect(registerBeforeQuitTaskMock).toHaveBeenCalledTimes(3);
  });

  it('forwards app events to every window using the shared IPC event channel', async () => {
    const { registerRemoteEvents } = await loadEventsModule();
    registerRemoteEvents();
    const appActivateListener = electronMock.app.on.mock.calls[0][1];

    appActivateListener({ type: 'activate' }, 'payload');

    expect(sendToAllWindowsMock).toHaveBeenCalledWith([
      IPC_EVENT_CHANNEL_NAME,
      'appEvents::onAppActivate',
      'payload',
    ]);
  });

  it('uses an event register custom sendEvent implementation when present', async () => {
    const { registerRemoteEvents } = await loadEventsModule();
    registerRemoteEvents();
    const debugListener = debugEventsMock.onTriggerRendererProcessGone.mock.calls[0][0];

    debugListener('crash');

    expect(
      /** @type {any} */ (debugEventsMock.onTriggerRendererProcessGone).sendEvent
    ).toHaveBeenCalledWith([
      IPC_EVENT_CHANNEL_NAME,
      'debug::onTriggerRendererProcessGone',
      'crash',
    ]);
    expect(sendToAllWindowsMock).not.toHaveBeenCalledWith([
      IPC_EVENT_CHANNEL_NAME,
      'debug::onTriggerRendererProcessGone',
      'crash',
    ]);
  });

  it('unregisters app listeners through the before-quit task', async () => {
    const { registerRemoteEvents } = await loadEventsModule();
    registerRemoteEvents();
    const appActivateListener = electronMock.app.on.mock.calls[0][1];
    const unregisterAppActivate = registerBeforeQuitTaskMock.mock.calls[0][0];

    unregisterAppActivate();

    expect(electronMock.app.removeListener).toHaveBeenCalledWith('activate', appActivateListener);
  });
});
