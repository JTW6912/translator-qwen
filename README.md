# 网页翻译 · AMD Token Factory

短期测试项目。Key 存在 Vercel 服务端环境变量 `AMD_API_KEY`，打开就能翻，不用手动输入。

- 接口：`https://developer.amd.com.cn/radeon/api/v1`（AMD Token Factory，OpenAI 兼容）
- 模型列表：服务端实时从 AMD `/v1/models` 取（`GET /api/models`），前端下拉框自动填充
- 每日额度约 $5，北京时间 00:00 重置

## 模型怎么选（AMD 对话里的研究 + 2026-11-09 实测）

| 模型 | 定位 | 备注 |
|---|---|---|
| Qwen3.8-Flash-Next | 翻译第 1 · 最快+最优（短期） | WMT24++ 翻译 86.2% 排第 1；但 AMD 标注 11/11 退役，只剩约 2 天；高峰期偶尔报并发上限 |
| DeepSeek-V4.1-Flash | 速度最快（长期） | 理论输出 179–227 tokens/秒最快；1M 上下文；高峰期偶尔报并发上限，后端自动重试 |
| GLM-5.3-Flash | 最均衡 · 长期稳定 | 翻译 86.1% 排第 3；149 tokens/秒，首字 0.7 秒；84 种语言；不退役 |
| MiMo-V2.6-Flash | 实测单次最快 | 2026-11-09 实测约 3 秒翻完一句；轻量，但翻译能力弱一档 |
| DeepSeek-V4-Flash | 长文档 | 翻译 4.38/5 分；1M 上下文；Flash 版比 Pro 版快 4 倍 |
| Qwen3.8-27B | 大模型 | 27B 大模型，质量稳，速度中等 |

2026-11-09 实测（同一句中译英）：
MiMo 约 3 秒，DeepSeek-V4-Flash 约 5.6 秒，GLM 约 6.5 秒，Qwen 约 8 秒，
DeepSeek-V4.1-Flash 第一次报并发上限（192），重试后成功。

## 为什么需要后端代理

AMD 接口实测：`POST` 返回里没有 `Access-Control-Allow-Origin`，`OPTIONS` 预检返回 405。
浏览器直连会被 CORS 拦住，所以纯 GitHub Pages（纯静态）翻不了。

正确做法：前端调同源 `/api/translate`，由 Vercel Serverless 代调 AMD，Key 存在服务端。

## 本地运行

```bash
AMD_API_KEY=rc-... node server.js
# 打开 http://localhost:3000
```

## 部署到 Vercel（真正能翻译的版本）

```bash
npx vercel login
npx vercel deploy --prod --yes
# 设环境变量（只设一次）：
printf "rc-..." | npx vercel env add AMD_API_KEY production
npx vercel deploy --prod --yes
```

也可以在 Vercel 网页端导入 GitHub 仓库 `JTW6912/translator-qwen`，
在 Settings → Environment Variables 加 `AMD_API_KEY`，再 Redeploy。

## 部署到 GitHub Pages（只能看界面）

Pages 是纯静态站，没有 `/api/translate`，翻译会失败。
仓库：https://github.com/JTW6912/translator-qwen
Pages：https://jtw6912.github.io/translator-qwen/

## 注意

- 不要把 `rc-...` Key 写进代码、不要提交到公开仓库。
- 这些 Flash 模型会先做内部推理，比较耗 token，`max_tokens` 已设为 1000，改小了译文会被截断。
- Qwen3.8-Flash-Next 11/11 退役后，默认模型请换成 DeepSeek-V4.1-Flash 或 GLM-5.3-Flash。
