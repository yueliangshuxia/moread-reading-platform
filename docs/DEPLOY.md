# 部署说明

## 隐私策略

- GitHub 仓库为 **Public**，不填 Description、Homepage、Topics，降低被检索到的概率。
- 前端页面加了 `noindex,nofollow`，`robots.txt` 禁止抓取。
- 临时分享用 Cloudflare Quick Tunnel 的随机域名，不公开、不提交到仓库。
- `release/` 下的演示包不进入 GitHub（`.gitignore` 已排除）。

## 方式一：临时公网分享（最快）

适合把链接发给朋友短期看。需要本机保持开机、两个进程保持运行。

```bash
# 1) 启动演示后端（H2，端口 8080）
java -jar moread-server.jar --spring.profiles.active=demo

# 2) 另开一个终端，建立临时隧道
cloudflared tunnel --url http://127.0.0.1:8080
```

终端会输出一个随机地址，例如：

```
https://xxxx-xxxx-xxxx.trycloudflare.com
```

把这个地址发给朋友即可。关闭终端或电脑关机后链接失效。

> 如果 QUIC 被网络拦截，加 `--protocol http2`。

## 方式二：Render 长期部署（需要账号）

仓库已带 `Dockerfile` 和 `render.yaml`。Docker 构建会：

1. 用 Node 构建 Vue 前端
2. 把 `dist/` 放进 Spring Boot 的 `static/`
3. 用 Maven 打 jar
4. 运行时启用 `demo` profile（H2 文件库）

步骤：

1. 在 Render 新建 **Web Service**，连接这个私有仓库。
2. Runtime 选 **Docker**，Dockerfile 路径 `./Dockerfile`。
3. 环境变量：
   - `SPRING_PROFILES_ACTIVE=demo`
4. Health Check Path：`/api/health`
5. 部署完成后使用 Render 给的地址。

或者使用 **Blueprint**，直接识别 `render.yaml`。

说明：

- Render 免费实例的文件系统是临时的，重新部署会重置演示数据（H2）。
- 不需要 MySQL；如果要接正式 MySQL，把 profile 换成默认 profile，并配置 `DB_USER` / `DB_PASSWORD`。
- Render 地址默认是公开的，但页面已 `noindex`；不要把地址发到公开渠道。

## 方式三：Railway / 其他 Docker 平台

- 直接用仓库根目录的 `Dockerfile`。
- 设置 `SPRING_PROFILES_ACTIVE=demo`。
- 平台注入 `PORT` 后，Spring Boot 会自动使用（`server.port: ${PORT:8080}`）。

## 演示账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 读者 | `reader@moread.cn` | `123456` |
| 管理员 | `admin@moread.cn` | `admin123` |

## 本地开发

```bash
# 后端（MySQL）
bash tools/run_server.sh

# 前端
cd web
npm run dev
```
