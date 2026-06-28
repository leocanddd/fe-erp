# Kolektor Dashboard — Structure & Styling

> **Source:** `kolektor.html`
> This file covers the **complete HTML structure** (annotated skeleton) and every **CSS block** used on this page, organised by layer. Use it to rebuild or re-skin the page without reverse-engineering the source.

---

## 1. Page-level layout

```
body
├── .sidebar#sidebar                    ← fixed, 220px (64px collapsed)
│   ├── .sidebar-logo  (logo img)
│   ├── nav.nav#nav    (JS-rendered nav items)
│   └── .sidebar-bottom
│       ├── .user-row  (avatar + name/role)
│       └── a.logout-row
├── header.header                       ← fixed 64px top bar
│   ├── button.collapse-toggle#collapseToggle
│   ├── .breadcrumb  (icon + "Kolektor")
│   └── .company  ("PT. DUTA KENCANA INDAH")
└── main.main                           ← margin-left:220px, margin-top:64px
    ├── .welcome  (h1 "Dashboard" + date + role)
    ├── .filter-row#filterRow           ← additive card-toggle pills
    │   ├── .fpill[data-card="overdue"]
    │   ├── .fpill[data-card="due2w"]
    │   ├── .fpill[data-card="sales"]
    │   ├── .fpill[data-card="visits"]
    │   └── .fpill[data-card="visits2"]
    └── .cards-stack#cardsStack
        ├── section.scard[data-card="overdue"]   ← Overdue AR card
        │   ├── .scard-head
        │   │   └── .scard-titlewrap (h2 + .scard-period.red-period)
        │   ├── .rc-summary#overdueSummary       ← JS-rendered
        │   └── .rc-list#overdueList             ← JS-rendered
        ├── section.scard[data-card="due2w"]     ← Due in 2 Weeks card
        │   └── (same structure as overdue)
        ├── section.scard[data-card="sales"]     ← Collection Performance
        │   ├── .scard-head + .scard-period#salesPeriod
        │   ├── .pbars#salesOverall              ← two .pbar-row items
        │   ├── .sp-pills#salesPills             ← Collector 1–5 pills
        │   └── .donut-wrap.sales-donut-solo#salesDonut
        ├── section.scard[data-card="visits"]    ← Collector Visits
        │   ├── .scard-head + .mw-toggle[data-card="visits"]
        │   ├── .pbars#visitsOverall
        │   ├── .linechart#visitsLine            ← dual-panel SVG line chart
        │   ├── .sp-pills#visitsPills
        │   └── .sp-blocks#visitsBlocks          ← per-collector bars
        └── section.scard[data-card="visits2"]   ← Collection Funnel
            ├── .scard-head + .scard-period#visits2Period
            ├── .funnel-wrap#visits2Funnel       ← fn-stage rows (JS)
            ├── .sp-pills#visits2Pills
            └── .linechart#visits2Line           ← 4-panel funnel trend
```

---

## 2. CSS — base tokens & reset

```css
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
	font-family: 'Montserrat', sans-serif;
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
```

---

## 3. CSS — Sidebar

```css
.sidebar {
	position: fixed;
	left: 0;
	top: 0;
	height: 100vh;
	width: var(--sidebar-w);
	background: var(--card);
	border-right: 1px solid var(--border);
	z-index: 200;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	transition: width 0.3s ease;
}
.sidebar-logo {
	height: 64px;
	min-height: 64px;
	border-bottom: 1px solid var(--border);
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

/* Nav items */
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
}
.nav-item:not(.active):hover {
	color: var(--blue);
}
.nav-item.active {
	background: var(--grad);
	color: #fff;
	border-radius: 10px;
	margin: 0 8px;
}

/* Submenus */
.submenu {
	overflow: hidden;
	height: 0;
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

/* Tooltip (collapsed mode) */
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
	z-index: 300;
	margin-left: 8px;
	transition: opacity 0.15s ease;
}
body.collapsed
	.nav-item:hover
	.tooltip {
	opacity: 1;
}

/* Sidebar bottom */
.sidebar-bottom {
	border-top: 1px solid var(--border);
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
	text-decoration: none;
	transition: color 0.2s ease;
}
.logout-row:hover {
	color: var(--red);
}

/* Collapsed state overrides */
body.collapsed .sidebar {
	width: 64px;
}
body.collapsed .nav-item .label,
body.collapsed .nav-item .chev,
body.collapsed .user-meta {
	display: none;
}
body.collapsed .nav-item {
	justify-content: center;
	padding: 0;
}
body.collapsed .nav-item.active {
	margin: 0 8px;
}
body.collapsed .user-row,
body.collapsed .logout-row {
	justify-content: center;
	padding: 10px 0;
}

/* Collapsed flyout submenu */
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
body.collapsed .submenu-head {
	display: block;
	padding: 2px 18px 8px;
	margin-bottom: 4px;
	font-weight: 700;
	font-size: 13px;
	color: var(--text);
	border-bottom: 1px solid var(--border);
}
body.collapsed .submenu a {
	padding-left: 18px;
	height: 36px;
	line-height: 36px;
}
```

---

## 4. CSS — Header

```css
.header {
	position: fixed;
	top: 0;
	left: var(--sidebar-w);
	right: 0;
	height: 64px;
	z-index: 100;
	background: var(--card);
	border-bottom: 1px solid var(--border);
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
	font-weight: 800;
	font-size: 20px;
	margin-right: 16px;
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
```

---

## 5. CSS — Main content area

```css
.main {
	margin-left: var(--sidebar-w);
	margin-top: 64px;
	background: var(--bg);
	padding: 32px 40px;
	min-height: calc(100vh - 64px);
	transition: margin-left 0.3s ease;
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
}
```

