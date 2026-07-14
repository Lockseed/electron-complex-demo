type DotPathObject = Record<string, any>;

// 工具函数：解析路径
function parsePath(path: string): string[] {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.');
}

// 获取嵌套属性值
export function getProperty<T = unknown>(obj: DotPathObject, key: string): T | undefined;
export function getProperty<T = unknown>(obj: DotPathObject, key: string, defaultValue: T): T;
export function getProperty<T = unknown>(
  obj: DotPathObject,
  key: string,
  defaultValue?: T
): T | undefined {
  const keys = parsePath(key);
  let result: any = obj;
  for (const k of keys) {
    if (result && Object.prototype.hasOwnProperty.call(result, k)) {
      result = result[k];
    } else {
      return defaultValue;
    }
  }
  return result;
}

// 设置嵌套属性值
export function setProperty(obj: DotPathObject, key: string, value: unknown): void {
  const keys = parsePath(key);
  let current: DotPathObject = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!Object.prototype.hasOwnProperty.call(current, k) || typeof current[k] !== 'object') {
      current[k] = Number.isNaN(Number(keys[i + 1])) ? {} : [];
    }
    current = current[k];
  }
  current[keys[keys.length - 1]] = value;
}

// 检查嵌套属性是否存在
export function hasProperty(obj: DotPathObject, key: string): boolean {
  const keys = parsePath(key);
  let current: any = obj;
  for (const k of keys) {
    if (current && Object.prototype.hasOwnProperty.call(current, k)) {
      current = current[k];
    } else {
      return false;
    }
  }
  return true;
}

// 删除嵌套属性
export function deleteProperty(obj: DotPathObject, key: string): boolean {
  const keys = parsePath(key);
  let current: any = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!Object.prototype.hasOwnProperty.call(current, k)) {
      return false; // 属性不存在
    }
    current = current[k];
  }
  return delete current[keys[keys.length - 1]];
}
