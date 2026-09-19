/* gradle.mjs · 跨平台调用 Android 工程的 Gradle 包装器
   用法：node scripts/gradle.mjs assembleDebug
        node scripts/gradle.mjs bundleRelease
        node scripts/gradle.mjs installDebug   （需 adb 与已连接设备） */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cwd = join(root, 'android');

if (!existsSync(cwd)) {
  console.error('[gradle] 找不到 android/ 工程，请先执行：npx cap add android');
  process.exit(1);
}

const isWin = process.platform === 'win32';
const cmd = isWin ? 'gradlew.bat' : './gradlew';
const args = process.argv.slice(2);

if (!args.length) {
  console.error('[gradle] 请指定任务，例如：node scripts/gradle.mjs assembleDebug');
  process.exit(1);
}

console.log('[gradle] ' + cmd + ' ' + args.join(' '));
const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: isWin });
process.exit(r.status == null ? 1 : r.status);
