const $ = (id) => document.getElementById(id);
const state = { timer: null, modelRows: [], timelineRows: [], pricingEvents: [], chartModel: 'all', currency: 'USD', packagePriceUsd: 100 };
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
const MODEL_COLORS = ['#fece14', '#60a5fa', '#34d399', '#fb923c', '#c4b5fd', '#f472b6'];
const TOKEN_COLORS = {
  uncached: '#60a5fa',
  cached: '#34d399',
  output: '#fb923c'
};
const formatNumber = (value) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value || 0);
const formatMoney = (value) => { const currency = CURRENCY_RATES[state.currency] || CURRENCY_RATES.USD; return `${currency.symbol}${((value || 0) * currency.rate).toFixed(2)}`; };
const formatMoneyInput = (usdValue) => ((usdValue || 0) * (CURRENCY_RATES[state.currency] || CURRENCY_RATES.USD).rate).toFixed(2);
const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;
const formatDate = (unix, includeTime = true) => new Intl.DateTimeFormat('zh-CN', includeTime ? { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } : { month: '2-digit', day: '2-digit' }).format(new Date(unix * 1000));
function formatChartDate(unix) {
  const range = getRange(); const duration = Math.max(0, range.end - range.start);
  const options = $('preset').value === 'today' || duration <= 36 * 3600
    ? { hour: '2-digit', minute: '2-digit' }
    : { month: '2-digit', day: '2-digit' };
  return new Intl.DateTimeFormat('zh-CN', options).format(new Date(unix * 1000));
}
const formatCompact = (value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : formatNumber(value);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

function setStatus(text, type = '') { $('liveStatus').className = `live-status ${type}`; $('liveStatus').lastElementChild.textContent = text; }
function showNotice(text, type = '') { const el = $('notice'); el.hidden = !text; el.className = `notice ${type}`; el.textContent = text; }
function getRange() {
  const preset = $('preset').value; const now = Date.now();
  if (preset === 'custom') return { start: Math.floor(new Date($('startDate').value).getTime() / 1000), end: Math.floor(new Date($('endDate').value).getTime() / 1000) };
  if (preset === 'today') { const current = new Date(now); const start = new Date(current.getFullYear(), current.getMonth(), current.getDate()); return { start: Math.floor(start.getTime() / 1000), end: Math.floor(now / 1000) }; }
  if (preset === 'since') return { start: 0, end: Math.floor(now / 1000) };
  const seconds = preset === '24h' ? 86400 : preset === '30d' ? 2592000 : 604800;
  return { start: Math.floor((now - seconds * 1000) / 1000), end: Math.floor(now / 1000) };
}
function setCustomDefaults() { const end = new Date(); const start = new Date(Date.now() - 7 * 86400000); const input = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); $('startDate').value = input(start); $('endDate').value = input(end); }
function getRangeLabel() { const preset = $('preset').value; if (preset === 'today') return '今天'; if (preset === '24h') return '最近 24 小时'; if (preset === '30d') return '最近 30 天'; if (preset === '7d') return '最近 7 天'; if (preset === 'since') return '从使用以来'; const format = (value) => value ? new Date(value).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }) : '未设置'; return `${format($('startDate').value)} 至 ${format($('endDate').value)}`; }
function flatten(payload) { return (payload.buckets || []).flatMap((bucket) => (bucket.results || []).map((item) => ({ ...item, startTime: bucket.startTime, endTime: bucket.endTime }))); }
function sumRows(rows) { return rows.reduce((acc, row) => { for (const key of ['inputTokens', 'cachedInputTokens', 'cacheWriteInputTokens', 'nonCachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens', 'requests', 'sessions']) acc[key] += row[key] || 0; return acc; }, { inputTokens: 0, cachedInputTokens: 0, cacheWriteInputTokens: 0, nonCachedInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0, totalTokens: 0, requests: 0, sessions: 0 }); }

function renderMetrics(modelRows, payload) {
  const total = payload.summary || sumRows(modelRows); const cacheRate = total.inputTokens ? total.cachedInputTokens / total.inputTokens * 100 : 0;
  $('inputMetric').textContent = formatNumber(total.inputTokens); $('inputSub').textContent = `${formatNumber(total.nonCachedInputTokens)} 未缓存 · ${formatNumber(total.cacheWriteInputTokens)} 写入`;
  $('cachedMetric').textContent = formatPercent(cacheRate); $('cachedSub').textContent = `${formatNumber(total.cachedInputTokens)} 个缓存输入 Token`;
  $('outputMetric').textContent = formatNumber(total.outputTokens); $('outputSub').textContent = `Reasoning ${formatNumber(total.reasoningOutputTokens || 0)}`;
  $('requestMetric').textContent = `${formatNumber(total.requests)} / ${formatNumber(total.sessionCount || total.sessions)}`; $('requestSub').textContent = '请求 / Session';
}

