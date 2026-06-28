# Kolektor Dashboard — Design Tokens

> **Source:** `kolektor.html`
> Every token, colour, typographic value, spacing constant and component-level shorthand used on this page — in the exact form your CSS/JS must reproduce.

---

## 1. CSS Custom Properties (root tokens)

```css
:root {
	/* Backgrounds */
	--bg: #f4f6f9; /* page / section background */
	--card: #ffffff; /* all card/panel surfaces */

	/* Brand colours */
	--dark: #121567; /* navy  – headings, IDs, avatar fill */
	--blue: #1ca7ec; /* cyan  – links, active state, accents */
	--red: #fe2c23; /* alert – overdue, over-target, logout hover */

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

| Token / Name | Hex       | Where used                                               |
| ------------ | --------- | -------------------------------------------------------- |
| `--dark`     | `#121567` | Headings, IDs, avatar bg, nav active border-radius hover |
| `--blue`     | `#1CA7EC` | Links, accents, active pills, breadcrumb, period badges  |
| `--red`      | `#FE2C23` | Overdue days, actual bars, alert text, logout hover      |
| `--muted`    | `#9A9A9A` | Secondary text, labels, inactive icons                   |
| `--border`   | `#E0E0E0` | Card outlines, table hairlines, dividers                 |
| `--bg`       | `#F4F6F9` | Page bg, progress track fill, hover surface              |
| `--card`     | `#FFFFFF` | Card/panel bg, sidebar bg                                |

### Status / semantic (inline, not tokenised)

| Name                | Hex                   | Used for                                |
| ------------------- | --------------------- | --------------------------------------- |
| Success / Collected | `#27AE60`             | Collected line chart, "Finished" status |
| Warning / Amber     | `#F5A623`             | Due-in-2-weeks badge, pill bg           |
| Amber text          | `#C77E12`             | Amber period label text, dark amber     |
| Amber total         | `#E08A0B`             | Due-2w total amount text                |
| Violet              | `#8E44AD`             | Manager avatar bg                       |
| Hover surface       | `#F8FBFF`             | Row hover, rc-summary bg, expand bg     |
| Info badge bg       | `#EBF6FD`             | Period badge bg (blue variant)          |
| Overdue badge bg    | `#FDECEA`             | Overdue days badge bg                   |
| Due2w badge bg      | `#FEF3E0`             | Due-in-2-weeks badge bg                 |
| Sidebar shadow      | `rgba(18,21,103,.16)` | Flyout submenu shadow                   |

### Chart series (navy → cyan ramp)

```js
const SALES_COLORS = [
	'#121567',
	'#1590CD',
	'#1CA7EC',
	'#61BEDF',
	'#A9DCF0',
];
// Index 0 = Collector 1 (darkest), Index 4 = Collector 5 (lightest)
```

### Funnel stage colours

```js
const FN_COLORS = [
	'#61BEDF',
	'#1CA7EC',
	'#1590CD',
	'#121567',
];
// Stage 0 (Outstanding) → Stage 3 (Collected) — darker as further along
// Final "Collected" stage uses --grad instead
```

### Line chart stroke colours

| Series               | Actual stroke | Target stroke (dashed) |
| -------------------- | ------------- | ---------------------- |
| Visits               | `#1CA7EC`     | `#61BEDF`              |
| Collected (Rp jt)    | `#121567`     | `#8E8FD8`              |
| Funnel – Outstanding | `#1CA7EC`     | `#61BEDF`              |
| Funnel – Reminded    | `#1590CD`     | `#6FB6DE`              |
| Funnel – Promised    | `#121567`     | `#8E8FD8`              |
| Funnel – Collected   | `#27AE60`     | `#9BD9B5`              |

---

## 3. Typography

| Element                    | Font       | Weight  | Size    | Colour                   |
| -------------------------- | ---------- | ------- | ------- | ------------------------ |
| Body copy                  | Montserrat | 400     | 13–14px | `--text`                 |
| Page title (h1)            | Montserrat | 700     | 20px    | `--text`                 |
| Card title                 | Montserrat | 700     | 16px    | `--text`                 |
| Section label              | Montserrat | 600     | 14px    | `--text`                 |
| Nav item label             | Montserrat | 500     | 14px    | `--text` / `#fff` active |
| Submenu link               | Montserrat | 400→600 | 13px    | `--muted` / `--blue`     |
| Company name               | Montserrat | 800     | 15px    | gradient text            |
| Breadcrumb                 | Montserrat | 600     | 15px    | `--blue`                 |
| Collapse toggle            | Montserrat | 800     | 20px    | gradient text            |
| Period badge               | Montserrat | 600     | 13px    | `--blue`                 |
| Filter pill                | Montserrat | 600     | 14px    | `--muted` / `#fff`       |
| Collector pill             | Montserrat | 600     | 13px    | `--muted` / `#fff`       |
| Progress label             | Montserrat | 500     | 13px    | `--muted`                |
| Progress value             | Montserrat | 600     | 13px    | `--text`                 |
| RC total amount            | Montserrat | 800     | 26px    | `--red` / `#E08A0B`      |
| RC count number            | Montserrat | 800     | 22px    | `--blue` / `--red`       |
| Funnel value               | Montserrat | 700     | 15px    | `--dark`                 |
| Funnel pct (gradient text) | Montserrat | 800     | 12px    | gradient text            |
| Donut legend               | Montserrat | 500     | 13px    | `--text`                 |
| Bar chart label            | Montserrat | 400     | 12px    | `--muted`                |
| Table head                 | Montserrat | 600     | 10px    | `--muted` (uppercase)    |
| User name                  | Montserrat | 700     | 14px    | `--dark`                 |
| User role                  | Montserrat | 400     | 12px    | `--muted`                |
| Activity badge             | Montserrat | 800     | 15px    | `#fff`                   |

