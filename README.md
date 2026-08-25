# Rise 6.9.5 but... OpenSource


<p align="center">
  <img src="./img/norise.png" alt="2" width="25%">
</p>
<p align="center">
  <img src="./img/deobf.jpg" alt="1" width="20%" />
  <img src="./img/deobf2.jpg" alt="2" width="20%" />
  <img src="./img/deobf3.jpg" alt="3" width="20%" />
  <img src="./img/heavy.jpg" alt="4" width="20%" />
</p>

Join Discord：https://discord.gg/eSFUUp7wW

## requirements

- JDK 21 or newer
- highiq

## modify

full offline, deobf, rename, fix, patch auth, add toggle and more....

## build

```
./gradlew clientJar
```

output: `build/dist/rise-client.jar`

## runnnnnnnnnn

```
./gradlew run
```

or directly (run `./gradlew gameDir` once first, see below):

```
java -Drise.gameDir=run -Djava.library.path=run/natives \
     -cp build/dist/rise-client.jar:libs/libraries.jar Start
```

## IntelliJ IDEA

1. open the project folder, wait for the gradle sync.
2. set the project SDK to JDK 21+.
3. select the **Rise Client** run configuration (committed in `.run/`) and hit run.

## system properties

all default to off.

| property | effect |
|---|---|
| `-Drise.auth.username=<name>` | username for the auth entry point |
| `-Drise.auth.autologin=true` | skip the login screen |
| `-Drise.gameDir=<path>` | game directory |
| `-Drise.protection.anticrack=true` | anti-crack environment scan |
| `-Drise.net.remotescripts=true` | remote script/config download |
| `-Drise.net.altservice=true` | alt-account service |
| `-Drise.net.versioncheck=true` | update gate on the login screen |

---

## 📱 Android / Mobile (Zalith Launcher · Pojav · gl4es)

This section documents the patches applied to make Rise 6.9.5 work on **Android ARM64** via Zalith Launcher / Pojav core using the `gl4es 1.1.5` OpenGL → GLES translation layer.

### Target environment

| Component | Value |
|---|---|
| OS / arch | Android 11, Linux aarch64 |
| Java | OpenJDK 21 (64-bit aarch64) |
| Renderer | Qualcomm Adreno 540 via **gl4es 1.1.5** (OpenGL 2.1 compat) |
| Windowing | LWJGL 3.3.6-snapshot + LWJGLX |

### Installing on Android

1. **Get a launcher** — [Zalith Launcher](https://github.com/ZalithLauncher/ZalithLauncher) or any Pojav-based fork.
2. **Download `rise-client.jar`** from the [Releases](../../releases) page (built by CI) or build it yourself (`./gradlew clientJar`).
3. **Add a new version** in the launcher. Choose **"Custom JAR"** and point it at `rise-client.jar`.
4. **Java flags** — add the following to your JVM arguments:
   ```
   -Drise.gameDir=<your game directory>
   -Drise.auth.username=<your username>
   -Drise.auth.autologin=true
   -Drise.net.offline=false
   ```
5. **Renderer** — select **gl4es** (OpenGL 2.1 compatibility). Other renderers are untested.
6. Launch and enjoy. Singleplayer and Multiplayer both work.

### Patches applied (vs. original Rise 6.9.5)

#### 🐛 Fix — Singleplayer crash on world load (`NoSuchMethodError`)

**Root cause:** `ChannelConsoleSpammer` called `RandomStringUtils.randomAlphabetic(int, int)` which requires Commons Lang3 ≥ 3.5. Minecraft 1.8.9 bundles 3.3.2, so every game tick threw `NoSuchMethodError` and crashed the game loop.

**Fix:** Replaced with the 3.3.2-compatible single-argument overload. Also hardened the EventBus dispatch loop to catch `Throwable` (not just `Exception`) so no future listener error can kill the game.

#### 🐛 Fix — Multiplayer connection failure on ARM64

**Root cause (1):** The client bundles a `librise_native.so` compiled for x86-64. On aarch64 it always fails to load with `UnsatisfiedLinkError`. This left all `NativeBridge` security methods returning `null`/`false`, causing security checks to misfire and potentially block connection flows.

**Root cause (2):** `SecurityFeatureManager` unconditionally enabled its checks (`nH() → true`), but those checks internally call `NativeBridge` methods that are non-functional without the native library. Running dead-stub security code produced incorrect results.

**Fix:** Detect ARM64 at startup and skip native library loading. Gate all security checks behind `NativeDecryptor.isLoaded()` so they're fully disabled in pure-Java mode (correct behaviour on mobile).

#### 🎨 Fix — GLSL shader compilation failure under gl4es

**Root cause:** Two shaders (`downsample.frag`, `upsample.frag`) declared `#version 330 core` but gl4es only supports up to OpenGL 2.1 / GLSL 1.20. They also used `out vec4 fragColor` (core profile output) and `gl_FragCoord` in ways that conflict with gl4es's compatibility layer.

**Fix:** Downgraded both shaders to `#version 120`. Replaced `out vec4 fragColor` with built-in `gl_FragColor`. Replaced `gl_FragCoord.xy / screenResolution` with `gl_TexCoord[0].st` (equivalent when rendered via the existing full-screen quad). Changed `uniform int mixture` → `uniform float mixture` to avoid GLSL 120 integer/float conversion edge cases in gl4es.

Additionally fixed `ShaderUtil.createShader()` to null-check the *loaded GLSL source* (not the filename parameter), preventing a crash when any shader resource fails to load.

#### ℹ️ Note — `GL_ARB_occlusion_query` (Adreno 540)

No custom-code occlusion query calls were found in the client source. The vanilla Minecraft rendering path (inside `minecraft-deobf.jar`) uses them, but gl4es stubs these calls to always return "visible". Chunks will always be considered visible — minor overdraw overhead, no crashes.

---

## join us

> this source code was generated via decompilation and may contain minor behavioral discrepancies or bugs. Although we have worked hard to fix them, 100% accuracy cannot be guaranteed.  
> 
> Contributions and bug reports are welcome—please feel free to open an **Issue** or submit a **PR**!

## thx

- **original obfuscated client:** RiseClient 6.9.5
- **some deobfuscation, symbol recovery:** completed by Claude™ and Codex™ under human supervision (billionaires should be covering my token costs)
- **devirtualization, flowdeobf, deobf tool:** anonymous™
- **Java Deobfuscator**
- **Recaf**
- **[VMProtect](https://vmpsoft.com/)** (demutation and devirtualization??!?!?!?!)
- **custom java obfuscator** (copied from zkm????)
- **RiseJDK-22.0.2** (ruthlessly modified)
- **Rise-vm😂** (funny)
- **[ViaVersionMCP/ViaMCP](https://github.com/ViaVersionMCP/ViaMCP)** — Licensed under GNU General Public License v3.0 / relevant open-source license


## legal & disclaimers

- **Minecraft Trademarks:** *Minecraft* is a trademark of Mojang Studios / Microsoft Corporation.  
- **Affiliation:** This project is an independent community development and is **NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**  
- **Assets & Code:** No proprietary Minecraft assets or un-obfuscated original Mojang source code are distributed directly within this repository. (All game assets belong to their respective owners). 