function renderTable(rows) {
  const tbody = $('usageRows'); $('rowCount').textContent = `${rows.length} 个模型`;
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">该时间范围没有用量数据</td></tr>'; return; }
  tbody.innerHTML = rows.map((row) => { const rate = row.inputTokens ? row.cachedInputTokens / row.inputTokens * 100 : 0; return `<tr><td><span class="group-name">${escapeHtml(row.model || '未记录模型')}</span></td><td class="number">${formatNumber(row.inputTokens)}</td><td class="number">${formatNumber(row.cachedInputTokens)}</td><td class="number hit-rate">${formatPercent(rate)}</td><td class="number">${formatNumber(row.outputTokens)}</td><td class="number">${formatNumber(row.totalTokens)}</td><td class="number">${formatNumber(row.requests)}</td><td class="number">${formatNumber(row.sessions)}</td></tr>`; }).join('');
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
  const svg = $('modelDonut'); const legend = $('donutLegend'); const models = rows.map((row) => ({ name: row.model || '未记录模型', value: Math.max(row.totalTokens || ((row.inputTokens || 0) + (row.outputTokens || 0)), 0) }));
  if (state.chartModel !== 'all' && !models.some((model) => model.name === state.chartModel)) state.chartModel = 'all';
  if (!models.length) { svg.innerHTML = '<circle class="donut-track" cx="90" cy="90" r="62"/><text class="donut-empty" x="90" y="94" text-anchor="middle">暂无数据</text>'; legend.innerHTML = ''; return; }
  const total = Math.max(1, models.reduce((sum, model) => sum + model.value, 0)); const radius = 62; const circumference = 2 * Math.PI * radius; let offset = 0;
  const selectedValue = state.chartModel === 'all' ? total : models.find((model) => model.name === state.chartModel)?.value || 0; const selectedLabel = state.chartModel === 'all' ? '全部模型' : state.chartModel.length > 13 ? `${state.chartModel.slice(0, 12)}…` : state.chartModel;
  const segments = models.map((model, index) => { const share = model.value / total; const length = share * circumference; const dash = Math.max(1, length - 2); const active = state.chartModel === 'all' || state.chartModel === model.name; const color = MODEL_COLORS[index % MODEL_COLORS.length]; const segment = `<circle class="donut-segment${active ? ' is-active' : ''}" role="button" tabindex="0" aria-label="选择 ${escapeHtml(model.name)}" data-model="${escapeHtml(model.name)}" stroke="${color}" cx="90" cy="90" r="${radius}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 90 90)"><title>${escapeHtml(model.name)}：${formatNumber(model.value)} Token（${(share * 100).toFixed(1)}%）</title></circle>`; offset += length; return segment; }).join('');
  svg.innerHTML = `<circle class="donut-track" cx="90" cy="90" r="${radius}"/><g>${segments}</g><circle class="donut-center-target" role="button" tabindex="0" aria-label="显示全部模型" cx="90" cy="90" r="43"/><text class="donut-center-label" x="90" y="86" text-anchor="middle">${escapeHtml(selectedLabel)}</text><text class="donut-center-value" x="90" y="105" text-anchor="middle">${(selectedValue / total * 100).toFixed(1)}%</text>`;
  legend.innerHTML = `<button class="donut-legend-item${state.chartModel === 'all' ? ' is-selected' : ''}" type="button" data-model="all"><i class="donut-dot all"></i><span>全部模型</span></button>${models.map((model, index) => `<button class="donut-legend-item${state.chartModel === model.name ? ' is-selected' : ''}" type="button" data-model="${escapeHtml(model.name)}"><i class="donut-dot" style="background:${MODEL_COLORS[index % MODEL_COLORS.length]}"></i><span title="${escapeHtml(model.name)}">${escapeHtml(model.name)}</span><small>${(model.value / total * 100).toFixed(1)}%</small></button>`).join('')}`;
  const selectModel = (model) => { state.chartModel = model; renderModelDonut(state.modelRows); renderChart(state.timelineRows); };
  [...svg.querySelectorAll('.donut-segment'), svg.querySelector('.donut-center-target'), ...legend.querySelectorAll('.donut-legend-item')].filter(Boolean).forEach((element) => { element.addEventListener('click', () => selectModel(element.dataset.model || 'all')); element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectModel(element.dataset.model || 'all'); } }); });
}

