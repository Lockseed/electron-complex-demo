const fs = require('fs');
const path = require('path');
const semver = require('semver');

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');

// 读取 package.json 文件
const packageJsonPath = path.join(rootDir, 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// 检查是否有 engines.node 字段
if (!packageJson.engines || !packageJson.engines.node) {
  console.log('No Node.js version requirement found in package.json, skipping version check.');
  process.exit(0);
}

const nodeVersionRequirement = packageJson.engines.node;
const currentVersion = process.version.slice(1); // 移除 'v' 前缀

console.log(`Required Node.js version: ${nodeVersionRequirement}`);
console.log(`Current Node.js version: ${currentVersion}`);

// 使用 semver 比较版本
if (!semver.satisfies(currentVersion, nodeVersionRequirement)) {
  console.error('\x1b[31m%s\x1b[0m', `
Error: Node.js version mismatch.
This project requires Node.js ${nodeVersionRequirement}.
Please run 'nvm use' or 'nvm install' with an appropriate version before continuing.
  `);
  process.exit(1);
} else {
  console.log('Node.js version matches requirements, proceeding...');
}