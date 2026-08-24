const $ = (id) => document.getElementById(id);
const LANGUAGE_STORAGE_KEY = 'codex-dashboard-language';
const TRANSLATIONS = Object.freeze({
  'zh-CN': {
    appEyebrow: 'LOCAL CODEX USAGE', appTitle: 'Codex 用量账簿', statusWaiting: '等待查询', statusQuerying: '查询中…', statusDemo: '演示数据', statusLive: '实时在线', statusFailed: '查询失败',
    queryConditions: '查询条件', readLocalLogs: '读取本机日志', analyzeTokenRecords: '直接分析官方账号的 token_count 记录', defaultPath: '默认读取', autoRefresh: '每 60 秒刷新', timeRange: '时间范围', today: '今天', last24h: '最近 24 小时', last7d: '最近 7 天', last30d: '最近 30 天', since: '从使用以来', custom: '自定义', granularity: '时间粒度', perHour: '按小时', perDay: '按天', perMinute: '按分钟', modelFilter: '模型筛选（可选）', modelPlaceholder: '例如 gpt-5.6-luna', queryUsage: '查询用量', demoData: '查看演示数据', startTime: '开始时间', endTime: '结束时间', switchToEnglish: '切换英文', switchToChinese: '切换中文',
    summaryMetrics: '汇总指标', inputToken: '输入 Token', cachedHit: '缓存命中', outputToken: '输出 Token', sessionRequest: 'Session / 请求', waitingData: '等待数据', uncachedWrite: '{uncached} 未缓存 · {write} 写入', cacheInputTokens: '{count} 个缓存输入 Token', reasoning: 'Reasoning {count}', requestSession: '请求 / Session',
    modelDistribution: '模型分布', clickToSwitch: '点击切换', donutAria: '模型 Token 占比环图', tokenChartAria: 'Token 使用柱状图', allModels: '全部模型', clickCenter: '点击中心显示全部模型', trend: '趋势', tokenUsage: 'Token 用量', uncachedInput: '未缓存输入', cachedInput: '缓存输入', output: '输出', modelCategory: '模型分类', byModel: '按模型汇总', modelCount: '{count} 个模型', noUsage: '该时间范围没有用量数据', runQuery: '执行查询后显示明细', noData: '暂无数据',
    officialPricing: '官方价格核算', actualTokenCost: '按模型与历史官方价格核算实际 Token 成本', pricingHelper: '按每条用量记录的模型和时间匹配官方历史单价；这里展示的是 API 参考成本，不代表 Plus/Codex 订阅额度扣费。', currentPeriod: '当前计算时间段：{range}', unconfirmedModels: '{count} 个模型存在未确认历史价格', allMatched: '全部模型均按使用时间匹配官方价格', coverage: '价格覆盖率 {value}', noPricable: '暂无可计价用量', confirmed: '已确认', noConfirmedPrice: '暂无已确认价格', mixedHistory: '历史价格混合 · {count} 段', historyUnconfirmed: '历史价格未确认', confirmedCoverage: '已确认 {value}', unconfirmedSegments: '{count} 段未确认', queryThenCalculate: '查询用量后计算', packagePrice: '本时间段套餐价格（{currency}）', autoMatchPrice: '按模型与使用时间自动匹配官方历史价格', officialBasis: '官方价格基准：美元 · 人民币换算汇率 1 USD = ¥{rate}（{date}）', openaiPricing: '查看 OpenAI 价格页 ↗', deepseekPricing: '查看 DeepSeek 价格页 ↗', officialBadge: 'OpenAI / DeepSeek 官方价', confirmedOfficialCost: '本时间段已确认官方参考成本', discountMultiplier: '套餐优惠倍数（套餐价 / 官方成本）', confirmedUsage: '本时间段实际用量 · 已确认', inputUnit: '输入单价', cachedInputUnit: '缓存输入单价', outputUnit: '输出单价', officialReferenceCost: '官方参考成本', pricingFootnote: '说明：按 OpenAI 与 DeepSeek 官方标准 API 价格，并根据每条用量记录的时间匹配历史价格；已确认区间正常计入，无法确认的历史区间单独显示且不猜测。套餐优惠倍数仅是本地估算，不代表 Plus / Codex 官方额度扣费。', unconfirmedPrice: '官方价格未确认', currencyUSD: '美元', currencyCNY: '人民币', switchToCNY: '切换人民币', switchToUSD: '切换美元', currencyRateNote: '官方价格基准：美元 · 人民币换算汇率 1 USD = ¥{rate}（{date}）',
    auditUsage: '核对用量', billingDetails: '当前计费明细', billingSummary: '查询用量后显示每条计费记录', confirmedReferenceCost: '已确认参考成本', confirmedTokens: '已确认 Token', unknownRecords: '未确认记录', billingTime: '时间', billingModel: '模型', billingMode: '模式', billingInput: '输入', billingCached: '缓存', billingOutput: '输出', officialUnitPrice: '官方单价', billingRateUnit: '输入 / 缓存 / 输出（{unit}）', referenceCost: '参考成本', status: '状态', noBillingDetails: '当前时间范围没有计费明细', noMatchedPrice: '没有匹配到官方历史价格', billingFootnote: '明细按当前筛选时间范围展示；“未确认”表示没有足够的官方历史价格依据，不会被猜测或计入参考成本。', billingRecordSummary: '{range} · {count} 条 Token 计费记录 · {coverage}', noToken: '暂无 Token', confirmedStatus: '已确认', unknownStatus: '未确认', unrecorded: '未记录', closeBilling: '关闭计费明细',
    sourceWaiting: '等待查询', localLogs: '官方本地日志', demoSource: '演示数据', dataSource: '数据源：{source}', syncedAt: '{range} · 同步于 {time}', demoNotice: '当前为演示数据。点击“查询用量”即可读取本机官方 Codex 日志。', oldServerNotice: '当前本地服务仍是旧版本，价格历史需要重启“启动仪表盘.cmd”后才能显示。', connectionError: '无法连接本地服务 {origin}，请先运行“启动仪表盘.cmd”。', fileOpenError: '请双击“启动仪表盘.cmd”打开网页，不要直接打开 wwwroot/index.html。', queryFailed: '查询失败，请检查 Codex 日志路径。',
    usageStatement: '使用声明', footerAuthor: '作者：可可和茶多酚 · 模型仅在当前时间范围有 token_count 时显示 · 本地日志只读', footerLicense: '本项目使用 Codex 配合 GPT 辅助开发，免费提供使用，不得用于商业用途 · 转载或二次分享请注明出处', providerDate: '{provider} · {date}', modelUnknown: '未记录模型', unknownPriceCoverage: '没有足够的官方历史价格依据'
  },
  'en-US': {
    appEyebrow: 'LOCAL CODEX USAGE', appTitle: 'Codex Usage Ledger', statusWaiting: 'Waiting', statusQuerying: 'Querying…', statusDemo: 'Demo data', statusLive: 'Live', statusFailed: 'Query failed',
    queryConditions: 'Query controls', readLocalLogs: 'Read local logs', analyzeTokenRecords: 'Analyze official account token_count records', defaultPath: 'Reads by default from', autoRefresh: 'Refresh every 60 seconds', timeRange: 'Time range', today: 'Today', last24h: 'Last 24 hours', last7d: 'Last 7 days', last30d: 'Last 30 days', since: 'Since first use', custom: 'Custom', granularity: 'Granularity', perHour: 'Hourly', perDay: 'Daily', perMinute: 'By minute', modelFilter: 'Model filter (optional)', modelPlaceholder: 'e.g. gpt-5.6-luna', queryUsage: 'Query usage', demoData: 'View demo data', startTime: 'Start time', endTime: 'End time', switchToEnglish: 'Switch to English', switchToChinese: '切换中文',
    summaryMetrics: 'Summary metrics', inputToken: 'Input tokens', cachedHit: 'Cache hit', outputToken: 'Output tokens', sessionRequest: 'Sessions / requests', waitingData: 'Waiting for data', uncachedWrite: '{uncached} uncached · {write} writes', cacheInputTokens: '{count} cached input tokens', reasoning: 'Reasoning {count}', requestSession: 'Requests / sessions',
    modelDistribution: 'Model distribution', clickToSwitch: 'Click to switch', donutAria: 'Model token share donut chart', tokenChartAria: 'Token usage bar chart', allModels: 'All models', clickCenter: 'Click center to show all models', trend: 'Trend', tokenUsage: 'Token usage', uncachedInput: 'Uncached input', cachedInput: 'Cached input', output: 'Output', modelCategory: 'Model breakdown', byModel: 'Usage by model', modelCount: '{count} models', noUsage: 'No usage in this time range', runQuery: 'Run a query to show details', noData: 'No data',
    officialPricing: 'Official pricing', actualTokenCost: 'Actual token cost by model and historical official pricing', pricingHelper: 'Matches each usage record to the official historical unit price by model and timestamp. This is API reference cost, not Plus/Codex subscription quota billing.', currentPeriod: 'Current period: {range}', unconfirmedModels: '{count} model(s) have unconfirmed historical pricing', allMatched: 'All models matched to official pricing by usage time', coverage: 'Price coverage {value}', noPricable: 'No priced usage yet', confirmed: 'Confirmed', noConfirmedPrice: 'No confirmed price', mixedHistory: 'Mixed historical pricing · {count} periods', historyUnconfirmed: 'Historical price unconfirmed', confirmedCoverage: 'Confirmed {value}', unconfirmedSegments: '{count} unconfirmed segment(s)', queryThenCalculate: 'Query usage to calculate', packagePrice: 'Package price for this period ({currency})', autoMatchPrice: 'Automatically match official historical pricing by model and usage time', officialBasis: 'Official price basis: USD · CNY conversion 1 USD = ¥{rate} ({date})', openaiPricing: 'OpenAI pricing ↗', deepseekPricing: 'DeepSeek pricing ↗', officialBadge: 'Official OpenAI / DeepSeek rates', confirmedOfficialCost: 'Confirmed official reference cost', discountMultiplier: 'Package multiplier (package / official cost)', confirmedUsage: 'Actual usage this period · confirmed', inputUnit: 'Input price', cachedInputUnit: 'Cached input price', outputUnit: 'Output price', officialReferenceCost: 'Official reference cost', pricingFootnote: 'Uses official OpenAI and DeepSeek API prices matched to each usage timestamp. Confirmed periods are included; unknown historical periods remain visible and are never guessed. The package multiplier is a local estimate, not official Plus / Codex quota billing.', unconfirmedPrice: 'Official price unconfirmed', currencyUSD: 'USD', currencyCNY: 'CNY', switchToCNY: 'Switch to CNY', switchToUSD: 'Switch to USD', currencyRateNote: 'Official price basis: USD · CNY conversion 1 USD = ¥{rate} ({date})',
    auditUsage: 'Audit usage', billingDetails: 'Current billing details', billingSummary: 'Query usage to show each billing record', confirmedReferenceCost: 'Confirmed reference cost', confirmedTokens: 'Confirmed tokens', unknownRecords: 'Unconfirmed records', billingTime: 'Time', billingModel: 'Model', billingMode: 'Mode', billingInput: 'Input', billingCached: 'Cached', billingOutput: 'Output', officialUnitPrice: 'Official unit price', billingRateUnit: 'Input / cached / output ({unit})', referenceCost: 'Reference cost', status: 'Status', noBillingDetails: 'No billing details in this time range', noMatchedPrice: 'No official historical price matched', billingFootnote: 'Details follow the current filters. “Unconfirmed” means there is not enough official historical pricing evidence; it is not guessed or included in reference cost.', billingRecordSummary: '{range} · {count} token billing record(s) · {coverage}', noToken: 'No tokens', confirmedStatus: 'Confirmed', unknownStatus: 'Unconfirmed', unrecorded: 'Unrecorded', closeBilling: 'Close billing details',
    sourceWaiting: 'Waiting for query', localLogs: 'Official local logs', demoSource: 'Demo data', dataSource: 'Data source: {source}', syncedAt: '{range} · Synced at {time}', demoNotice: 'Demo data is active. Click “Query usage” to read the official local Codex logs.', oldServerNotice: 'The local service is still an older version. Restart “启动仪表盘.cmd” to load pricing history.', connectionError: 'Cannot connect to local service {origin}. Run “启动仪表盘.cmd” first.', fileOpenError: 'Run “启动仪表盘.cmd” to open the dashboard instead of opening wwwroot/index.html directly.', queryFailed: 'Query failed. Check the Codex log path.',
    usageStatement: 'Usage statement', footerAuthor: 'Author: 可可和茶多酚 · Models appear only when token_count exists in the selected range · Local logs are read-only', footerLicense: 'Built with Codex and GPT assistance, provided free of charge, not for commercial use · Please credit the source when reposting or sharing', providerDate: '{provider} · {date}', modelUnknown: 'Unrecorded model', unknownPriceCoverage: 'Insufficient official historical pricing evidence'
  }
});
const readLanguage = () => { try { return ['zh-CN', 'en-US'].includes(localStorage.getItem(LANGUAGE_STORAGE_KEY)) ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : 'zh-CN'; } catch { return 'zh-CN'; } };
const state = { timer: null, modelRows: [], timelineRows: [], pricingEvents: [], chartModel: 'all', currency: 'USD', packagePriceUsd: 100, language: readLanguage(), statusKey: 'statusWaiting', statusType: '', noticeKey: '' };
const CURRENCY_RATES = Object.freeze({ USD: { label: '美元', symbol: '$', rate: 1 }, CNY: { label: '人民币', symbol: '¥', rate: 6.79, asOf: '2026-08-10' } });
// Official price snapshots. Confirmed periods are billable; unknown events stay unpriced.
const MODEL_PRICING_HISTORY = Object.freeze([
  { provider: 'OpenAI', models: ['gpt-4o', 'gpt-4o-2024-08-06'], effectiveFrom: '2024-08-06T00:00:00Z', effectiveTo: '2024-10-01T00:00:00Z', input: 2.5, cached: null, output: 10, source: 'https://openai.com/index/api-prompt-caching/' },
  { provider: 'OpenAI', models: ['gpt-4o', 'gpt-4o-2024-08-06'], effectiveFrom: '2024-10-01T00:00:00Z', input: 2.5, cached: 1.25, output: 10, source: 'https://openai.com/index/api-prompt-caching/' },
  { provider: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o-mini-2024-07-18'], effectiveFrom: '2024-07-18T00:00:00Z', effectiveTo: '2024-10-01T00:00:00Z', input: .15, cached: null, output: .6, source: 'https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/' },
  { provider: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o-mini-2024-07-18'], effectiveFrom: '2024-10-01T00:00:00Z', input: .15, cached: .075, output: .6, source: 'https://openai.com/index/api-prompt-caching/' },
  { provider: 'OpenAI', models: ['o1-preview'], effectiveFrom: '2024-10-01T00:00:00Z', input: 15, cached: 7.5, output: 60, source: 'https://openai.com/index/api-prompt-caching/' },
  { provider: 'OpenAI', models: ['o1-mini'], effectiveFrom: '2024-10-01T00:00:00Z', input: 3, cached: 1.5, output: 12, source: 'https://openai.com/index/api-prompt-caching/' },
  { provider: 'OpenAI', models: ['gpt-4.1'], effectiveFrom: '2025-04-14T00:00:00Z', input: 2, cached: .5, output: 8, source: 'https://openai.com/index/gpt-4-1/' },
  { provider: 'OpenAI', models: ['gpt-4.1-mini'], effectiveFrom: '2025-04-14T00:00:00Z', input: .4, cached: .1, output: 1.6, source: 'https://openai.com/index/gpt-4-1/' },
  { provider: 'OpenAI', models: ['gpt-4.1-nano'], effectiveFrom: '2025-04-14T00:00:00Z', input: .1, cached: .025, output: .4, source: 'https://openai.com/index/gpt-4-1/' },
  { provider: 'OpenAI', models: ['gpt-5'], effectiveFrom: '2025-08-07T00:00:00Z', input: 1.25, cached: .125, output: 10, source: 'https://openai.com/index/introducing-gpt-5-for-developers/' },
  { provider: 'OpenAI', models: ['gpt-5-mini'], effectiveFrom: '2025-08-07T00:00:00Z', input: .25, cached: .025, output: 2, source: 'https://openai.com/index/introducing-gpt-5-for-developers/' },
  { provider: 'OpenAI', models: ['gpt-5-nano'], effectiveFrom: '2025-08-07T00:00:00Z', input: .05, cached: .005, output: .4, source: 'https://openai.com/index/introducing-gpt-5-for-developers/' },
  { provider: 'OpenAI', models: ['gpt-5-codex'], effectiveFrom: '2025-09-23T00:00:00Z', input: 1.25, cached: .125, output: 10, source: 'https://openai.com/index/introducing-upgrades-to-codex/' },
  { provider: 'OpenAI', models: ['gpt-5.1', 'gpt-5.1-chat-latest'], effectiveFrom: '2025-12-11T00:00:00Z', input: 1.25, cached: .125, output: 10, source: 'https://openai.com/index/introducing-gpt-5-2/' },
  { provider: 'OpenAI', models: ['gpt-5.2', 'gpt-5.2-chat-latest', 'gpt-5.2-codex'], effectiveFrom: '2025-12-11T00:00:00Z', input: 1.75, cached: .175, output: 14, source: 'https://openai.com/index/introducing-gpt-5-2/' },
  { provider: 'OpenAI', models: ['gpt-5.1-pro'], effectiveFrom: '2025-12-11T00:00:00Z', input: 15, cached: null, output: 120, source: 'https://openai.com/index/introducing-gpt-5-2/' },
  { provider: 'OpenAI', models: ['gpt-5.2-pro'], effectiveFrom: '2025-12-11T00:00:00Z', input: 21, cached: null, output: 168, source: 'https://openai.com/index/introducing-gpt-5-2/' },
  { provider: 'OpenAI', models: ['gpt-5.4'], effectiveFrom: '2026-03-05T00:00:00Z', input: 2.5, cached: .25, output: 15, source: 'https://openai.com/index/introducing-gpt-5-4/' },
  { provider: 'OpenAI', models: ['gpt-5.4-mini'], effectiveFrom: '2026-03-17T00:00:00Z', input: .75, cached: .075, output: 4.5, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'OpenAI', models: ['gpt-5.4-pro'], effectiveFrom: '2026-03-05T00:00:00Z', input: 30, cached: null, output: 180, source: 'https://openai.com/index/introducing-gpt-5-4/' },
  { provider: 'OpenAI', models: ['gpt-5.6-sol'], effectiveFrom: '2026-07-09T00:00:00Z', input: 5, cached: .5, output: 30, source: 'https://developers.openai.com/api/docs/models/gpt-5.6-sol' },
  { provider: 'OpenAI', models: ['gpt-5.6-terra'], effectiveFrom: '2026-07-09T00:00:00Z', effectiveTo: '2026-07-30T00:00:00Z', input: 2.5, cached: .25, output: 15, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'OpenAI', models: ['gpt-5.6-terra'], effectiveFrom: '2026-07-30T00:00:00Z', input: 2, cached: .2, output: 12, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'OpenAI', models: ['gpt-5.6-luna'], effectiveFrom: '2026-07-09T00:00:00Z', effectiveTo: '2026-07-30T00:00:00Z', input: 1, cached: .1, output: 6, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'OpenAI', models: ['gpt-5.6-luna'], effectiveFrom: '2026-07-30T00:00:00Z', input: .2, cached: .02, output: 1.2, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'OpenAI', models: ['gpt-5.5'], effectiveFrom: '2026-04-24T00:00:00Z', input: 5, cached: .5, output: 30, source: 'https://developers.openai.com/api/docs/models/gpt-5.5' },
  { provider: 'OpenAI', models: ['gpt-5.5-pro'], effectiveFrom: '2026-04-24T00:00:00Z', input: 30, cached: null, output: 180, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'OpenAI', models: ['gpt-5.3-codex'], effectiveFrom: '2026-02-24T00:00:00Z', input: 1.75, cached: .175, output: 14, source: 'https://developers.openai.com/api/docs/changelog' },
  { provider: 'DeepSeek', models: ['deepseek-chat', 'deepseek-v2', 'deepseek-v2.5', 'deepseek-v3'], effectiveFrom: '2024-08-02T00:00:00Z', effectiveTo: '2025-02-08T00:00:00Z', input: .14, cached: .014, output: .28, source: 'https://api-docs.deepseek.com/news/news0802/' },
  { provider: 'DeepSeek', models: ['deepseek-chat', 'deepseek-v3', 'deepseek-v3-0324', 'deepseek-v3.1'], effectiveFrom: '2025-02-08T00:00:00Z', effectiveTo: '2025-09-05T16:00:00Z', input: .27, cached: .07, output: 1.1, source: 'https://api-docs.deepseek.com/news/news1226/' },
  { provider: 'DeepSeek', models: ['deepseek-reasoner', 'deepseek-r1', 'deepseek-r1-0528'], effectiveFrom: '2025-01-20T00:00:00Z', effectiveTo: '2025-09-05T16:00:00Z', input: .55, cached: .14, output: 2.19, source: 'https://api-docs.deepseek.com/news/news250120/' },
  { provider: 'DeepSeek', models: ['deepseek-v3.1', 'deepseek-v3.1-terminus', 'deepseek-chat', 'deepseek-reasoner'], effectiveFrom: '2025-09-05T16:00:00Z', effectiveTo: '2025-09-29T10:00:00Z', input: .56, cached: .07, output: 1.68, source: 'https://api-docs.deepseek.com/news/news250821/' },
  { provider: 'DeepSeek', models: ['deepseek-v3.2', 'deepseek-v3.2-exp', 'deepseek-chat', 'deepseek-reasoner'], effectiveFrom: '2025-09-29T10:00:00Z', input: .28, cached: .028, output: .42, source: 'https://api-docs.deepseek.com/news/news251201/' },
  { provider: 'DeepSeek', models: ['deepseek-v4-flash'], effectiveFrom: '2026-04-24T00:00:00Z', effectiveTo: '2026-08-16T16:00:00Z', input: .14, cached: .028, output: .28, source: 'https://api-docs.deepseek.com/news/news260424/' },
  { provider: 'DeepSeek', models: ['deepseek-v4-pro'], effectiveFrom: '2026-04-24T00:00:00Z', effectiveTo: '2026-08-16T16:00:00Z', input: 1.74, cached: .145, output: 3.48, source: 'https://api-docs.deepseek.com/news/news260424/' },
  { provider: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'], effectiveFrom: '2026-04-24T00:00:00Z', effectiveTo: '2026-07-24T16:00:00Z', input: .14, cached: .028, output: .28, source: 'https://api-docs.deepseek.com/news/news260424/' },
  { provider: 'DeepSeek', models: ['deepseek-v4-flash'], effectiveFrom: '2026-08-16T16:00:00Z', schedule: 'deepseek-v4', peak: { input: .44, cached: .014, output: 1.32 }, offPeak: { input: .22, cached: .007, output: .66 }, source: 'https://api-docs.deepseek.com/news/news260813/' },
  { provider: 'DeepSeek', models: ['deepseek-v4-pro'], effectiveFrom: '2026-08-16T16:00:00Z', schedule: 'deepseek-v4', peak: { input: 1.32, cached: .044, output: 3.96 }, offPeak: { input: .66, cached: .022, output: 1.98 }, source: 'https://api-docs.deepseek.com/news/news260813/' }
]);
const MODEL_COLORS = ['#c8a96a', '#789cc6', '#6fa28b', '#c58b5e', '#9b8db7', '#b7788f'];
const TOKEN_COLORS = {
  uncached: '#789cc6',
  cached: '#6fa28b',
  output: '#c58b5e'
};
const currentLocale = () => state.language === 'en-US' ? 'en-US' : 'zh-CN';
const t = (key, values = {}) => { const template = TRANSLATIONS[state.language]?.[key] ?? TRANSLATIONS['zh-CN'][key] ?? key; return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? ''); };
const formatNumber = (value) => new Intl.NumberFormat(currentLocale(), { maximumFractionDigits: 0 }).format(value || 0);
const formatMoney = (value) => { const currency = CURRENCY_RATES[state.currency] || CURRENCY_RATES.USD; return `${currency.symbol}${((value || 0) * currency.rate).toFixed(2)}`; };
const formatMoneyInput = (usdValue) => ((usdValue || 0) * (CURRENCY_RATES[state.currency] || CURRENCY_RATES.USD).rate).toFixed(2);
const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;
const formatDate = (unix, includeTime = true) => new Intl.DateTimeFormat(currentLocale(), includeTime ? { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } : { month: '2-digit', day: '2-digit' }).format(new Date(unix * 1000));
function formatChartDate(unix, durationOverride = null) {
  const range = getRange(); const duration = durationOverride === null ? Math.max(0, range.end - range.start) : Math.max(0, durationOverride);
  const options = $('preset').value === 'today' || duration <= 36 * 3600
    ? { hour: '2-digit', minute: '2-digit' }
    : { month: '2-digit', day: '2-digit' };
  return new Intl.DateTimeFormat(currentLocale(), options).format(new Date(unix * 1000));
}
function formatChartLabel(unix, chartStep) {
  if (chartStep >= 86400) return new Intl.DateTimeFormat(currentLocale(), { month: '2-digit', day: '2-digit' }).format(new Date(unix * 1000));
  return formatChartDate(unix, chartStep);
}
function formatChartPeriod(start, end, chartStep) {
  const startLabel = formatChartLabel(start, chartStep);
  if (!end || end <= start) return startLabel;
  const endLabel = formatChartLabel(end, chartStep);
  return startLabel === endLabel ? startLabel : `${startLabel}–${endLabel}`;
}
const formatCompact = (value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : formatNumber(value);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

function setStatus(text, type = '', key = '') { state.statusKey = key; state.statusType = type; $('liveStatus').className = `live-status ${type}`; $('liveStatus').lastElementChild.textContent = text; }
function showNotice(text, type = '', key = '') { state.noticeKey = key; const el = $('notice'); el.hidden = !text; el.className = `notice ${type}`; el.textContent = text; }
function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel)); });
  document.querySelectorAll('.choice-select').forEach(syncChoiceSelect);
  const usageHeaders = state.language === 'en-US' ? ['Model', 'Input', 'Cached input', 'Hit rate', 'Output', 'Total tokens', 'Requests', 'Sessions'] : ['模型', '输入', '缓存输入', '命中率', '输出', '总 Token', '请求', 'Session'];
  document.querySelectorAll('.table-panel thead th').forEach((element, index) => { element.textContent = usageHeaders[index]; });
  document.querySelector('.pricing-panel thead th:first-child').textContent = t('billingModel');
  $('languageCurrent').textContent = state.language === 'zh-CN' ? '中文' : 'English';
  $('languageToggle').setAttribute('aria-label', state.language === 'zh-CN' ? '语言：中文' : 'Language: English');
  $('languageMenu').setAttribute('aria-label', state.language === 'zh-CN' ? '选择语言' : 'Choose language');
  document.querySelectorAll('.language-option').forEach((option) => { option.setAttribute('aria-selected', String(option.dataset.language === state.language)); });
  if (state.statusKey) setStatus(t(state.statusKey), state.statusType, state.statusKey);
  if (state.modelRows.length || state.timelineRows.length || state.pricingEvents.length) {
    const payload = state.payload || { summary: sumRows(state.modelRows) };
    renderMetrics(state.modelRows, payload); renderTable(state.modelRows); renderModelDonut(state.modelRows); renderChart(state.timelineRows); renderPricing(state.modelRows, state.pricingEvents);
    if ($('billingDialog').open) renderBillingDetails();
  }
  syncCurrencyUi();
}
function setLanguage(language) {
  if (!['zh-CN', 'en-US'].includes(language) || language === state.language) return;
  state.language = language;
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* private browsing can block storage */ }
  applyLanguage();
}
function closeLanguageMenu({ focus = false } = {}) { $('languageMenu').hidden = true; $('languageToggle').setAttribute('aria-expanded', 'false'); if (focus) $('languageToggle').focus(); }
function toggleLanguageMenu() { const willOpen = $('languageMenu').hidden; $('languageMenu').hidden = !willOpen; $('languageToggle').setAttribute('aria-expanded', String(willOpen)); if (willOpen) document.querySelector(`.language-option[data-language="${state.language}"]`)?.focus(); }
function syncChoiceSelect(choice) { const select = $(choice.dataset.selectId); const current = choice.querySelector('.choice-current'); const selected = select.selectedOptions[0]; if (current && selected) current.textContent = selected.textContent; choice.querySelectorAll('.choice-option').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.value === select.value))); const fieldLabel = choice.parentElement?.querySelector(':scope > span')?.textContent || ''; choice.querySelector('.choice-toggle')?.setAttribute('aria-label', `${fieldLabel}：${selected?.textContent || ''}`); choice.querySelector('.choice-menu')?.setAttribute('aria-label', fieldLabel); }
function closeChoiceSelect(choice, { focus = false } = {}) { choice.querySelector('.choice-menu').hidden = true; choice.querySelector('.choice-toggle').setAttribute('aria-expanded', 'false'); if (focus) choice.querySelector('.choice-toggle').focus(); }
function closeChoiceMenus(except = null) { document.querySelectorAll('.choice-select').forEach((choice) => { if (choice !== except) closeChoiceSelect(choice); }); }
function toggleChoiceMenu(choice) { const menu = choice.querySelector('.choice-menu'); const willOpen = menu.hidden; closeChoiceMenus(choice); closeLanguageMenu(); menu.hidden = !willOpen; choice.querySelector('.choice-toggle').setAttribute('aria-expanded', String(willOpen)); if (willOpen) choice.querySelector('.choice-option[aria-selected="true"]')?.focus(); }
function getRange() {
  const preset = $('preset').value; const now = Date.now();
  if (preset === 'custom') return { start: Math.floor(new Date($('startDate').value).getTime() / 1000), end: Math.floor(new Date($('endDate').value).getTime() / 1000) };
  if (preset === 'today') { const current = new Date(now); const start = new Date(current.getFullYear(), current.getMonth(), current.getDate()); return { start: Math.floor(start.getTime() / 1000), end: Math.floor(now / 1000) }; }
  if (preset === 'since') return { start: 0, end: Math.floor(now / 1000) };
  const seconds = preset === '24h' ? 86400 : preset === '30d' ? 2592000 : 604800;
  return { start: Math.floor((now - seconds * 1000) / 1000), end: Math.floor(now / 1000) };
}
function setCustomDefaults() { const end = new Date(); const start = new Date(Date.now() - 7 * 86400000); const input = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); $('startDate').value = input(start); $('endDate').value = input(end); }
function getRangeLabel() { const preset = $('preset').value; if (preset === 'today') return t('today'); if (preset === '24h') return t('last24h'); if (preset === '30d') return t('last30d'); if (preset === '7d') return t('last7d'); if (preset === 'since') return t('since'); const format = (value) => value ? new Date(value).toLocaleString(currentLocale(), { dateStyle: 'medium', timeStyle: 'short' }) : (state.language === 'en-US' ? 'Not set' : '未设置'); return `${format($('startDate').value)} ${state.language === 'en-US' ? 'to' : '至'} ${format($('endDate').value)}`; }
function flatten(payload) { return (payload.buckets || []).flatMap((bucket) => (bucket.results || []).map((item) => ({ ...item, startTime: bucket.startTime, endTime: bucket.endTime }))); }
function sumRows(rows) { return rows.reduce((acc, row) => { for (const key of ['inputTokens', 'cachedInputTokens', 'cacheWriteInputTokens', 'nonCachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens', 'requests', 'sessions']) acc[key] += row[key] || 0; return acc; }, { inputTokens: 0, cachedInputTokens: 0, cacheWriteInputTokens: 0, nonCachedInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0, totalTokens: 0, requests: 0, sessions: 0 }); }