function renderChart(rows) {
  const svg = $('chart'); const heading = $('chartHeading'); const width = 900; const height = 260; const pad = { top: 18, right: 22, bottom: 30, left: 55 }; const visibleRows = state.chartModel === 'all' ? rows : rows.filter((row) => (row.model || '未记录模型') === state.chartModel); const grouped = [...new Map(visibleRows.map((row) => [row.startTime, { startTime: row.startTime, uncachedInputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }])).values()];
  visibleRows.forEach((row) => { const point = grouped.find((item) => item.startTime === row.startTime); const input = Math.max(row.inputTokens || 0, 0); const cached = Math.min(Math.max(row.cachedInputTokens || 0, 0), input); point.uncachedInputTokens += input - cached; point.cachedInputTokens += cached; point.outputTokens += Math.max(row.outputTokens || 0, 0); }); grouped.sort((a, b) => a.startTime - b.startTime); heading.textContent = state.chartModel === 'all' ? '全部模型 Token 用量' : `${state.chartModel} Token 用量`;
  if (!grouped.length) { svg.innerHTML = ''; return; }
  const plotWidth = width - pad.left - pad.right; const plotHeight = height - pad.top - pad.bottom; const max = Math.max(1, ...grouped.map((item) => item.uncachedInputTokens + item.cachedInputTokens + item.outputTokens)); const x = (index) => pad.left + (grouped.length === 1 ? plotWidth / 2 : index / (grouped.length - 1) * plotWidth); const y = (value) => height - pad.bottom - (value / max) * plotHeight; const slot = plotWidth / Math.max(1, grouped.length); const barWidth = Math.max(2, Math.min(30, slot * .55)); const series = [{ key: 'uncachedInputTokens', color: TOKEN_COLORS.uncached, label: '未缓存输入' }, { key: 'cachedInputTokens', color: TOKEN_COLORS.cached, label: '缓存输入' }, { key: 'outputTokens', color: TOKEN_COLORS.output, label: '输出' }];
  const grid = [0, .5, 1].map((fraction) => { const value = max * fraction; const py = y(value); return `<line class="chart-grid" x1="${pad.left}" x2="${width - pad.right}" y1="${py}" y2="${py}"/><text class="chart-label" x="8" y="${py + 4}">${formatCompact(value)}</text>`; }).join('');
  const bars = grouped.map((item, index) => { let cursor = height - pad.bottom; const segments = series.map((itemSeries) => { const value = item[itemSeries.key] || 0; const segmentHeight = Math.max(0, (value / max) * plotHeight); cursor -= segmentHeight; const rect = `<rect class="chart-bar" fill="${itemSeries.color}" x="${(x(index) - barWidth / 2).toFixed(1)}" y="${cursor.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${segmentHeight.toFixed(1)}" rx="2"><title>${state.chartModel === 'all' ? '全部模型' : escapeHtml(state.chartModel)} · ${formatChartDate(item.startTime)} · ${itemSeries.label}：${formatNumber(value)}</title></rect>`; return rect; }).join(''); return segments; }).join('');
  const labels = grouped.map((item, index) => index % Math.max(1, Math.ceil(grouped.length / 6)) === 0 ? `<text class="chart-label" text-anchor="middle" x="${x(index)}" y="${height - 7}">${formatChartDate(item.startTime)}</text>` : '').join('');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.style.height = ''; svg.parentElement.style.height = ''; svg.innerHTML = `${grid}${bars}${labels}`;
}

