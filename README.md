# Codex Usage Ledger（Codex 用量账簿）

![Codex Usage Ledger 图标](assets/codex-usage-ledger.svg)

一款面向 Codex 用户的本地用量账簿：读取当前 Windows 用户的本机 Codex 日志，按模型、时间与 Token 类型汇总用量，并使用已确认的 OpenAI / DeepSeek 官方历史 API 单价计算参考成本。

数据仅在本机读取和计算，不需要 API Key，不上传原始会话。

## 免安装使用（推荐）

从 [GitHub Releases](https://github.com/xzwkkcdf-qr/codex-usage-dashboard/releases) 下载：

```text
CodexUsageLedger-v1.0.0-win-x64.zip
```

完整解压后双击 `CodexUsageLedger.exe`。程序不会弹出 CMD 窗口，会在本地服务就绪后自动打开默认浏览器。首次运行不需要安装 .NET；需要停止时，在任务管理器结束 `CodexUsageLedger.exe` 即可。

默认地址：`http://127.0.0.1:5188`

如不希望自动打开浏览器，可在命令行运行：

```powershell
.\CodexUsageLedger.exe --no-browser
```

请保留解压目录中的全部文件，不要只复制 EXE。发布页同时提供 `.sha256` 文件用于校验下载包。

## 功能

- 今天、最近 24 小时、7 天、30 天、从使用以来或自定义时间范围
- 按分钟、小时或天显示均匀时间柱，每根柱子按未缓存输入、缓存输入和输出分段
- 左侧模型分布圆环与右侧单张柱状图联动，不同模型清晰区分
- 按模型汇总输入、缓存输入、命中率、输出、总 Token、请求和 Session
- 按每条记录的模型与使用日期匹配 OpenAI / DeepSeek 已确认的官方历史价格
- 美元 / 人民币一键切换，所有价格相关内容同步换算
- 当前计费明细可展开核对时间、模型、Token、官方单价、参考成本与确认状态
- 中文 / English 主题化下拉切换，默认中文
- Night Editorial 深色数据终端界面，自适应桌面与移动端

## 数据原理

默认读取：

```text
%USERPROFILE%\.codex\sessions\**\*.jsonl
%USERPROFILE%\.codex\archived_sessions\*.jsonl
```

日志中的 `token_count` 是 Session 内的累计值。项目按同一 Session 的相邻记录计算增量，再按模型与时间桶汇总，从而避免重复累计。模型名称来自 `thread_settings_applied`、`world_state` 和 `turn_context` 等事件。

浏览器只向本机的 ASP.NET Core 服务请求聚合结果：

```text
本机 Codex 日志 → 本地 ASP.NET Core 服务 → 聚合 JSON → 浏览器图表
```

服务仅监听回环地址 `127.0.0.1`。原始会话不会由项目上传；页面中的官方价格链接只有在用户点击后才会访问对应网站。

## 官方价格与套餐优惠倍数

网页按每条用量记录的模型和时间自动匹配内置的 OpenAI 与 DeepSeek 官方标准 API 价格。时间范围跨越调价时，会分别使用对应历史区间；无法确认的历史价格不会猜测，也不会计入已确认参考成本。

```text
参考成本 = 非缓存输入 / 1M × 官方输入单价
          + 缓存输入 / 1M × 官方缓存输入单价
          + 输出 / 1M × 官方输出单价

套餐优惠倍数 = 套餐总价 / 已确认官方参考成本
```

套餐优惠倍数只是本地比较指标，不代表 ChatGPT Plus / Codex 套餐的官方额度、账单或扣费。真实套餐额度和重置时间以官方页面为准。

价格来源：

- [OpenAI API Pricing](https://platform.openai.com/pricing)
- [OpenAI Prompt Caching 历史价格](https://openai.com/index/api-prompt-caching/)
- [OpenAI GPT-4.1 历史价格](https://openai.com/index/gpt-4-1/)
- [OpenAI GPT-5 历史价格](https://openai.com/index/introducing-gpt-5-for-developers/)
- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [DeepSeek API Change Log](https://api-docs.deepseek.com/updates/)

## 从源码运行

源码开发需要 Windows 与 .NET 10 SDK：

```powershell
git clone https://github.com/xzwkkcdf-qr/codex-usage-dashboard.git
cd codex-usage-dashboard
dotnet restore
dotnet build
.\启动仪表盘.ps1
```

也可双击 `启动仪表盘.cmd`。不要直接打开 `wwwroot/index.html`，因为页面需要本地服务提供聚合数据。

## 构建便携版

```powershell
.\build-release.ps1
```

脚本会运行测试、发布 Windows x64 自包含版本，并在 `artifacts` 目录生成 ZIP 和 SHA-256 校验文件。

## 使用声明

作者：可可和茶多酚。

本项目使用 Codex 配合 GPT 辅助开发，免费提供使用，不得用于商业用途；转载、二次分享或发布修改版本时请注明原项目、作者与仓库出处。完整条款见 [LICENSE.txt](LICENSE.txt)。