function renderMetrics(modelRows, payload) {
  const total = payload.summary || sumRows(modelRows); const cacheRate = total.inputTokens ? total.cachedInputTokens / total.inputTokens * 100 : 0;
  $('inputMetric').textContent = formatNumber(total.inputTokens); $('inputSub').textContent = t('uncachedWrite', { uncached: formatNumber(total.nonCachedInputTokens), write: formatNumber(total.cacheWriteInputTokens) });
  $('cachedMetric').textContent = formatPercent(cacheRate); $('cachedSub').textContent = t('cacheInputTokens', { count: formatNumber(total.cachedInputTokens) });
  $('outputMetric').textContent = formatNumber(total.outputTokens); $('outputSub').textContent = t('reasoning', { count: formatNumber(total.reasoningOutputTokens || 0) });
  $('requestMetric').textContent = `${formatNumber(total.requests)} / ${formatNumber(total.sessionCount || total.sessions)}`; $('requestSub').textContent = t('requestSession');
}

function renderTable(rows) {
  const tbody = $('usageRows'); $('rowCount').textContent = t('modelCount', { count: formatNumber(rows.length) });
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">${t('noUsage')}</td></tr>`; return; }
  tbody.innerHTML = rows.map((row) => { const rate = row.inputTokens ? row.cachedInputTokens / row.inputTokens * 100 : 0; return `<tr><td><span class="group-name">${escapeHtml(row.model || t('modelUnknown'))}</span></td><td class="number">${formatNumber(row.inputTokens)}</td><td class="number">${formatNumber(row.cachedInputTokens)}</td><td class="number hit-rate">${formatPercent(rate)}</td><td class="number">${formatNumber(row.outputTokens)}</td><td class="number">${formatNumber(row.totalTokens)}</td><td class="number">${formatNumber(row.requests)}</td><td class="number">${formatNumber(row.sessions)}</td></tr>`; }).join('');
}

