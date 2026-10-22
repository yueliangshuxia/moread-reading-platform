# 墨阅后端 API

基础地址：`http://127.0.0.1:8080`

- 所有接口返回统一结构：`{ "code": 0, "message": "ok", "data": ... }`
- 除公开读接口外，请求头带：`Authorization: Bearer <token>`
- 时间字段在接口里通常已经格式化为“2 小时前”“昨天”等展示字符串
- 演示账号：
  - 读者：`reader@moread.cn / 123456`
  - 管理员：`admin@moread.cn / admin123`

## 1. 认证

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/auth/register` | 否 | 注册，body：`{name,email,password}` |
| POST | `/api/auth/login` | 否 | 登录，body：`{email,password}`，返回 `{token,user}` |
| GET | `/api/auth/me` | 是 | 当前用户 |

```bash
curl -s -X POST http://127.0.0.1:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"reader@moread.cn","password":"123456"}'
```

## 2. 书库

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/books` | 否 | 书库列表，支持 `q`、`category`、`sort=recommend/rating/readers/year`、`free`、`list`、`page`、`size` |
| GET | `/api/books/{id}` | 否 | 书籍详情，含目录（不含正文） |
| GET | `/api/books/{id}/chapters` | 否 | 章节目录 |
| GET | `/api/books/{id}/chapters/{orderNo}` | 条件 | 章节正文；非免费章节未登录返回 403 |
| GET | `/api/books/{id}/similar` | 否 | 相似推荐 |
| GET | `/api/books/{id}/reviews` | 否 | 已通过审核的书评 |
| POST | `/api/books/{id}/reviews` | 是 | 提交书评，body：`{rating:1-5,content}`，初始状态 `PENDING` |
| GET | `/api/books/{id}/factors` | 是 | 当前用户对这本书的推荐因子（百分制）与理由 |

列表返回分页结构：

```json
{ "code": 0, "message": "ok", "data": {
  "content": [ ... ], "page": 1, "size": 50, "total": 27, "totalPages": 1
} }
```

## 3. 分类与书单

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/categories` | 否 | 分类及在架图书数量 |
| GET | `/api/booklists` | 否 | 全部书单 |
| GET | `/api/booklists/{id}` | 否 | 书单详情与书目 |

## 4. 书架

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/shelf` | 是 | 按 `reading/want/finished/paused` 分组返回 |
| GET | `/api/shelf/{bookId}` | 是 | 单本书架状态 |
| PUT | `/api/shelf/{bookId}` | 是 | body：`{status:"READING"|"WANT"|"FINISHED"|"PAUSED"}` |
| DELETE | `/api/shelf/{bookId}` | 是 | 移出书架 |

状态变化会写入 `reading_events`，并触发用户画像与推荐缓存刷新。

## 5. 阅读进度与行为

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/reading/progress/{bookId}` | 是 | 阅读进度 |
| PUT | `/api/reading/progress/{bookId}` | 是 | body：`{percent:0-100,chapterNo}` |
| POST | `/api/reading/events` | 是 | body：`{bookId,eventType,durationSeconds,percent,chapterNo}` |
| GET | `/api/reading/stats` | 是 | 阅读统计（周时长、热力图、连续天数、分类占比、目标） |

`eventType` 可选：

```
EXPOSE, CLICK, SHELF, START_READ, SESSION, PROGRESS, FINISH, NOTE, HIGHLIGHT, REVIEW, ABANDON
```

前端建议：

- 进入阅读器发 `START_READ`
- 每 30–60 秒或离开页面时发 `SESSION`，带本次阅读秒数
- 滚动 25% / 50% / 75% / 100% 时发 `PROGRESS`
- 读完发 `FINISH`

## 6. 笔记 / 划线

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/notes?bookId=&type=NOTE|HIGHLIGHT` | 是 | 笔记列表 |
| POST | `/api/notes` | 是 | body：`{bookId,chapterNo,quote,content,type,page}` |
| DELETE | `/api/notes/{id}` | 是 | 删除自己的笔记 |

## 7. 书评点赞

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/reviews/{id}/like` | 是 | 点赞 / 取消点赞，返回最新数量 |

## 8. 共读社区

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/community/posts?topic=` | 否 | 讨论列表；登录后会带 `liked` |
| POST | `/api/community/posts` | 是 | body：`{topic,bookId,content}` |
| GET | `/api/community/posts/{id}` | 否 | 讨论详情 + 回应 |
| GET | `/api/community/posts/{id}/comments` | 否 | 回应列表 |
| POST | `/api/community/posts/{id}/comments` | 是 | body：`{content}` |
| POST | `/api/community/posts/{id}/like` | 是 | 点赞 / 取消点赞 |

