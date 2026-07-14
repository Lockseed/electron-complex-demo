import { generateString } from '@/common/utils.js';

import type { RemoteAPIs, RemoteEvents } from '@/common/remote-contracts.js';

interface DebugSetupOptions {
  remoteAPIs: RemoteAPIs;
  remoteEvents: RemoteEvents;
}

export function setup({ remoteAPIs: _remoteAPIs, remoteEvents }: DebugSetupOptions): void {
  remoteEvents.debug?.onTriggerRendererProcessGone((reason: 'crash' | 'oom') => {
    console.log('[onTriggerRendererProcessGone] reason ', reason);
    if (reason === 'crash') triggerCrash();
    else if (reason === 'oom') triggerOOM();
  });
}

let crashTimer: ReturnType<typeof setInterval> | undefined;
function triggerCrash(): void {
  if (crashTimer) return;

  let count = 3;

  crashTimer = setInterval(() => {
    console.log('Renderer Crash After ', count);
    count--;
    if (count <= 0) {
      clearInterval(crashTimer);
      process.crash();
    }
  }, 1000);
}

let oomTimer: ReturnType<typeof setInterval> | undefined;
const memoryHog: string[] = [];

function triggerOOM(): void {
  if (oomTimer) return; // 避免重复启动

  function kb2mb(kb: number): string {
    return (kb / 1024).toFixed(2);
  }

  // 不能用，无法正常使内存增长。
  // function genChunk(sizeInMB) {
  //   const sizeInBytes = sizeInMB * 1024 * 1024;
  //   const buffer = new Uint8Array(sizeInBytes);
  //   for (let i = 0; i < buffer.length; i++) {
  //     buffer[i] = Math.floor(Math.random() * 256); // 填充内存，确保被使用
  //   }
  //   return buffer;
  // }

  oomTimer = setInterval(async () => {
    try {
      // 当前进程的内存信息
      const memInfo = await process.getProcessMemoryInfo();
      // V8 堆内存信息
      const heapStats = process.getHeapStatistics();

      const memUsed = memInfo.private;
      const memTotal = heapStats.heapSizeLimit;
      const memUsedPercent = ((memUsed / memTotal) * 100).toFixed(2);

      const heapUsed = heapStats.usedHeapSize;
      const heapTotal = heapStats.totalHeapSize;
      const heapUsedPercent = ((heapUsed / heapTotal) * 100).toFixed(2);

      console.log(
        `Memory Hog Length: ${memoryHog.length}\nMemory Usage: ${kb2mb(memUsed)}MB / ${kb2mb(memTotal)}MB, ${memUsedPercent}%\nHeap   Usage: ${kb2mb(heapUsed)}MB / ${kb2mb(heapTotal)}MB, ${heapUsedPercent}%`
      );

      // 每次分配 1M
      // 这里生成的数据不能使用 ArrayBuffer，可能是因为 preolaod 里面的
      // ArrayBuffer 是由 Node 在管理，而不是 V8
      // const bigString = generateString(10 * 1024 * 1024 / 2);
      // console.log(`Push new string. size: ${Buffer.byteLength(bigString, 'utf16le') / 1024 / 1024} MB`);
      memoryHog.push(generateString((1 * 1024 * 1024) / 2));
    } catch (_) {
      //
    }
  }, 1000); // 每秒执行一次
}
