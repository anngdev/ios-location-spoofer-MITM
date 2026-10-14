# Location Picker — Cloudflare Worker

与 `../server.js` API 完全兼容，免 VPS、自带 HTTPS，支持 **Loon / Shadowrocket / Surge** 的 `configUrl`。

## 接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/admin` | GET | **管理后台**（管理多用户、生成/重置/删除 Token、查看实时坐标） |
| `/api/admin/*` | ALL | 管理后台 API 接口（需要 ADMIN_TOKEN 认证） |
| `/` | GET | 指定用户的地图选点网页（URL 带 `?token=<用户TOKEN>`） |
| `/loc.json?token=` | GET | 读取指定用户的坐标 JSON |
| `/set?token=` | POST | 保存指定用户的选点坐标 |
| `/enable?token=` | POST | 指定用户一键恢复真实位置 / 开启伪造 |
| `/health` | GET | 健康检查（无需 token） |

## 多用户使用说明

1. **管理员入口**：访问 `/admin`，输入配置的 `ADMIN_TOKEN` 即可登录管理后台。
2. **创建用户**：在管理后台点击 **Add User**，设置设备/用户名称（如 “Alice — iPhone 15”），系统会自动生成安全的随机 Token（也可自定义）。
3. **分发配置**：在用户卡片点击 **Config**，即可一键复制：
   - 网页选点链接：`https://你的worker.workers.dev/?token=用户TOKEN`
   - 模块读取链接：`https://你的worker.workers.dev/loc.json?token=用户TOKEN`
   - Loon / Shadowrocket / Surge 模块参数代码片段
4. **用户隔离**：每个用户拥有独立的位置坐标、海拔与精度设置，互不干扰；管理员可随时在后台一键停用、重置 Token 或删除用户。

## 部署

> 只想用 Cloudflare 网页后台复制粘贴、不想装 npm / Wrangler 的用户，看这里：[`../cloudflare-webui/`](../cloudflare-webui/)。

### 1. 安装依赖

```bash
cd location-picker/worker
npm install
```

### 2. 创建 KV 命名空间

```bash
npx wrangler kv namespace create LOC_KV
npx wrangler kv namespace create LOC_KV --preview
```

把输出的 `id` 填进 `wrangler.jsonc` 的 `id`。

### 3. 设置管理员与访问口令

```bash
# 设置管理员后台口令（用于进入 /admin）
npx wrangler secret put ADMIN_TOKEN

# （可选）初始默认用户口令
npx wrangler secret put TOKEN
```

本地开发可复制 `.dev.vars.example` 为 `.dev.vars` 并填写 `ADMIN_TOKEN=...` 和 `TOKEN=...`。

### 4. 部署

```bash
npm run deploy
```

记下输出的地址，例如 `https://ios-location-picker.你的账号.workers.dev`。

## Loon 插件配置

Loon → 设置 → 插件 → iOS Location Spoofer → **远程配置 URL**：

```
https://ios-location-picker.你的账号.workers.dev/loc.json?token=你的TOKEN
```

保存后，在 iPhone 浏览器打开地图页：

```
https://ios-location-picker.你的账号.workers.dev/?token=你的TOKEN
```

点地图 → **保存定位** → 关开 iPhone 定位服务生效（Loon 约 60 秒内刷新缓存）。

## Shadowrocket 配置

模块 `argument=` 末尾追加：

```
&configUrl=https://ios-location-picker.你的账号.workers.dev/loc.json?token=你的TOKEN
```

## 自定义域名（可选）

在 Cloudflare Dashboard → Workers → 你的 Worker → Settings → Domains 绑定子域即可，例如 `loc.example.com`。

## 与 Node 版差异

- 数据存在 **KV**（非本地文件），个人用量免费额度足够
- KV 有秒级最终一致性，保存后 Loon 最多等约 60 秒缓存刷新
- 无需自行管理 HTTPS 证书
