# README Dashboard Screenshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the README header icon with a stable screenshot of the Chinese desktop dashboard rendered from test data.

**Architecture:** Run the existing ASP.NET Core dashboard with `CODEX_HOME` pointed at the repository fixture, select the “从使用以来” preset in Playwright, and capture the fully loaded desktop page. Store the PNG as a normal brand asset and make the existing release contract verify both the README reference and the asset's presence.

**Tech Stack:** .NET 10, ASP.NET Core, PowerShell, Playwright, PNG, Markdown

## Global Constraints

- Use the Chinese interface at a 1440px-wide desktop viewport.
- Use repository test data; do not read or expose the user's real Codex sessions.
- Wait for the loaded dashboard state before capture.
- Store the screenshot under `assets` with a descriptive filename.
- Keep the existing SVG and ICO application brand assets.

---

### Task 1: Capture and publish the README dashboard preview

**Files:**
- Create: `assets/codex-usage-ledger-dashboard.png`
- Modify: `README.md:1-5`
- Modify: `tests/release-contract.ps1:29-46`

**Interfaces:**
- Consumes: `CODEX_HOME`, `tests/fixtures/luna-codex`, `http://127.0.0.1:5188`, Playwright's `page.screenshot()`
- Produces: `assets/codex-usage-ledger-dashboard.png` and the Markdown reference `![Codex Usage Ledger 仪表盘界面](assets/codex-usage-ledger-dashboard.png)`

- [ ] **Step 1: Add failing release-contract checks**

Add the new PNG to `$requiredFiles` and require the exact Markdown reference:

```powershell
$requiredFiles = @(
    'assets\codex-usage-ledger.svg',
    'assets\codex-usage-ledger.ico',
    'assets\codex-usage-ledger-dashboard.png',
    'LICENSE.txt',
    'release-assets\使用说明.txt',
    'release-assets\版本信息.txt'
)

Assert-Contains $readme '!-- no match --' 'temporary red test must be replaced in Step 4.'
Assert-Contains $readme '!\[Codex Usage Ledger 仪表盘界面\]\(assets/codex-usage-ledger-dashboard\.png\)' 'README must lead with a real dashboard preview.'
```

Do not add the temporary `!-- no match --` assertion; it illustrates the expected initial failure. The real failure must come from the missing PNG and missing Markdown reference.

- [ ] **Step 2: Run the contract test and verify it fails**

Run:

```powershell
pwsh -NoProfile -File .\tests\release-contract.ps1
```

Expected: FAIL because `assets\codex-usage-ledger-dashboard.png` does not exist or the README reference is missing.

- [ ] **Step 3: Start the dashboard against the fixture**

Run the built application with `CODEX_HOME` set only for that server process:

```powershell
$env:CODEX_HOME = (Resolve-Path '.\tests\fixtures\luna-codex').Path
dotnet run --project .\CodexUsageDashboard.csproj -- --no-browser --urls http://127.0.0.1:5188
```

Expected: the health endpoint at `http://127.0.0.1:5188/api/health` reports `localLogs: true` and `codexHome` points to `tests\fixtures\luna-codex`.

- [ ] **Step 4: Capture the loaded Chinese desktop dashboard**

Use Playwright with a `1440 × 1000` viewport. Clear the language preference, load the dashboard, wait for `body.is-ready`, choose the preset option whose `data-value` is `since`, wait until `body.is-loading` is absent, and write a full-page PNG:

```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5188/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.removeItem('codex-dashboard-language'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('body.is-ready');
await page.locator('.choice-select[data-select-id="preset"] .choice-toggle').click();
await page.locator('.choice-select[data-select-id="preset"] .choice-option[data-value="since"]').click();
await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
await page.screenshot({ path: 'assets/codex-usage-ledger-dashboard.png', fullPage: true });
await browser.close();
```

Expected: a sharp PNG showing the populated Chinese dashboard with no browser chrome, loading overlay, dialog, or private data.

- [ ] **Step 5: Replace the README header image**

Change the Markdown immediately below the H1 from:

```markdown
![Codex Usage Ledger 图标](assets/codex-usage-ledger.svg)
```

to:

```markdown
![Codex Usage Ledger 仪表盘界面](assets/codex-usage-ledger-dashboard.png)
```

- [ ] **Step 6: Inspect the image and run verification**

Open the PNG and confirm it contains populated metrics, charts, and the model table with no personal paths or session names. Then run:

```powershell
pwsh -NoProfile -File .\tests\release-contract.ps1
pwsh -NoProfile -File .\tests\ui-contract.ps1
git diff --check
```

Expected: both scripts print their PASS messages, `git diff --check` is silent, and the README image path resolves to the new PNG.

- [ ] **Step 7: Commit the screenshot change**

```powershell
git add -- README.md tests/release-contract.ps1 assets/codex-usage-ledger-dashboard.png
git commit -m "docs: show dashboard preview in README"
```