function getModelPricing(model, timestamp = Math.floor(Date.now() / 1000)) {
  const normalized = String(model || '').trim().toLowerCase(); const at = timestamp * 1000;
  return MODEL_PRICING_HISTORY.filter((entry) => entry.models.some((name) => normalized === name || normalized.startsWith(`${name}-`)) && new Date(entry.effectiveFrom).getTime() <= at && (!entry.effectiveTo || at < new Date(entry.effectiveTo).getTime())).sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())[0] || null;
}

function resolvePricingRates(pricing, timestamp) {
  if (!pricing) return null;
  if (pricing.schedule !== 'deepseek-v4') return pricing;
  const hour = new Date(timestamp * 1000).getUTCHours(); const peak = (hour >= 1 && hour < 4) || (hour >= 6 && hour < 10);
  return peak ? pricing.peak : pricing.offPeak;
}

function calculateReferenceCost(row, pricing, timestamp = Math.floor(Date.now() / 1000)) {
  const rates = resolvePricingRates(pricing, timestamp); if (!rates) return null;
  const input = Math.max(row.inputTokens || 0, 0); const cached = Math.min(Math.max(row.cachedInputTokens || 0, 0), input); const cacheWrite = Math.min(Math.max(row.cacheWriteInputTokens || 0, 0), input - cached); const uncached = Math.max(input - cached - cacheWrite, 0);
  const cacheWriteRate = pricing.cacheWrite ?? rates.input;
  const cachedRate = rates.cached ?? rates.input;
  return (uncached / 1000000) * rates.input + (cached / 1000000) * cachedRate + (cacheWrite / 1000000) * cacheWriteRate + ((row.outputTokens || 0) / 1000000) * rates.output;
}