## 9. 个人中心

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/profile` | 是 | 用户信息 + 统计 + 目标 + 偏好 |
| PUT | `/api/profile` | 是 | body：`{name,bio,avatar}` |
| GET | `/api/profile/stats` | 是 | 仅统计 |
| GET | `/api/profile/reviews` | 是 | 我的书评（含待审 / 已通过 / 已驳回） |
| GET | `/api/profile/goal` | 是 | 年度目标 |
| PUT | `/api/profile/goal` | 是 | body：`{year,target}` |

统计里的关键字段：

- `weeklyMinutes`：最近 7 天，单位分钟
- `weeklyLabels`：对应的星期标签
- `heatmap`：最近 12 周 × 7 天，共 84 个 0–4 等级
- `categories`：最近 84 天阅读时长的分类占比
- `goal`：`{year,target,finished,percent}`

## 10. 推荐

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/recommendations/home?limit=6` | 是 | 首页个性化推荐（带理由与因子） |
| GET | `/api/recommendations/similar/{bookId}` | 否 | 相似图书 |
| GET | `/api/recommendations/factors/{bookId}` | 是 | 单本书的推荐因子 |

推荐链路：

```
CB + ItemCF + 热门/新书召回
  → AHP 权重 + TOPSIS 贴近度
  → MMR 多样性重排
  → 推荐理由
```

默认权重：内容 35%、协同 30%、热度 20%、新鲜度 15%。

## 11. 管理后台

所有 `/api/admin/**` 需要 `ADMIN` 角色。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/admin/overview` | 用户 / 图书 / 今日时长 / 待审 / 7 日活跃 / 分类占比 |
| GET | `/api/admin/books?q=&categoryId=` | 全部图书（含下架） |
| POST | `/api/admin/books` | 新增图书 |
| PUT | `/api/admin/books/{id}` | 编辑图书 |
| PUT | `/api/admin/books/{id}/listed` | body：`{listed:true|false}` |
| GET | `/api/admin/users` | 用户列表 |
| PUT | `/api/admin/users/{id}/status` | body：`{status:"ACTIVE"|"MUTED"}` |
| GET | `/api/admin/reviews?status=PENDING|PASSED|REJECTED` | 书评审核列表 |
| POST | `/api/admin/reviews/{id}/approve` | 通过 |
| POST | `/api/admin/reviews/{id}/reject` | 驳回 |
| GET | `/api/admin/recommendation/weights` | 读取权重（百分制） |
| PUT | `/api/admin/recommendation/weights` | body：`{content,cf,popularity,freshness}`，自动归一化 |
| POST | `/api/admin/recommendations/rebuild` | 手动重算全量推荐 |

新增 / 编辑图书 body 示例：

```json
{
  "title": "海边的房间",
  "author": "测试作者",
  "categoryId": "contemporary",
  "tags": ["原创", "海边"],
  "rating": 8.5,
  "words": "10 万",
  "publishedYear": 2026,
  "status": "连载",
  "free": true,
  "original": true,
  "coverTheme": "bottle",
  "coverPattern": "letter",
  "blurb": "一句话简介",
  "intro": "更长的介绍",
  "authorBio": "作者简介",
  "scores": { "content": 0.3, "cf": 0.2, "popularity": 0.1, "freshness": 0.4 }
}
```

## 12. 健康检查与公共统计

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 返回 `{status:"UP",app:"moread-server",time}` |
| GET | `/api/stats/public` | 返回 `{readers,books,readingEvents}`，首页展示用 |

## 13. 错误码

| HTTP | code | 场景 |
|---|---|---|
| 400 | 400 | 参数校验失败 / 业务参数不合法 |
| 401 | 401 | 未登录或 token 失效 |
| 403 | 403 | 无权限（如读者访问后台） |
| 404 | 404 | 图书 / 书评 / 讨论不存在 |
| 500 | 500 | 服务器异常 |

## 14. 运行与测试

```bash
# 启动（需要 MySQL）
bash tools/run_server.sh

# 跑单元 + 集成测试（H2，不依赖 MySQL）
cd server
../.tooling/apache-maven-3.9.9/bin/mvn test

# 接口冒烟（后端启动后）
python tools/smoke_api.py
```

数据库默认：

- 库名：`moread`（首次启动自动创建）
- 用户：`root / 123456`，可用 `DB_USER` / `DB_PASSWORD` 覆盖
- 表结构导出：`docs/schema.sql`

## 15. 前端接入提示

- CORS 已允许 `localhost:5173`、`127.0.0.1:5173`、`localhost:8000`、`127.0.0.1:8000`、`127.0.0.1:8765`
- 登录后把 token 放 `Authorization: Bearer <token>`
- 推荐页 / 书架 / 笔记 / 后台都需要 token
- 书库、分类、书单、公开书评、社区读接口可不登录访问
