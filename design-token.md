# AR (Accounts Receivable) — Design Tokens

> **Source:** `AR.html`
> Every token, colour, typographic value, spacing constant and component-level shorthand used on this page — in the exact form your CSS/JS must reproduce.

---

## 1. CSS Custom Properties (root tokens)

```css
:root {
	/* Backgrounds */
	--bg: #f4f6f9; /* page / section background, progress tracks */
	--card: #ffffff; /* all card/panel surfaces */

	/* Brand colours */
	--dark: #121567; /* navy — headings, IDs, expand panel order number */
	--blue: #1ca7ec; /* cyan — links, active states, outstanding status */
	--red: #fe2c23; /* alert — overdue status, outstanding count */

	/* Text */
	--text: #111111; /* primary body copy */
	--muted: #9a9a9a; /* secondary labels, dates, captions */

	/* Borders */
	--border: #e0e0e0; /* card borders, dividers, hairlines */

	/* Signature gradient */
	--grad: linear-gradient(
		90deg,
		#61bedf 0%,
		#1ca7ec 50%,
		#1590cd 100%
	);

	/* Layout */
	--sidebar-w: 220px; /* 64px when body.collapsed */
}
```

---

## 2. Colour palette (all values in use)

### Brand & semantic

| Token / Name | Hex       | Where used                                                                                                                               |
| ------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--dark`     | `#121567` | AR IDs, expand panel #ID, project source badge bg, nav hover                                                                             |
| `--blue`     | `#1CA7EC` | Outstanding status, links, active pills, date pills, TT confirmed date, collector note mark, vc-select focus border, outstanding sf-pill |
| `--red`      | `#FE2C23` | Overdue status, SP summary outstanding count, overdue sf-pill, disputed reminder                                                         |
| `--muted`    | `#9A9A9A` | Secondary text, unassigned avatar bg-fallback token reference                                                                            |
| `--border`   | `#E0E0E0` | All borders, TT pending dot border                                                                                                       |
| `--bg`       | `#F4F6F9` | Page bg, status filter inactive bg                                                                                                       |
| `--card`     | `#FFFFFF` | Sidebar, header, v-row hover base                                                                                                        |

### Status colours (inline)

| Name           | Hex                     | Used for                                                                                                    |
| -------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Outstanding    | `#1CA7EC`               | `.v-status.outstanding`, `.v-ex-pill.outstanding`, `.sf-pill[data-status="outstanding"]`                    |
| Due in 2 Weeks | `#F5A623`               | `.v-status.due2w`, `.v-ex-pill.due2w`, `.sf-pill[data-status="due2w"]`, `.vs-sub .dot.pend`, `.rm-reminded` |
| Overdue        | `#FE2C23`               | `.v-status.overdue`, `.v-ex-pill.overdue`, `.sf-pill[data-status="overdue"]`                                |
| Paid           | `#27AE60`               | `.v-status.paid`, `.v-ex-pill.paid`, `.sf-pill[data-status="paid"]`, `.btn-excel`, `.vs-sub .dot.real`      |
| Promised       | `var(--blue)` `#1CA7EC` | `.rm-promised` reminder pill                                                                                |
| Disputed       | `var(--red)` `#FE2C23`  | `.rm-disputed` reminder pill                                                                                |
| Not Reminded   | `#9AA7B6`               | `.rm-none` reminder pill                                                                                    |

### Surface / background variants

| Name              | Hex                    | Where used                                                                |
| ----------------- | ---------------------- | ------------------------------------------------------------------------- |
| Hover / expand bg | `#F8FBFF`              | `.v-row:hover`, `.v-expand-inner`, `.valsummary`, `.sum-card`, `.vc-note` |
| Empty avatar bg   | `#EEF1F5`              | `.vc-avatar.empty`                                                        |
| Empty avatar text | `#9AA7B6`              | `.vc-avatar.empty` colour                                                 |
| WhatsApp green    | `#25D366`              | `.rm-send` (WA button)                                                    |
| WA shadow         | `rgba(37,211,102,.25)` | `.rm-send` box-shadow                                                     |
| Blue shadow       | `rgba(28,167,236,.25)` | `.rm-send.alt` box-shadow                                                 |
| Toast bg          | `var(--dark)`          | `.ar-toast`                                                               |
| Toast shadow      | `rgba(18,21,103,.32)`  | `.ar-toast`                                                               |