function summarizeModelPricing(row, pricingEvents) {
  const events = pricingEvents.filter((event) => (event.model || '未记录模型') === (row.model || '未记录模型'));
  if (!events.length) return { complete: false, referenceCost: null, confirmedReferenceCost: 0, pricedTokens: 0, totalTokens: 0, coverage: 0, unknownEvents: 0, versions: [], rates: null };
  const totals = { uncached: 0, cached: 0, cacheWrite: 0, output: 0 }; const weighted = { input: 0, cached: 0, cacheWrite: 0, output: 0 }; const versions = new Map(); let referenceCost = 0; let pricedTokens = 0; let totalTokens = 0; let unknownEvents = 0; let complete = true;
  for (const event of events) {
    const eventInput = Math.max(event.inputTokens || 0, 0); const eventOutput = Math.max(event.outputTokens || 0, 0); totalTokens += eventInput + eventOutput;
    const pricing = getModelPricing(event.model, event.timestamp); const rates = resolvePricingRates(pricing, event.timestamp);
    if (!pricing || !rates) { complete = false; unknownEvents += 1; continue; }
    const input = eventInput; const cached = Math.min(Math.max(event.cachedInputTokens || 0, 0), input); const cacheWrite = Math.min(Math.max(event.cacheWriteInputTokens || 0, 0), input - cached); const uncached = Math.max(input - cached - cacheWrite, 0); const output = eventOutput;
    const rowTokens = { inputTokens: input, cachedInputTokens: cached, cacheWriteInputTokens: cacheWrite, outputTokens: output }; referenceCost += calculateReferenceCost(rowTokens, pricing, event.timestamp);
    pricedTokens += input + output;
    totals.uncached += uncached; totals.cached += cached; totals.cacheWrite += cacheWrite; totals.output += output;
    weighted.input += uncached * rates.input; weighted.cached += cached * (rates.cached ?? rates.input); weighted.cacheWrite += cacheWrite * (pricing.cacheWrite ?? rates.input); weighted.output += output * rates.output;
    versions.set(`${pricing.provider}|${pricing.models[0]}|${pricing.effectiveFrom}`, pricing);
  }
  const rates = pricedTokens ? { input: totals.uncached ? weighted.input / totals.uncached : 0, cached: totals.cached ? weighted.cached / totals.cached : null, cacheWrite: totals.cacheWrite ? weighted.cacheWrite / totals.cacheWrite : null, output: totals.output ? weighted.output / totals.output : 0 } : null;
  return { complete, referenceCost: complete ? referenceCost : null, confirmedReferenceCost: referenceCost, pricedTokens, totalTokens, coverage: totalTokens ? pricedTokens / totalTokens : 0, unknownEvents, versions: [...versions.values()], rates };
}

