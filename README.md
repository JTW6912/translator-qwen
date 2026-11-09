# 网页翻译 · Qwen3.8-Flash-Next

短期测试项目（Qwen3.8-Flash-Next 在 AMD 上标注 11/11 退役，只适合这几天用）。

- 模型：`Qwen3.8-Flash-Next`
- 接口：`https://developer.amd.com.cn/radeon/api/v1`（AMD Token Factory，OpenAI 兼容）
- 每日额度约 $5，北京时间 00:00 重置

## 为什么需要后端代理

AMD 接口实测：`POST` 返回里没有 `Access-Control-Allow-Origin`，`OPTIONS` 预检返回 405。
浏览器直连会被 CORS 拦住，所以纯 GitHub Pages（纯静态）翻不了。

正确做法：前端调同源 `/api/translate`，由 Vercel Serverless / 本地 Node 代调 AMD，Key 存在服务端。

## 本地运行

```bash
AMD_API_KEY=rc-... node server.js
# 打开 http://localhost:3000
```

## 部署到 Vercel（推荐，真正能翻译的版本）

1. 把本仓库推到 GitHub
2. Vercel → Add New Project → 选这个仓库 → Deploy
3. 在 Vercel 项目 Settings → Environment Variables 加：
   - `AMD_API_KEY` = 你的 `rc-...` Key
   - 可选 `AMD_MODEL`，默认就是 `Qwen3.8-Flash-Next`
4. Redeploy，打开 Vercel 给的域名就能翻译

## 部署到 GitHub Pages（只能看界面）

Pages 是纯静态站，没有 `/api/translate`，翻译会失败。
可以在页面设置里填 Vercel 地址作为代理地址来绕过。

## 长期替换模型

只改模型名即可，同个 Key 通用：

- `DeepSeek-V4.1-Flash`（AMD Model 字段是 `DeepSeek-V4.1-Flash`，不带 `-1017` 后缀也能用；完整名 `DeepSeek-V4.1-Flash-1017`）
- `GLM-5.3-Flash`

在 Vercel 环境变量里加 `AMD_MODEL=DeepSeek-V4.1-Flash`，或改 `api/translate.js` 里的默认值。

## 注意

- 不要把 `rc-...` Key 写进代码、不要提交到公开仓库。
- Qwen3.8-Flash-Next 内部会先推理，比较耗 token，`max_tokens` 已设为 1000，改小了译文会被截断。