### Source badge colours

| Source                      | Hex       |
| --------------------------- | --------- |
| Retail (`.ar-src.retail`)   | `#1CA7EC` |
| Project (`.ar-src.project`) | `#121567` |

---

## 3. Typography

| Element                   | Weight  | Size   | Colour                             |
| ------------------------- | ------- | ------ | ---------------------------------- |
| Page title (h1)           | 700     | 20px   | `--text`                           |
| Card title (.vcard-title) | 700     | 16px   | `--text`                           |
| Custom label              | 500     | 14px   | `--muted`                          |
| Date pills                | 600     | 13px   | `#fff`                             |
| MW toggle                 | 600     | 13px   | `--muted` / `#fff` active          |
| VS total amount           | 800     | 28px   | gradient text                      |
| VS sub-label              | 600     | 12px   | `--muted` (uppercase)              |
| VS sub-value              | 700     | 15px   | `--text`                           |
| SP pill                   | 600     | 13px   | `--muted` / `#fff` active          |
| SP summary name           | 600     | 14px   | `--dark`                           |
| SP outstanding value      | 700     | 16px   | `--red`                            |
| Status filter pill        | 600     | 13px   | `--muted` / `#fff` active          |
| AR row — order ID         | 700     | 14px   | `--dark`                           |
| AR row — company          | 600     | 13.5px | `--text`                           |
| AR row — sub-label        | 400     | 12px   | `--muted`                          |
| AR row — value            | 600     | 13px   | `--text`                           |
| AR row — status           | 600     | 13px   | status-specific                    |
| AR row — view             | 600     | 13px   | `--blue`                           |
| Expand — order ID         | 800     | 22px   | `--dark`                           |
| Expand — company          | 700     | 16px   | `--text`                           |
| Expand — meta             | 400     | 13px   | `--text` (line-height 1.9)         |
| Expand status pill        | 700     | 13px   | `#fff`                             |
| Line item name            | 600     | 14px   | `--text`                           |
| Line item unit            | 400     | 12px   | `--muted`                          |
| Line item total           | 600     | 14px   | `--text`                           |
| Total row label           | 700     | 15px   | `--text`                           |
| Total row value           | 800     | 15px   | `--dark`                           |
| TT step label             | 600     | 13px   | `--dark` done / `--muted` pending  |
| TT step date              | 500/700 | 12px   | `--muted` / `--blue` done          |
| Reminder pill             | 700     | 12px   | `#fff`                             |
| Reminder option           | 600     | 12px   | `--muted` → status colour selected |
| Send button               | 700     | 13px   | `#fff`                             |
| Collector name            | 700     | 14px   | `--dark`                           |
| Collector label           | 600     | 10px   | `--muted` (uppercase)              |
| Collector note            | 400     | 13px   | `--text` (line-height 1.6)         |
| Collector note mark       | 700     | 22px   | `--blue` (Georgia serif)           |
| Pagination info           | 400     | 13px   | `--muted`                          |
| Pagination button         | 500     | 13px   | `--muted` / `#fff` active          |

**Gradient text recipe** (value summary total):

```css
background: var(--grad);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

**Open-row gradient text** (order ID, company name, "View" when row is open):

```css
.v-rowwrap.open .v-oid,
.v-rowwrap.open .v-store .vs-co,
.v-rowwrap.open .v-view {
	background: var(--grad);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}
