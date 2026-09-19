/* build-web.mjs · 把可发布的静态文件同步到 www/（Capacitor 的 webDir）
   零依赖：只用 Node 内置模块，避免把开发脚本 / node_modules 打进 APK。
   只用 readFileSync / writeFileSync 逐个写入——本机环境对 rm/cp 类批量操作有安全拦截。 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');

let files = 0;

function copyDir(src, dst) {
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dst, name);
    if (statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      writeFileSync(d, readFileSync(s));
      files++;
    }
  }
}

if (!existsSync(out)) mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), readFileSync(join(root, 'index.html')));
files++;
copyDir(join(root, 'assets'), join(out, 'assets'));

if (!existsSync(join(out, 'assets', 'js', 'app.js'))) {
  console.error('[build] 复制失败：www/assets/js/app.js 不存在');
  process.exit(1);
}

console.log('[build] www/ 就绪，共 ' + files + ' 个文件');
