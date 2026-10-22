#!/usr/bin/env bash
# 清空并重建 moread 数据库。仅在你想重新导入种子数据时使用。
# 会删除所有本地演示数据，请确认后再执行。
set -euo pipefail

DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"

echo "即将删除数据库 moread（包含所有演示数据）。"
printf "输入 yes 继续："
read -r answer
if [ "$answer" != "yes" ]; then
  echo "已取消。"
  exit 0
fi

mysql -u"$DB_USER" -p"$DB_PASSWORD" -e \
  "DROP DATABASE IF EXISTS moread; CREATE DATABASE moread CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "数据库已重建。下次启动后端会自动导入种子数据。"