```

---

## 4. Spacing & sizing

| Element                       | Value                   |
| ----------------------------- | ----------------------- |
| Sidebar width                 | `220px` (`--sidebar-w`) |
| Sidebar collapsed             | `64px`                  |
| Header height                 | `64px`                  |
| Main padding                  | `32px 40px`             |
| vcard padding                 | `24px 28px`             |
| vcard border-radius           | `12px`                  |
| Export row margin             | `-8px 0 16px`           |
| Export button height          | `34px`                  |
| Date pill height              | `30px`                  |
| SP pill height                | `30px`                  |
| Status filter pill height     | `34px`                  |
| Per-page pill height          | `30px`                  |
| SP summary card padding       | `14px 16px`             |
| SP summary card border-radius | `10px`                  |
| Summary avatar size           | `40px`                  |
| Value summary bar height      | `14px`                  |
| Value summary bar radius      | `8px`                   |
| AR row padding                | `12px 8px`              |
| AR row border-radius          | `8px`                   |
| Expand panel padding          | `24px 28px`             |
| Expand panel gap (left/right) | `32px`                  |
| Left column flex              | `0 0 45%`               |
| TT dot size                   | `13px`                  |
| VC avatar size                | `34px`                  |
| VC note padding               | `12px 14px 26px`        |
| VC note border-radius         | `10px`                  |
| Pagination button height      | `30px`                  |
| Pagination button radius      | `6px`                   |
| Pagination margin-top         | `20px`                  |

---

## 5. Component token summary

### Active / selected state

```css
/* Pills, toggles, date pills */
background: var(--grad);
color: #fff;
border-color: transparent;
```

### Hover row

```css
background: #f8fbff;
```

### Card box-shadow

```css
box-shadow: 0 2px 8px
	rgba(0, 0, 0, 0.04);
```

### Toast shadow

```css
box-shadow: 0 10px 30px
	rgba(18, 21, 103, 0.32);
```

### WA send button shadow

```css
box-shadow: 0 2px 8px
	rgba(37, 211, 102, 0.25);
```

### Email send button shadow

```css
box-shadow: 0 2px 8px
	rgba(28, 167, 236, 0.25);
```

---

## 6. Reminder status colours (complete reference)

| Class                                      | Background | Meaning                     |
| ------------------------------------------ | ---------- | --------------------------- |
| `.rm-none` / `.rm-opt.rm-none.sel`         | `#9AA7B6`  | Not reminded yet            |
| `.rm-reminded` / `.rm-opt.rm-reminded.sel` | `#F5A623`  | Reminder sent               |
| `.rm-promised` / `.rm-opt.rm-promised.sel` | `#1CA7EC`  | Follow-up — promised to pay |
| `.rm-disputed` / `.rm-opt.rm-disputed.sel` | `#FE2C23`  | Disputed                    |

---

## 7. Value summary sub-indicator dot colours

| Class               | Hex       | Meaning                     |
| ------------------- | --------- | --------------------------- |
| `.vs-sub .dot.pend` | `#F5A623` | Outstanding (pending) value |
| `.vs-sub .dot.real` | `#27AE60` | Collected (realized) value  |
| `.vs-sub .dot.tgt`  | `#121567` | Target                      |

---

## 8. GSAP animation values

| Animation                                      | Duration               | Ease                   |
| ---------------------------------------------- | ---------------------- | ---------------------- |
| Row expand (open)                              | 0.4s                   | power2.out             |
| Row collapse (close)                           | 0.3s                   | power2.in              |
| SP summary card collapse/expand (width)        | 0.3s                   | power2.in / power2.out |
| SP filter remove fade                          | 0.3s                   | —                      |
| Entrance (`.welcome`, `.export-row`, `.vcard`) | 0.5s, stagger 0.06s    | power2.out             |
| SP summary card entrance                       | 0.4s, stagger 0.06s    | power2.out             |
| Value summary fill bar                         | 0.55s (CSS transition) | ease                   |