function renderModelDonut(rows) {
  const svg = $('modelDonut'); const legend = $('donutLegend'); const models = rows.map((row) => ({ name: row.model || t('modelUnknown'), value: Math.max(row.totalTokens || ((row.inputTokens || 0) + (row.outputTokens || 0)), 0) }));
  if (state.chartModel !== 'all' && !models.some((model) => model.name === state.chartModel)) state.chartModel = 'all';
  if (!models.length) { svg.innerHTML = `<circle class="donut-track" cx="90" cy="90" r="62"/><text class="donut-empty" x="90" y="94" text-anchor="middle">${t('noData')}</text>`; legend.innerHTML = ''; return; }
  const total = Math.max(1, models.reduce((sum, model) => sum + model.value, 0)); const radius = 62; const circumference = 2 * Math.PI * radius; let offset = 0;
  const selectedValue = state.chartModel === 'all' ? total : models.find((model) => model.name === state.chartModel)?.value || 0; const selectedLabel = state.chartModel === 'all' ? t('allModels') : state.chartModel.length > 13 ? `${state.chartModel.slice(0, 12)}…` : state.chartModel;
  const segments = models.map((model, index) => { const share = model.value / total; const length = share * circumference; const dash = Math.max(1, length - 2); const active = state.chartModel === 'all' || state.chartModel === model.name; const color = MODEL_COLORS[index % MODEL_COLORS.length]; const segment = `<circle class="donut-segment${active ? ' is-active' : ''}" role="button" tabindex="0" aria-label="${state.language === 'en-US' ? 'Select ' : '选择 '}${escapeHtml(model.name)}" data-model="${escapeHtml(model.name)}" stroke="${color}" cx="90" cy="90" r="${radius}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 90 90)"><title>${escapeHtml(model.name)}: ${formatNumber(model.value)} Token (${(share * 100).toFixed(1)}%)</title></circle>`; offset += length; return segment; }).join('');
  svg.innerHTML = `<circle class="donut-track" cx="90" cy="90" r="${radius}"/><g>${segments}</g><circle class="donut-center-target" role="button" tabindex="0" aria-label="${t('allModels')}" cx="90" cy="90" r="43"/><text class="donut-center-label" x="90" y="86" text-anchor="middle">${escapeHtml(selectedLabel)}</text><text class="donut-center-value" x="90" y="105" text-anchor="middle">${(selectedValue / total * 100).toFixed(1)}%</text>`;
  legend.innerHTML = `<button class="donut-legend-item${state.chartModel === 'all' ? ' is-selected' : ''}" type="button" data-model="all"><i class="donut-dot all"></i><span>${t('allModels')}</span></button>${models.map((model, index) => `<button class="donut-legend-item${state.chartModel === model.name ? ' is-selected' : ''}" type="button" data-model="${escapeHtml(model.name)}"><i class="donut-dot" style="background:${MODEL_COLORS[index % MODEL_COLORS.length]}"></i><span title="${escapeHtml(model.name)}">${escapeHtml(model.name)}</span><small>${(model.value / total * 100).toFixed(1)}%</small></button>`).join('')}`;
  const selectModel = (model) => { state.chartModel = model; renderModelDonut(state.modelRows); renderChart(state.timelineRows); };
  [...svg.querySelectorAll('.donut-segment'), svg.querySelector('.donut-center-target'), ...legend.querySelectorAll('.donut-legend-item')].filter(Boolean).forEach((element) => { element.addEventListener('click', () => selectModel(element.dataset.model || 'all')); element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectModel(element.dataset.model || 'all'); } }); });
}

