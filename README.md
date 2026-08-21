# Codex 官方账号用量分析仪表盘

这是一个本地网页仪表盘，默认读取官方 Codex 登录态产生的本机日志：

```text
%USERPROFILE%\\.codex\\sessions\\**\\*.jsonl
%USERPROFILE%\\.codex\\archived_sessions\\*.jsonl
```

日志里的 `token_count` 事件包含累计的输入、缓存输入、缓存写入、输出、推理输出和总 Token。本项目会对每个 Session 做增量计算，再按模型汇总，避免重复累计。

## 启动

环境要求：Windows 与 .NET 10 SDK。

克隆仓库并首次编译：

```powershell
git clone https://github.com/xzwkkcdf-wq/codex-usage-dashboard.git
cd codex-usage-dashboard
dotnet restore
dotnet build
```

之后直接双击项目根目录的 `启动仪表盘.cmd`，或在 PowerShell 中运行：

```powershell
.\启动仪表盘.ps1
```

脚本会自动启动本地服务并打开浏览器，关闭脚本窗口即可停止服务。

更新项目文件后，重新运行启动脚本即可；脚本会识别并替换同一仪表盘占用的旧实例，价格历史需要新版服务返回每条用量的时间戳。

如果浏览器没有自动打开，请手动访问 `http://127.0.0.1:5188`。不要直接双击 `wwwroot/index.html`，否则网页没有本地服务地址，查询会显示连接失败。启动故障会记录在 `dashboard-server-error.log`。

## 功能

- 官方账号本地日志实时读取，不需要 API Key、不上传原始会话
- 数据源固定为本机官方 Codex 日志，不包含远程 Usage API 或 API Key 配置
- 按模型分类统计输入、缓存输入、缓存命中率、输出、总 Token、请求和 Session
- 今天、最近 24 小时、7 天、30 天、从使用以来或自定义时间范围
- 切换时间范围和时间粒度后会自动重新查询并重绘趋势图
- 按分钟、小时、天查看趋势
- Professional 深色模式：深炭黑工作台、明黄主操作、高对比数据表与自适应图表布局
- 输入套餐总价后，按照内置的 OpenAI 与 DeepSeek 官方模型标准 API 历史价格反推每个模型的等效输入、缓存输入和输出单价
- 支持一键切换美元 / 人民币，主价格表、套餐实用性和计费明细会同步换算；人民币采用页面标注的本地固定汇率，仅作展示换算
- 支持打开当前计费明细，逐条核对时间、模型、模式、Token、官方单价、参考成本和确认状态
- 已确认的历史价格正常计入；无法确认的历史区间单独显示，不会用猜测值覆盖

模型名称会从 `thread_settings_applied`、`world_state` 和 `turn_context` 等日志事件读取；模型只有在当前时间范围内存在 `token_count` 用量时才会出现在表格中。如果想确认较早使用过的模型，请切换到“最近 30 天”或自定义范围。

## 套餐价格计算逻辑

网页按每条用量记录的模型和时间，自动匹配内置的 OpenAI 与 DeepSeek 官方标准 API 价格（短上下文）；时间范围跨越调价时，会按历史价格分别计算。官方资料无法确认的历史区间不会猜测，也不会计入参考成本和套餐折算。

```text
参考成本 = 非缓存输入 / 1M × 输入参考价
          + 缓存输入 / 1M × 缓存参考价
          + 输出 / 1M × 输出参考价

折算系数 = 套餐总价 / 参考成本
等效单价 = 参考单价 × 折算系数
```

这属于基于本机真实 Token 用量的 API 等效估算，不是 OpenAI 或 DeepSeek 对 ChatGPT/Codex/订阅额度的官方账单。价格目录包含官方来源链接和生效时间，价格变更以官方页面为准。

价格来源：

- [OpenAI API Pricing](https://platform.openai.com/pricing)
- [OpenAI Prompt Caching 历史价格](https://openai.com/index/api-prompt-caching/)
- [OpenAI GPT-4.1 历史价格](https://openai.com/index/gpt-4-1/)
- [OpenAI GPT-5 历史价格](https://openai.com/index/introducing-gpt-5-for-developers/)
- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [DeepSeek API Change Log](https://api-docs.deepseek.com/updates/)

## 使用声明

本项目使用 Codex 配合 GPT 辅助开发，免费提供使用，不得用于商业用途；转载或二次分享请注明出处。
