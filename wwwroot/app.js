const $ = (id) => document.getElementById(id);
const state = { timer: null, modelRows: [], timelineRows: [], chartModel: 'all' };
const MODEL_PRICING = Object.freeze({
  'gpt-5.6-sol': { input: 5, cached: .5, cacheWrite: 6.25, output: 30 },
  'gpt-5.6-terra': { input: 2.5, cached: .25, cacheWrite: 3.125, output: 15 },
  'gpt-5.6-luna': { input: 1, cached: .1, cacheWrite: 1.25, output: 6 },
  'gpt-5.5': { input: 5, cached: .5, cacheWrite: null, output: 30 },
  'gpt-5.5-pro': { input: 30, cached: 30, cacheWrite: null, output: 180 },
  'gpt-5.4': { input: 2.5, cached: .25, cacheWrite: null, output: 15 },
  'gpt-5.4-mini': { input: .75, cached: .075, cacheWrite: null, output: 4.5 },
  'gpt-5.4-nano': { input: .2, cached: .02, cacheWrite: null, output: 1.25 },
  'gpt-5.4-pro': { input: 30, cached: 30, cacheWrite: null, output: 180 },
  'gpt-5.3-codex': { input: 1.75, cached: .175, cacheWrite: null, output: 14 }
});
const MODEL_COLORS = ['#fece14', '#60a5fa', '#34d399', '#fb923c', '#c4b5fd', '#f472b6'];
const TOKEN_COLORS = {
  uncached: '#60a5fa',
  cached: '#34d399',
  output: '#fb923c'
};
const formatNumber = (value) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value || 0);
const formatMoney = (value) => `$${(value || 0).toFixed(2)}`;
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
  const seconds = preset === '24h' ? 86400 : preset === '30d' ? 2592000 : 604800;
  return { start: Math.floor((now - seconds * 1000) / 1000), end: Math.floor(now / 1000) };
}
function setCustomDefaults() { const end = new Date(); const start = new Date(Date.now() - 7 * 86400000); const input = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); $('startDate').value = input(start); $('endDate').value = input(end); }
function getRangeLabel() { const preset = $('preset').value; if (preset === 'today') return '今天'; if (preset === '24h') return '最近 24 小时'; if (preset === '30d') return '最近 30 天'; if (preset === '7d') return '最近 7 天'; const format = (value) => value ? new Date(value).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }) : '未设置'; return `${format($('startDate').value)} 至 ${format($('endDate').value)}`; }
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

function getModelPricing(model) {
  const normalized = String(model || '').trim().toLowerCase();
  if (MODEL_PRICING[normalized]) return MODEL_PRICING[normalized];
  const alias = Object.keys(MODEL_PRICING).find((key) => normalized.startsWith(`${key}-`));
  return alias ? MODEL_PRICING[alias] : null;
}