function localBucketStart(unix, step) { const date = new Date(unix * 1000); if (step >= 86400) date.setHours(0, 0, 0, 0); else date.setMinutes(0, 0, 0); return Math.floor(date.getTime() / 1000); }
function shiftLocalBucket(unix, step, offset) { const date = new Date(unix * 1000); if (step >= 86400) date.setDate(date.getDate() + offset); else date.setHours(date.getHours() + offset); return Math.floor(date.getTime() / 1000); }
function getChartStep() { const range = getRange(); const rangeDuration = Math.max(0, range.end - range.start); if (rangeDuration > 36 * 3600) return 86400; return $('bucket').value === '1d' ? 86400 : 3600; }
function buildChartBuckets(rows, step) {
  if (!rows.length) return [];
  const source = new Map();
  rows.forEach((row) => { const startTime = localBucketStart(row.startTime, step); const key = String(startTime); const point = source.get(key) || { startTime, endTime: shiftLocalBucket(startTime, step, 1), uncachedInputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }; const input = Math.max(row.inputTokens || 0, 0); const cached = Math.min(Math.max(row.cachedInputTokens || 0, 0), input); point.uncachedInputTokens += input - cached; point.cachedInputTokens += cached; point.outputTokens += Math.max(row.outputTokens || 0, 0); source.set(key, point); });
  const range = getRange(); const sourceTimes = [...source.values()].map((item) => item.startTime); let first; let last;
  if (range.start > 0) { const bucketCount = Math.max(1, Math.ceil((range.end - range.start) / step)); last = localBucketStart(range.end, step); first = shiftLocalBucket(last, step, -(bucketCount - 1)); } else { first = Math.min(...sourceTimes); last = Math.max(...sourceTimes); }
  const timeline = []; for (let cursor = first; cursor <= last; cursor = shiftLocalBucket(cursor, step, 1)) { timeline.push(source.get(String(cursor)) || { startTime: cursor, endTime: shiftLocalBucket(cursor, step, 1), uncachedInputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }); if (cursor === last) break; }
  return timeline;
}
function renderChart(rows) {
  const svg = $('chart'); const heading = $('chartHeading'); const width = 900; const height = 260; const pad = { top: 18, right: 22, bottom: 30, left: 55 }; const visibleRows = state.chartModel === 'all' ? rows : rows.filter((row) => (row.model || t('modelUnknown')) === state.chartModel); const chartStep = getChartStep(); const grouped = buildChartBuckets(visibleRows, chartStep); const resolutionLabel = chartStep >= 86400 ? t('perDay') : t('perHour'); heading.textContent = `${state.chartModel === 'all' ? t('allModels') : state.chartModel} ${t('tokenUsage')} · ${resolutionLabel}`;
  if (!grouped.length) { svg.innerHTML = ''; return; }
  const plotWidth = width - pad.left - pad.right; const plotHeight = height - pad.top - pad.bottom; const slotWidth = plotWidth / Math.max(1, grouped.length); const max = Math.max(1, ...grouped.map((item) => item.uncachedInputTokens + item.cachedInputTokens + item.outputTokens)); const x = (index) => pad.left + (index + .5) * slotWidth; const y = (value) => height - pad.bottom - (value / max) * plotHeight; const barWidth = Math.min(22, Math.max(1, slotWidth - 4)); const series = [{ key: 'uncachedInputTokens', color: TOKEN_COLORS.uncached, label: t('uncachedInput') }, { key: 'cachedInputTokens', color: TOKEN_COLORS.cached, label: t('cachedInput') }, { key: 'outputTokens', color: TOKEN_COLORS.output, label: t('output') }];
  const grid = [0, .5, 1].map((fraction) => { const value = max * fraction; const py = y(value); return `<line class="chart-grid" x1="${pad.left}" x2="${width - pad.right}" y1="${py}" y2="${py}"/><text class="chart-label" x="8" y="${py + 4}">${formatCompact(value)}</text>`; }).join('');
  const bars = grouped.map((item, index) => { const barTotal = item.uncachedInputTokens + item.cachedInputTokens + item.outputTokens; let cursor = height - pad.bottom; const segments = series.map((itemSeries) => { const value = item[itemSeries.key] || 0; const share = barTotal ? value / barTotal : 0; const segmentHeight = Math.max(0, (value / max) * plotHeight); cursor -= segmentHeight; const rect = `<rect class="chart-bar" style="--bar-index:${index};--bar-delay:${Math.min(index, 8) * 28}" fill="${itemSeries.color}" x="${(x(index) - barWidth / 2).toFixed(1)}" y="${cursor.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${segmentHeight.toFixed(1)}" rx="2"><title>${state.chartModel === 'all' ? t('allModels') : escapeHtml(state.chartModel)} · ${formatChartPeriod(item.startTime, item.endTime, chartStep)} · ${itemSeries.label}: ${formatNumber(value)} Token (${state.language === 'en-US' ? 'share of period' : '占该时间段'} ${formatPercent(share * 100)})</title></rect>`; return rect; }).join(''); return segments; }).join('');
  const tickCount = Math.min(7, Math.max(2, grouped.length)); const tickIndexes = [...new Set(Array.from({ length: tickCount }, (_, index) => Math.round(index * (grouped.length - 1) / Math.max(1, tickCount - 1))))]; const axis = tickIndexes.map((index, tickIndex) => { const tx = x(index); const anchor = tickIndex === 0 ? 'start' : tickIndex === tickIndexes.length - 1 ? 'end' : 'middle'; return `<line class="chart-axis-tick" x1="${tx.toFixed(1)}" x2="${tx.toFixed(1)}" y1="${pad.top}" y2="${height - pad.bottom}"/><text class="chart-label chart-axis-label" text-anchor="${anchor}" x="${tx.toFixed(1)}" y="${height - 7}">${formatChartLabel(grouped[index].startTime, chartStep)}</text>`; }).join('');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.style.height = ''; svg.parentElement.style.height = ''; svg.innerHTML = `${grid}${axis}${bars}`;
}

