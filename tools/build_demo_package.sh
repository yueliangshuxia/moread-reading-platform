#!/usr/bin/env bash
# 构建“给朋友双击就能打开”的墨阅演示包：
#   1) Vue 构建产物放进 Spring Boot 的 static 目录
#   2) 打成可执行 jar（demo profile 使用内嵌 H2，不需要 MySQL）
#   3) 用 jpackage 生成自带 Java 运行时的免安装版
#   4) 生成源码 zip
#
# 运行前请先停掉正在使用 server/target 的后端进程。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MVN="$ROOT/.tooling/apache-maven-3.9.9/bin/mvn"
WEB="$ROOT/web"
SERVER="$ROOT/server"
STATIC="$SERVER/src/main/resources/static"
RELEASE="$ROOT/release"
DEMO="$RELEASE/墨阅演示"
APP_NAME="墨阅阅读平台-免安装版"
APP_DIR="$RELEASE/$APP_NAME"

if [ ! -x "$MVN" ]; then
  echo "找不到 Maven：$MVN" >&2
  exit 1
fi

echo "==> 1/5 构建 Vue 前端"
cd "$WEB"
npm run build

echo "==> 2/5 把前端放进 Spring Boot static"
rm -rf "$STATIC"
mkdir -p "$STATIC"
cp -R "$WEB/dist/." "$STATIC/"

echo "==> 3/5 打包 Spring Boot 可执行 jar（含 H2）"
cd "$SERVER"
"$MVN" -B -q clean package -DskipTests
JAR="$(ls target/moread-server-*.jar | grep -v original | head -1)"
if [ -z "$JAR" ]; then
  echo "没有找到打出来的 jar" >&2
  exit 1
fi

echo "==> 4/5 组装 jar 演示包"
rm -rf "$DEMO"
mkdir -p "$DEMO"
cp "$JAR" "$DEMO/moread-server.jar"
cp "$ROOT/tools/demo/run-jar.bat" "$DEMO/run.bat"
cp "$ROOT/tools/demo/打开说明-jar.txt" "$DEMO/打开说明.txt"

python - "$DEMO" "$RELEASE/墨阅演示.zip" <<'PY'
import sys, zipfile
from pathlib import Path
src, dst = Path(sys.argv[1]), Path(sys.argv[2])
with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in src.rglob("*"):
        if f.is_file():
            z.write(f, f.relative_to(src.parent))
print("wrote", dst)
PY

echo "==> 5/5 生成免安装版（jpackage）"
rm -rf "$RELEASE/Moread" "$APP_DIR" "$RELEASE/_app_input"
mkdir -p "$RELEASE/_app_input"
cp "$JAR" "$RELEASE/_app_input/moread-server.jar"

if command -v jpackage >/dev/null 2>&1; then
  if jpackage \
      --type app-image \
      --name Moread \
      --app-version 1.0.0 \
      --vendor "MoRead" \
      --description "墨阅 MoRead 阅读平台演示" \
      --dest "$RELEASE" \
      --input "$RELEASE/_app_input" \
      --main-jar moread-server.jar \
      --main-class org.springframework.boot.loader.launch.JarLauncher \
      --java-options "-Dspring.profiles.active=demo" \
      --java-options "-Dfile.encoding=UTF-8" \
      --add-modules java.base,java.sql,java.naming,java.management,java.instrument,java.net.http,java.desktop,java.logging,java.security.jgss,java.security.sasl,jdk.crypto.ec,jdk.unsupported,jdk.management,jdk.zipfs \
      --win-console; then
    mv "$RELEASE/Moread" "$APP_DIR"
    cp "$ROOT/tools/demo/run-app.bat" "$APP_DIR/run.bat"
    cp "$ROOT/tools/demo/打开说明-app.txt" "$APP_DIR/打开说明.txt"
    python - "$APP_DIR" "$RELEASE/$APP_NAME.zip" <<'PY'
import sys, zipfile
from pathlib import Path
src, dst = Path(sys.argv[1]), Path(sys.argv[2])
with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in src.rglob("*"):
        if f.is_file():
            z.write(f, f.relative_to(src.parent))
print("wrote", dst)
PY
  else
    echo "jpackage 失败；保留 jar 演示包，免安装版未生成。" >&2
  fi
else
  echo "找不到 jpackage；跳过免安装版，只保留 jar 演示包。" >&2
fi
rm -rf "$RELEASE/_app_input"

echo "==> 生成源码 zip"
python - "$ROOT" "$RELEASE/墨阅阅读平台-源码.zip" <<'PY'
import os, sys, zipfile
from pathlib import Path
root, dst = Path(sys.argv[1]), Path(sys.argv[2])
exclude_dirs = {"node_modules", "target", "dist", ".tooling", ".git", "release", ".tmp", "data", "__pycache__"}
exclude_files = {".reference_doc.txt"}
with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for current, dirs, files in os.walk(root):
        cur = Path(current)
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        if cur == root / "server/src/main/resources" and "static" in dirs:
            dirs.remove("static")
        for name in files:
            if name in exclude_files:
                continue
            f = cur / name
            rel = f.relative_to(root)
            if rel.parts[:2] == ("release",):
                continue
            z.write(f, rel)
print("wrote", dst)
PY

echo
echo "完成。发布目录：$RELEASE"
ls -lh "$RELEASE" | sed 's/^/  /'