---

## 6. CSS — Filter pills (card toggles)

```css
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
	font-weight: 600;
	font-size: 14px;
	background: #fff;
	border: 1px solid var(--border);
	color: var(--muted);
	cursor: pointer;
	transition: 0.2s;
	white-space: nowrap;
}
.fpill .dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--muted);
}
.fpill.active {
	background: var(--grad);
	border-color: transparent;
	color: #fff;
}
.fpill.active .dot {
	background: #fff;
}
```

---

## 7. CSS — Card shell (.scard)

```css
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
}
.scard-period.red-period {
	background: #fdecea;
	color: var(--red);
}
.scard-period.amber-period {
	background: #fef3e0;
	color: #c77e12;
}

/* Monthly / Weekly toggle inside a card */
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
```

---

## 8. CSS — Receivable list rows (.rc-\*)

```css
/* Summary banner */
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
.rc-count.assigned .rc-cnum {
	color: var(--blue);
}
.rc-count.unassigned .rc-cnum {
	color: var(--red);
}

/* Row grid: Invoice | Client | Days | Value | Collector */
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
	border-bottom: 1px solid var(--border);
}
.rc-row {
	padding: 13px 8px;
	border-bottom: 1px solid var(--bg);
	transition: background 0.2s;
}
.rc-row:hover {
	background: #f8fbff;
}
.rc-id {
	font-weight: 700;
	font-size: 13px;
	color: var(--dark);
}
.rc-src.retail {
	background: #1ca7ec;
}
.rc-src.project {
	background: #121567;
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
	font-weight: 700;
	font-size: 12px;
	cursor: pointer;
	transition: 0.2s;
}
.rc-assign:hover {
	border-color: var(--blue);
	color: var(--blue);
	border-style: solid;
}

/* Collector picker dropdown */
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
	font-weight: 600;
	font-size: 13px;
	color: var(--text);
	transition: background 0.15s;
}
.rc-opt:hover {
	background: #f1f6fc;
	color: var(--blue);
}
.rc-avatar.role-sales {
	background: var(--dark);
}
.rc-avatar.role-manager {
	background: #8e44ad;
}
```

---

## 9. CSS — Progress bars (.pbar-\*)

```css
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
}
```

---

## 10. CSS — Collector pills (.sp-pill / .sp-block)

```css
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
	font-weight: 600;
	font-size: 13px;
	background: #fff;
	border: 1px solid var(--border);
	color: var(--muted);
	transition: 0.2s;
}
.sp-pill.active {
	background: var(--grad);
	border-color: transparent;
	color: #fff;
}
.sp-pill.active .dot {
	background: #fff;
}

.sp-blocks {
	display: flex;
	flex-direction: column;
}
.sp-block {
	padding: 14px 0;
	border-bottom: 1px solid var(--border);
	overflow: hidden;
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
}
.sp-block-avg {
	margin-left: auto;
	font-style: italic;
	font-size: 13px;
	color: var(--muted);
}
```

---

## 11. CSS — Donut chart (.donut-wrap / .donut-legend)

```css
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
.donut-wrap.sales-donut-solo {
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-start;
	gap: 18px 48px;
	margin-top: 20px;
}
.donut-wrap.sales-donut-solo svg {
	width: 210px;
	height: 210px;
	flex: 0 0 auto;
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
	white-space: nowrap;
}
.donut-legend .lg i {
	width: 10px;
	height: 10px;
	border-radius: 3px;
}
.donut-legend .lg .amt {
	margin-left: auto;
	font-weight: 600;
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
```

---

## 12. CSS — Funnel chart (.fn-\*)

```css
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
```

---

## 13. CSS — Line chart (.linechart / .lc-\*)

```css
.linechart {
	margin-top: 16px;
}
.lc-panel {
	margin-bottom: 10px;
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
/* Dashed line indicator */
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
```

---

## 14. CSS — Status pills (.pill)

```css
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
.pill.finished {
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
```

---

## 15. External dependencies

| Dependency                | Version      | Purpose                                                   |
| ------------------------- | ------------ | --------------------------------------------------------- |
| Google Fonts — Montserrat | latest       | Primary typeface (400/500/600/700/800, 700i)              |
| GSAP                      | 3.12.5 (CDN) | Nav accordion, bar/funnel/line animations, card show/hide |
| `auth.js`                 | local        | Session guard, sidebar user-card sync, role gating        |

---

## 16. JavaScript behaviour summary

| Concern          | Function(s)                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Nav render       | `renderNav()` — data-driven from `NAV[]`, role-filtered via `ROLES` map                        |
| Sidebar collapse | `collapseToggle` click → `body.collapsed`, persisted in `localStorage['sidebarCollapsed']`     |
| Card toggle      | `filterRow` click → `toggleCard(el, show)` (GSAP height tween)                                 |
| Progress bars    | `bars(el, rows)`, `applyBars(scope, rows, animate)`                                            |
| Collector pills  | `renderPills(pillsId, blocksId)` → `toggleBlock(el, show)` (GSAP)                              |
| Donut chart      | `donut(elId, segs, center)` — pure SVG, segments as dasharray                                  |
| Funnel chart     | `renderVisits2(animate)` — reads `V2_STAGES`, factored by `v2Active` set                       |
| Line charts      | `lineChart(elId, mode, factor)` — dual-panel SVG polyline; `lineChart4` — 4-panel funnel trend |
| Monthly/Weekly   | `applyMode(card, mode, animate)` — swaps data + re-animates                                    |
| Receivable rows  | `rcRender(key)` — generates rows; `openRcMenu(btn,key,id)` — body-level dropdown               |
| Staff lock       | inline IIFE at bottom — hides other collectors' blocks for staff-level users                   |
