#!/usr/bin/env bash
# 启动墨阅后端。
#
# 为什么不用 mvn spring-boot:run：
#   仓库路径里有中文（E:\桌面\毕业设计阅读网站），spring-boot:run 给子进程
#   构造 classpath 时走 MANIFEST 的 Class-Path 规范，只允许 ASCII，结果会
#   报 ClassNotFoundException。这里自己拼 classpath，用 java 直接起。
#
# 用法：
#   bash tools/run_server.sh
#   bash tools/run_server.sh --server.port=9090
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MVN="$ROOT/.tooling/apache-maven-3.9.9/bin/mvn"
SERVER="$ROOT/server"

if [ ! -x "$MVN" ]; then
  echo "找不到 Maven：$MVN" >&2
  exit 1
fi

cd "$SERVER"

echo "==> 编译（先 clean，避免 IDE 留下半成品 class）"
"$MVN" -B -q clean compile

echo "==> 解析依赖"
"$MVN" -B -q dependency:build-classpath -Dmdep.outputFile=target/cp.txt

if [ ! -s target/cp.txt ]; then
  echo "依赖列表没生成出来，target/cp.txt 是空的" >&2
  exit 1
fi

echo "==> 启动（需要 MySQL 正在运行；首次启动会自动建库并导入演示数据）"
exec java -Dfile.encoding=UTF-8 -cp "target/classes;$(cat target/cp.txt)" \
  com.moread.MoreadApplication "$@"
