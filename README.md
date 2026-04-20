# Profy Starter

Next.js 应用脚手架，集成 **`@profy/sdk`**（平台代理、`useProfyShell`、计费与官方代理 iframe 集成能力）。

## 快速开始

```bash
npm install
npm run dev
```

默认 **`npm run dev`** 为 **`profy dev`**：联调网关（默认 **82**）+ Next（**81**）。请在浏览器打开 **`http://localhost:82/webapps/{appCode}`**（`appCode` 见根目录 **`profy.json`**），以便 Cookie 与 **`/api/market/*`** 等同源请求与换票一致。

仅改 UI 时可用 **`npm run dev:next`**（仅 Next，**81**），但无网关时平台会话可能与线上一致性较差。

## 配置

### `profy.json`

根目录单文件配置，带 JSON Schema 校验（`$schema`: `./packages/sdk/profy.schema.json`）。

| 字段 | 说明 |
|------|------|
| **`appCode`** | 应用唯一标识，与线上控制台一致；影响默认 `basePath`（`/webapps/{appCode}`）。 |
| **`name`** / **`description`** / **`locale`** | 展示与默认语言；`locale` 会注入为 `NEXT_PUBLIC_LOCALE`。 |
| **`version`** | 版本号；`profy publish` / `deploy` 等会引用。 |
| **`billing.rules`** | 计费规则（路径、类型、额度、名称等），供 SDK 计费 UI 解析。 |
| **`platform.baseUrl`** | 平台站点 / API 根地址（如测试环境 `https://profy-test.agentspro.cn`）。 |
| **`platform.appSecret`** | 应用密钥（Profy 控制台）；本地 **`profy dev`** 网关换票与 **`PROFY_APP_SECRET`** 二选一，**勿提交仓库**。 |
| **`platform.appUuid`** | 应用 UUID；URL 无 `appId` 时作为 `NEXT_PUBLIC_APP_UUID`。 |
| **`deploy`** | 部署相关：`mode`（如 `k8s`）、`replicas`、`platform`（Docker 构建架构，默认 `linux/amd64`）、`env` 等。 |

多数 **`NEXT_PUBLIC_*`** 与 **`PLATFORM_BASE_URL`** 会由 **`createNextConfig(profy.json)`** 在构建时注入；改 `profy.json` 后需重启 dev / 重新 build。
Starter 模板默认 **`locale: "zh"`**；英文应用改成 **`"en"`** 即可。

### 环境变量（`.env.local`）

复制 **`.env.example`** 为 **`.env.local`** 后按需填写（已被 `.gitignore` 忽略）。

| 变量 | 作用 |
|------|------|
| **`PLATFORM_BASE_URL`** | 与 `platform.baseUrl` 对齐；可在 CI 覆盖而无需改 JSON。 |
| **`PROFY_APP_SECRET`** | 与 `platform.appSecret` 相同用途；本地代理换票。 |
| **`NEXT_PUBLIC_BASE_PATH`** / **`APP_PREFIX`** | 可选，覆盖默认 `/webapps/{appCode}`。 |
| **`INTERNAL_NEXT_URL`** | 可选，Next 重写目标（默认 `http://127.0.0.1:{PORT}`）。 |
| **`PROFY_API_URL`** | **Profy CLI**（`profy login` / `deploy`）请求的平台 API 根地址，默认测试环境。 |

细节与约束见 **[AGENTS.md](./AGENTS.md)**。

### 生产部署环境文件（`.env.prod`）

K8s / Docker 部署时，如应用依赖服务端密钥或第三方 API 凭证，请在项目根目录创建 **`.env.prod`**。`profy deploy` / `profy build --docker` 会将它带入 Docker build，并在镜像中作为 **`.env.production`** 提供给 Next.js 生产构建和运行时使用。

- 本地开发继续使用 **`.env.local`**
- 生产部署使用 **`.env.prod`**
- 模板文件见 **`.env.prod.example`**
- **`.env.prod` 不应提交到仓库**

## 常用 `profy` 命令

CLI 包为 **`@profy/cli`**，安装依赖后可在项目根目录执行：

```bash
npx profy <command>
```

部署、发布、查看状态前通常需要先 **`profy login`**（凭证默认在 `~/.profy/credentials.json`）。可用 **`PROFY_API_URL`** 或 **`profy login --base-url <url>`** 指定平台。

| 命令 | 说明 |
|------|------|
| **`profy login`** | 设备码或手动 Token 登录平台。`--base-url` 覆盖 API 根地址。 |
| **`profy auth status`** | 查看当前登录状态（`--output json`）。 |
| **`profy auth logout`** | 清除 `~/.profy/credentials.json` 中的本地凭证。 |
| **`profy dev`** | 启动 Next + 本地平台网关（默认 Next **81**、网关 **82**）。`-p` / `--gateway-port` 改端口；`--no-gateway` 仅 Next。 |
| **`profy build`** | 生产构建。`--docker` 同时构建镜像；`--tag` 指定镜像标签。 |
| **`profy deploy`** | 构建镜像、上传并部署到 Profy 云（K8s）。`--tag`、`--replicas`、`--platform`、`--skip-build` 等见 `npx profy deploy --help`。 |
| **`profy publish`** | 提交应用审核。`--version`、`--desc`、`--force`。 |
| **`profy status`** | 查看应用在平台上的状态。`--output json` 可机器可读。 |
| **`profy logs`** | 拉取已部署实例日志。`--tail`、`--follow`。 |
| **`profy versions`** | 查看部署历史（用于回滚参考）。 |
| **`profy rollback`** | 回滚到历史版本。`--replicas` 可覆盖副本数。 |
| **`profy init`** | 从模板初始化新项目（在空目录或脚手架场景使用）。`--app-code` 指定应用代码。 |

与 **`package.json`** 的对应关系：**`npm run dev`** → **`profy dev`**；其余命令一般在终端直接 **`npx profy …`**。

## 文档

| 文档 | 内容 |
|------|------|
| **[AGENTS.md](./AGENTS.md)** | 架构、`basePath`、平台 API、`billingRules`、部署与约束（主文档） |
| **[.profy/skills/SKILL.md](./.profy/skills/SKILL.md)** | 给 AI 助手的门禁与 SDK 速查 |

## 与本仓库其它示例的关系

- 官方代理场景下，历史记录列表由 Profy 壳层负责；starter 应用通过 iframe 接收 `postMessage` 回放快照，并在业务区回填表单与结果。接入约束见 **[AGENTS.md](./AGENTS.md)**。