function renderPricing(rows, pricingEvents = []) {
  const packagePrice = state.packagePriceUsd; const priced = rows.map((row) => ({ row, summary: summarizeModelPricing(row, pricingEvents) })); const complete = priced.every((item) => item.summary.complete); const totalCost = priced.reduce((sum, item) => sum + item.summary.confirmedReferenceCost, 0); const scale = totalCost > 0 ? packagePrice / totalCost : 0; const total = sumRows(rows); const confirmedTokens = priced.reduce((sum, item) => sum + item.summary.pricedTokens, 0); const coverage = total.totalTokens ? confirmedTokens / total.totalTokens : 0; const unmatched = priced.filter((item) => !item.summary.complete).length;
  const coverageLabel = total.totalTokens ? `价格覆盖率 ${formatPercent(coverage * 100)}` : '暂无可计价用量';
  $('pricePeriod').textContent = `当前计算时间段：${getRangeLabel()} · ${unmatched ? `${unmatched} 个模型存在未确认历史价格` : '全部模型均按使用时间匹配官方价格'} · ${coverageLabel}`; $('referenceCost').textContent = totalCost > 0 ? `${complete ? '' : '已确认 '}${formatMoney(totalCost)}` : '暂无已确认价格'; $('priceScale').textContent = totalCost > 0 ? `${complete ? '' : '已确认 '}${scale.toFixed(3)}x` : '—'; $('pricedTokens').textContent = `${formatNumber(total.totalTokens)} · 已确认 ${formatNumber(confirmedTokens)}`;
  $('priceRows').innerHTML = priced.length ? priced.map(({ row, summary }) => { const modelName = escapeHtml(row.model || '未记录模型'); const versionLabel = summary.versions.length > 1 ? `历史价格混合 · ${summary.versions.length} 段` : summary.versions[0] ? `${summary.versions[0].provider} · ${new Date(summary.versions[0].effectiveFrom).toLocaleDateString('zh-CN')}` : '历史价格未确认'; const coverageText = summary.complete ? versionLabel : `${versionLabel} · 已确认 ${formatPercent(summary.coverage * 100)} · ${summary.unknownEvents} 段未确认`; if (!summary.rates) return `<tr><td><span class="group-name">${modelName}</span><span class="group-sub">${coverageText}</span></td><td class="number">—</td><td class="number">—</td><td class="number">—</td><td class="number">—</td><td class="number">—</td></tr>`; return `<tr><td><span class="group-name">${modelName}</span><span class="group-sub">${coverageText}</span></td><td class="number">${formatMoney(summary.confirmedReferenceCost * scale)}</td><td class="number">${formatMoney(summary.rates.input * scale)}</td><td class="number">${summary.rates.cached === null ? '—' : formatMoney(summary.rates.cached * scale)}</td><td class="number">${formatMoney(summary.rates.output * scale)}</td><td class="number">${formatMoney(summary.confirmedReferenceCost)}</td></tr>`; }).join('') : '<tr><td colspan="6" class="empty-cell">查询用量后计算</td></tr>';
}

function billingModeLabel(event) {
  const raw = event.mode ?? event.serviceTier ?? event.service_tier ?? event.speed ?? event.priority;
  if (raw === true) return 'Fast';
  if (!raw) return '未记录';
  const value = String(raw).toLowerCase();
  if (value.includes('fast')) return 'Fast';
  if (value.includes('priority')) return 'Priority';
  if (value.includes('standard')) return 'Standard';
  return String(raw);
}

function billingTimestamp(unix) { return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(unix * 1000)); }

function getBillingDetails() {
  const details = [...state.pricingEvents].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((event) => {
    const input = Math.max(event.inputTokens || 0, 0); const cached = Math.min(Math.max(event.cachedInputTokens || 0, 0), input); const output = Math.max(event.outputTokens || 0, 0); const pricing = getModelPricing(event.model, event.timestamp); const rates = resolvePricingRates(pricing, event.timestamp); const tokens = { inputTokens: input, cachedInputTokens: cached, cacheWriteInputTokens: event.cacheWriteInputTokens || 0, outputTokens: output }; const referenceCost = pricing && rates ? calculateReferenceCost(tokens, pricing, event.timestamp) : null;
    return { event, input, cached, output, pricing, rates, referenceCost, confirmed: referenceCost !== null };
  });
  const referenceCost = details.reduce((sum, detail) => sum + (detail.referenceCost || 0), 0); const confirmedTokens = details.filter((detail) => detail.confirmed).reduce((sum, detail) => sum + detail.input + detail.output, 0); const totalTokens = details.reduce((sum, detail) => sum + detail.input + detail.output, 0); const packagePrice = Math.max(0, Number($('packagePrice').value) || 0); const scale = referenceCost > 0 ? packagePrice / referenceCost : 0;
  return { details, referenceCost, confirmedTokens, totalTokens, scale };
}

