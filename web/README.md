# 墨阅 MoRead · Vue 3 前端

正式前端，接 `server/` 的 Spring Boot 接口。视觉与 `demo/` 的静态设计稿保持一致。

## 启动

先确保后端在 `http://127.0.0.1:8080` 运行：

```bash
cd ..
bash tools/run_server.sh
```

然后启动前端：

```bash
cd web
npm install
npm run dev
# http://127.0.0.1:5173/
```

Vite 已配置 `/api` 代理到 `http://127.0.0.1:8080`，开发时不用处理跨域。

## 构建

```bash
npm run build      # 输出 dist/
npm run preview    # 本地预览生产构建
```

生产构建会使用 **hash 路由**（`/#/book/...`），方便直接塞进 Spring Boot 的 `static/` 目录，
不需要服务端再做 SPA fallback。开发环境仍然是 history 路由。

生产部署时，Nginx 把 `/api` 转发到 Spring Boot，静态文件指向 `dist/`。
如果前后端不同源，可以在 `.env` 里设置：

```bash
VITE_API_BASE=https://api.example.com/api
```

## 演示账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 读者 | `reader@moread.cn` | `123456` |
| 管理员 | `admin@moread.cn` | `admin123` |

## 结构

```text
src/
├── api/          # Axios 封装与各模块接口
├── assets/css/   # 复用 demo 的设计令牌与页面样式
├── components/   # 封面、书卡、书架、搜索、图表、弹窗等
├── content.js    # 首页共读 / 笔记 / 成就等编辑内容
├── router/       # 路由与登录 / 管理员守卫
├── stores/       # Pinia：auth / ui
├── utils/        # 格式化
└── views/        # 首页、书库、详情、阅读器、书架、共读、个人中心、后台、登录、404
```

## 说明

- 书封由 CSS 生成，图片来自 `public/assets/img`（unDraw / Pexels / Picsum）。
- 阅读器的正文来自后端章节接口；种子数据只有第一章正文，其他章节会显示占位提示。
- 阅读事件：进入阅读器发 `START_READ`，每分钟发 `SESSION`，滚动时保存进度并发 `PROGRESS`。
- 书评提交后是 `PENDING`，需要管理员在 `/admin` 审核。
