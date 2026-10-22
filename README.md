# 墨阅 MoRead · 毕业设计

个性化阅读平台。当前已完成**静态设计稿**、**Spring Boot 后端**和**Vue 3 正式前端**，前后端已经接通。

## 快速入口

- **设计稿首页**：双击 `demo/index.html`（推荐 Chrome / Edge）
- **Demo 说明**：`demo/README.md`
- **选题与论文方案**：`毕业设计方案.md`
- **后端 API 文档**：`docs/API.md`
- **数据库结构**：`docs/schema.sql`
- **正式 Vue 前端**：`web/`（开发地址 `http://127.0.0.1:5173`）
- **静态设计稿**：`demo/`（用于视觉对照）
- **启动后端**：
  ```bash
  bash tools/run_server.sh
  # http://127.0.0.1:8080/api/health
  ```
- **启动前端**：
  ```bash
  cd web
  npm run dev
  # http://127.0.0.1:5173/
  ```
- **只看静态 Demo**：
  ```bash
  cd demo
  python -m http.server 8000
  # http://127.0.0.1:8000/
  ```

## 给朋友的一键演示包（`release/`）

| 文件 | 大小 | 使用方式 | 依赖 |
|---|---|---|---|
| `墨阅阅读平台-免安装版.zip` | 约 84 MB | 解压 → 双击 `run.bat` → 浏览器自动打开 | **不需要 Java、不需要 MySQL** |
| `墨阅演示.zip` | 约 59 MB | 解压 → 双击 `run.bat` | 需要 Java 21，不需要 MySQL |
| `墨阅阅读平台-源码.zip` | 约 4.8 MB | 工程源码、文档、设计稿 | 开发用，需 Node / Maven |

免安装版和 jar 版都使用：

- 内嵌 H2 演示数据库，首次启动自动建库并导入 27 本书、10 个用户
- 前端已经打进 jar，访问 `http://127.0.0.1:8080/` 即可
- 数据保存在 `data/`；删除 `data/` 再启动即可恢复初始数据
- 账号：读者 `reader@moread.cn / 123456`；管理员 `admin@moread.cn / admin123`
- 详细说明见 `release/说明.txt`

重新打包：

```bash
# 先停掉正在使用 server/target 的后端
bash tools/build_demo_package.sh
```

> 演示包使用 `demo` profile（H2）和 hash 路由（`/#/...`）；本地开发仍用 MySQL + history 路由。

## GitHub 与部署

- 仓库使用 **Private**，不填写描述、主页和 Topics，避免被搜索到。
- 前端已加 `noindex,nofollow`，`robots.txt` 禁止抓取。
- `release/` 下的演示包不上传。
- 临时分享、Render、Railway 的步骤见 `docs/DEPLOY.md`。
- 一键临时公网地址：
  ```bash
  java -jar moread-server.jar --spring.profiles.active=demo
  cloudflared tunnel --url http://127.0.0.1:8080
  ```

## 本次交付

| 内容 | 位置 | 状态 |
|---|---|---|
| 10 个静态页面（首页 / 书库 / 详情 / 阅读器 / 书架 / 共读 / 个人中心 / 后台 / 登录 / 404） | `demo/` | 已完成 |
| 本地化素材（unDraw / Pexels / Iconify / Picsum） | `demo/assets/` | 已完成 |
| 响应式与深浅色主题 | `demo/assets/css/` | 已实现 |
| 阅读器交互：目录、笔记、划线、复制、字号、主题、阅读统计 | `demo/reader.html` | 已实现（数据为演示） |
| 书单专题、共读评论、阅读目标、书架状态 | `demo/index.html`、`community.html`、`profile.html`、`book.html` | 已实现（数据为演示） |
| 后台：图书新增 / 用户状态 / 书评筛选审核 / 推荐权重实时预览 | `demo/admin.html` | 已实现（数据为演示） |
| 后端：Spring Boot + JPA + MySQL + JWT + 推荐算法 | `server/` | 已实现，可运行 |
| 正式前端：Vue 3 + Vite + Pinia + Router + Axios | `web/` | 已实现，已接后端 |
| 接口冒烟与测试 | `tools/smoke_api.py`、`server/src/test` | 47 项冒烟 + 10 项测试通过 |
| 前端页面与交互验证 | Playwright | 33 项检查通过 |
| 选题、论文主线、七章大纲、算法与实验设计 | `毕业设计方案.md` | 已写入 |

## 前端（Vue 3）