**Gradient text recipe** (company name, collapse toggle, funnel %, activity text):

```css
background: var(--grad);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

---

## 4. Spacing & sizing

| Token / constant         | Value                    | Where used                                |
| ------------------------ | ------------------------ | ----------------------------------------- |
| Sidebar width            | `220px` (`--sidebar-w`)  | All page offset calculations              |
| Sidebar collapsed        | `64px`                   | `body.collapsed .sidebar`                 |
| Header height            | `64px`                   | Fixed top bar; `margin-top` on `.main`    |
| Main padding             | `32px 40px`              | `.main`                                   |
| Card padding             | `24px 28px`              | `.scard`                                  |
| Card border-radius       | `12px`                   | `.scard`                                  |
| Nav item height          | `48px`                   | `.nav-item`                               |
| Nav item radius (active) | `10px`                   | `.nav-item.active`                        |
| Nav item margin (active) | `0 8px`                  | keeps active pill inset from sidebar edge |
| Submenu link height      | `38px` (36px collapsed)  | `.submenu a`                              |
| Avatar size              | `40px`                   | `.avatar`                                 |
| Sidebar logo height      | `64px`                   | `.sidebar-logo`                           |
| Progress bar height      | `20px`                   | `.pbar-track`                             |
| Funnel bar height        | `26px`                   | `.fn-track`                               |
| Pill height (filter)     | `36px`                   | `.fpill`                                  |
| Pill height (collector)  | `30px`                   | `.sp-pill`                                |
| MW toggle button height  | `32px`                   | `.mw-toggle button`                       |
| Card gap (stack)         | `20px` (`margin-bottom`) | `.scard`                                  |
| RC row padding           | `13px 8px`               | `.rc-row`                                 |
| RC count min-width       | `104px`                  | `.rc-count`                               |

---

## 5. Component-level token summary

### Active / selected state

```css
background: var(
	--grad
); /* nav active, pills active, MW active, filter active */
color: #fff;
border-color: transparent;
```

### Hover row surface

```css
background: #f8fbff;
```

### Card box-shadow

```css
box-shadow: 0 2px 8px
	rgba(0, 0, 0, 0.04);
```

### Flyout shadow (collapsed submenu)

```css
box-shadow: 0 12px 32px
	rgba(18, 21, 103, 0.16);
```

### RC collector picker shadow

```css
box-shadow: 0 12px 32px
	rgba(18, 21, 103, 0.18);
```

### Scrollbar

```css
width: 8px; height: 8px;
thumb: background #d6dbe2; border-radius 8px;
track: transparent;
```

---

## 6. Status chip colours (complete reference)

| Class                                                             | Background | Meaning                  |
| ----------------------------------------------------------------- | ---------- | ------------------------ |
| `.pill.diproses` `.pill.assigned` `.pill.quotation`               | `#1CA7EC`  | In progress / assigned   |
| `.pill.pending` `.pill.reminded` `.pill.remin`                    | `#F5A623`  | Pending / reminded       |
| `.pill.selesai` `.pill.approved` `.pill.finished` `.pill.product` | `#27AE60`  | Done / approved          |
| `.pill.rejected` `.pill.action`                                   | `#FE2C23`  | Rejected / action needed |
| `.pill.terkirim`                                                  | `#8E44AD`  | Shipped/sent             |
| `.pill.inquiry`                                                   | `#9A9A9A`  | Inquiry (neutral)        |
| `.pill.application`                                               | `#121567`  | Application (dark navy)  |

---

## 7. GSAP animation values

| Animation                 | Duration                     | Ease                   |
| ------------------------- | ---------------------------- | ---------------------- |
| Nav chevron rotate        | 0.25s                        | power2.out             |
| Submenu open/close        | 0.25s                        | power2.out / power2.in |
| Card show/hide            | 0.4s                         | power2.out / power2.in |
| Collector block show/hide | 0.4s                         | power2.out / power2.in |
| Progress bar fill         | 1.0s (initial) / 0.6s (swap) | power2.out             |
| Funnel bar fill           | 0.6s                         | power2.out             |
| Entrance stagger (.scard) | 0.5s, stagger 0.1s           | power2.out             |
| Nav active item entrance  | 0.5s                         | power2.out             |
