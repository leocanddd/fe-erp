# Kolektor ▸ kolektor — Build Doc

> Single-file build reference for **`kolektor.html`**: dependencies, the full specification, and the complete copy-paste-ready source.

## Dependencies

**Source file:** `kolektor.html`

**Shared scripts it loads** (must sit in the same folder):

- `auth.js`

**Assets referenced:**

- `assets/Logo_DKI.png`

External CDNs: Google Fonts (Montserrat), GSAP 3.12.5. Shared-script source is in `DKI-ERP-Master-Documentation.md` §12, or the matching `.js` files in the project root.

---

## Specification

# 01 · Kolektor → Dashboard

**File:** `kolektor.html` · **Sidebar:** Kolektor ▸ Dashboard (`selected:0`) · **Title:** "Dashboard" · **Landing page.**

The collection analytics landing page. Same machinery as the Retail dashboard ([../Retail/01-Dashboard.md](../Retail/01-Dashboard.md)) — a `.filter-row` of pills shows/hides a `.cards-stack` of `.scard`s, each with target/actual `bars()`, per-collector blocks/pills, donuts, and dual line charts, all Monthly/Weekly-switchable via `applyMode()`. This doc covers the **collection-specific cards**.

> Shell → [../Retail/README.md §3](../Retail/README.md). The shared renderers (`bars`, `renderBlocks`, `renderPills`, `toggleBlock`, `donut`, `lineChart`, `applyMode`, `DATA`, `PERIODS`) are documented in [../Retail/01-Dashboard.md](../Retail/01-Dashboard.md) — here they're re-themed for collection ("Collector 1–5", "To be Collected / Collected").

---

## Filter pills + cards

Five pills (`#filterRow`, all active) toggle five cards (`#cardsStack`):

| Pill        | `data-card` | Card                                                             |
| ----------- | ----------- | ---------------------------------------------------------------- |
| Overdue     | `overdue`   | **Overdue** receivables list                                     |
| Due 2 Weeks | `due2w`     | **Due in 2 Weeks** receivables list                              |
| Collection  | `sales`     | **Collection Performance** (bars + per-collector blocks + donut) |
| Visits      | `visits`    | **Collector Visits** (bars + dual line chart + blocks)           |
| Funnel      | `visits2`   | **Collection Funnel**                                            |

---

## Cards 1 & 2 — Overdue / Due in 2 Weeks (receivable cards)

Each renders a summary band (`.rc-summary`) + a list (`.rc-list`) from a shared config:

```js
RC_CONFIG = {
  overdue: { items:RC_OVERDUE, tone:'red',   total:'Total Overdue',  daysHead:'Overdue', … },
  due2w:   { items:RC_DUE2W,   tone:'amber', total:'Total Due Soon', daysHead:'Due In',  … }
}
```

### Receivable item shape

```js
{ id:'PO250061', src:'Project', client:'PT Waskita Karya', subject:'Apartemen Green Park Tower',
  value:182500000, days:38, sales:'Sales 2', assignee:{ name:'Andi', role:'Collector' } | null }
```

`src` (`Retail`/`Project`) renders the source badge; `days` is days-overdue (red card) or days-until-due (amber card); `assignee` may be `null` (unassigned). `rcRender(key)` builds the summary total + per-row list; `RC_COLLECTORS` is the collector roster.

---

## Card 3 — Collection Performance `[data-card="sales"]`

`bars('salesOverall', …)` seeded **To be Collected** (gradient, Rp 4,000,000,000) vs **Collected** (red, Rp 1,200,000,000). Per-collector blocks/pills (`renderBlocks`/`renderPills` → "Collector 1–5") + a Sales-contribution donut.

## Card 4 — Collector Visits `[data-card="visits"]`

`bars('visitsOverall', …)` Target 1200 / Actual 560, a **dual line chart** (`lineChart('visitsLine', mode)` — Visits panel + Sales-value panel), and per-collector blocks with daily average.

## Card 5 — Collection Funnel `[data-card="visits2"]`

A 4-stage funnel that **shrinks as you filter collectors**:

```js
V2_STAGES.monthly = [
	{ k: 'Outstanding', v: 320 },
	{ k: 'Reminded', v: 210 },
	{ k: 'Promised', v: 96 },
	{
		k: 'Collected',
		v: 1200,
		money: true,
		tgt: 1500,
	},
]; // weekly: 84/55/25/310
V2_WEIGHTS = {
	1: 0.24,
	2: 0.22,
	3: 0.2,
	4: 0.18,
	5: 0.16,
}; // each collector's share of team total
```

`v2Factor()` sums the weights of the _active_ collectors; `renderVisits2()` scales every stage by it (counts shrink proportionally; the money stage scales to the factor). Below the funnel, `lineChart4('visits2Line', mode, factor)` draws one trend panel per stage. Money is formatted by `fmtRp(jt)` (jt = Rp millions → "Rp X jt" / "Rp X.XX B").

---

## Data contract

| Endpoint (suggested)                                | Feeds                                                           |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `GET /collection/receivables?bucket=overdue\|due2w` | the two receivable cards (`RC_*` shape)                         |
| `GET /collection/performance?period=`               | to-be-collected vs collected, per-collector split, contribution |
| `GET /collection/visits?period=`                    | collector visit counts + time series                            |
| `GET /collection/funnel?period=&collectors=`        | funnel stage counts + per-stage trend                           |

## Implementation notes

- All figures are hard-coded demo data; the funnel's collector-weighting is a presentation model, not real attribution.
- Card show/hide, Monthly/Weekly, collector pills, and all reveals behave exactly as the Retail dashboard.

---

## Full page source — `kolektor.html`