- Vue 3.5 + Vite 6 + Pinia + Vue Router + Axios
- 复用 `demo/` 的设计系统与 CSS：书房索引、松绿 / 绛红 / 铜、竖排书脊、CSS 书封
- 没有引入重型组件库，页面组件按设计稿定制，避免和视觉系统打架
- 开发时代理：`/api` → `http://127.0.0.1:8080`，无需处理 CORS
- 生产构建：`npm run build`，输出 `web/dist`

页面：

| 路由 | 页面 | 数据来源 |
|---|---|---|
| `/` | 首页 | 书库、分类、书单、个性化推荐 |
| `/discover` | 书库 | 搜索、分类、排序、书单筛选 |
| `/book/:id` | 书籍详情 | 简介、目录、书评、推荐因子、相似书 |
| `/reader/:id` | 阅读器 | 章节、进度、阅读事件、笔记、统计 |
| `/shelf` | 我的书架 | 在读 / 想读 / 读完 / 搁置、周阅读 |
| `/community` | 共读 | 讨论、回应、点赞 |
| `/profile` | 个人中心 | 统计、热力图、笔记、书评、目标 |
| `/admin` | 管理后台 | 概览、图书、用户、书评审核、推荐权重 |
| `/login` | 登录 / 注册 | JWT 登录、演示账号 |

已接通的交互：

- 登录 / 注册、JWT 持久化、未登录跳转
- 首页个性化推荐（登录后）、书单、搜索浮层（`/` 或 `Ctrl/Cmd+K`）
- 书库筛选 / 排序 / 网格与列表、加入书架
- 书籍详情书架状态、书评提交（待审）
- 阅读器章节切换、进度保存、阅读事件上报、笔记 / 划线、阅读统计、字号 / 行距 / 主题
- 社区发帖、回应、点赞
- 个人中心目标调整、资料编辑、笔记 / 书评
- 后台图书新增 / 编辑 / 上下架、用户状态、书评审核、推荐权重保存与重算

> 前端测试：33 项页面 / 交互检查通过；桌面与手机端均无横向溢出；无控制台报错。

## 后端

技术栈：

- Spring Boot 3.5.16 + Java 21
- Spring Security + JWT
- Spring Data JPA + MySQL 8
- 推荐：CB + ItemCF 召回 → AHP-TOPSIS 排序 → MMR 重排
- 无 Redis、无外部大模型依赖；本机没安装 Maven，使用仓库自带 `.tooling/apache-maven-3.9.9/`

数据库：

- 默认库名 `moread`，首次启动自动创建并导入种子数据
- 默认账号 `root / 123456`，可用 `DB_USER` / `DB_PASSWORD` 环境变量覆盖
- 重新导入演示数据：`bash tools/reset_db.sh`，然后重启后端
- 表结构：`docs/schema.sql`（20 张表）

演示账号：

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 读者 | `reader@moread.cn` | `123456` |
| 管理员 | `admin@moread.cn` | `admin123` |

已实现模块：

- 认证：注册 / 登录 / 当前用户
- 书库：列表、搜索、分类、排序、书单、详情、章节、相似推荐
- 书架：在读写 / 想读 / 读完 / 搁置、进度
- 阅读：阅读事件、进度保存、周统计、热力图、阅读目标
- 笔记：划线 / 笔记的新增、查询、删除
- 书评：公开书评、提交待审、点赞、后台审核
- 社区：讨论、回应、点赞
- 推荐：首页推荐、推荐因子与理由、离线重算
- 后台：概览、图书新增 / 编辑 / 上下架、用户状态、书评筛选审核、权重配置
- 健康检查与统一错误响应

测试：

```bash
cd server
../.tooling/apache-maven-3.9.9/bin/mvn test   # 10 项，H2，不依赖 MySQL
python ../tools/smoke_api.py                  # 47 项，需要后端已启动
```

> 后端启动脚本绕开了 `mvn spring-boot:run`：仓库路径含中文，插件的 Class-Path 会出问题。
> 当前后端已在 `http://127.0.0.1:8080` 验证通过；停止后重新启动用 `bash tools/run_server.sh`。

## 题目

> **《基于 Spring Boot 和 Vue 的个性化阅读平台设计与实现》**

论文主线：**让读者在信息过载里更快找到下一本对的书，并且读得更深；再用阅读行为把推荐与阅读体验闭环起来。**

题目按工程向命名，技术栈直接写进题目；AHP-TOPSIS 混合推荐与阅读行为分析仍然作为第 4 章的核心方法展开。

备选（工程向 / 算法向）与完整论证见 `毕业设计方案.md`。

## 说明

- 所有书籍、用户、书评、帖子、统计数据均为演示数据；公版经典只使用书名、作者与简介；阅读器正文为原创演示文本。
- 素材来源与许可见 `demo/README.md`。
- 当前不是 git 仓库；如需版本管理，可在确认方案后初始化。