function renderBillingDetails() {
  const { details, referenceCost, confirmedTokens, totalTokens, scale } = getBillingDetails(); const unknownCount = details.filter((detail) => !detail.confirmed).length;
  $('billingDialogSummary').textContent = details.length ? `${getRangeLabel()} · ${details.length} 条 Token 计费记录 · ${totalTokens ? `覆盖率 ${formatPercent(confirmedTokens / totalTokens * 100)}` : '暂无 Token'}` : '查询用量后显示每条计费记录'; $('billingReferenceCost').textContent = referenceCost > 0 ? formatMoney(referenceCost) : '暂无已确认价格'; $('billingConfirmedTokens').textContent = formatNumber(confirmedTokens); $('billingUnknownCount').textContent = formatNumber(unknownCount);
  $('billingRows').innerHTML = details.length ? details.map(({ event, input, cached, output, pricing, rates, referenceCost: cost, confirmed }) => { const modelName = escapeHtml(event.model || '未记录模型'); const mode = escapeHtml(billingModeLabel(event)); const rateText = confirmed ? `${formatMoney(rates.input)} / ${rates.cached === null ? '—' : formatMoney(rates.cached)} / ${formatMoney(rates.output)}` : '—'; const status = confirmed ? '<span class="billing-status confirmed">已确认</span>' : '<span class="billing-status unknown">未确认</span>'; return `<tr><td class="billing-time">${billingTimestamp(event.timestamp)}</td><td><span class="group-name">${modelName}</span><span class="group-sub">${pricing ? `${pricing.provider} · ${new Date(pricing.effectiveFrom).toLocaleDateString('zh-CN')}` : '没有匹配到官方历史价格'}</span></td><td><span class="billing-mode">${mode}</span></td><td class="number">${formatNumber(input)}</td><td class="number">${formatNumber(cached)}</td><td class="number">${formatNumber(output)}</td><td class="billing-rate">${rateText}</td><td class="number">${confirmed ? formatMoney(cost) : '—'}${confirmed && scale ? `<span class="group-sub">套餐 ${formatMoney(cost * scale)}</span>` : ''}</td><td>${status}</td></tr>`; }).join('') : '<tr><td colspan="9" class="empty-cell">当前时间范围没有计费明细</td></tr>';
}

function syncCurrencyUi() {
  const currency = CURRENCY_RATES[state.currency]; const unit = `${currency.symbol}/1M`; $('packageCurrencyLabel').textContent = currency.label; $('packagePrice').value = formatMoneyInput(state.packagePriceUsd); $('currencyToggle').textContent = state.currency === 'USD' ? '切换人民币' : '切换美元'; $('currencyToggle').setAttribute('aria-label', `切换为${state.currency === 'USD' ? '人民币' : '美元'}`); $('currencyRateNote').textContent = `官方价格基准：美元 · 人民币换算汇率 1 USD = ¥${CURRENCY_RATES.CNY.rate.toFixed(2)}（${CURRENCY_RATES.CNY.asOf}）`; $('priceUnitInput').textContent = unit; $('priceUnitCached').textContent = unit; $('priceUnitOutput').textContent = unit; $('billingUnit').textContent = `输入 / 缓存 / 输出（${unit}）`;
}

function setCurrency(currency) { if (!CURRENCY_RATES[currency] || currency === state.currency) return; state.currency = currency; syncCurrencyUi(); renderPricing(state.modelRows, state.pricingEvents); if ($('billingDialog').open) renderBillingDetails(); }

