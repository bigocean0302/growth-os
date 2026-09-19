# 打包成真 Android APK

原型本身已经是**纯静态站点**（全相对路径、零 CDN、零后端），所以打包路径很干净：Capacitor 把它塞进一个原生 Android 壳里。工程已经配好了，你只差补环境。

## 现在的状态（已就绪，不用你动手）

```
growth-os/
├── capacitor.config.json        appId com.growthos.app / appName 个人成长 OS / webDir www
├── package.json                 已装 @capacitor/core + cli + android 8.5.2，脚本齐全
├── scripts/build-web.mjs        把 index.html + assets 同步到 www/
├── scripts/gradle.mjs           跨平台调用 gradlew（Windows 自动用 gradlew.bat）
├── .github/workflows/…          云端构建 APK 的工作流（可选路径 C）
└── android/                     ✅ 原生工程已生成
    ├── app/build.gradle         applicationId = com.growthos.app
    ├── variables.gradle         minSdk 24 / compileSdk 36 / targetSdk 36
    ├── app/src/main/java/com/growthos/app/MainActivity.java
    └── app/src/main/assets/public/   Web 资源已同步进去
```

真机适配也做了：`index.html` 里检测 Capacitor 环境并给 `<html>` 打 `data-native="1"`，CSS 据此**隐藏原型自带的假状态栏和手机外壳**，改用系统安全区（`env(safe-area-inset-*)`）。浏览器里预览完全不受影响，所以你可以继续用原型做设计评审。

## 环境要求（本机目前缺的就是这两个）

| 组件 | 版本 | 说明 |
|---|---|---|
| JDK | **21** | Capacitor 8 + AGP 8.13 要求；装 17 也能编，但 21 最稳 |
| Android SDK | **Platform 36 + Build Tools 36** | 由 `variables.gradle` 的 `compileSdkVersion 36` 决定 |

> 不需要 Android Studio 本身，见路径 B。

---

## 路径 A：装 Android Studio（最省事，推荐）

1. 装 [Android Studio](https://developer.android.com/studio)，首次启动时选 **Standard** 安装，它会自动下载 JDK、Android SDK Platform 36、Build Tools。
2. 在 Studio 里 **File → Settings → Android SDK → SDK Platforms**，确认勾了 `Android 16 (API 36)`；**SDK Tools** 里确认有 `Android SDK Build-Tools 36`、`Android SDK Platform-Tools`。
3. 回到本目录，一条命令：

```bash
npm run android
```

这会同步 Web 资源并用 Android Studio 打开 `android/`。然后在 Studio 里：
**Build → Build Bundle(s)/APK(s) → Build APK(s)**，编完点 `locate` 就能拿到 APK。

或者不开 Studio，直接命令行出包：

```bash
npm run apk
```

产物：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 路径 B：不装 Android Studio，只装命令行 SDK（更轻）

1. **JDK 21**（任选其一）：

```powershell
winget install Microsoft.OpenJDK.21
```

或去 [Adoptium](https://adoptium.net/) 下载 Temurin 21 安装包。

2. **Android 命令行工具**：从 [这里](https://developer.android.com/studio#command-line-tools-only) 下载 "Command line tools only"，解压到例如 `C:\Android\cmdline-tools\latest`。

3. **装 SDK 组件**：

```powershell
cd C:\Android\cmdline-tools\latest\bin
.\sdkmanager.bat "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

4. **设环境变量**（PowerShell 管理员，或系统设置里手动加）：

```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Android', 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', 'C:\Android', 'User')
```

> 如果不想设环境变量，也可以在 `android/local.properties` 里写一行 `sdk.dir=C:\\Android`（注意双反斜杠）。

5. **出包**：

```bash
npm run apk
```

> 第一次会下载 Gradle 8.14.3 和一堆依赖，可能要 10～20 分钟，之后就快了。

装到手机上（USB 调试已开）：

```bash
npm run install
```

---

## 路径 C：云端构建，本机一个环境都不装

仓库里已经放了 `.github/workflows/android-apk.yml`。

1. 把 `growth-os/` 推到一个 GitHub 仓库（`node_modules/` 和 `www/` 已被 `.gitignore` 排除）。
2. GitHub → **Actions** → 选 **Build Android APK** → **Run workflow**。
3. 跑完在 **Artifacts** 里下载 `growth-os-apk`，解压就是 `app-debug.apk`。

免费额度内随便跑，适合先出一版给同事看看。

---

## 发布版（签名）

Debug 包只能自己装。要上架或分发，需要签名：

```powershell
keytool -genkey -v -keystore growthos.keystore -alias growthos ^
  -keyalg RSA -keysize 2048 -validity 10000
```

然后在 `android/app/build.gradle` 的 `buildTypes.release` 里加：

```groovy
release {
    minifyEnabled false
    signingConfig signingConfigs.release
    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
}
signingConfigs {
    release {
        storeFile file('../../growthos.keystore')
        storePassword '你的密码'
        keyAlias 'growthos'
        keyPassword '你的密码'
    }
}
```

再跑 `npm run aab` 出 **AAB**（Google Play 要 AAB），或把 `bundleRelease` 换成 `assembleRelease` 出签名 APK。

> 密码别写进仓库。正式项目建议用 `android/local.properties` 或环境变量注入。

---

## 换图标和启动图

用 [Icon Kitchen](https://icon.kitchen/) 或 Android Studio 的 **Image Asset Studio**：

```bash
# 生成后替换这两个目录即可
android/app/src/main/res/mipmap-*/          # 图标
android/app/src/main/res/drawable*/splash.png  # 启动图
```

---

## 常见问题

**Q：改了原型代码后要重新打包吗？**
要，但很快：`npm run apk`（内部先 `build` 同步 `www/`，再 `cap sync`，再 gradle 增量构建）。也可以开发期用 `npm run android` 在 Studio 里改完直接 Run。

**Q：`cap sync` 报 safe-delete / trash 错误？**
这是本机对 `fs.rm` 做了回收站拦截导致的清理失败，不影响结果——`android/app/src/main/assets/public/` 里的 `index.html`、`assets/`、`capacitor.config.json` 都已经正确写入。真要清理，手动删掉 `assets/public/cordova_plugins.js` 这个空文件即可。在 CI 或普通终端里不会出现。

**Q：真机上数据会丢吗？**
不会。数据存在 WebView 的 localStorage（key `gos.v1`），Capacitor 下持久化和原生 App 一致。我们做了 try/catch，极端情况自动降级为内存运行。

**Q：真机上剪贴板（复制周报）能用吗？**
能。config 里 `androidScheme` 设成了 `https`，属于安全上下文，`navigator.clipboard` 可用；失败也有 Toast 兜底。

**Q：最低支持 Android 几？**
`minSdkVersion 24` = Android 7.0（2016 年），覆盖率接近 100%。

**Q：能上 iOS 吗？**
可以，但要 macOS + Xcode：`npx cap add ios && npm run sync && npx cap open ios`。