```html
<!DOCTYPE html>
<html lang="id">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<title>
			DKI ERP — Kolektor Dashboard
		</title>
		<link
			rel="preconnect"
			href="https://fonts.googleapis.com"
		/>
		<link
			rel="preconnect"
			href="https://fonts.gstatic.com"
			crossorigin
		/>
		<link
			href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap"
			rel="stylesheet"
		/>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
		<style>
			:root {
				--bg: #f4f6f9;
				--card: #ffffff;
				--dark: #121567;
				--blue: #1ca7ec;
				--red: #fe2c23;
				--text: #111111;
				--muted: #9a9a9a;
				--border: #e0e0e0;
				--grad: linear-gradient(
					90deg,
					#61bedf 0%,
					#1ca7ec 50%,
					#1590cd 100%
				);
				--sidebar-w: 220px;
			}
			* {
				box-sizing: border-box;
			}
			html,
			body {
				margin: 0;
				padding: 0;
			}
			body {
				font-family:
					'Montserrat', sans-serif;
				background: var(--bg);
				color: var(--text);
				-webkit-font-smoothing: antialiased;
			}
			::-webkit-scrollbar {
				width: 8px;
				height: 8px;
			}
			::-webkit-scrollbar-thumb {
				background: #d6dbe2;
				border-radius: 8px;
			}
			::-webkit-scrollbar-track {
				background: transparent;
			}

			/* ====================== SIDEBAR ====================== */
			.sidebar {
				position: fixed;
				left: 0;
				top: 0;
				height: 100vh;
				width: var(--sidebar-w);
				background: var(--card);
				border-right: 1px solid
					var(--border);
				z-index: 200;
				display: flex;
				flex-direction: column;
				overflow: hidden;
				transition: width 0.3s ease;
			}
			.sidebar-logo {
				height: 64px;
				min-height: 64px;
				border-bottom: 1px solid
					var(--border);
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 16px;
				overflow: hidden;
			}
			.logo-img {
				height: 40px;
				width: auto;
				object-fit: contain;
				display: block;
			}
			.nav {
				flex: 1;
				overflow-y: auto;
				overflow-x: hidden;
				padding: 12px 0;
			}
			.nav-item {
				height: 48px;
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 0 16px;
				cursor: pointer;
				position: relative;
				color: var(--text);
				transition:
					color 0.2s ease,
					background 0.2s ease;
				white-space: nowrap;
			}
			.nav-item .ic {
				flex: 0 0 20px;
				width: 20px;
				height: 20px;
				color: var(--muted);
				transition: color 0.2s ease;
			}
			.nav-item .label {
				font-weight: 500;
				font-size: 14px;
				flex: 1;
			}
			.nav-item .chev {
				flex: 0 0 auto;
				width: 16px;
				height: 16px;
				color: var(--muted);
				transition: color 0.2s ease;
			}
			.nav-item:not(.active):hover {
				color: var(--blue);
			}
			.nav-item:not(.active):hover .ic,
			.nav-item:not(.active):hover
				.chev {
				color: var(--blue);
			}
			.nav-item.active {
				background: var(--grad);
				color: #fff;
				border-radius: 10px;
				margin: 0 8px;
			}
			.nav-item.active .ic,
			.nav-item.active .chev {
				color: #fff;
			}
			.submenu {
				overflow: hidden;
				height: 0;
			}
			.submenu-head {
				display: none;
			}
			.nav-group {
				position: relative;
			}
			.submenu a {
				display: block;
				height: 38px;
				line-height: 38px;
				padding-left: 48px;
				font-size: 13px;
				color: var(--muted);
				text-decoration: none;
				white-space: nowrap;
				transition: color 0.2s ease;
			}
			.submenu a:hover {
				color: var(--blue);
			}
			.submenu a.selected {
				color: var(--blue);
				font-weight: 600;
				position: relative;
			}
			.submenu a.selected::before {
				content: '';
				position: absolute;
				left: 32px;
				top: 50%;
				transform: translateY(-50%);
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: var(--grad);
			}

			/* tooltip when collapsed */
			.tooltip {
				position: absolute;
				left: 64px;
				top: 50%;
				transform: translateY(-50%);
				background: var(--dark);
				color: #fff;
				font-size: 12px;
				font-weight: 600;
				padding: 5px 10px;
				border-radius: 6px;
				white-space: nowrap;
				opacity: 0;
				pointer-events: none;
				transition: opacity 0.15s ease;
				z-index: 300;
				margin-left: 8px;
			}
			body.collapsed
				.nav-item:hover
				.tooltip {
				opacity: 1;
			}
			.tooltip::before {
				content: '';
				position: absolute;
				left: -4px;
				top: 50%;
				transform: translateY(-50%)
					rotate(45deg);
				width: 8px;
				height: 8px;
				background: var(--dark);
			}

			.sidebar-bottom {
				border-top: 1px solid
					var(--border);
				padding: 8px 0;
			}
			.user-row {
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 10px 16px;
				white-space: nowrap;
			}
			.avatar {
				flex: 0 0 40px;
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background: var(--grad);
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-weight: 700;
				font-size: 16px;
			}
			.user-meta .nm {
				font-weight: 700;
				font-size: 14px;
				color: var(--dark);
				line-height: 1.2;
			}
			.user-meta .rl {
				font-size: 12px;
				color: var(--muted);
			}
			.logout-row {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 10px 16px;
				cursor: pointer;
				color: var(--muted);
				transition: color 0.2s ease;
				white-space: nowrap;
				text-decoration: none;
			}
			.logout-row .ic {
				flex: 0 0 20px;
				width: 20px;
				height: 20px;
			}
			.logout-row .label {
				font-weight: 600;
				font-size: 13px;
			}
			.logout-row:hover {
				color: var(--red);
			}

			/* collapsed sidebar tweaks */
			body.collapsed .sidebar {
				width: 64px;
			}
			body.collapsed .logo-text,
			body.collapsed .nav-item .label,
			body.collapsed .nav-item .chev,
			body.collapsed .user-meta {
				display: none;
			}
			body.collapsed .sidebar-logo {
				justify-content: center;
				padding: 0;
			}
			body.collapsed .logo-img {
				height: 34px;
			}
			body.collapsed .nav-item {
				justify-content: center;
				padding: 0;
			}
			body.collapsed .nav-item.active {
				margin: 0 8px;
			}
			body.collapsed .user-row {
				justify-content: center;
				padding: 10px 0;
			}
			body.collapsed .logout-row {
				justify-content: center;
				padding: 10px 0;
			}
			body.collapsed
				.logout-row
				.label {
				display: none;
			}

			/* collapsed: submenu becomes a hover flyout panel */
			body.collapsed .nav-item {
				justify-content: center;
			}
			body.collapsed .submenu {
				position: absolute;
				left: 60px;
				top: 0;
				height: auto;
				overflow: visible;
				min-width: 184px;
				background: var(--card);
				border: 1px solid var(--border);
				border-radius: 12px;
				box-shadow: 0 12px 32px
					rgba(18, 21, 103, 0.16);
				padding: 8px 0;
				opacity: 0;
				visibility: hidden;
				transform: translateX(-6px);
				transition:
					opacity 0.16s ease,
					transform 0.16s ease,
					visibility 0.16s ease;
				z-index: 300;
				pointer-events: none;
			}
			body.collapsed
				.nav-group:hover
				.submenu {
				opacity: 1;
				visibility: visible;
				transform: translateX(0);
				pointer-events: auto;
			}
			body.collapsed .submenu::before {
				content: '';
				position: absolute;
				left: -16px;
				top: 0;
				width: 16px;
				height: 48px;
			}
			body.collapsed .submenu-head {
				display: block;
				padding: 2px 18px 8px;
				margin-bottom: 4px;
				font-weight: 700;
				font-size: 13px;
				color: var(--text);
				border-bottom: 1px solid
					var(--border);
			}
			body.collapsed .submenu a {
				padding-left: 18px;
				height: 36px;
				line-height: 36px;
			}
			body.collapsed
				.submenu
				a.selected::before {
				left: 6px;
			}
			/* items with a flyout: the flyout header shows the label, so drop the tooltip */
			body.collapsed
				.nav-group:has(.submenu)
				.tooltip {
				display: none;
			}

			/* ====================== HEADER ====================== */
			.header {
				position: fixed;
				top: 0;
				left: var(--sidebar-w);
				right: 0;
				height: 64px;
				z-index: 100;
				background: var(--card);
				border-bottom: 1px solid
					var(--border);
				display: flex;
				align-items: center;
				padding: 0 32px 0 20px;
				transition: left 0.3s ease;
			}
			body.collapsed .header {
				left: 64px;
			}
			.collapse-toggle {
				background: none;
				border: none;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 800;
				font-size: 20px;
				margin-right: 16px;
				line-height: 1;
				padding: 0;
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}
			.breadcrumb {
				display: flex;
				align-items: center;
				gap: 6px;
			}
			.breadcrumb .ic {
				width: 18px;
				height: 18px;
				color: var(--blue);
			}
			.breadcrumb span {
				color: var(--blue);
				font-weight: 600;
				font-size: 15px;
			}
			.company {
				margin-left: auto;
				font-weight: 800;
				font-size: 15px;
				letter-spacing: 0.08em;
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}

			/* ====================== MAIN ====================== */
			.main {
				margin-left: var(--sidebar-w);
				margin-top: 64px;
				background: var(--bg);
				padding: 32px 40px;
				min-height: calc(100vh - 64px);
				transition: margin-left 0.3s
					ease;
			}
			body.collapsed .main {
				margin-left: 64px;
			}

			.welcome {
				display: flex;
				align-items: flex-start;
				margin-bottom: 24px;
			}
			.welcome h1 {
				margin: 0;
				font-weight: 700;
				font-size: 20px;
				color: var(--text);
			}
			.welcome .date {
				margin-top: 4px;
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
			}
			.welcome .role {
				margin-left: auto;
				font-weight: 500;
				font-size: 13px;
				color: var(--muted);
				text-align: right;
			}

			.viewtabs {
				display: flex;
				gap: 8px;
				margin-bottom: 24px;
				flex-wrap: wrap;
				align-items: center;
			}
			.vt-label {
				font-weight: 600;
				font-size: 13px;
				color: var(--muted);
				margin-right: 4px;
			}
			.vtab {
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
				color: var(--muted);
				background: var(--card);
				border: 1px solid var(--border);
				border-radius: 100px;
				padding: 8px 18px;
				cursor: pointer;
				display: flex;
				align-items: center;
				gap: 7px;
				transition:
					color 0.2s ease,
					border-color 0.2s ease,
					background 0.2s ease,
					opacity 0.2s ease;
			}
			.vtab::before {
				content: '';
				width: 8px;
				height: 8px;
				border-radius: 50%;
				border: 1.5px solid
					var(--border);
				background: transparent;
				transition: all 0.2s ease;
			}
			.vtab:hover {
				color: var(--blue);
				border-color: var(--blue);
			}
			.vtab.active {
				color: #fff;
				border-color: transparent;
				background: var(--grad);
			}
			.vtab.active::before {
				background: #fff;
				border-color: #fff;
			}

			.grid {
				display: grid;
				grid-template-columns: 1fr;
				gap: 30px;
				align-items: start;
			}
			.col {
				display: contents;
			}
			.widget {
				background: var(--card);
				border: 1px solid var(--border);
				border-radius: 14px;
				padding: 28px 32px;
				box-shadow: 0 2px 8px
					rgba(0, 0, 0, 0.04);
			}
			.widget-title {
				font-weight: 700;
				font-size: 16px;
				color: var(--text);
				margin: 0 0 16px;
			}

			/* ---- reusable table ---- */
			.divider-bar {
				height: 6px;
				border-radius: 4px;
				background: var(--grad);
				width: 100%;
				margin-bottom: 12px;
			}
			.dtable {
				width: 100%;
			}
			.drow {
				display: grid;
				grid-template-columns: 1fr auto 1fr;
				align-items: center;
				height: 46px;
				border-bottom: 1px solid
					var(--bg);
				transition: background 0.2s ease;
				padding: 0 4px;
				border-radius: 4px;
			}
			.drow:hover {
				background: #f8fbff;
			}
			.drow .oid {
				font-weight: 600;
				font-size: 13px;
				color: var(--dark);
				display: flex;
				flex-direction: column;
				gap: 3px;
			}
			.drow .oid .duedate {
				font-weight: 500;
				font-size: 11px;
				color: var(--muted);
			}
			.drow .date {
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				text-align: center;
			}
			.drow .pillwrap {
				display: flex;
				justify-content: flex-end;
			}
			.lihat {
				display: block;
				text-align: right;
				color: var(--blue);
				font-weight: 600;
				font-size: 12px;
				margin-top: 12px;
				text-decoration: none;
				cursor: pointer;
			}

			/* ---- ongoing orders: extra meta columns ---- */
			.drow.has-meta {
				grid-template-columns: 1.3fr 1fr 1.2fr 1fr 110px;
				align-items: center;
			}
			.drow.has-meta .oid {
				justify-self: start;
			}
			.drow .sales {
				font-weight: 500;
				font-size: 13px;
				color: var(--text);
				justify-self: start;
				text-align: left;
			}
			.drow .value {
				font-weight: 700;
				font-size: 13px;
				color: var(--dark);
				justify-self: end;
				text-align: right;
			}
			.drow.has-meta .date {
				justify-self: center;
			}
			.drow.web-cols {
				grid-template-columns: 1fr 1.3fr 1.3fr 0.9fr 110px;
				align-items: center;
			}
			.drow .contact {
				font-weight: 500;
				font-size: 13px;
				color: var(--text);
				justify-self: start;
				text-align: left;
			}
			.drow .contact.anon {
				color: var(--muted);
				font-style: italic;
			}
			.drow .cdetail {
				font-weight: 500;
				font-size: 13px;
				color: var(--blue);
				justify-self: start;
				text-align: left;
			}
			.drow .cdetail.anon {
				color: var(--muted);
				font-style: italic;
				font-weight: 400;
			}
			.drow-head.web-cols
				span:nth-child(2) {
				text-align: left;
			}
			.drow-head.web-cols
				span:nth-child(3) {
				text-align: left;
			}
			.drow-head.web-cols
				span:nth-child(4) {
				text-align: center;
			}
			.drow-head.web-cols
				span:nth-child(5) {
				text-align: right;
			}
			.drow-head.proj-cols
				span:nth-child(3) {
				text-align: left;
			}
			.dtable.proj-cols .value {
				justify-self: start;
				text-align: left;
				font-weight: 600;
				color: var(--dark);
			}
			.drow-head {
				height: 34px;
				border-bottom: 1px solid
					var(--border);
			}
			.drow-head span {
				font-weight: 600;
				font-size: 10px;
				text-transform: uppercase;
				letter-spacing: 0.04em;
				color: var(--muted);
			}
			.drow-head span:nth-child(1) {
				text-align: left;
			}
			.drow-head span:nth-child(2) {
				text-align: left;
			}
			.drow-head span:nth-child(3) {
				text-align: right;
			}
			.drow-head span:nth-child(4) {
				text-align: center;
			}
			.drow-head span:nth-child(5) {
				text-align: right;
			}

			/* ---- inventory widget ---- */
			.inv-banner {
				width: 100%;
				height: 44px;
				border-radius: 10px;
				background: var(--grad);
				padding: 0 16px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 12px;
			}
			.inv-banner .inv-count {
				color: #fff;
				font-weight: 800;
				font-size: 18px;
			}
			.inv-banner .inv-label {
				color: #fff;
				font-weight: 700;
				font-size: 15px;
			}
			.inv-table .drow {
				height: 40px;
			}
			.inv-table .inv-id {
				color: #111;
				font-weight: 700;
				font-size: 14px;
			}
			.inv-stat {
				justify-self: end;
				text-align: right;
				font-weight: 700;
				font-size: 14px;
			}
			.inv-stat.in {
				color: #27ae60;
			}
			.inv-stat.out {
				color: #fe2c23;
			}
			.drow.inv-cols {
				grid-template-columns: 1.1fr 1.4fr 0.7fr 1fr 90px;
				align-items: center;
			}
			.inv-prod {
				font-weight: 500;
				font-size: 13px;
				color: var(--text);
				justify-self: start;
				text-align: left;
			}
			.inv-qty {
				font-weight: 700;
				font-size: 13px;
				color: var(--dark);
				justify-self: center;
				text-align: center;
			}
			.drow.inv-cols .date {
				justify-self: center;
			}
			.drow-head.inv-cols
				span:nth-child(2) {
				text-align: left;
			}
			.drow-head.inv-cols
				span:nth-child(3) {
				text-align: center;
			}
			.pill {
				border-radius: 100px;
				padding: 2px 10px;
				font-weight: 700;
				font-size: 11px;
				text-transform: uppercase;
				color: #fff;
				white-space: nowrap;
				line-height: 1.5;
			}
			.pill.diproses,
			.pill.assigned,
			.pill.quotation {
				background: #1ca7ec;
			}
			.pill.pending,
			.pill.reminded,
			.pill.remin {
				background: #f5a623;
			}
			.pill.selesai,
			.pill.approved,
			.pill.finished,
			.pill.product {
				background: #27ae60;
			}
			.pill.rejected,
			.pill.action {
				background: #fe2c23;
			}
			.pill.terkirim {
				background: #8e44ad;
			}
			.pill.inquiry {
				background: #9a9a9a;
			}
			.pill.application {
				background: #121567;
			}

			/* ---- progress bar ---- */
			.progress-track {
				width: 100%;
				height: 44px;
				border-radius: 8px;
				background: var(--bg);
				overflow: hidden;
				position: relative;
			}
			.progress-fill {
				height: 100%;
				width: 0;
				background: var(--grad);
				border-radius: 8px;
				display: flex;
				align-items: center;
				padding-left: 12px;
			}
			.progress-fill span {
				color: #fff;
				font-weight: 700;
				font-size: 14px;
				white-space: nowrap;
			}
			.target-line {
				color: var(--red);
				font-weight: 700;
				font-style: italic;
				font-size: 13px;
				margin-top: 8px;
			}

			.section-label {
				font-weight: 600;
				font-size: 14px;
				color: var(--text);
				margin-top: 26px;
				margin-bottom: 14px;
			}

			/* ---- bar chart ---- */
			.barchart {
				display: flex;
				flex-direction: column;
				gap: 14px;
			}
			.bcrow {
				display: flex;
				align-items: center;
				gap: 10px;
			}
			.bclabel {
				flex: 0 0 72px;
				font-weight: 400;
				font-size: 12px;
				color: var(--muted);
			}
			.bctrack {
				flex: 1;
				display: flex;
				align-items: center;
				gap: 8px;
			}
			.bcbar {
				height: 16px;
				border-radius: 4px;
				width: 0;
			}
			.bcval {
				font-weight: 500;
				font-size: 11px;
				color: var(--text);
			}

			/* ---- salesperson two-metric chart ---- */
			.saleschart {
				display: flex;
				flex-direction: column;
				gap: 18px;
			}
			.sc-row {
				display: grid;
				grid-template-columns: 72px 1fr;
				gap: 16px;
				align-items: center;
			}
			.sc-name {
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
			}
			.sc-bars {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.sc-metric {
				display: grid;
				grid-template-columns: 74px 1fr;
				gap: 10px;
				align-items: center;
			}
			.sc-cap {
				font-weight: 600;
				font-size: 10px;
				text-transform: uppercase;
				letter-spacing: 0.04em;
				color: var(--muted);
			}
			.sc-metric .bctrack {
				flex: 1;
				display: flex;
				align-items: center;
				gap: 8px;
			}

			/* ---- stacked project bar + legend ---- */
			.projlegend {
				display: flex;
				flex-wrap: wrap;
				gap: 14px 18px;
				margin-bottom: 16px;
			}
			.projlegend span {
				display: flex;
				align-items: center;
				gap: 6px;
				font-weight: 500;
				font-size: 11px;
				color: var(--muted);
			}
			.projlegend i {
				width: 10px;
				height: 10px;
				border-radius: 3px;
				display: inline-block;
			}
			.stackbar {
				display: flex;
				width: 100%;
				height: 18px;
				border-radius: 5px;
				overflow: hidden;
			}
			.stackbar .seg {
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-weight: 700;
				font-size: 10px;
				min-width: 14px;
			}

			/* ---- stats ---- */
			.statrow {
				display: flex;
				align-items: baseline;
				gap: 0;
			}
			.stat-num {
				font-weight: 800;
				line-height: 1;
			}
			.stat-num.grad {
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}
			.stat-num.red {
				color: var(--red);
			}
			.stat-label {
				font-weight: 600;
				font-size: 14px;
				color: var(--text);
				margin-left: 8px;
			}

			.stats-block {
				display: flex;
				flex-direction: column;
				gap: 10px;
				margin-top: 22px;
			}
			.stats-list {
				display: flex;
				flex-direction: column;
				gap: 14px;
				margin-bottom: 20px;
			}
			.stats-list .stat-label {
				font-weight: 500;
			}

			/* ---- collection sub-cards ---- */
			.subcards {
				display: flex;
				gap: 16px;
				margin-bottom: 20px;
			}
			.subcard {
				flex: 1;
				border-radius: 10px;
				padding: 16px 18px;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			.subcard.due {
				background: linear-gradient(
					90deg,
					#ff6b6b,
					#fe2c23
				);
			}
			.subcard.weeks {
				background: linear-gradient(
					90deg,
					#ffb347,
					#f5a623
				);
			}
			.subcard .amt {
				color: #fff;
				font-weight: 700;
				font-size: 14px;
			}
			.subcard .tag {
				color: #fff;
				font-weight: 700;
				font-size: 14px;
			}

			.dual-tables {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 20px;
			}
			.dual-tables .drow {
				grid-template-columns: minmax(
						0,
						1fr
					) 120px 92px;
				gap: 6px;
				align-items: center;
			}
			.dual-tables .drow .date {
				font-size: 12px;
				font-weight: 700;
				color: var(--dark);
				text-align: right;
			}
			.dual-tables .drow .pillwrap {
				justify-content: flex-end;
			}
			.dual-tables .drow.has-due {
				height: auto;
				min-height: 56px;
				padding-top: 8px;
				padding-bottom: 8px;
			}

			/* ---- activity header ---- */
			.activity-head {
				display: flex;
				align-items: center;
				margin-bottom: 16px;
			}
			.activity-badge {
				background: var(--grad);
				border-radius: 8px;
				padding: 4px 14px;
				color: #fff;
				font-weight: 800;
				font-size: 15px;
			}
			.activity-text {
				margin-left: auto;
				font-weight: 600;
				font-size: 13px;
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}
		</style>
		<script src="auth.js"></script>
	</head>
	<body>
		<!-- ====================== SIDEBAR ====================== -->
		<aside class="sidebar" id="sidebar">
			<div class="sidebar-logo">
				<img
					class="logo-img"
					src="assets/Logo_DKI.png"
					alt="PT Duta Kencana Indah"
				/>
			</div>

			<nav class="nav" id="nav"></nav>

			<div class="sidebar-bottom">
				<div class="user-row">
					<div class="avatar">R</div>
					<div class="user-meta">
						<div class="nm">Rayvin</div>
						<div class="rl">
							Superadmin
						</div>
					</div>
				</div>
				<a
					class="logout-row"
					href="index.html"
					title="Log Out"
				>
					<svg
						class="ic"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
						/>
						<polyline
							points="16 17 21 12 16 7"
						/>
						<line
							x1="21"
							y1="12"
							x2="9"
							y2="12"
						/>
					</svg>
					<span class="label"
						>LOG OUT</span
					>
				</a>
			</div>
		</aside>

		<!-- ====================== HEADER ====================== -->
		<header class="header">
			<button
				class="collapse-toggle"
				id="collapseToggle"
			>
				«
			</button>
			<div class="breadcrumb">
				<svg
					class="ic"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<ellipse
						cx="12"
						cy="6"
						rx="8"
						ry="3"
					/>
					<path
						d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"
					/>
					<path
						d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"
					/>
				</svg>
				<span>Kolektor</span>
			</div>
			<div class="company">
				PT. DUTA KENCANA INDAH
			</div>
		</header>

		<!-- ====================== MAIN ====================== -->
		<main class="main">
			<div class="welcome">
				<div>
					<h1>Dashboard</h1>
					<div class="date">
						09 Jun 2026
					</div>
				</div>
				<div class="role">
					Superadmin
				</div>
			</div>

			<div
				class="filter-row"
				id="filterRow"
			>
				<button
					class="fpill active"
					data-card="overdue"
				>
					<span class="dot"></span
					>Overdue
				</button>
				<button
					class="fpill active"
					data-card="due2w"
				>
					<span class="dot"></span>Due 2
					Weeks
				</button>
				<button
					class="fpill active"
					data-card="sales"
				>
					<span class="dot"></span
					>Collection
				</button>
				<button
					class="fpill active"
					data-card="visits"
				>
					<span class="dot"></span
					>Visits
				</button>
				<button
					class="fpill active"
					data-card="visits2"
				>
					<span class="dot"></span
					>Funnel
				</button>
			</div>

			<div
				class="cards-stack"
				id="cardsStack"
			>
				<section
					class="scard"
					data-card="overdue"
				>
					<div class="scard-head">
						<div
							class="scard-titlewrap"
						>
							<h2 class="scard-title">
								Overdue
							</h2>
							<span
								class="scard-period red-period"
								>Past due date</span
							>
						</div>
					</div>
					<div
						class="rc-summary"
						id="overdueSummary"
					></div>
					<div
						class="rc-list"
						id="overdueList"
					></div>
				</section>

				<section
					class="scard"
					data-card="due2w"
				>
					<div class="scard-head">
						<div
							class="scard-titlewrap"
						>
							<h2 class="scard-title">
								Due in 2 Weeks
							</h2>
							<span
								class="scard-period amber-period"
								>Approaching due
								date</span
							>
						</div>
					</div>
					<div
						class="rc-summary"
						id="due2wSummary"
					></div>
					<div
						class="rc-list"
						id="due2wList"
					></div>
				</section>

				<section
					class="scard"
					data-card="sales"
				>
					<div class="scard-head">
						<div
							class="scard-titlewrap"
						>
							<h2 class="scard-title">
								Collection Performance
							</h2>
							<span
								class="scard-period"
								id="salesPeriod"
								>June 2026</span
							>
						</div>
					</div>
					<div
						class="pbars"
						id="salesOverall"
					></div>
					<div
						class="sp-pills"
						id="salesPills"
					></div>
					<div
						class="donut-wrap sales-donut-solo"
						id="salesDonut"
					></div>
				</section>

				<section
					class="scard"
					data-card="visits"
				>
					<div class="scard-head">
						<div
							class="scard-titlewrap"
						>
							<h2 class="scard-title">
								Collector Visits
							</h2>
							<span
								class="scard-period"
								id="visitsPeriod"
								>June 2026</span
							>
						</div>
						<div
							class="mw-toggle"
							data-card="visits"
						>
							<button class="active">
								Monthly</button
							><button>Weekly</button>
						</div>
					</div>
					<div
						class="pbars"
						id="visitsOverall"
					></div>
					<div
						class="linechart"
						id="visitsLine"
					></div>
					<div
						class="sp-pills"
						id="visitsPills"
					></div>
					<div
						class="sp-blocks"
						id="visitsBlocks"
					></div>
				</section>

				<section
					class="scard"
					data-card="visits2"
				>
					<div class="scard-head">
						<div
							class="scard-titlewrap"
						>
							<h2 class="scard-title">
								Collection Funnel
							</h2>
							<span
								class="scard-period"
								id="visits2Period"
								>June 2026</span
							>
						</div>
					</div>
					<div
						class="funnel-wrap"
						id="visits2Funnel"
					></div>
					<div
						class="sp-pills"
						id="visits2Pills"
					></div>
					<div
						class="linechart"
						id="visits2Line"
					></div>
				</section>
			</div>
		</main>

		<style>
			.grad-bar {
				background: var(--grad);
			}

			/* filter row */
			.filter-row {
				display: flex;
				gap: 10px;
				margin-bottom: 24px;
				flex-wrap: wrap;
			}
			.fpill {
				display: flex;
				align-items: center;
				gap: 8px;
				height: 36px;
				padding: 0 18px;
				border-radius: 100px;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 14px;
				background: #fff;
				border: 1px solid var(--border);
				color: var(--muted);
				transition: 0.2s;
				white-space: nowrap;
			}
			.fpill .dot {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background: var(--muted);
				transition: 0.2s;
				flex: 0 0 auto;
			}
			.fpill.active {
				background: var(--grad);
				border-color: transparent;
				color: #fff;
			}
			.fpill.active .dot {
				background: #fff;
			}

			/* breakdown donut toggle */
			.bd-head {
				display: flex;
				align-items: center;
				gap: 12px;
				flex-wrap: wrap;
			}
			.bd-title {
				font-weight: 700;
				font-size: 14px;
				color: var(--text);
			}
			.seg {
				display: inline-flex;
				background: #f1f4f8;
				border-radius: 100px;
				padding: 3px;
				margin-left: auto;
			}
			.seg-btn {
				border: none;
				background: none;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 12px;
				color: var(--muted);
				padding: 6px 14px;
				border-radius: 100px;
				transition: 0.18s;
			}
			.seg-btn.active {
				background: #fff;
				color: var(--text);
				box-shadow: 0 1px 3px
					rgba(18, 21, 103, 0.12);
			}

			.cards-stack {
				display: flex;
				flex-direction: column;
			}
			.scard {
				background: #fff;
				border: 1px solid var(--border);
				border-radius: 12px;
				padding: 24px 28px;
				box-shadow: 0 2px 8px
					rgba(0, 0, 0, 0.04);
				margin-bottom: 20px;
				overflow: hidden;
			}

			/* receivable cards (Overdue / Due in 2 Weeks) */
			.scard-period.red-period {
				background: #fdecea;
				color: var(--red);
			}
			.scard-period.amber-period {
				background: #fef3e0;
				color: #c77e12;
			}
			.rc-summary {
				display: flex;
				align-items: center;
				gap: 24px;
				flex-wrap: wrap;
				padding: 18px 22px;
				border-radius: 12px;
				background: #f8fbff;
				border: 1px solid var(--border);
				margin-bottom: 18px;
			}
			.rc-total {
				display: flex;
				flex-direction: column;
				gap: 5px;
				margin-right: auto;
			}
			.rc-total-lbl {
				font-weight: 600;
				font-size: 12px;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				color: var(--muted);
			}
			.rc-total-amt {
				font-weight: 800;
				font-size: 26px;
				line-height: 1;
			}
			.rc-total-amt.red {
				color: var(--red);
			}
			.rc-total-amt.amber {
				color: #e08a0b;
			}
			.rc-counts {
				display: flex;
				gap: 12px;
			}
			.rc-count {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4px;
				min-width: 104px;
				padding: 11px 16px;
				border-radius: 10px;
				border: 1px solid var(--border);
				background: #fff;
			}
			.rc-cnum {
				font-weight: 800;
				font-size: 22px;
				line-height: 1;
			}
			.rc-clbl {
				font-weight: 600;
				font-size: 11px;
				color: var(--muted);
				text-align: center;
				white-space: nowrap;
			}
			.rc-count.assigned .rc-cnum {
				color: var(--blue);
			}
			.rc-count.unassigned .rc-cnum {
				color: var(--red);
			}
			.rc-count.unassigned.amber
				.rc-cnum {
				color: #e08a0b;
			}

			.rc-list {
				display: flex;
				flex-direction: column;
			}
			.rc-row-head,
			.rc-row {
				display: grid;
				grid-template-columns: 80px minmax(
						0,
						1fr
					) 72px 118px 134px;
				gap: 12px;
				align-items: center;
			}
			.rc-row-head {
				padding: 0 8px 10px;
				border-bottom: 1px solid
					var(--border);
			}
			.rc-row-head span {
				font-weight: 600;
				font-size: 10px;
				text-transform: uppercase;
				letter-spacing: 0.04em;
				color: var(--muted);
			}
			.rc-row-head span:nth-child(3) {
				text-align: center;
			}
			.rc-row-head span:nth-child(4) {
				text-align: right;
			}
			.rc-row {
				padding: 13px 8px;
				border-bottom: 1px solid
					var(--bg);
				transition: background 0.2s ease;
			}
			.rc-row:hover {
				background: #f8fbff;
			}
			.rc-id {
				font-weight: 700;
				font-size: 13px;
				color: var(--dark);
			}
			.rc-client {
				display: flex;
				flex-direction: column;
				gap: 2px;
				min-width: 0;
			}
			.rc-client b {
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.rc-client small {
				font-weight: 400;
				font-size: 11px;
				color: var(--muted);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.rc-src {
				display: inline-block;
				font-weight: 700;
				font-size: 8px;
				text-transform: uppercase;
				letter-spacing: 0.04em;
				padding: 1px 5px;
				border-radius: 3px;
				color: #fff;
				margin-right: 5px;
				vertical-align: 1px;
			}
			.rc-src.retail {
				background: #1ca7ec;
			}
			.rc-src.project {
				background: #121567;
			}
			.rc-days {
				justify-self: center;
				font-weight: 700;
				font-size: 12px;
				border-radius: 100px;
				padding: 3px 11px;
				white-space: nowrap;
			}
			.rc-days.red {
				color: var(--red);
				background: #fdecea;
			}
			.rc-days.amber {
				color: #c77e12;
				background: #fef3e0;
			}
			.rc-val {
				justify-self: end;
				font-weight: 700;
				font-size: 13px;
				color: var(--dark);
				white-space: nowrap;
			}
			.rc-staff {
				display: flex;
				align-items: center;
				gap: 8px;
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				justify-self: start;
			}
			.rc-avatar {
				flex: 0 0 26px;
				width: 26px;
				height: 26px;
				border-radius: 50%;
				background: var(--grad);
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-weight: 700;
				font-size: 11px;
			}
			.rc-assign {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				height: 30px;
				padding: 0 14px;
				border-radius: 100px;
				border: 1px dashed #c9d3df;
				background: #fff;
				color: var(--muted);
				font-family:
					'Montserrat', sans-serif;
				font-weight: 700;
				font-size: 12px;
				cursor: pointer;
				transition: 0.2s;
				justify-self: start;
			}
			.rc-assign:hover {
				border-color: var(--blue);
				color: var(--blue);
				border-style: solid;
			}
			.rc-menu {
				position: fixed;
				z-index: 500;
				background: #fff;
				border: 1px solid var(--border);
				border-radius: 10px;
				box-shadow: 0 12px 32px
					rgba(18, 21, 103, 0.18);
				padding: 6px;
				min-width: 168px;
				display: none;
				flex-direction: column;
				gap: 2px;
			}
			.rc-menu.open {
				display: flex;
			}
			.rc-menu-title {
				font-weight: 600;
				font-size: 10px;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				color: var(--muted);
				padding: 6px 10px 5px;
			}
			.rc-opt {
				display: flex;
				align-items: center;
				gap: 9px;
				height: 38px;
				padding: 0 10px;
				border: none;
				background: none;
				border-radius: 8px;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				text-align: left;
				transition: background 0.15s
					ease;
			}
			.rc-opt:hover {
				background: #f1f6fc;
				color: var(--blue);
			}
			.rc-menu .rc-avatar {
				width: 24px;
				height: 24px;
				flex: 0 0 24px;
				font-size: 10px;
			}
			.rc-menu-sep {
				height: 1px;
				background: var(--border);
				margin: 6px 8px;
			}
			.rc-opt small {
				font-weight: 500;
				font-size: 11px;
				color: var(--muted);
				margin-left: 3px;
			}
			.rc-avatar.role-sales {
				background: var(--dark);
			}
			.rc-avatar.role-manager {
				background: #8e44ad;
			}
			.rc-staff-meta {
				display: flex;
				flex-direction: column;
				line-height: 1.15;
				min-width: 0;
			}
			.rc-staff-meta b {
				font-weight: 600;
				font-size: 12.5px;
				color: var(--text);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.rc-staff-meta small {
				font-weight: 600;
				font-size: 9px;
				text-transform: uppercase;
				letter-spacing: 0.03em;
				color: var(--muted);
				white-space: nowrap;
			}

			.scard-head {
				display: flex;
				align-items: center;
				margin-bottom: 20px;
			}
			.scard-titlewrap {
				display: flex;
				align-items: baseline;
				gap: 12px;
				flex-wrap: wrap;
			}
			.scard-title {
				font-weight: 700;
				font-size: 16px;
				color: var(--text);
				margin: 0;
			}
			.scard-period {
				font-weight: 600;
				font-size: 13px;
				color: var(--blue);
				background: #ebf6fd;
				padding: 3px 12px;
				border-radius: 100px;
				white-space: nowrap;
			}
			.mw-toggle {
				margin-left: auto;
				display: flex;
				gap: 6px;
			}
			.mw-toggle button {
				height: 32px;
				padding: 0 16px;
				border-radius: 8px;
				border: none;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
				background: var(--bg);
				color: var(--muted);
				transition: 0.2s;
			}
			.mw-toggle button.active {
				background: var(--grad);
				color: #fff;
			}

			.pbar-row {
				display: flex;
				align-items: center;
				gap: 12px;
				height: 28px;
			}
			.pbar-label {
				flex: 0 0 60px;
				font-weight: 500;
				font-size: 13px;
				color: var(--muted);
			}
			#salesOverall .pbar-label {
				flex: 0 0 108px;
			}
			.pbar-track {
				flex: 1;
				height: 20px;
				border-radius: 6px;
				background: var(--bg);
				overflow: hidden;
			}
			.pbar-fill {
				height: 100%;
				border-radius: 6px;
				width: 0;
			}
			.pbar-fill.grad {
				background: var(--grad);
			}
			.pbar-fill.red {
				background: var(--red);
			}
			.pbar-val {
				flex: 0 0 auto;
				min-width: 140px;
				text-align: right;
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
			}

			.sp-pills {
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
				margin-top: 16px;
			}
			.sp-pill {
				display: flex;
				align-items: center;
				gap: 7px;
				height: 30px;
				padding: 0 14px;
				border-radius: 100px;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
				background: #fff;
				border: 1px solid var(--border);
				color: var(--muted);
				transition: 0.2s;
				white-space: nowrap;
			}
			.sp-pill .dot {
				width: 7px;
				height: 7px;
				border-radius: 50%;
				background: var(--muted);
				flex: 0 0 auto;
			}
			.sp-pill.active {
				background: var(--grad);
				border-color: transparent;
				color: #fff;
			}
			.sp-pill.active .dot {
				background: #fff;
			}

			.card-2col {
				display: grid;
				grid-template-columns: 1fr 240px;
				gap: 32px;
				margin-top: 20px;
				align-items: start;
			}

			/* sales donut shown on its own (no individual bars beside it) */
			.donut-wrap.sales-donut-solo {
				flex-direction: row;
				flex-wrap: wrap;
				align-items: center;
				justify-content: flex-start;
				gap: 18px 48px;
				margin-top: 20px;
			}
			.donut-wrap.sales-donut-solo
				.donut-title {
				flex-basis: 100%;
			}
			.donut-wrap.sales-donut-solo svg {
				width: 210px;
				height: 210px;
				flex: 0 0 auto;
			}
			.donut-wrap.sales-donut-solo
				.donut-legend {
				flex: 1;
				min-width: 280px;
				width: auto;
			}

			/* visits2 card → conversion funnel (replaces the target/actual bar) */
			.funnel-wrap {
				margin-top: 6px;
				margin-bottom: 4px;
			}
			.funnel {
				display: flex;
				flex-direction: column;
			}
			.fn-stage {
				display: flex;
				align-items: center;
				gap: 14px;
				height: 42px;
			}
			.fn-label {
				flex: 0 0 88px;
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
			}
			.fn-track {
				flex: 1;
				height: 26px;
				border-radius: 7px;
				background: var(--bg);
				overflow: hidden;
			}
			.fn-fill {
				height: 100%;
				border-radius: 7px;
				width: 0;
			}
			.fn-val {
				flex: 0 0 100px;
				text-align: right;
				font-weight: 700;
				font-size: 15px;
				color: var(--dark);
			}
			.fn-val-money {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				justify-content: center;
				line-height: 1.2;
			}
			.fn-attain {
				font-weight: 700;
				font-size: 10px;
				margin-top: 3px;
				white-space: nowrap;
			}
			.fn-conv {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 2px 0 2px 102px;
			}
			.fn-conv::before {
				content: '\2193';
				color: var(--blue);
				font-weight: 700;
				font-size: 12px;
				line-height: 1;
			}
			.fn-pct {
				font-weight: 800;
				font-size: 12px;
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}
			.fn-ratio {
				font-weight: 700;
				font-size: 10px;
				color: var(--blue);
				background: #ebf6fd;
				padding: 1px 8px;
				border-radius: 100px;
				white-space: nowrap;
			}
			.fn-cap {
				font-weight: 500;
				font-size: 11px;
				color: var(--muted);
			}

			.sp-blocks {
				display: flex;
				flex-direction: column;
			}
			.sp-block {
				padding: 14px 0;
				border-bottom: 1px solid
					var(--border);
				overflow: hidden;
			}
			.sp-block:last-child {
				border-bottom: none;
			}
			.sp-block-head {
				display: flex;
				align-items: center;
				margin-bottom: 8px;
			}
			.sp-block-title {
				font-weight: 700;
				font-size: 15px;
				color: var(--text);
				white-space: nowrap;
			}
			.sp-block-avg {
				margin-left: auto;
				font-weight: 400;
				font-style: italic;
				font-size: 13px;
				color: var(--muted);
			}

			.donut-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 16px;
			}
			.donut-wrap svg {
				width: 180px;
				height: 180px;
			}
			.donut-legend {
				display: flex;
				flex-direction: column;
				gap: 10px;
				width: 100%;
			}
			.donut-legend .lg {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 13px;
				font-weight: 500;
				color: var(--text);
				white-space: nowrap;
			}
			.donut-legend .lg i {
				width: 10px;
				height: 10px;
				border-radius: 3px;
				flex: 0 0 auto;
			}
			.donut-legend .lg .amt {
				margin-left: auto;
				font-weight: 600;
				color: var(--text);
				font-size: 12px;
			}
			.donut-legend .lg .pct {
				margin-left: 8px;
				font-weight: 700;
				color: var(--muted);
				min-width: 34px;
				text-align: right;
			}
			.donut-title {
				font-weight: 700;
				font-size: 13px;
				color: var(--text);
				align-self: flex-start;
				margin-bottom: -4px;
			}
			.donut-title small {
				display: block;
				font-weight: 500;
				font-size: 11px;
				color: var(--muted);
				margin-top: 2px;
			}

			.linechart {
				margin-top: 16px;
			}
			.lc-panel {
				margin-bottom: 10px;
			}
			.lc-panel:last-child {
				margin-bottom: 0;
			}
			.lc-head {
				display: flex;
				align-items: center;
				gap: 12px;
				margin-bottom: 2px;
			}
			.lc-name {
				font-weight: 700;
				font-size: 13px;
				color: var(--text);
			}
			.lc-legend2 {
				margin-left: auto;
				display: flex;
				gap: 14px;
			}
			.lc-legend2 .lg {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 11px;
				font-weight: 500;
				color: var(--muted);
			}
			.lc-legend2 .lg i.ln {
				width: 16px;
				height: 3px;
				border-radius: 2px;
			}
			.lc-legend2 .lg i.ln.dash {
				background: none !important;
				background-image: repeating-linear-gradient(
					90deg,
					currentColor 0 4px,
					transparent 4px 7px
				) !important;
			}
			.linechart svg {
				width: 100%;
				height: auto;
				display: block;
			}
			.lc-legend {
				display: flex;
				gap: 18px;
				margin-bottom: 10px;
				flex-wrap: wrap;
			}
			.lc-legend .lg {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 12px;
				font-weight: 500;
				color: var(--muted);
			}
			.lc-legend .lg i {
				width: 10px;
				height: 10px;
				border-radius: 50%;
			}
			.lc-legend .lg i.ln {
				width: 18px;
				height: 3px;
				border-radius: 2px;
			}
			.lc-legend .lg i.ln.dash {
				background: none !important;
				background-image: repeating-linear-gradient(
					90deg,
					currentColor 0 4px,
					transparent 4px 7px
				) !important;
			}

			.stores-2col {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 32px;
				margin-top: 4px;
				align-items: start;
			}
			.col-title {
				font-weight: 700;
				font-size: 15px;
				color: var(--text);
				margin: 0 0 12px;
			}
			.tbar {
				display: flex;
				align-items: center;
				justify-content: center;
				background: var(--grad);
				color: #fff;
				font-weight: 700;
				font-size: 13px;
				border-radius: 8px;
				height: 40px;
				margin: 16px 0 8px;
			}
			.srow {
				display: grid;
				grid-template-columns: 1.5fr auto 1fr 1fr auto;
				gap: 10px;
				align-items: center;
				padding: 10px 0;
				border-bottom: 1px solid
					var(--bg);
				transition: background 0.2s;
			}
			.srow:hover {
				background: #f8fbff;
			}
			.srow .nm {
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
			}
			.srow .mut {
				font-weight: 400;
				font-size: 12px;
				color: var(--muted);
			}
			.srow .amt {
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				text-align: right;
			}

			.pgroup {
				padding: 6px 0;
				border-bottom: 1px solid
					var(--bg);
			}
			.pgroup:last-child {
				border-bottom: none;
			}
			.pg-head {
				display: grid;
				grid-template-columns: auto 1fr auto;
				gap: 10px;
				align-items: center;
				padding-bottom: 8px;
				border-bottom: 1px solid
					var(--border);
			}
			.pg-head .brand {
				font-weight: 700;
				font-size: 13px;
				color: var(--text);
			}
			.pg-head .prod {
				font-weight: 400;
				font-size: 12px;
				color: var(--muted);
			}
			.pg-head .qty {
				font-weight: 700;
				font-size: 13px;
				color: var(--blue);
				text-align: right;
			}
			.pg-row {
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 7px 0;
			}
			.pg-row .mut {
				font-weight: 500;
				font-size: 12px;
				color: var(--text);
				min-width: 58px;
			}
			.pg-row .qbadge {
				display: inline-flex;
				align-items: baseline;
				gap: 3px;
				background: #eef3fb;
				color: var(--blue);
				font-weight: 700;
				font-size: 12px;
				padding: 2px 9px;
				border-radius: 100px;
			}
			.pg-row .qbadge small {
				font-weight: 600;
				font-size: 10px;
				color: var(--muted);
			}
			.pg-row .amt {
				margin-left: auto;
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				text-align: right;
			}
		</style>

		<script>
			/* ====================== ICONS ====================== */
			const ICONS = {
				home: '<path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10h14V10"/>',
				inventory:
					'<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="m7.5 5.5 9 5"/>',
				retail:
					'<path d="M3 9 4.5 4h15L21 9"/><path d="M4 9v11h16V9"/><path d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M9 20v-5h6v5"/>',
				project:
					'<path d="M3 21h18"/><path d="M5 21V8l9-3v16"/><path d="M14 21V10l5 2v9"/><path d="M5 5 14 2"/>',
				kolektor:
					'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
				website:
					'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
				rockwoolindo:
					'<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15 21V9h3a2 2 0 0 1 2 2v10"/><path d="M8 7h2M8 11h2M8 15h2"/>',
				karir:
					'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 4a3 3 0 0 1 0 6"/><path d="M18 15c2.5.6 4 2.4 4 5"/>',
				admin:
					'<path d="M12 3 4 6v5c0 4.5 3.2 7.8 8 10 4.8-2.2 8-5.5 8-10V6l-8-3Z"/><path d="M9 12l2 2 4-4"/>',
				profil:
					'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
			};
			const chevSVG =
				'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
			function icon(name) {
				return (
					'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
					ICONS[name] +
					'</svg>'
				);
			}

			/* ====================== NAV CONFIG ====================== */
			const NAV = [
				{
					key: 'home',
					label: 'Home',
					icon: 'home',
				},
				{
					key: 'inventory',
					label: 'Inventory',
					icon: 'inventory',
					sub: [
						'Stok Barang',
						'Lokasi',
						'History',
					],
				},
				{
					key: 'retail',
					label: 'Retail',
					icon: 'retail',
					sub: [
						'Dashboard',
						'Toko',
						'Order',
						'Kunjungan',
						'Tracking',
					],
				},
				{
					key: 'project',
					label: 'Project',
					icon: 'project',
					sub: [
						'Dashboard',
						'Projects',
						'Companies',
						'Quotations',
						'PO',
						'Kunjungan',
						'Tracking',
					],
				},
				{
					key: 'kolektor',
					label: 'Kolektor',
					icon: 'kolektor',
					active: true,
					sub: [
						'Dashboard',
						'AR',
						'Kunjungan',
						'Schedule',
						'Tracking',
					],
					selected: 0,
				},
				{
					key: 'website',
					label: 'Website',
					icon: 'website',
					sub: [
						'Messages',
						'News',
						'Portfolio',
						'Web Products',
						'Product Categories',
						'Blogs',
						'Career',
						'Tools',
					],
				},
				{
					key: 'rockwoolindo',
					label: 'Rockwoolindo',
					icon: 'rockwoolindo',
					sub: [
						'Inquiry',
						'Produk',
						'Konten',
					],
				},
				{
					key: 'karir',
					label: 'Karir / HRGA',
					icon: 'karir',
					sub: [
						'Lowongan',
						'Pelamar',
						'Karyawan',
					],
				},
				{
					key: 'admin',
					label: 'Admin',
					icon: 'admin',
					sub: [
						'Accounts',
						'Access Manager',
					],
				},
				{
					key: 'profil',
					label: 'Profil',
					icon: 'profil',
				},
			];

			/* role visibility rules (switchable) */
			const ROLES = {
				superadmin: '*',
				retail: [
					'home',
					'retail',
					'inventory',
					'profil',
				],
				project: [
					'home',
					'project',
					'inventory',
					'profil',
				],
				kolektor: [
					'home',
					'kolektor',
					'profil',
				],
				marketing: [
					'home',
					'website',
					'rockwoolindo',
					'profil',
				],
				hrga: [
					'home',
					'karir',
					'profil',
				],
				warehouse: [
					'home',
					'inventory',
					'profil',
				],
			};
			let CURRENT_ROLE = window.DKI
				? DKI.role()
				: 'superadmin';

			/* module pages that exist as real dashboards */
			const NAV_DEST = {
				home: 'dashboard.html',
				inventory: 'Stok Barang.html',
				retail: 'retail.html',
				project: 'project.html',
				kolektor: 'kolektor.html',
				website: 'Messages.html',
				rockwoolindo:
					'Rockwoolindo Inquiry.html',
				karir: 'Lowongan.html',
				admin: 'Accounts.html',
				profil: 'Profil.html',
			};
			/* sub-items that have their own pages (key|label -> file) */
			const SUB_DEST = {
				'inventory|Stok Barang':
					'Stok Barang.html',
				'inventory|Lokasi':
					'Lokasi.html',
				'inventory|History':
					'Stock History.html',
				'retail|Dashboard':
					'retail.html',
				'retail|Toko': 'Stores.html',
				'retail|Order': 'Orders.html',
				'retail|Kunjungan':
					'Visit Report.html',
				'retail|Tracking':
					'Tracking.html',
				'project|Dashboard':
					'project.html',
				'project|Projects':
					'Projects.html',
				'project|Companies':
					'Companies.html',
				'project|Quotations':
					'Quotations.html',
				'project|PO': 'PO.html',
				'project|Kunjungan':
					'Visit Report Project.html',
				'project|Tracking':
					'Tracking Project.html',
				'kolektor|Dashboard':
					'kolektor.html',
				'kolektor|AR': 'AR.html',
				'kolektor|Kunjungan':
					'Visit Report Kolektor.html',
				'kolektor|Schedule':
					'Schedule.html',
				'kolektor|Tracking':
					'Tracking Kolektor.html',
				'website|Messages':
					'Messages.html',
				'website|News': 'News.html',
				'website|Portfolio':
					'Portfolio.html',
				'website|Web Products':
					'Web Products.html',
				'website|Product Categories':
					'Product Categories.html',
				'website|Blogs': 'Blogs.html',
				'website|Career': 'Career.html',
				'website|Tools': 'Tools.html',
				'rockwoolindo|Inquiry':
					'Rockwoolindo Inquiry.html',
				'rockwoolindo|Produk':
					'Rockwoolindo Produk.html',
				'rockwoolindo|Konten':
					'Rockwoolindo Konten.html',
				'karir|Lowongan':
					'Lowongan.html',
				'karir|Pelamar': 'Pelamar.html',
				'karir|Karyawan':
					'Karyawan.html',
				'admin|Accounts':
					'Accounts.html',
				'admin|Access Manager':
					'Access Manager.html',
			};

			function renderNav() {
				const nav =
					document.getElementById(
						'nav',
					);
				const allowed =
					ROLES[CURRENT_ROLE];
				nav.innerHTML = '';
				NAV.forEach((item) => {
					if (
						allowed !== '*' &&
						!allowed.includes(item.key)
					)
						return;
					const group =
						document.createElement(
							'div',
						);
					group.className = 'nav-group';

					const el =
						document.createElement(
							'div',
						);
					el.className =
						'nav-item' +
						(item.active
							? ' active'
							: '');
					el.dataset.key = item.key;
					el.innerHTML =
						icon(item.icon) +
						'<span class="label">' +
						item.label +
						'</span>' +
						(item.sub ? chevSVG : '') +
						'<span class="tooltip">' +
						item.label +
						'</span>';
					group.appendChild(el);

					// move the active highlight to whichever icon is clicked (works collapsed too)
					el.addEventListener(
						'click',
						() => {
							nav
								.querySelectorAll(
									'.nav-item.active',
								)
								.forEach((x) =>
									x.classList.remove(
										'active',
									),
								);
							el.classList.add(
								'active',
							);
							// when collapsed, clicking a module icon jumps straight to its dashboard, staying minimized
							const dest =
								NAV_DEST[item.key];
							if (
								dest &&
								(!item.sub ||
									document.body.classList.contains(
										'collapsed',
									))
							)
								location.href = dest;
						},
					);

					if (item.sub) {
						const sm =
							document.createElement(
								'div',
							);
						sm.className = 'submenu';
						sm.innerHTML =
							'<div class="submenu-head">' +
							item.label +
							'</div>' +
							item.sub
								.map(
									(s, i) =>
										'<a' +
										(item.selected === i
											? ' class="selected"'
											: '') +
										'>' +
										s +
										'</a>',
								)
								.join('');
						// clicking a submenu item moves the selection
						sm.addEventListener(
							'click',
							(e) => {
								const a =
									e.target.closest('a');
								if (!a) return;
								sm.querySelectorAll(
									'a',
								).forEach((x) =>
									x.classList.remove(
										'selected',
									),
								);
								a.classList.add(
									'selected',
								);
								const dest =
									SUB_DEST[
										item.key +
											'|' +
											a.textContent.trim()
									];
								if (dest)
									location.href = dest;
							},
						);
						group.appendChild(sm);
						let open = false;
						el.addEventListener(
							'click',
							() => {
								if (
									document.body.classList.contains(
										'collapsed',
									)
								)
									return; // collapsed: flyout handles reveal
								open = !open;
								const chev =
									el.querySelector(
										'.chev',
									);
								gsap.to(chev, {
									rotation: open
										? 180
										: 0,
									duration: 0.25,
									ease: 'power2.out',
									transformOrigin:
										'50% 50%',
								});
								if (open) {
									gsap.set(sm, {
										height: 'auto',
									});
									const h =
										sm.offsetHeight;
									gsap.fromTo(
										sm,
										{
											height: 0,
											opacity: 0,
										},
										{
											height: h,
											opacity: 1,
											duration: 0.25,
											ease: 'power2.out',
											onComplete: () =>
												gsap.set(sm, {
													height:
														'auto',
												}),
										},
									);
								} else {
									gsap.to(sm, {
										height: 0,
										opacity: 0,
										duration: 0.25,
										ease: 'power2.in',
									});
								}
							},
						);
					}
					nav.appendChild(group);
				});
			}
			renderNav();

			/* ====================== COLLAPSE TOGGLE (persisted) ====================== */
			const toggle =
				document.getElementById(
					'collapseToggle',
				);
			function syncToggle() {
				toggle.textContent =
					document.body.classList.contains(
						'collapsed',
					)
						? '\u00BB'
						: '\u00AB';
			}
			// restore the user's last choice so it survives page navigation
			if (
				localStorage.getItem(
					'sidebarCollapsed',
				) === '1'
			)
				document.body.classList.add(
					'collapsed',
				);
			syncToggle();
			toggle.addEventListener(
				'click',
				() => {
					const collapsed =
						document.body.classList.toggle(
							'collapsed',
						);
					localStorage.setItem(
						'sidebarCollapsed',
						collapsed ? '1' : '0',
					);
					syncToggle();
					// clear any inline height/opacity gsap left on submenus + reset chevrons,
					// so collapsed flyouts (and re-expanded panels) aren't stuck
					document
						.querySelectorAll(
							'.submenu',
						)
						.forEach((sm) => {
							if (window.gsap)
								gsap.set(sm, {
									clearProps: 'all',
								});
						});
					document
						.querySelectorAll(
							'.nav-item .chev',
						)
						.forEach((c) => {
							if (window.gsap)
								gsap.set(c, {
									clearProps: 'all',
								});
						});
				},
			);

			/* Home nav -> dashboard */
			const homeNav =
				document.querySelector(
					'.nav-item[data-key="home"]',
				);
			if (homeNav)
				homeNav.addEventListener(
					'click',
					() => {
						location.href =
							'dashboard.html';
					},
				);

			/* ====================== RETAIL RENDER ====================== */
			const $ = (id) =>
				document.getElementById(id);

			function bars(el, rows) {
				el.innerHTML = rows
					.map(
						(r) =>
							'<div class="pbar-row"><span class="pbar-label">' +
							r.label +
							'</span>' +
							'<div class="pbar-track"><div class="pbar-fill ' +
							r.cls +
							'" data-w="' +
							r.w +
							'"></div></div>' +
							'<span class="pbar-val">' +
							r.val +
							'</span></div>',
					)
					.join('');
			}
			bars($('salesOverall'), [
				{
					label: 'To be Collected',
					cls: 'grad',
					w: 70,
					val: 'Rp 4,000,000,000',
				},
				{
					label: 'Collected',
					cls: 'red',
					w: 30,
					val: 'Rp 1,200,000,000',
				},
			]);
			bars($('visitsOverall'), [
				{
					label: 'Target',
					cls: 'grad',
					w: 60,
					val: '1200',
				},
				{
					label: 'Actual',
					cls: 'red',
					w: 45,
					val: '560',
				},
			]);

			function renderBlocks(
				elId,
				withAvg,
			) {
				$(elId).innerHTML = [
					1, 2, 3, 4, 5,
				]
					.map(
						(n) =>
							'<div class="sp-block" data-sp="' +
							n +
							'">' +
							'<div class="sp-block-head"><span class="sp-block-title">Collector ' +
							n +
							'</span>' +
							(withAvg
								? '<span class="sp-block-avg">Avg 8 / Hari</span>'
								: '') +
							'</div>' +
							'<div class="pbar-row"><span class="pbar-label">Target</span><div class="pbar-track"><div class="pbar-fill grad" data-w="' +
							(60 + n * 4) +
							'"></div></div><span class="pbar-val">Rp 400,000,000</span></div>' +
							'<div class="pbar-row"><span class="pbar-label">Actual</span><div class="pbar-track"><div class="pbar-fill red" data-w="' +
							(12 + n * 4) +
							'"></div></div><span class="pbar-val">Rp 80,000,000</span></div>' +
							'</div>',
					)
					.join('');
			}
			renderBlocks(
				'visitsBlocks',
				true,
			);

			function spBlockHeight(el) {
				gsap.set(el, {
					height: 'auto',
					paddingTop: 14,
					paddingBottom: 14,
					opacity: 1,
				});
				return el.offsetHeight;
			}
			function toggleBlock(el, show) {
				gsap.killTweensOf(el);
				if (show) {
					el.style.display = '';
					const h = spBlockHeight(el);
					gsap.fromTo(
						el,
						{
							height: 0,
							paddingTop: 0,
							paddingBottom: 0,
							opacity: 0,
						},
						{
							height: h,
							paddingTop: 14,
							paddingBottom: 14,
							opacity: 1,
							duration: 0.4,
							ease: 'power2.out',
							onComplete: () =>
								gsap.set(el, {
									height: 'auto',
								}),
						},
					);
				} else {
					gsap.to(el, {
						height: 0,
						paddingTop: 0,
						paddingBottom: 0,
						opacity: 0,
						duration: 0.4,
						ease: 'power2.in',
						onComplete: () => {
							el.style.display = 'none';
						},
					});
				}
			}
			function renderPills(
				pillsId,
				blocksId,
			) {
				const c = $(pillsId);
				c.innerHTML = [1, 2, 3, 4, 5]
					.map(
						(n) =>
							'<button class="sp-pill active" data-sp="' +
							n +
							'"><span class="dot"></span>Collector ' +
							n +
							'</button>',
					)
					.join('');
				c.addEventListener(
					'click',
					(e) => {
						const b =
							e.target.closest(
								'.sp-pill',
							);
						if (!b) return;
						b.classList.toggle(
							'active',
						);
						const blocksEl =
							blocksId && $(blocksId);
						if (!blocksEl) return; // no blocks to toggle (e.g. visits2) — just flip the button
						const blk =
							blocksEl.querySelector(
								'.sp-block[data-sp="' +
									b.dataset.sp +
									'"]',
							);
						toggleBlock(
							blk,
							b.classList.contains(
								'active',
							),
						);
					},
				);
			}
			renderPills(
				'visitsPills',
				'visitsBlocks',
			);

			/* visits2 card: a conversion funnel (Visits → Reminded → Sales → Projects).
   Base = full team; the Sales 1-5 buttons scale every stage by the included reps. */
			const V2_WEIGHTS = {
				1: 0.24,
				2: 0.22,
				3: 0.2,
				4: 0.18,
				5: 0.16,
			}; // each rep's share of the team total
			const v2Active = new Set([
				1, 2, 3, 4, 5,
			]);
			let visits2Mode = 'monthly';
			function v2Factor() {
				let f = 0;
				v2Active.forEach(
					(n) => (f += V2_WEIGHTS[n]),
				);
				return f;
			}
			const V2_STAGES = {
				monthly: [
					{ k: 'Outstanding', v: 320 },
					{ k: 'Reminded', v: 210 },
					{ k: 'Promised', v: 96 },
					{
						k: 'Collected',
						v: 1200,
						money: true,
						tgt: 1500,
					},
				],
				weekly: [
					{ k: 'Outstanding', v: 84 },
					{ k: 'Reminded', v: 55 },
					{ k: 'Promised', v: 25 },
					{
						k: 'Collected',
						v: 310,
						money: true,
						tgt: 400,
					},
				],
			};
			const FN_COLORS = [
				'#61BEDF',
				'#1CA7EC',
				'#1590CD',
				'#121567',
			];
			function fmtRp(jt) {
				// jt = value in Rp millions (juta)
				if (jt >= 1000)
					return (
						'Rp ' +
						(jt / 1000).toFixed(2) +
						' B'
					);
				return (
					'Rp ' +
					(
						Math.round(jt * 10) / 10
					).toLocaleString('en-US') +
					' jt'
				);
			}
			function renderVisits2(animate) {
				const f = v2Factor();
				const stages =
					V2_STAGES[visits2Mode];
				const baseMax = stages[0].v; // count widths relative to full-team Visits, so filtering shrinks the funnel
				let html =
					'<div class="funnel">';
				stages.forEach((s, i) => {
					const w = s.money
						? Math.round(f * 100)
						: Math.round(
								((s.v * f) / baseMax) *
									100,
							);
					const val = s.money
						? fmtRp(s.v * f)
						: Math.round(
								s.v * f,
							).toLocaleString('en-US');
					const bg = s.money
						? 'var(--grad)'
						: FN_COLORS[i];
					let valHtml =
						'<span class="fn-val">' +
						val +
						'</span>';
					if (s.money) {
						const pctT = Math.round(
							(s.v / s.tgt) * 100,
						); // attainment vs the team's value target
						const col =
							pctT >= 100
								? '#27AE60'
								: pctT >= 70
									? 'var(--blue)'
									: '#FE2C23';
						valHtml =
							'<span class="fn-val fn-val-money">' +
							val +
							'<small class="fn-attain" style="color:' +
							col +
							'">' +
							pctT +
							'% to target</small></span>';
					}
					html +=
						'<div class="fn-stage"><span class="fn-label">' +
						s.k +
						'</span>' +
						'<div class="fn-track"><div class="fn-fill" data-w="' +
						w +
						'" style="background:' +
						bg +
						'"></div></div>' +
						valHtml +
						'</div>';
					if (i < stages.length - 1) {
						const nx = stages[i + 1];
						let pct,
							cap,
							ratioHtml = '';
						if (nx.money) {
							pct = fmtRp(nx.v / s.v);
							cap =
								s.k +
								' \u2192 ' +
								nx.k +
								' (avg / ' +
								s.k
									.toLowerCase()
									.replace(/s$/, '') +
								')';
						} else {
							pct =
								Math.round(
									(nx.v / s.v) * 100,
								) + '%';
							cap =
								s.k + ' \u2192 ' + nx.k;
							const r = s.v / nx.v; // closing ratio, e.g. 3.0 : 1
							ratioHtml =
								'<span class="fn-ratio">' +
								(r >= 10
									? Math.round(r)
									: r.toFixed(1)) +
								' : 1</span>';
						}
						html +=
							'<div class="fn-conv"><span class="fn-pct">' +
							pct +
							'</span>' +
							ratioHtml +
							'<span class="fn-cap">' +
							cap +
							'</span></div>';
					}
				});
				html += '</div>';
				$('visits2Funnel').innerHTML =
					html;
				$('visits2Funnel')
					.querySelectorAll('.fn-fill')
					.forEach((p) => {
						if (animate !== false)
							gsap.fromTo(
								p,
								{ width: 0 },
								{
									width:
										p.dataset.w + '%',
									duration: 0.6,
									ease: 'power2.out',
								},
							);
						else
							p.style.width =
								p.dataset.w + '%';
					});
				lineChart4(
					'visits2Line',
					visits2Mode,
					f,
				);
			}
			function renderVisits2Pills() {
				const c = $('visits2Pills');
				c.innerHTML = [1, 2, 3, 4, 5]
					.map(
						(n) =>
							'<button class="sp-pill active" data-sp="' +
							n +
							'"><span class="dot"></span>Collector ' +
							n +
							'</button>',
					)
					.join('');
				c.addEventListener(
					'click',
					(e) => {
						const b =
							e.target.closest(
								'.sp-pill',
							);
						if (!b) return;
						const n = +b.dataset.sp;
						b.classList.toggle(
							'active',
						);
						if (
							b.classList.contains(
								'active',
							)
						)
							v2Active.add(n);
						else v2Active.delete(n);
						renderVisits2(true);
					},
				);
			}
			renderVisits2Pills();

			/* donut — generic renderer with optional center label */
			function donut(
				elId,
				segs,
				center,
			) {
				let cum = 0;
				const circles = segs
					.map((s) => {
						const off = 100 - cum + 25;
						cum += s.p;
						return (
							'<circle cx="21" cy="21" r="15.915" fill="none" stroke="' +
							s.c +
							'" stroke-width="5" stroke-dasharray="' +
							s.p +
							' ' +
							(100 - s.p) +
							'" stroke-dashoffset="' +
							off +
							'"></circle>'
						);
					})
					.join('');
				let centerEls = '';
				if (center) {
					centerEls =
						'<text x="21" y="20" text-anchor="middle" font-size="3.2" font-weight="700" fill="#121567">' +
						center.value +
						'</text>' +
						'<text x="21" y="24.4" text-anchor="middle" font-size="2.3" font-weight="600" fill="#9A9A9A">' +
						center.label +
						'</text>';
				}
				const svg =
					'<svg viewBox="0 0 42 42">' +
					circles +
					centerEls +
					'</svg>';
				const legend =
					'<div class="donut-legend">' +
					segs
						.map(
							(s) =>
								'<div class="lg"><i style="background:' +
								s.c +
								'"></i>' +
								s.l +
								(s.amt
									? '<span class="amt">' +
										s.amt +
										'</span>'
									: '') +
								'<span class="pct">' +
								s.p +
								'%</span></div>',
						)
						.join('') +
					'</div>';
				$(elId).innerHTML =
					svg + legend;
			}

			/* sales contribution donut — each sales rep's share of the overall actual */
			const SALES_COLORS = [
				'#121567',
				'#1590CD',
				'#1CA7EC',
				'#61BEDF',
				'#A9DCF0',
			];
			const SALES_CONTRIB = {
				monthly: {
					total: 'Rp 1.2 M',
					label: 'Total Collected',
					segs: [
						{
							l: 'Collector 1',
							p: 28,
							amt: 'Rp 336.0 jt',
						},
						{
							l: 'Collector 2',
							p: 24,
							amt: 'Rp 288.0 jt',
						},
						{
							l: 'Collector 3',
							p: 20,
							amt: 'Rp 240.0 jt',
						},
						{
							l: 'Collector 4',
							p: 16,
							amt: 'Rp 192.0 jt',
						},
						{
							l: 'Collector 5',
							p: 12,
							amt: 'Rp 144.0 jt',
						},
					],
				},
				weekly: {
					total: 'Rp 320 jt',
					label: 'Total Collected',
					segs: [
						{
							l: 'Collector 1',
							p: 30,
							amt: 'Rp 96.0 jt',
						},
						{
							l: 'Collector 2',
							p: 23,
							amt: 'Rp 73.6 jt',
						},
						{
							l: 'Collector 3',
							p: 21,
							amt: 'Rp 67.2 jt',
						},
						{
							l: 'Collector 4',
							p: 15,
							amt: 'Rp 48.0 jt',
						},
						{
							l: 'Collector 5',
							p: 11,
							amt: 'Rp 35.2 jt',
						},
					],
				},
			};
			/* sales filter pills now drive the contribution donut (no individual bars anymore) */
			let salesMode = 'monthly';
			const salesActive = new Set([
				1, 2, 3, 4, 5,
			]);
			function renderSalesPills() {
				const c = $('salesPills');
				c.innerHTML = [1, 2, 3, 4, 5]
					.map(
						(n) =>
							'<button class="sp-pill active" data-sp="' +
							n +
							'"><span class="dot"></span>Collector ' +
							n +
							'</button>',
					)
					.join('');
				c.addEventListener(
					'click',
					(e) => {
						const b =
							e.target.closest(
								'.sp-pill',
							);
						if (!b) return;
						const n = +b.dataset.sp;
						b.classList.toggle(
							'active',
						);
						if (
							b.classList.contains(
								'active',
							)
						)
							salesActive.add(n);
						else salesActive.delete(n);
						renderSalesDonut(salesMode);
					},
				);
			}
			function renderSalesDonut(mode) {
				salesMode = mode || salesMode;
				const d =
					SALES_CONTRIB[salesMode];
				const active = d.segs
					.map((s, i) => ({
						...s,
						c: SALES_COLORS[i],
						idx: i + 1,
					}))
					.filter((s) =>
						salesActive.has(s.idx),
					);
				const sum =
					active.reduce(
						(a, s) => a + s.p,
						0,
					) || 1; // rescale so active reps fill the ring
				const scaled = active.map(
					(s) => ({
						...s,
						p: Math.round(
							(s.p / sum) * 100,
						),
					}),
				);
				donut('salesDonut', scaled, {
					value: d.total,
					label: d.label,
				});
				$(
					'salesDonut',
				).insertAdjacentHTML(
					'afterbegin',
					'<div class="donut-title">Collector Contribution<small>Share of total collected</small></div>',
				);
			}
			renderSalesPills();
			renderSalesDonut('monthly');

			/* ====================== RECEIVABLE CARDS (Overdue / Due in 2 Weeks) ====================== */
			const RC_COLLECTORS = [
				'Andi',
				'Budi',
				'Citra',
				'Dewi',
				'Eka',
			];
			function rcRupiah(n) {
				return (
					'Rp ' +
					n.toLocaleString('en-US')
				);
			}
			const RC_OVERDUE = [
				{
					id: 'PO250061',
					src: 'Project',
					client: 'PT Waskita Karya',
					subject:
						'Apartemen Green Park Tower',
					value: 182500000,
					days: 38,
					sales: 'Sales 2',
					assignee: {
						name: 'Andi',
						role: 'Collector',
					},
				},
				{
					id: 'DKI250048',
					src: 'Retail',
					client: 'TB. Makmur Jaya',
					subject: 'Retail Order',
					value: 46750000,
					days: 31,
					sales: 'Sales 1',
					assignee: {
						name: 'Citra',
						role: 'Collector',
					},
				},
				{
					id: 'PO250057',
					src: 'Project',
					client: 'PT Hutama Karya',
					subject:
						'Cold Storage Marunda',
					value: 264000000,
					days: 27,
					sales: 'Sales 4',
					assignee: null,
				},
				{
					id: 'PO250053',
					src: 'Project',
					client: 'PT Adhi Karya',
					subject:
						'Data Center Lippo Village',
					value: 128900000,
					days: 22,
					sales: 'Sales 3',
					assignee: {
						name: 'Budi',
						role: 'Collector',
					},
				},
				{
					id: 'DKI250041',
					src: 'Retail',
					client: 'TB. Sinar Abadi',
					subject: 'Retail Order',
					value: 33200000,
					days: 19,
					sales: 'Sales 5',
					assignee: null,
				},
				{
					id: 'PO250049',
					src: 'Project',
					client: 'PT Nindya Karya',
					subject:
						'Pabrik Otomotif Cibitung',
					value: 97400000,
					days: 15,
					sales: 'Sales 2',
					assignee: {
						name: 'Dewi',
						role: 'Collector',
					},
				},
				{
					id: 'DKI250036',
					src: 'Retail',
					client: 'TB. Berkah Mandiri',
					subject: 'Retail Order',
					value: 51800000,
					days: 12,
					sales: 'Sales 1',
					assignee: null,
				},
				{
					id: 'PO250044',
					src: 'Project',
					client:
						'PT Total Bangun Persada',
					subject:
						'Hotel Grand Serpong',
					value: 143600000,
					days: 8,
					sales: 'Sales 4',
					assignee: {
						name: 'Eka',
						role: 'Collector',
					},
				},
			];
			const RC_DUE2W = [
				{
					id: 'PO250072',
					src: 'Project',
					client: 'PT Wijaya Karya',
					subject:
						'Gedung Kantor BSD City',
					value: 158200000,
					days: 3,
					sales: 'Sales 3',
					assignee: {
						name: 'Andi',
						role: 'Collector',
					},
				},
				{
					id: 'DKI250055',
					src: 'Retail',
					client: 'TB. Cahaya Baru',
					subject: 'Retail Order',
					value: 38900000,
					days: 5,
					sales: 'Sales 2',
					assignee: null,
				},
				{
					id: 'PO250069',
					src: 'Project',
					client:
						'PT Pembangunan Perumahan',
					subject:
						'RS Medika Tangerang',
					value: 212400000,
					days: 7,
					sales: 'Sales 5',
					assignee: {
						name: 'Budi',
						role: 'Collector',
					},
				},
				{
					id: 'DKI250052',
					src: 'Retail',
					client: 'TB. Sumber Rezeki',
					subject: 'Retail Order',
					value: 29500000,
					days: 9,
					sales: 'Sales 1',
					assignee: null,
				},
				{
					id: 'PO250066',
					src: 'Project',
					client: 'PT Acset Indonusa',
					subject:
						'Mall Cibubur Junction',
					value: 176800000,
					days: 11,
					sales: 'Sales 4',
					assignee: {
						name: 'Citra',
						role: 'Collector',
					},
				},
				{
					id: 'DKI250047',
					src: 'Retail',
					client: 'TB. Harapan Kita',
					subject: 'Retail Order',
					value: 42100000,
					days: 12,
					sales: 'Sales 3',
					assignee: null,
				},
				{
					id: 'PO250063',
					src: 'Project',
					client: 'PT Waskita Karya',
					subject: 'Sekolah Citra Raya',
					value: 131700000,
					days: 14,
					sales: 'Sales 2',
					assignee: {
						name: 'Dewi',
						role: 'Collector',
					},
				},
			];
			const RC_CONFIG = {
				overdue: {
					items: RC_OVERDUE,
					tone: 'red',
					total: 'Total Overdue',
					summaryId: 'overdueSummary',
					listId: 'overdueList',
					daysHead: 'Overdue',
				},
				due2w: {
					items: RC_DUE2W,
					tone: 'amber',
					total: 'Total Due Soon',
					summaryId: 'due2wSummary',
					listId: 'due2wList',
					daysHead: 'Due In',
				},
			};
			function rcRender(key) {
				const o = RC_CONFIG[key],
					items = o.items,
					tone = o.tone;
				const total = items.reduce(
					(s, r) => s + r.value,
					0,
				);
				const assigned = items.filter(
					(r) => r.assignee,
				).length;
				const unassigned =
					items.length - assigned;
				$(o.summaryId).innerHTML =
					'<div class="rc-total"><span class="rc-total-lbl">' +
					o.total +
					'</span>' +
					'<span class="rc-total-amt ' +
					tone +
					'">' +
					rcRupiah(total) +
					'</span></div>' +
					'<div class="rc-counts">' +
					'<div class="rc-count assigned"><span class="rc-cnum">' +
					assigned +
					'</span><span class="rc-clbl">Staff Assigned</span></div>' +
					'<div class="rc-count unassigned' +
					(tone === 'amber'
						? ' amber'
						: '') +
					'"><span class="rc-cnum">' +
					unassigned +
					'</span><span class="rc-clbl">Not Assigned</span></div>' +
					'</div>';
				const head =
					'<div class="rc-row-head"><span>Invoice</span><span>Client</span><span>' +
					o.daysHead +
					'</span><span>Value</span><span>Collector</span></div>';
				const rows = items
					.map((r) => {
						const a = r.assignee;
						const staff = a
							? '<span class="rc-staff"><span class="rc-avatar role-' +
								a.role.toLowerCase() +
								'">' +
								a.name.charAt(0) +
								'</span><span class="rc-staff-meta"><b>' +
								a.name +
								'</b><small>' +
								(a.role === 'Manager'
									? 'Sales Manager'
									: a.role) +
								'</small></span></span>'
							: '<button class="rc-assign">+ Assign</button>';
						return (
							'<div class="rc-row" data-key="' +
							key +
							'" data-id="' +
							r.id +
							'">' +
							'<span class="rc-id">' +
							r.id +
							'</span>' +
							'<span class="rc-client"><b>' +
							r.client +
							'</b><small><span class="rc-src ' +
							r.src.toLowerCase() +
							'">' +
							r.src +
							'</span>' +
							r.subject +
							'</small></span>' +
							'<span class="rc-days ' +
							tone +
							'">' +
							r.days +
							' days</span>' +
							'<span class="rc-val">' +
							rcRupiah(r.value) +
							'</span>' +
							staff +
							'</div>'
						);
					})
					.join('');
				$(o.listId).innerHTML =
					head + rows;
			}
			Object.keys(RC_CONFIG).forEach(
				rcRender,
			);

			/* collector picker dropdown for unassigned rows (body-level popover, not clipped by card overflow) */
			const rcMenu =
				document.createElement('div');
			rcMenu.className = 'rc-menu';
			document.body.appendChild(rcMenu);
			let rcTarget = null;
			function openRcMenu(
				btn,
				key,
				id,
			) {
				rcTarget = { key: key, id: id };
				rcMenu.innerHTML =
					'<div class="rc-menu-title">Assign collector</div>' +
					RC_COLLECTORS.map(
						function (c) {
							return (
								'<button class="rc-opt" data-role="Collector" data-c="' +
								c +
								'"><span class="rc-avatar">' +
								c.charAt(0) +
								'</span>' +
								c +
								'</button>'
							);
						},
					).join('') +
					'<div class="rc-menu-sep"></div><div class="rc-menu-title">Or assign to</div>' +
					'<button class="rc-opt" data-role="Sales"><span class="rc-avatar role-sales">S</span>Sales <small>order owner</small></button>' +
					'<button class="rc-opt" data-role="Manager"><span class="rc-avatar role-manager">M</span>Sales Manager</button>';
				rcMenu.classList.add('open');
				const r =
					btn.getBoundingClientRect();
				const mh = rcMenu.offsetHeight,
					mw = rcMenu.offsetWidth;
				let top = r.bottom + 6,
					left = r.left;
				if (
					top + mh >
					window.innerHeight - 8
				)
					top = r.top - 6 - mh;
				if (
					left + mw >
					window.innerWidth - 8
				)
					left =
						window.innerWidth - 8 - mw;
				rcMenu.style.top = top + 'px';
				rcMenu.style.left = left + 'px';
			}
			function closeRcMenu() {
				rcMenu.classList.remove('open');
				rcTarget = null;
			}
			document
				.querySelectorAll('.rc-list')
				.forEach(function (l) {
					l.addEventListener(
						'click',
						function (e) {
							const b =
								e.target.closest(
									'.rc-assign',
								);
							if (!b) return;
							e.stopPropagation();
							const row =
								b.closest('.rc-row');
							openRcMenu(
								b,
								row.dataset.key,
								row.dataset.id,
							);
						},
					);
				});
			rcMenu.addEventListener(
				'click',
				function (e) {
					const o =
						e.target.closest('.rc-opt');
					if (!o || !rcTarget) return;
					const key = rcTarget.key;
					const it = RC_CONFIG[
						key
					].items.find(function (x) {
						return x.id === rcTarget.id;
					});
					const role = o.dataset.role;
					if (role === 'Collector')
						it.assignee = {
							name: o.dataset.c,
							role: 'Collector',
						};
					else if (role === 'Sales')
						it.assignee = {
							name: it.sales,
							role: 'Sales',
						};
					else
						it.assignee = {
							name: 'Hendra',
							role: 'Manager',
						};
					closeRcMenu();
					rcRender(key);
				},
			);
			document.addEventListener(
				'click',
				function (e) {
					if (
						rcMenu.classList.contains(
							'open',
						) &&
						!rcMenu.contains(e.target)
					)
						closeRcMenu();
				},
			);
			window.addEventListener(
				'scroll',
				closeRcMenu,
				true,
			);
			window.addEventListener(
				'resize',
				closeRcMenu,
			);

			/* two stacked panels: Visits (top) and Sales (bottom), shared time axis.
   `factor` (0..1) scales the plotted target/actual to only the selected salespeople. */
			function lineChart(
				elId,
				mode,
				factor,
			) {
				factor =
					factor == null ? 1 : factor;
				const sets = {
					monthly: {
						xl: [
							'Jul',
							'Aug',
							'Sep',
							'Oct',
							'Nov',
							'Dec',
							'Jan',
							'Feb',
							'Mar',
						],
						maxV: 160,
						maxS: 480, // visits count | sales (Rp jt)
						vt: [
							100, 100, 110, 110, 120,
							120, 130, 130, 140,
						], // visit target
						va: [
							60, 72, 68, 95, 88, 118,
							110, 128, 135,
						], // visit actual
						st: [
							300, 300, 330, 330, 360,
							360, 390, 390, 420,
						], // sales target (Rp jt)
						sa: [
							180, 210, 200, 280, 260,
							350, 330, 380, 400,
						], // sales actual (Rp jt)
					},
					weekly: {
						xl: [
							'Mon',
							'Tue',
							'Wed',
							'Thu',
							'Fri',
							'Sat',
							'Sun',
						],
						maxV: 32,
						maxS: 96,
						vt: [
							25, 25, 25, 25, 25, 25,
							25,
						],
						va: [
							15, 18, 17, 24, 21, 27,
							29,
						],
						st: [
							70, 70, 70, 70, 70, 70,
							70,
						],
						sa: [
							42, 50, 48, 67, 60, 73,
							78,
						],
					},
				};
				const cfg =
					sets[mode || 'monthly'];
				const n = cfg.xl.length;
				const W = 600,
					padL = 34,
					padR = 14;
				const x = (i) =>
					padL +
					i *
						((W - padL - padR) /
							(n - 1));

				function panel(opt) {
					const H = 120,
						padT = 16,
						padB = opt.showX ? 26 : 10;
					const y = (v) =>
						padT +
						(1 - v / opt.max) *
							(H - padT - padB);
					let grid = '';
					[0, 0.5, 1].forEach((f) => {
						const yy =
							padT +
							(1 - f) *
								(H - padT - padB);
						grid +=
							'<line x1="' +
							padL +
							'" y1="' +
							yy +
							'" x2="' +
							(W - padR) +
							'" y2="' +
							yy +
							'" stroke="#EEF2F7" stroke-width="1"></line>';
						grid +=
							'<text x="' +
							(padL - 6) +
							'" y="' +
							(yy + 3) +
							'" font-size="8" fill="#9A9A9A" text-anchor="end">' +
							Math.round(opt.max * f) +
							'</text>';
					});
					const tPts = opt.target
						.map(
							(v, i) =>
								x(i) + ',' + y(v),
						)
						.join(' ');
					const aPts = opt.actual
						.map(
							(v, i) =>
								x(i) + ',' + y(v),
						)
						.join(' ');
					const tLine =
						'<polyline points="' +
						tPts +
						'" fill="none" stroke="' +
						opt.ct +
						'" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round"></polyline>';
					const aLine =
						'<polyline points="' +
						aPts +
						'" fill="none" stroke="' +
						opt.ca +
						'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline>';
					const dots = opt.actual
						.map(
							(v, i) =>
								'<circle cx="' +
								x(i) +
								'" cy="' +
								y(v) +
								'" r="2.4" fill="' +
								opt.ca +
								'"></circle>',
						)
						.join('');
					let xlabels = '';
					if (opt.showX)
						cfg.xl.forEach((t, i) => {
							xlabels +=
								'<text x="' +
								x(i) +
								'" y="' +
								(H - 8) +
								'" font-size="8" fill="#9A9A9A" text-anchor="middle">' +
								t +
								'</text>';
						});
					const head =
						'<div class="lc-head"><span class="lc-name">' +
						opt.title +
						'</span>' +
						'<span class="lc-legend2"><span class="lg"><i class="ln" style="background:' +
						opt.ca +
						'"></i>Actual</span>' +
						'<span class="lg"><i class="ln dash" style="color:' +
						opt.ct +
						'"></i>Target</span></span></div>';
					return (
						'<div class="lc-panel">' +
						head +
						'<svg viewBox="0 0 ' +
						W +
						' ' +
						H +
						'">' +
						grid +
						tLine +
						aLine +
						dots +
						xlabels +
						'</svg></div>'
					);
				}

				$(elId).innerHTML =
					panel({
						title: 'Visits',
						max: cfg.maxV,
						target: cfg.vt.map(
							(v) => v * factor,
						),
						actual: cfg.va.map(
							(v) => v * factor,
						),
						ca: '#1CA7EC',
						ct: '#61BEDF',
						showX: false,
					}) +
					panel({
						title: 'Collected (Rp jt)',
						max: cfg.maxS,
						target: cfg.st.map(
							(v) => v * factor,
						),
						actual: cfg.sa.map(
							(v) => v * factor,
						),
						ca: '#121567',
						ct: '#8E8FD8',
						showX: true,
					});
			}

			/* visits2 trend: one panel per funnel stage (Visits, Reminded, Sales, Total Value),
   scaled by the same Sales-filter factor as the funnel above it */
			function lineChart4(
				elId,
				mode,
				factor,
			) {
				factor =
					factor == null ? 1 : factor;
				const sets = {
					monthly: {
						xl: [
							'Jul',
							'Aug',
							'Sep',
							'Oct',
							'Nov',
							'Dec',
							'Jan',
							'Feb',
							'Mar',
						],
						metrics: [
							{
								title: 'Outstanding',
								max: 160,
								ca: '#1CA7EC',
								ct: '#61BEDF',
								t: [
									100, 100, 110, 110,
									120, 120, 130, 130,
									140,
								],
								a: [
									60, 72, 68, 95, 88,
									118, 110, 128, 135,
								],
							},
							{
								title: 'Reminded',
								max: 54,
								ca: '#1590CD',
								ct: '#6FB6DE',
								t: [
									30, 30, 33, 33, 36,
									36, 39, 39, 42,
								],
								a: [
									18, 22, 20, 29, 26,
									35, 33, 38, 40,
								],
							},
							{
								title: 'Promised',
								max: 18,
								ca: '#121567',
								ct: '#8E8FD8',
								t: [
									10, 10, 11, 11, 12,
									12, 13, 13, 14,
								],
								a: [
									6, 7, 7, 10, 9, 12,
									11, 13, 14,
								],
							},
							{
								title:
									'Collected (Rp jt)',
								max: 480,
								ca: '#27AE60',
								ct: '#9BD9B5',
								t: [
									300, 300, 330, 330,
									360, 360, 390, 390,
									420,
								],
								a: [
									180, 210, 200, 280,
									260, 350, 330, 380,
									400,
								],
							},
						],
					},
					weekly: {
						xl: [
							'Mon',
							'Tue',
							'Wed',
							'Thu',
							'Fri',
							'Sat',
							'Sun',
						],
						metrics: [
							{
								title: 'Outstanding',
								max: 32,
								ca: '#1CA7EC',
								ct: '#61BEDF',
								t: [
									25, 25, 25, 25, 25,
									25, 25,
								],
								a: [
									15, 18, 17, 24, 21,
									27, 29,
								],
							},
							{
								title: 'Reminded',
								max: 11,
								ca: '#1590CD',
								ct: '#6FB6DE',
								t: [
									7, 7, 7, 7, 7, 7, 7,
								],
								a: [
									4, 5, 5, 7, 6, 8, 9,
								],
							},
							{
								title: 'Promised',
								max: 5,
								ca: '#121567',
								ct: '#8E8FD8',
								t: [
									2.5, 2.5, 2.5, 2.5,
									2.5, 2.5, 2.5,
								],
								a: [
									1, 2, 2, 3, 2, 3, 4,
								],
							},
							{
								title:
									'Collected (Rp jt)',
								max: 96,
								ca: '#27AE60',
								ct: '#9BD9B5',
								t: [
									70, 70, 70, 70, 70,
									70, 70,
								],
								a: [
									42, 50, 48, 67, 60,
									73, 78,
								],
							},
						],
					},
				};
				const cfg =
					sets[mode || 'monthly'];
				const n = cfg.xl.length;
				const W = 600,
					padL = 34,
					padR = 14;
				const x = (i) =>
					padL +
					i *
						((W - padL - padR) /
							(n - 1));
				function panel(opt) {
					const H = 120,
						padT = 16,
						padB = opt.showX ? 26 : 10;
					const y = (v) =>
						padT +
						(1 - v / opt.max) *
							(H - padT - padB);
					let grid = '';
					[0, 0.5, 1].forEach((g) => {
						const yy =
							padT +
							(1 - g) *
								(H - padT - padB);
						grid +=
							'<line x1="' +
							padL +
							'" y1="' +
							yy +
							'" x2="' +
							(W - padR) +
							'" y2="' +
							yy +
							'" stroke="#EEF2F7" stroke-width="1"></line>';
						grid +=
							'<text x="' +
							(padL - 6) +
							'" y="' +
							(yy + 3) +
							'" font-size="8" fill="#9A9A9A" text-anchor="end">' +
							Math.round(opt.max * g) +
							'</text>';
					});
					const tPts = opt.target
						.map(
							(v, i) =>
								x(i) + ',' + y(v),
						)
						.join(' ');
					const aPts = opt.actual
						.map(
							(v, i) =>
								x(i) + ',' + y(v),
						)
						.join(' ');
					const tLine =
						'<polyline points="' +
						tPts +
						'" fill="none" stroke="' +
						opt.ct +
						'" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round"></polyline>';
					const aLine =
						'<polyline points="' +
						aPts +
						'" fill="none" stroke="' +
						opt.ca +
						'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline>';
					const dots = opt.actual
						.map(
							(v, i) =>
								'<circle cx="' +
								x(i) +
								'" cy="' +
								y(v) +
								'" r="2.4" fill="' +
								opt.ca +
								'"></circle>',
						)
						.join('');
					let xlabels = '';
					if (opt.showX)
						cfg.xl.forEach((t, i) => {
							xlabels +=
								'<text x="' +
								x(i) +
								'" y="' +
								(H - 8) +
								'" font-size="8" fill="#9A9A9A" text-anchor="middle">' +
								t +
								'</text>';
						});
					const head =
						'<div class="lc-head"><span class="lc-name">' +
						opt.title +
						'</span>' +
						'<span class="lc-legend2"><span class="lg"><i class="ln" style="background:' +
						opt.ca +
						'"></i>Actual</span>' +
						'<span class="lg"><i class="ln dash" style="color:' +
						opt.ct +
						'"></i>Target</span></span></div>';
					return (
						'<div class="lc-panel">' +
						head +
						'<svg viewBox="0 0 ' +
						W +
						' ' +
						H +
						'">' +
						grid +
						tLine +
						aLine +
						dots +
						xlabels +
						'</svg></div>'
					);
				}
				$(elId).innerHTML = cfg.metrics
					.map((m, idx) =>
						panel({
							title: m.title,
							max: m.max,
							target: m.t.map(
								(v) => v * factor,
							),
							actual: m.a.map(
								(v) => v * factor,
							),
							ca: m.ca,
							ct: m.ct,
							showX:
								idx ===
								cfg.metrics.length - 1,
						}),
					)
					.join('');
			}
			lineChart(
				'visitsLine',
				'monthly',
			);
			lineChart4(
				'visits2Line',
				'monthly',
			);

			/* ====================== TIMEFRAME (Monthly / Weekly) ====================== */
			const PERIODS = {
				monthly: 'June 2026',
				weekly: '06/01 \u2013 06/06',
			};
			const DATA = {
				sales: {
					overall: {
						monthly: [
							{
								cls: 'grad',
								w: 70,
								val: 'Rp 4,000,000,000',
							},
							{
								cls: 'red',
								w: 30,
								val: 'Rp 1,200,000,000',
							},
						],
						weekly: [
							{
								cls: 'grad',
								w: 70,
								val: 'Rp 1,000,000,000',
							},
							{
								cls: 'red',
								w: 32,
								val: 'Rp 320,000,000',
							},
						],
					},
					block: {
						monthly: (n) => [
							{
								cls: 'grad',
								w: 60 + n * 4,
								val: 'Rp 400,000,000',
							},
							{
								cls: 'red',
								w: 12 + n * 4,
								val: 'Rp 80,000,000',
							},
						],
						weekly: (n) => [
							{
								cls: 'grad',
								w: 55 + n * 4,
								val: 'Rp 100,000,000',
							},
							{
								cls: 'red',
								w: 10 + n * 3,
								val: 'Rp 24,000,000',
							},
						],
					},
				},
				visits: {
					overall: {
						monthly: [
							{
								cls: 'grad',
								w: 60,
								val: '1200',
							},
							{
								cls: 'red',
								w: 45,
								val: '560',
							},
						],
						weekly: [
							{
								cls: 'grad',
								w: 60,
								val: '300',
							},
							{
								cls: 'red',
								w: 48,
								val: '145',
							},
						],
					},
					block: {
						monthly: (n) => [
							{
								cls: 'grad',
								w: 60 + n * 4,
								val: '240',
							},
							{
								cls: 'red',
								w: 12 + n * 4,
								val: '110',
							},
						],
						weekly: (n) => [
							{
								cls: 'grad',
								w: 55 + n * 4,
								val: '60',
							},
							{
								cls: 'red',
								w: 10 + n * 3,
								val: '26',
							},
						],
					},
					avg: {
						monthly: 'Avg 8 / Hari',
						weekly: 'Avg 6 / Hari',
					},
				},
			};
			function applyBars(
				scope,
				rows,
				animate,
			) {
				const fills =
					scope.querySelectorAll(
						'.pbar-fill',
					);
				const vals =
					scope.querySelectorAll(
						'.pbar-val',
					);
				rows.forEach((r, i) => {
					if (fills[i]) {
						fills[i].className =
							'pbar-fill ' + r.cls;
						fills[i].dataset.w = r.w;
						if (animate !== false)
							gsap.to(fills[i], {
								width: r.w + '%',
								duration: 0.6,
								ease: 'power2.out',
							});
					}
					if (vals[i])
						vals[i].textContent = r.val;
				});
			}
			function applyMode(
				card,
				mode,
				animate,
			) {
				if (card === 'sales') {
					$('salesPeriod').textContent =
						PERIODS[mode];
					applyBars(
						$('salesOverall'),
						DATA.sales.overall[mode],
						animate,
					);
					renderSalesDonut(mode);
				} else if (card === 'visits') {
					$(
						'visitsPeriod',
					).textContent = PERIODS[mode];
					applyBars(
						$('visitsOverall'),
						DATA.visits.overall[mode],
						animate,
					);
					const blk = $('visitsBlocks');
					if (blk)
						blk
							.querySelectorAll(
								'.sp-block',
							)
							.forEach((b) => {
								applyBars(
									b,
									DATA.visits.block[
										mode
									](+b.dataset.sp),
									animate,
								);
								const a =
									b.querySelector(
										'.sp-block-avg',
									);
								if (a)
									a.textContent =
										DATA.visits.avg[
											mode
										];
							});
					lineChart('visitsLine', mode);
				} else if (card === 'visits2') {
					visits2Mode = mode;
					$(
						'visits2Period',
					).textContent = PERIODS[mode];
					renderVisits2(animate);
				}
			}

			/* Monthly / Weekly toggle */
			document
				.querySelectorAll('.mw-toggle')
				.forEach((g) => {
					g.addEventListener(
						'click',
						(e) => {
							const b =
								e.target.closest(
									'button',
								);
							if (!b) return;
							g.querySelectorAll(
								'button',
							).forEach((x) =>
								x.classList.remove(
									'active',
								),
							);
							b.classList.add('active');
							applyMode(
								g.dataset.card,
								b.textContent
									.trim()
									.toLowerCase(),
								true,
							);
						},
					);
				});

			/* Card filter (Sales / Visits / Stores) additive stacking */
			function toggleCard(el, show) {
				gsap.killTweensOf(el);
				if (show) {
					el.style.display = '';
					gsap.set(el, {
						height: 'auto',
						marginBottom: 20,
						paddingTop: 24,
						paddingBottom: 24,
						opacity: 1,
					});
					const hh = el.offsetHeight;
					gsap.fromTo(
						el,
						{
							height: 0,
							marginBottom: 0,
							paddingTop: 0,
							paddingBottom: 0,
							opacity: 0,
						},
						{
							height: hh,
							marginBottom: 20,
							paddingTop: 24,
							paddingBottom: 24,
							opacity: 1,
							duration: 0.4,
							ease: 'power2.out',
							onComplete: () =>
								gsap.set(el, {
									height: 'auto',
								}),
						},
					);
				} else {
					gsap.to(el, {
						height: 0,
						marginBottom: 0,
						paddingTop: 0,
						paddingBottom: 0,
						opacity: 0,
						duration: 0.4,
						ease: 'power2.in',
						onComplete: () => {
							el.style.display = 'none';
						},
					});
				}
			}
			const filterRow = $('filterRow');
			filterRow.addEventListener(
				'click',
				(e) => {
					const b =
						e.target.closest('.fpill');
					if (!b) return;
					b.classList.toggle('active');
					const card =
						document.querySelector(
							'.scard[data-card="' +
								b.dataset.card +
								'"]',
						);
					toggleCard(
						card,
						b.classList.contains(
							'active',
						),
					);
				},
			);

			/* ====================== LOAD ANIMATIONS ====================== */
			window.addEventListener(
				'load',
				() => {
					applyMode(
						'sales',
						'monthly',
						false,
					);
					applyMode(
						'visits',
						'monthly',
						false,
					);
					applyMode(
						'visits2',
						'monthly',
						false,
					);
					const active =
						document.querySelector(
							'.nav-item.active',
						);
					if (active)
						gsap.from(active, {
							opacity: 0,
							duration: 0.5,
							ease: 'power2.out',
						});
					gsap.from('.scard', {
						y: 20,
						opacity: 0,
						duration: 0.5,
						stagger: 0.1,
						ease: 'power2.out',
						clearProps:
							'opacity,transform',
					});
					document
						.querySelectorAll(
							'.pbar-fill',
						)
						.forEach((p) => {
							gsap.to(p, {
								width:
									p.dataset.w + '%',
								duration: 1,
								ease: 'power2.out',
								delay: 0.3,
							});
						});
				},
			);
		</script>
		<template id="__bundler_thumbnail">
			<svg
				viewBox="0 0 100 100"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					width="100"
					height="100"
					rx="16"
					fill="#121567"
				/>
				<rect
					x="30"
					y="30"
					width="40"
					height="40"
					rx="6"
					fill="#1CA7EC"
				/>
				<rect
					x="36"
					y="38"
					width="28"
					height="5"
					rx="2.5"
					fill="#fff"
				/>
				<rect
					x="36"
					y="48"
					width="20"
					height="5"
					rx="2.5"
					fill="#fff"
					opacity="0.8"
				/>
				<rect
					x="36"
					y="58"
					width="24"
					height="5"
					rx="2.5"
					fill="#fff"
					opacity="0.6"
				/>
			</svg>
		</template>
		<script>
			/* access-level: dashboards — Staff sees only their own breakdown (group totals stay) */
			(function () {
				if (!window.DKI) return;
				var s = DKI.getSession();
				if (!s) return;
				document.body.setAttribute(
					'data-role',
					s.role,
				);
				if (s.level)
					document.body.setAttribute(
						'data-level',
						s.level,
					);
				var own = DKI.ownerSP();
				if (!own) return;
				var idx = parseInt(
					String(own).replace(
						/\D/g,
						'',
					),
					10,
				);
				function lock() {
					document
						.querySelectorAll(
							'.sp-pills',
						)
						.forEach(function (p) {
							p.style.display = 'none';
						});
					document
						.querySelectorAll(
							'.sp-block',
						)
						.forEach(function (b) {
							if (
								b.dataset.sp &&
								+b.dataset.sp !== idx
							) {
								b.style.display =
									'none';
							}
						});
				}
				lock();
				setTimeout(lock, 60);
				setTimeout(lock, 450);
			})();
		</script>
	</body>
</html>
```