async function loadUsage({ demo = false } = {}) {
  setStatus('查询中…'); $('refresh').disabled = true; showNotice('');
  try {
    let payload;
    if (demo) payload = demoPayload();
    else {
      if (window.location.protocol === 'file:') throw new Error('请双击“启动仪表盘.cmd”打开网页，不要直接打开 wwwroot/index.html。');
      const range = getRange(); const params = new URLSearchParams({ ...range, bucketWidth: $('bucket').value, includeArchived: 'true' }); if ($('model').value.trim()) params.set('model', $('model').value.trim()); const endpoint = `/api/local-usage?${params}`;
      let response;
      try { response = await fetch(endpoint); } catch (networkError) { throw new Error(`无法连接本地服务 ${window.location.origin}，请先运行“启动仪表盘.cmd”。`); }
      const responseText = await response.text(); let parsed; try { parsed = JSON.parse(responseText); } catch { parsed = {}; }
      payload = parsed; if (!response.ok) throw new Error(payload.error || `查询失败（HTTP ${response.status}）`);
    }
    state.timelineRows = flatten(payload); state.pricingEvents = payload.pricingEvents || []; state.modelRows = payload.models || Object.values(state.timelineRows.reduce((map, row) => { const key = row.model || '未记录模型'; if (!map[key]) map[key] = { model: key, inputTokens: 0, cachedInputTokens: 0, cacheWriteInputTokens: 0, nonCachedInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0, totalTokens: 0, requests: 0, sessions: 0 }; for (const field of ['inputTokens', 'cachedInputTokens', 'cacheWriteInputTokens', 'nonCachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens', 'requests']) map[key][field] += row[field] || 0; return map; }, {}));
    renderMetrics(state.modelRows, payload); renderTable(state.modelRows); renderModelDonut(state.modelRows); renderChart(state.timelineRows); renderPricing(state.modelRows, state.pricingEvents); const fetched = payload.fetchedAt ? new Date(payload.fetchedAt) : new Date(); $('updatedAt').textContent = `${getRangeLabel()} · 同步于 ${fetched.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    const sourceLabel = payload.source === 'local-codex-logs' ? `官方本地日志 · ${payload.sourceRoot || ''}` : '演示数据'; $('sourceFooter').textContent = `数据源：${sourceLabel}`; setStatus(demo ? '演示数据' : '实时在线', 'live'); if (demo) showNotice('当前为演示数据。点击“查询用量”即可读取本机官方 Codex 日志。'); else if (!Array.isArray(payload.pricingEvents)) showNotice('当前本地服务仍是旧版本，价格历史需要重启“启动仪表盘.cmd”后才能显示。');
  } catch (error) { setStatus('查询失败', 'error'); showNotice(error.message || '查询失败，请检查 Codex 日志路径。'); }
  finally { $('refresh').disabled = false; }
}

function demoPayload() { const now = Math.floor(Date.now() / 3600000) * 3600; const models = ['gpt-5.5', 'gpt-5.3-codex']; const buckets = Array.from({ length: 10 }, (_, index) => { const startTime = now - (9 - index) * 3600; return { startTime, endTime: startTime + 3600, results: models.map((model, modelIndex) => ({ model, inputTokens: 12000 + index * 800 + modelIndex * 4500, cachedInputTokens: 7200 + index * 520 + modelIndex * 2500, cacheWriteInputTokens: 500, nonCachedInputTokens: 4300 + index * 280 + modelIndex * 2000, outputTokens: 2600 + index * 170 + modelIndex * 650, reasoningOutputTokens: 100, totalTokens: 14600 + index * 970 + modelIndex * 5150, requests: 8 + index, sessions: 1 })) }; }); const modelRows = models.map((model) => { const rows = buckets.flatMap((bucket) => bucket.results.filter((row) => row.model === model)); return { model, ...sumRows(rows) }; }); const pricingEvents = buckets.flatMap((bucket) => bucket.results.map((row) => ({ ...row, timestamp: bucket.startTime }))); return { configured: true, source: 'demo', fetchedAt: new Date().toISOString(), models: modelRows, buckets, pricingEvents }; }

const reloadFromFilter = () => loadUsage();
$('preset').addEventListener('change', () => { $('customRange').hidden = $('preset').value !== 'custom'; reloadFromFilter(); }); $('bucket').addEventListener('change', reloadFromFilter); $('refresh').addEventListener('click', reloadFromFilter); $('demo').addEventListener('click', () => loadUsage({ demo: true }));
for (const id of ['startDate', 'endDate']) $(id).addEventListener('change', () => { if ($('preset').value === 'custom') reloadFromFilter(); });
$('packagePrice').addEventListener('input', () => { state.packagePriceUsd = Math.max(0, Number($('packagePrice').value) || 0) / CURRENCY_RATES[state.currency].rate; renderPricing(state.modelRows, state.pricingEvents); if ($('billingDialog').open) renderBillingDetails(); }); $('currencyToggle').addEventListener('click', () => setCurrency(state.currency === 'USD' ? 'CNY' : 'USD'));
$('billingDetails').addEventListener('click', () => { renderBillingDetails(); $('billingDialog').showModal(); }); $('billingClose').addEventListener('click', () => $('billingDialog').close()); $('billingDialog').addEventListener('click', (event) => { if (event.target === $('billingDialog')) $('billingDialog').close(); });
$('autoRefresh').addEventListener('change', () => { clearInterval(state.timer); if ($('autoRefresh').checked) state.timer = setInterval(() => loadUsage(), 60000); }); syncCurrencyUi(); setCustomDefaults(); loadUsage(); state.timer = setInterval(() => { if ($('autoRefresh').checked) loadUsage(); }, 60000);