function renderPricing(rows, pricingEvents = []) {
  const unavailablePrice = `<span class="price-unavailable" aria-label="${t('unconfirmedPrice')}">/</span>`; const renderUnitPrice = (actual) => actual === null || actual === undefined ? unavailablePrice : formatMoney(actual); const packagePrice = state.packagePriceUsd; const priced = rows.map((row) => ({ row, summary: summarizeModelPricing(row, pricingEvents) })); const totalCost = priced.reduce((sum, item) => sum + item.summary.confirmedReferenceCost, 0); const scale = totalCost > 0 ? packagePrice / totalCost : 0; const total = sumRows(rows); const confirmedTokens = priced.reduce((sum, item) => sum + item.summary.pricedTokens, 0); const coverage = total.totalTokens ? confirmedTokens / total.totalTokens : 0; const unmatched = priced.filter((item) => !item.summary.complete).length;
  $('pricePeriod').textContent = `${t('currentPeriod', { range: getRangeLabel() })} · ${unmatched ? t('unconfirmedModels', { count: unmatched }) : t('allMatched')} · ${coverage ? t('coverage', { value: formatPercent(coverage * 100) }) : t('noPricable')}`; $('referenceCost').textContent = totalCost > 0 ? `${unmatched ? `${t('confirmed')} ` : ''}${formatMoney(totalCost)}` : t('noConfirmedPrice'); $('priceScale').textContent = totalCost > 0 ? `${scale.toFixed(3)}x` : '—'; $('pricedTokens').textContent = `${formatNumber(total.totalTokens)} · ${t('confirmed')} ${formatNumber(confirmedTokens)}`;
  $('priceRows').innerHTML = priced.length ? priced.map(({ row, summary }) => { const modelName = escapeHtml(row.model || t('modelUnknown')); const versionLabel = summary.versions.length > 1 ? t('mixedHistory', { count: summary.versions.length }) : summary.versions[0] ? t('providerDate', { provider: summary.versions[0].provider, date: new Date(summary.versions[0].effectiveFrom).toLocaleDateString(currentLocale()) }) : t('historyUnconfirmed'); const coverageText = summary.complete ? versionLabel : `${versionLabel} · ${t('confirmedCoverage', { value: formatPercent(summary.coverage * 100) })} · ${t('unconfirmedSegments', { count: summary.unknownEvents })}`; if (!summary.rates) return `<tr><td><span class="group-name">${modelName}</span><span class="group-sub">${coverageText}</span></td><td class="number">${unavailablePrice}</td><td class="number">${unavailablePrice}</td><td class="number">${unavailablePrice}</td><td class="number">${unavailablePrice}</td></tr>`; return `<tr><td><span class="group-name">${modelName}</span><span class="group-sub">${coverageText}</span></td><td class="number">${renderUnitPrice(summary.rates.input)}</td><td class="number">${renderUnitPrice(summary.rates.cached)}</td><td class="number">${renderUnitPrice(summary.rates.output)}</td><td class="number">${formatMoney(summary.confirmedReferenceCost)}</td></tr>`; }).join('') : `<tr><td colspan="5" class="empty-cell">${t('queryThenCalculate')}</td></tr>`;
}

function billingModeLabel(event) {
  const raw = event.mode ?? event.serviceTier ?? event.service_tier ?? event.speed ?? event.priority;
  if (raw === true) return 'Fast';
  if (!raw) return t('unrecorded');
  const value = String(raw).toLowerCase();
  if (value.includes('fast')) return 'Fast';
  if (value.includes('priority')) return 'Priority';
  if (value.includes('standard')) return 'Standard';
  return String(raw);
}