function calculateReferenceCost(row, pricing) {
  if (!pricing) return null;
  const input = Math.max(row.inputTokens || 0, 0); const cached = Math.min(Math.max(row.cachedInputTokens || 0, 0), input); const cacheWrite = Math.min(Math.max(row.cacheWriteInputTokens || 0, 0), input - cached); const uncached = Math.max(input - cached - cacheWrite, 0);
  const cacheWriteRate = pricing.cacheWrite ?? pricing.input;
  return (uncached / 1000000) * pricing.input + (cached / 1000000) * pricing.cached + (cacheWrite / 1000000) * cacheWriteRate + ((row.outputTokens || 0) / 1000000) * pricing.output;
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

function renderPricing(rows) {
  const packagePrice = Math.max(0, Number($('packagePrice').value) || 0); const priced = rows.map((row) => { const pricing = getModelPricing(row.model); return { row, pricing, referenceCost: calculateReferenceCost(row, pricing) }; }); const totalCost = priced.reduce((sum, item) => sum + (item.referenceCost || 0), 0); const scale = totalCost > 0 ? packagePrice / totalCost : 0; const total = sumRows(rows); const unmatched = priced.filter((item) => !item.pricing).length;
  $('pricePeriod').textContent = `当前计算时间段：${getRangeLabel()} · ${unmatched ? `${unmatched} 个模型未匹配官方价格` : '全部模型已匹配官方价格'}`; $('referenceCost').textContent = formatMoney(totalCost); $('priceScale').textContent = `${scale.toFixed(3)}x`; $('pricedTokens').textContent = formatNumber(total.totalTokens);
  $('priceRows').innerHTML = priced.length ? priced.map(({ row, pricing, referenceCost }) => { const modelName = escapeHtml(row.model || '未记录模型'); if (!pricing) return `<tr><td><span class="group-name">${modelName}</span><span class="group-sub">未匹配官方价格，未计入折算</span></td><td class="number">—</td><td class="number">—</td><td class="number">—</td><td class="number">—</td><td class="number">—</td></tr>`; return `<tr><td><span class="group-name">${modelName}</span></td><td class="number">${formatMoney(referenceCost * scale)}</td><td class="number">${formatMoney(pricing.input * scale)}</td><td class="number">${formatMoney(pricing.cached * scale)}</td><td class="number">${formatMoney(pricing.output * scale)}</td><td class="number">${formatMoney(referenceCost)}</td></tr>`; }).join('') : '<tr><td colspan="6" class="empty-cell">查询用量后计算</td></tr>';
}

async function loadUsage({ demo = false } = {}) {
  setStatus('查询中…'); $('refresh').disabled = true; showNotice('');
  try {
    let payload;
    if (demo) payload = demoPayload();
    else {
      if (window.location.protocol === 'file:') throw new Error('请双击“启动仪表盘.cmd”打开网页，不要直接打开 wwwroot/index.html。');
      const range = getRange(); const source = $('source').value; const params = new URLSearchParams({ ...range, bucketWidth: $('bucket').value, includeArchived: 'true', limit: $('bucket').value === '1m' ? 1440 : $('bucket').value === '1d' ? 31 : 168 }); if ($('model').value.trim()) params.set('model', $('model').value.trim()); const endpoint = source === 'api' ? `/api/usage?${params}` : `/api/local-usage?${params}`;
      let response;
      try { response = await fetch(endpoint); } catch (networkError) { throw new Error(`无法连接本地服务 ${window.location.origin}，请先运行“启动仪表盘.cmd”。`); }
      const responseText = await response.text(); let parsed; try { parsed = JSON.parse(responseText); } catch { parsed = {}; }
      payload = parsed; if (!response.ok) throw new Error(payload.error || `查询失败（HTTP ${response.status}）`);
    }
    state.timelineRows = flatten(payload); state.modelRows = payload.models || Object.values(state.timelineRows.reduce((map, row) => { const key = row.model || '未记录模型'; if (!map[key]) map[key] = { model: key, inputTokens: 0, cachedInputTokens: 0, cacheWriteInputTokens: 0, nonCachedInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0, totalTokens: 0, requests: 0, sessions: 0 }; for (const field of ['inputTokens', 'cachedInputTokens', 'cacheWriteInputTokens', 'nonCachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens', 'requests']) map[key][field] += row[field] || 0; return map; }, {}));
    renderMetrics(state.modelRows, payload); renderTable(state.modelRows); renderModelDonut(state.modelRows); renderChart(state.timelineRows); renderPricing(state.modelRows); const fetched = payload.fetchedAt ? new Date(payload.fetchedAt) : new Date(); $('updatedAt').textContent = `${getRangeLabel()} · 同步于 ${fetched.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    const sourceLabel = payload.source === 'local-codex-logs' ? `官方本地日志 · ${payload.sourceRoot || ''}` : payload.source === 'organization-usage-api' ? 'Organization Usage API' : '演示数据'; $('sourceFooter').textContent = `数据源：${sourceLabel}`; setStatus(demo ? '演示数据' : '实时在线', 'live'); if (demo) showNotice('当前为演示数据。点击“查询用量”即可读取本机官方 Codex 日志。');
  } catch (error) { setStatus('查询失败', 'error'); showNotice(error.message || '查询失败，请检查 Codex 日志路径。'); }
  finally { $('refresh').disabled = false; }
}

function demoPayload() { const now = Math.floor(Date.now() / 3600000) * 3600; const models = ['gpt-5.5', 'gpt-5.3-codex']; const buckets = Array.from({ length: 10 }, (_, index) => { const startTime = now - (9 - index) * 3600; return { startTime, endTime: startTime + 3600, results: models.map((model, modelIndex) => ({ model, inputTokens: 12000 + index * 800 + modelIndex * 4500, cachedInputTokens: 7200 + index * 520 + modelIndex * 2500, cacheWriteInputTokens: 500, nonCachedInputTokens: 4300 + index * 280 + modelIndex * 2000, outputTokens: 2600 + index * 170 + modelIndex * 650, reasoningOutputTokens: 100, totalTokens: 14600 + index * 970 + modelIndex * 5150, requests: 8 + index, sessions: 1 })) }; }); const modelRows = models.map((model) => { const rows = buckets.flatMap((bucket) => bucket.results.filter((row) => row.model === model)); return { model, ...sumRows(rows) }; }); return { configured: true, source: 'demo', fetchedAt: new Date().toISOString(), models: modelRows, buckets }; }

const reloadFromFilter = () => loadUsage();
$('preset').addEventListener('change', () => { $('customRange').hidden = $('preset').value !== 'custom'; reloadFromFilter(); }); $('bucket').addEventListener('change', reloadFromFilter); $('refresh').addEventListener('click', reloadFromFilter); $('demo').addEventListener('click', () => loadUsage({ demo: true }));
for (const id of ['startDate', 'endDate']) $(id).addEventListener('change', () => { if ($('preset').value === 'custom') reloadFromFilter(); });
$('packagePrice').addEventListener('input', () => renderPricing(state.modelRows));
$('autoRefresh').addEventListener('change', () => { clearInterval(state.timer); if ($('autoRefresh').checked) state.timer = setInterval(() => loadUsage(), 60000); }); setCustomDefaults(); loadUsage(); state.timer = setInterval(() => { if ($('autoRefresh').checked) loadUsage(); }, 60000);