function billingTimestamp(unix) { return new Intl.DateTimeFormat(currentLocale(), { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(unix * 1000)); }

function getBillingDetails() {
  const details = [...state.pricingEvents].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((event) => {
    const input = Math.max(event.inputTokens || 0, 0); const cached = Math.min(Math.max(event.cachedInputTokens || 0, 0), input); const output = Math.max(event.outputTokens || 0, 0); const pricing = getModelPricing(event.model, event.timestamp); const rates = resolvePricingRates(pricing, event.timestamp); const tokens = { inputTokens: input, cachedInputTokens: cached, cacheWriteInputTokens: event.cacheWriteInputTokens || 0, outputTokens: output }; const referenceCost = pricing && rates ? calculateReferenceCost(tokens, pricing, event.timestamp) : null;
    return { event, input, cached, output, pricing, rates, referenceCost, confirmed: referenceCost !== null };
  });
  const referenceCost = details.reduce((sum, detail) => sum + (detail.referenceCost || 0), 0); const confirmedTokens = details.filter((detail) => detail.confirmed).reduce((sum, detail) => sum + detail.input + detail.output, 0); const totalTokens = details.reduce((sum, detail) => sum + detail.input + detail.output, 0);
  return { details, referenceCost, confirmedTokens, totalTokens };
}

function renderBillingDetails() {
  const { details, referenceCost, confirmedTokens, totalTokens } = getBillingDetails(); const unknownCount = details.filter((detail) => !detail.confirmed).length;
  $('billingDialogSummary').textContent = details.length ? t('billingRecordSummary', { range: getRangeLabel(), count: formatNumber(details.length), coverage: totalTokens ? t('coverage', { value: formatPercent(confirmedTokens / totalTokens * 100) }) : t('noToken') }) : t('billingSummary'); $('billingReferenceCost').textContent = referenceCost > 0 ? formatMoney(referenceCost) : t('noConfirmedPrice'); $('billingConfirmedTokens').textContent = formatNumber(confirmedTokens); $('billingUnknownCount').textContent = formatNumber(unknownCount);
  $('billingRows').innerHTML = details.length ? details.map(({ event, input, cached, output, pricing, rates, referenceCost: cost, confirmed }) => { const modelName = escapeHtml(event.model || t('modelUnknown')); const mode = escapeHtml(billingModeLabel(event)); const rateText = confirmed ? `${formatMoney(rates.input)} / ${rates.cached === null ? '—' : formatMoney(rates.cached)} / ${formatMoney(rates.output)}` : '—'; const status = confirmed ? `<span class="billing-status confirmed">${t('confirmedStatus')}</span>` : `<span class="billing-status unknown">${t('unknownStatus')}</span>`; return `<tr><td class="billing-time">${billingTimestamp(event.timestamp)}</td><td><span class="group-name">${modelName}</span><span class="group-sub">${pricing ? t('providerDate', { provider: pricing.provider, date: new Date(pricing.effectiveFrom).toLocaleDateString(currentLocale()) }) : t('noMatchedPrice')}</span></td><td><span class="billing-mode">${mode}</span></td><td class="number">${formatNumber(input)}</td><td class="number">${formatNumber(cached)}</td><td class="number">${formatNumber(output)}</td><td class="billing-rate">${rateText}</td><td class="number">${confirmed ? formatMoney(cost) : '—'}</td><td>${status}</td></tr>`; }).join('') : `<tr><td colspan="9" class="empty-cell">${t('noBillingDetails')}</td></tr>`;
}

function syncCurrencyUi() {
  const currency = CURRENCY_RATES[state.currency]; const unit = `${currency.symbol}/1M`; $('packageCurrencyLabel').textContent = state.language === 'en-US' ? currency.label === '美元' ? 'USD' : 'CNY' : currency.label; $('packagePrice').value = formatMoneyInput(state.packagePriceUsd); $('currencyToggle').textContent = t(state.currency === 'USD' ? 'switchToCNY' : 'switchToUSD'); $('currencyToggle').setAttribute('aria-label', t(state.currency === 'USD' ? 'switchToCNY' : 'switchToUSD')); $('currencyRateNote').textContent = t('currencyRateNote', { rate: CURRENCY_RATES.CNY.rate.toFixed(2), date: CURRENCY_RATES.CNY.asOf }); $('priceUnitInput').textContent = unit; $('priceUnitCached').textContent = unit; $('priceUnitOutput').textContent = unit; $('billingUnit').textContent = t('billingRateUnit', { unit });
}

function setCurrency(currency) { if (!CURRENCY_RATES[currency] || currency === state.currency) return; state.currency = currency; syncCurrencyUi(); renderPricing(state.modelRows, state.pricingEvents); if ($('billingDialog').open) renderBillingDetails(); }

async function loadUsage({ demo = false } = {}) {
  document.body.classList.add('is-loading'); setStatus(t('statusQuerying'), '', 'statusQuerying'); $('refresh').disabled = true; showNotice('');
  try {
    let payload;
    if (demo) payload = demoPayload();
    else {
      if (window.location.protocol === 'file:') throw new Error(t('fileOpenError'));
      const range = getRange(); const params = new URLSearchParams({ ...range, bucketWidth: $('bucket').value, includeArchived: 'true' }); if ($('model').value.trim()) params.set('model', $('model').value.trim()); const endpoint = `/api/local-usage?${params}`;
      let response;
      try { response = await fetch(endpoint); } catch (networkError) { throw new Error(t('connectionError', { origin: window.location.origin })); }
      const responseText = await response.text(); let parsed; try { parsed = JSON.parse(responseText); } catch { parsed = {}; }
      payload = parsed; if (!response.ok) throw new Error(payload.error || `查询失败（HTTP ${response.status}）`);
    }
    state.payload = payload; state.timelineRows = flatten(payload); state.pricingEvents = payload.pricingEvents || []; state.modelRows = payload.models || Object.values(state.timelineRows.reduce((map, row) => { const key = row.model || t('modelUnknown'); if (!map[key]) map[key] = { model: key, inputTokens: 0, cachedInputTokens: 0, cacheWriteInputTokens: 0, nonCachedInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0, totalTokens: 0, requests: 0, sessions: 0 }; for (const field of ['inputTokens', 'cachedInputTokens', 'cacheWriteInputTokens', 'nonCachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens', 'requests']) map[key][field] += row[field] || 0; return map; }, {}));
    renderMetrics(state.modelRows, payload); renderTable(state.modelRows); renderModelDonut(state.modelRows); renderChart(state.timelineRows); renderPricing(state.modelRows, state.pricingEvents); document.body.classList.add('is-ready'); const fetched = payload.fetchedAt ? new Date(payload.fetchedAt) : new Date(); $('updatedAt').textContent = t('syncedAt', { range: getRangeLabel(), time: fetched.toLocaleTimeString(currentLocale(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
    const sourceLabel = payload.source === 'local-codex-logs' ? `${t('localLogs')} · ${payload.sourceRoot || ''}` : t('demoSource'); $('sourceFooter').textContent = t('dataSource', { source: sourceLabel }); setStatus(demo ? t('statusDemo') : t('statusLive'), 'live', demo ? 'statusDemo' : 'statusLive'); if (demo) showNotice(t('demoNotice')); else if (!Array.isArray(payload.pricingEvents)) showNotice(t('oldServerNotice'));
  } catch (error) { setStatus(t('statusFailed'), 'error', 'statusFailed'); showNotice(error.message || t('queryFailed')); }
  finally { document.body.classList.remove('is-loading'); $('refresh').disabled = false; }
}

function demoPayload() { const now = Math.floor(Date.now() / 3600000) * 3600; const models = ['gpt-5.5', 'gpt-5.3-codex']; const buckets = Array.from({ length: 10 }, (_, index) => { const startTime = now - (9 - index) * 3600; return { startTime, endTime: startTime + 3600, results: models.map((model, modelIndex) => ({ model, inputTokens: 12000 + index * 800 + modelIndex * 4500, cachedInputTokens: 7200 + index * 520 + modelIndex * 2500, cacheWriteInputTokens: 500, nonCachedInputTokens: 4300 + index * 280 + modelIndex * 2000, outputTokens: 2600 + index * 170 + modelIndex * 650, reasoningOutputTokens: 100, totalTokens: 14600 + index * 970 + modelIndex * 5150, requests: 8 + index, sessions: 1 })) }; }); const modelRows = models.map((model) => { const rows = buckets.flatMap((bucket) => bucket.results.filter((row) => row.model === model)); return { model, ...sumRows(rows) }; }); const pricingEvents = buckets.flatMap((bucket) => bucket.results.map((row) => ({ ...row, timestamp: bucket.startTime }))); return { configured: true, source: 'demo', fetchedAt: new Date().toISOString(), models: modelRows, buckets, pricingEvents }; }

const reloadFromFilter = () => loadUsage();
$('preset').addEventListener('change', () => { $('customRange').hidden = $('preset').value !== 'custom'; reloadFromFilter(); }); $('bucket').addEventListener('change', reloadFromFilter); $('refresh').addEventListener('click', reloadFromFilter); $('demo').addEventListener('click', () => loadUsage({ demo: true }));
for (const id of ['startDate', 'endDate']) $(id).addEventListener('change', () => { if ($('preset').value === 'custom') reloadFromFilter(); });
$('packagePrice').addEventListener('input', () => { state.packagePriceUsd = Math.max(0, Number($('packagePrice').value) || 0) / CURRENCY_RATES[state.currency].rate; renderPricing(state.modelRows, state.pricingEvents); if ($('billingDialog').open) renderBillingDetails(); }); $('currencyToggle').addEventListener('click', () => setCurrency(state.currency === 'USD' ? 'CNY' : 'USD'));
$('languageToggle').addEventListener('click', toggleLanguageMenu);
document.querySelectorAll('.language-option').forEach((option) => option.addEventListener('click', () => { setLanguage(option.dataset.language); closeLanguageMenu({ focus: true }); }));
$('languageMenu').addEventListener('keydown', (event) => { const options = [...document.querySelectorAll('.language-option')]; const current = options.indexOf(document.activeElement); if (event.key === 'Escape') { event.preventDefault(); closeLanguageMenu({ focus: true }); } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus(); } });
document.querySelectorAll('.choice-select').forEach((choice) => { const toggle = choice.querySelector('.choice-toggle'); const menu = choice.querySelector('.choice-menu'); toggle.addEventListener('click', () => toggleChoiceMenu(choice)); choice.querySelectorAll('.choice-option').forEach((option) => option.addEventListener('click', () => { const select = $(choice.dataset.selectId); select.value = option.dataset.value; syncChoiceSelect(choice); closeChoiceSelect(choice, { focus: true }); select.dispatchEvent(new Event('change', { bubbles: true })); })); menu.addEventListener('keydown', (event) => { const options = [...choice.querySelectorAll('.choice-option')]; const current = options.indexOf(document.activeElement); if (event.key === 'Escape') { event.preventDefault(); closeChoiceSelect(choice, { focus: true }); } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus(); } }); });
document.addEventListener('click', (event) => { if (!event.target.closest('.language-select')) closeLanguageMenu(); if (!event.target.closest('.choice-select')) closeChoiceMenus(); });
$('billingDetails').addEventListener('click', () => { renderBillingDetails(); $('billingDialog').showModal(); }); $('billingClose').addEventListener('click', () => $('billingDialog').close()); $('billingDialog').addEventListener('click', (event) => { if (event.target === $('billingDialog')) $('billingDialog').close(); });
$('autoRefresh').addEventListener('change', () => { clearInterval(state.timer); if ($('autoRefresh').checked) state.timer = setInterval(() => loadUsage(), 60000); }); applyLanguage(); setCustomDefaults(); loadUsage(); state.timer = setInterval(() => { if ($('autoRefresh').checked) loadUsage(); }, 60000);
