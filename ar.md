# Kolektor ▸ AR — Build Doc

> Single-file build reference for **`AR.html`**: dependencies, the full specification, and the complete copy-paste-ready source.

## Dependencies

**Source file:** `AR.html`

**Shared scripts it loads** (must sit in the same folder):

- `auth.js`

**Assets referenced:**

- `assets/Logo_DKI.png`

External CDNs: Google Fonts (Montserrat), GSAP 3.12.5. Shared-script source is in `DKI-ERP-Master-Documentation.md` §12, or the matching `.js` files in the project root.

---

## Specification

# 02 · Kolektor → AR (Accounts Receivable)

**File:** `AR.html` · **Sidebar:** Kolektor ▸ AR (`selected:1`) · **Title:** "Accounts Receivable"

The master receivables list — every outstanding **Retail order + Project PO** in one expandable table, with a value-summary header, salesperson filter, status filter, and a per-row **reminder / WhatsApp follow-up** workflow. Forked from the Project **PO** page ([../Project/05-PO.md](../Project/05-PO.md)) and extended with collection features.

> Shell + list-page conventions (export row, salesperson filter, summary cards, expandable rows, pagination) → [../Retail/README.md](../Retail/README.md). This doc covers AR-specific additions.

---

## Page structure

```
.welcome                     "Accounts Receivable"
.export-row                  Export + Excel
.vcard
  ├─ .valsummary  #valSummary       total receivables + target progress + outstanding/collected/target
  ├─ .filter2-row  #spFilter         salesperson pills (Sales 1–5)
  ├─ .summary-row  #summaryRow        per-sales "Outstanding" cards
  ├─ .statusfilter #statusFilter     radio: All / Outstanding / Due in 2 Weeks / Overdue / Paid
  ├─ .divider
  ├─ .visit-table  #arTable           expandable receivable rows
  └─ .pagination   #pagination
```

---

## Data model — `AR` (16 generated rows)

```js
{
  id:'PO250065' | 'DKI250065',         // PO… = Project, DKI… = Retail
  source:'Project' | 'Retail',          // → .ar-src badge
  client, subject,                      // company + project name (or "Retail Order")
  date, delivery, value,                // dates + amount
  sp:1..5,                              // salesperson
  status:'outstanding'|'due2w'|'overdue'|'paid',
  substatus,                            // detail line per status
  addr, items:[{name,qty,unit,total}], total,
  // PO-only delivery/Tanda-Terima tracker:
  shipped, shippedDate, ttIssued, ttDate,
  // collection workflow:
  remindStatus:'none'|'reminded'|'promised'|'disputed', remindCount, lastRemind,
  collector, collectorNote, noteDate
}
```

Supporting constants: `STATUSES`, `SUBSTATUS`, `STORES`, `CLIENTS`, `PROJ_NAMES`, `PRODNAMES`, `ADDR`, `COLLECTORS`, `COL_NOTES`, `SP_PENDING`.

---

## Behaviour

### Value summary — `renderValueSummary()`

Sums **only the active salespeople**. Shows Total Receivables (gradient), a target-progress bar (`FULL_TARGET = total × 1.25`, scaled by active reps), and three sub-figures: Outstanding (pending statuses), Collected (`paid`), Target. Recomputes on every salesperson toggle.

### Filters

- **Salesperson** (`#spFilter`): toggle pills; each animates its summary card in/out (`collapseCard`) and filters rows (`applyFilters` on `activeSP` Set).
- **Status** (`#statusFilter`): single-select radio; active pill is color-coded per status; sets `curStatus`. Both feed `applyFilters()`.

### Expandable row → reminder workflow (`.rm-block`)

Opening a row reveals line items, address, the **Tanda Terima** delivery tracker (PO rows only: shipped → TT issued steps), and the **Reminder** block:

- Current reminder pill + count + last-reminded date.
- A segmented selector `arSetRemind(id, key)` to set `none / reminded / promised / disputed`.
- **WhatsApp** send button (`.rm-send`, green) + an alternate gradient send → fires a confirmation toast (`.ar-toast`). Cosmetic — composes no real message.
- Collector assignee + note (`.vc-block`).

---

## Data contract

```
GET  /collection/ar?sp=&status=&page=     → { rows:[AR], total }
GET  /collection/ar/summary?sp=           → { total, outstanding, collected, target }
POST /collection/ar/:id/remind            → { status, channel:'whatsapp', message }
PUT  /collection/ar/:id/collector         → { collector }
```

---

# Backend API Requirements for AR Page

The backend needs to implement the following API endpoints to support the AR (Accounts Receivable) page:

## 1. GET `/api/collection/ar` - Get AR List

**Description:** Retrieve a paginated list of accounts receivable with filters

**Query Parameters:**
- `sp` (string, required): Comma-separated salesperson IDs (e.g., "1,2,3,4,5")
- `status` (string, required): Filter by status - "all", "outstanding", "due2w", "overdue", or "paid"
- `page` (number, required): Page number for pagination (starts at 1)

**Response Format:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "rows": [
      {
        "id": "PO250065",
        "source": "Project",
        "client": "PT ABC Corporation",
        "subject": "Office Renovation Project",
        "date": "2026-05-15",
        "delivery": "2026-06-30",
        "value": 150000000,
        "sp": 1,
        "status": "overdue",
        "substatus": "15 days overdue",
        "addr": "Jl. Sudirman No. 123, Jakarta",
        "items": [
          {
            "name": "Paint - Dulux Premium White",
            "qty": 50,
            "unit": "gallon",
            "total": 25000000
          },
          {
            "name": "Labor - Painting Services",
            "qty": 10,
            "unit": "day",
            "total": 15000000
          }
        ],
        "total": 150000000,
        "shipped": true,
        "shippedDate": "2026-06-25",
        "ttIssued": false,
        "ttDate": null,
        "remindStatus": "reminded",
        "remindCount": 2,
        "lastRemind": "2026-06-23T10:30:00Z",
        "collector": "Andi Wijaya",
        "collectorNote": "Client promises payment by next week",
        "noteDate": "2026-06-22"
      }
    ],
    "total": 156
  }
}
```

**Business Logic:**
- Filter AR items by the specified salesperson IDs
- Filter by status:
  - "all": Return all items
  - "outstanding": Items with status "outstanding"
  - "due2w": Items due in 2 weeks
  - "overdue": Items past due date
  - "paid": Items that are paid
- Paginate results (10 items per page)
- Include all line items, delivery tracking, and reminder workflow data

---

## 2. GET `/api/collection/ar/summary` - Get AR Summary

**Description:** Get aggregated summary of accounts receivable

**Query Parameters:**
- `sp` (string, required): Comma-separated salesperson IDs (e.g., "1,2,3,4,5")

**Response Format:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "total": 2500000000,
    "outstanding": 1800000000,
    "collected": 700000000,
    "target": 3125000000,
    "targetProgress": 80,
    "bySalesperson": [
      {
        "id": 1,
        "outstanding": 450000000
      },
      {
        "id": 2,
        "outstanding": 380000000
      },
      {
        "id": 3,
        "outstanding": 320000000
      },
      {
        "id": 4,
        "outstanding": 380000000
      },
      {
        "id": 5,
        "outstanding": 270000000
      }
    ]
  }
}
```

**Business Logic:**
- Sum all receivables for the specified salespeople
- Calculate total outstanding (not yet paid)
- Calculate total collected (paid)
- Calculate target (total × 1.25)
- Calculate target progress percentage
- Provide per-salesperson outstanding amounts

---

## 3. POST `/api/collection/ar/:id/remind` - Update Reminder Status

**Description:** Update the reminder status for an AR item

**URL Parameters:**
- `id` (string): The AR item ID (e.g., "PO250065")

**Request Body:**
```json
{
  "status": "reminded"
}
```

**Allowed status values:**
- `"none"`: No reminder sent
- `"reminded"`: Reminder sent
- `"promised"`: Client promised payment
- `"disputed"`: Payment disputed

**Response Format:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "PO250065",
    "remindStatus": "reminded",
    "remindCount": 3,
    "lastRemind": "2026-06-25T14:22:00Z"
  }
}
```

**Business Logic:**
- Update the reminder status for the specified AR item
- Increment `remindCount` if status is not "none"
- Reset `remindCount` to 0 if status is "none"
- Update `lastRemind` timestamp to current time (unless status is "none")

---

## 4. POST `/api/collection/ar/:id/send-reminder` - Send Reminder

**Description:** Send a payment reminder via WhatsApp or Email

**URL Parameters:**
- `id` (string): The AR item ID (e.g., "PO250065")

**Request Body:**
```json
{
  "channel": "whatsapp"
}
```

**Allowed channel values:**
- `"whatsapp"`: Send via WhatsApp
- `"email"`: Send via Email

**Response Format:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "message": "Reminder sent successfully via whatsapp"
  }
}
```

**Business Logic:**
- Send a payment reminder to the client via the specified channel
- The reminder should include:
  - Invoice ID
  - Client name
  - Amount due
  - Due date
  - Payment instructions
- Update `remindCount` and `lastRemind` fields
- Log the reminder in the system

---

## Error Responses

All endpoints should return errors in the following format:

```json
{
  "status": "error",
  "statusCode": 400,
  "error": "Invalid salesperson ID",
  "message": "Salesperson ID must be between 1 and 5"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (AR item not found)
- `500`: Internal Server Error

---

## Data Model Notes

### AR Item Status Calculation
- `"overdue"`: `dueDate < today`
- `"due2w"`: `dueDate >= today AND dueDate <= today + 14 days`
- `"outstanding"`: `dueDate > today + 14 days AND NOT paid`
- `"paid"`: Payment received

### Tanda Terima (TT) Tracking
Only applicable for `source: "Project"` items:
1. `shipped`: Boolean - Has the order been shipped?
2. `shippedDate`: Date - When was it shipped?
3. `ttIssued`: Boolean - Has the Tanda Terima been issued?
4. `ttDate`: Date - When was the TT issued?

### Reminder Workflow States
- `none`: No reminder activity
- `reminded`: Reminder sent to client
- `promised`: Client has promised to pay
- `disputed`: Client is disputing the invoice

---

## Database Schema Suggestions

### `ar_items` table
```sql
CREATE TABLE ar_items (
  id VARCHAR(50) PRIMARY KEY,
  source ENUM('Retail', 'Project') NOT NULL,
  client VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  invoice_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  due_date DATE NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  salesperson_id INT NOT NULL,
  status ENUM('outstanding', 'due2w', 'overdue', 'paid') NOT NULL,
  substatus VARCHAR(255),
  delivery_address TEXT,
  shipped BOOLEAN DEFAULT false,
  shipped_date DATE,
  tt_issued BOOLEAN DEFAULT false,
  tt_date DATE,
  remind_status ENUM('none', 'reminded', 'promised', 'disputed') DEFAULT 'none',
  remind_count INT DEFAULT 0,
  last_remind TIMESTAMP,
  collector VARCHAR(255),
  collector_note TEXT,
  note_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `ar_line_items` table
```sql
CREATE TABLE ar_line_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ar_item_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  qty INT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (ar_item_id) REFERENCES ar_items(id) ON DELETE CASCADE
);
```

### `reminder_logs` table
```sql
CREATE TABLE reminder_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ar_item_id VARCHAR(50) NOT NULL,
  channel ENUM('whatsapp', 'email') NOT NULL,
  status ENUM('sent', 'failed') NOT NULL,
  message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ar_item_id) REFERENCES ar_items(id) ON DELETE CASCADE
);
```

## Implementation notes

- `AR` is procedurally generated (16 rows) — not real data; merges Retail + Project sources for demo.
- WhatsApp send, Export/Excel, and pagination are **cosmetic**.
- Tanda-Terima tracker only applies to `source:'Project'` rows.

---

## Full page source — `AR.html`

```html
<!DOCTYPE html>
<html lang="id">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<title>DKI ERP — AR</title>
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
					<h1>Accounts Receivable</h1>
					<div class="date">
						08 Jun 2026
					</div>
				</div>
				<div class="role">
					Superadmin
				</div>
			</div>

			<div class="export-row">
				<button class="btn-export">
					Export
				</button>
				<button class="btn-excel">
					Excel
				</button>
			</div>

			<section class="vcard">
				<div class="controls-row">
					<h2 class="vcard-title">
						Accounts Receivable
					</h2>
					<span class="custom-label"
						>Custom</span
					>
					<div class="daterange">
						<button
							class="date-pill"
							data-target="start"
						>
							05/01
						</button>
						<span class="dash"
							>&mdash;</span
						>
						<button
							class="date-pill"
							data-target="end"
						>
							05/01
						</button>
						<input
							type="date"
							class="date-native"
							id="dateStart"
						/>
						<input
							type="date"
							class="date-native"
							id="dateEnd"
						/>
					</div>
					<div
						class="mw-toggle"
						id="mwToggle"
					>
						<button class="active">
							Monthly</button
						><button>Weekly</button>
					</div>
				</div>

				<div
					class="valsummary"
					id="valSummary"
				></div>

				<div class="filter2-row">
					<div
						class="sp-filter"
						id="spFilter"
					></div>
					<div class="perpage">
						<span class="pp-label"
							>View per page</span
						>
						<button
							class="pp-pill"
							id="perPage"
						>
							10
						</button>
					</div>
				</div>

				<div
					class="summary-row"
					id="summaryRow"
				></div>

				<div
					class="statusfilter"
					id="statusFilter"
				></div>

				<div class="divider"></div>

				<div
					class="visit-table"
					id="arTable"
				></div>

				<div
					class="pagination"
					id="pagination"
				></div>
			</section>
		</main>

		<style>
			/* ===== export buttons ===== */
			.export-row {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
				margin: -8px 0 16px;
			}
			.btn-export,
			.btn-excel {
				height: 34px;
				padding: 0 20px;
				border: none;
				border-radius: 8px;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 700;
				font-size: 13px;
				color: #fff;
				transition: filter 0.2s ease;
			}
			.btn-export {
				background: var(--grad);
			}
			.btn-excel {
				background: #27ae60;
			}
			.btn-export:hover,
			.btn-excel:hover {
				filter: brightness(1.08);
			}

			/* ===== main card ===== */
			.vcard {
				background: var(--card);
				border: 1px solid var(--border);
				border-radius: 12px;
				padding: 24px 28px;
				box-shadow: 0 2px 8px
					rgba(0, 0, 0, 0.04);
			}
			.controls-row {
				display: flex;
				align-items: center;
				gap: 16px;
				flex-wrap: wrap;
			}
			.vcard-title {
				margin: 0;
				font-weight: 700;
				font-size: 16px;
				color: var(--text);
			}
			.custom-label {
				font-weight: 500;
				font-size: 14px;
				color: var(--muted);
			}
			.daterange {
				display: flex;
				align-items: center;
				gap: 8px;
				position: relative;
			}
			.date-pill {
				height: 30px;
				padding: 0 14px;
				border: none;
				border-radius: 100px;
				cursor: pointer;
				background: var(--grad);
				color: #fff;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
			}
			.daterange .dash {
				color: var(--muted);
			}
			.date-native {
				position: absolute;
				left: 0;
				bottom: 0;
				width: 1px;
				height: 1px;
				opacity: 0;
				pointer-events: none;
			}
			.mw-toggle {
				margin-left: auto;
				display: flex;
				gap: 6px;
			}
			.mw-toggle button {
				height: 30px;
				padding: 0 16px;
				border-radius: 100px;
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

			.filter2-row {
				display: flex;
				align-items: center;
				gap: 16px;
				margin-top: 14px;
				flex-wrap: wrap;
			}
			.sp-filter {
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
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
			.perpage {
				margin-left: auto;
				display: flex;
				align-items: center;
				gap: 10px;
			}
			.pp-label {
				font-weight: 500;
				font-size: 13px;
				color: var(--muted);
			}
			.pp-pill {
				height: 30px;
				padding: 0 14px;
				border: none;
				border-radius: 8px;
				cursor: pointer;
				background: var(--grad);
				color: #fff;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 700;
				font-size: 13px;
			}

			/* salesperson summary cards (Pending) */
			.summary-row {
				display: flex;
				gap: 12px;
				margin-top: 16px;
				margin-bottom: 16px;
				align-items: stretch;
			}
			.sum-card {
				flex: 1 1 0;
				min-width: 0;
				background: #f8fbff;
				border: 1px solid var(--border);
				border-radius: 10px;
				padding: 14px 16px;
				overflow: hidden;
			}
			.sum-top {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 10px;
				flex-wrap: wrap;
			}
			.sum-avatar {
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
				font-size: 13px;
			}
			.sum-name {
				font-weight: 600;
				font-size: 14px;
				color: var(--dark);
				white-space: nowrap;
			}
			.sum-stat {
				display: flex;
				align-items: baseline;
				justify-content: space-between;
				gap: 8px;
			}
			.sum-stat .k {
				font-weight: 400;
				font-size: 12px;
				color: var(--muted);
				white-space: nowrap;
			}
			.sum-stat .v {
				font-weight: 700;
				font-size: 16px;
				color: var(--red);
			}

			/* status filter (radio) */
			.statusfilter {
				display: flex;
				gap: 10px;
				margin-bottom: 20px;
				flex-wrap: wrap;
			}
			.sf-pill {
				height: 34px;
				padding: 0 18px;
				border: none;
				border-radius: 100px;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
				background: var(--bg);
				color: var(--muted);
				transition:
					background 0.2s ease,
					color 0.2s ease;
			}
			.sf-pill.active {
				color: #fff;
			}
			.sf-pill.active[data-status='all'] {
				background: var(--grad);
			}
			.sf-pill.active[data-status='outstanding'] {
				background: #1ca7ec;
			}
			.sf-pill.active[data-status='due2w'] {
				background: #f5a623;
			}
			.sf-pill.active[data-status='overdue'] {
				background: #fe2c23;
			}
			.sf-pill.active[data-status='paid'] {
				background: #27ae60;
			}

			.divider {
				height: 1px;
				background: var(--border);
				width: 100%;
			}

			/* value summary (total / processing / target) */
			.valsummary {
				background: #f8fbff;
				border: 1px solid var(--border);
				border-radius: 12px;
				padding: 18px 22px;
				margin: 16px 0 18px;
			}
			.vs-head {
				display: flex;
				align-items: flex-end;
				justify-content: space-between;
				gap: 16px;
				flex-wrap: wrap;
			}
			.vs-lbl {
				display: block;
				font-weight: 600;
				font-size: 12px;
				color: var(--muted);
				text-transform: uppercase;
				letter-spacing: 0.05em;
				margin-bottom: 5px;
			}
			.vs-amt {
				font-weight: 800;
				font-size: 28px;
				line-height: 1;
			}
			.vs-amt.grad {
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}
			.vs-track {
				height: 14px;
				border-radius: 8px;
				background: var(--bg);
				overflow: hidden;
				margin: 16px 0 7px;
			}
			.vs-fill {
				height: 100%;
				border-radius: 8px;
				background: var(--grad);
				transition: width 0.55s ease;
			}
			.vs-cap {
				font-weight: 500;
				font-size: 12px;
				color: var(--muted);
			}
			.vs-cap b {
				font-weight: 800;
				color: var(--dark);
			}
			.vs-subs {
				display: flex;
				gap: 30px;
				margin-top: 14px;
				flex-wrap: wrap;
			}
			.vs-sub {
				display: flex;
				align-items: center;
				gap: 9px;
			}
			.vs-sub .dot {
				width: 9px;
				height: 9px;
				border-radius: 50%;
				flex: 0 0 auto;
			}
			.vs-sub .dot.pend {
				background: #f5a623;
			}
			.vs-sub .dot.real {
				background: #27ae60;
			}
			.vs-sub .dot.tgt {
				background: var(--dark);
			}
			.vs-sub .k {
				font-weight: 500;
				font-size: 12px;
				color: var(--muted);
			}
			.vs-sub .v {
				font-weight: 700;
				font-size: 15px;
				color: var(--text);
			}

			/* purchase orders table */
			.visit-table {
				margin-top: 4px;
			}
			.v-rowwrap {
				border-bottom: 1px solid #f4f6f9;
			}
			.v-row {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 12px 8px;
				cursor: pointer;
				transition: background 0.2s ease;
				border-radius: 8px;
			}
			.v-row:hover {
				background: #f8fbff;
			}
			.v-oid {
				font-weight: 700;
				font-size: 14px;
				color: var(--dark);
				min-width: 100px;
			}
			.v-store {
				font-weight: 500;
				font-size: 13px;
				color: var(--text);
				flex: 1.5;
				min-width: 150px;
				display: flex;
				flex-direction: column;
				gap: 2px;
				overflow: hidden;
			}
			.v-store .vs-co {
				font-weight: 600;
				font-size: 13.5px;
				color: var(--text);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.v-store .vs-proj {
				font-weight: 400;
				font-size: 12px;
				color: var(--muted);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.v-date {
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				min-width: 80px;
			}
			.v-delivery {
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				min-width: 100px;
			}
			.v-value {
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				min-width: 100px;
			}
			.v-salesman {
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				min-width: 80px;
			}
			.v-status {
				font-weight: 600;
				font-size: 13px;
				min-width: 70px;
			}
			.v-status.outstanding {
				color: #1ca7ec;
			}
			.v-status.due2w {
				color: #f5a623;
			}
			.v-status.overdue {
				color: #fe2c23;
			}
			.v-status.paid {
				color: #27ae60;
			}
			.v-view {
				font-weight: 600;
				font-size: 13px;
				color: var(--blue);
				cursor: pointer;
				min-width: 40px;
				text-align: right;
			}
			.v-view:hover {
				text-decoration: underline;
			}
			.v-rowwrap.open .v-oid,
			.v-rowwrap.open .v-store .vs-co,
			.v-rowwrap.open .v-view {
				background: var(--grad);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}
			@media (max-width: 1320px) {
				.v-delivery {
					display: none;
				}
			}
			@media (max-width: 1120px) {
				.v-date {
					display: none;
				}
			}
			@media (max-width: 960px) {
				.v-salesman {
					display: none;
				}
			}

			/* expanded panel */
			.v-expand {
				overflow: hidden;
				height: 0;
				opacity: 0;
			}
			.v-expand-inner {
				background: #f8fbff;
				border: 1px solid var(--border);
				border-top: none;
				border-radius: 0 0 12px 12px;
				padding: 24px 28px;
				display: flex;
				gap: 32px;
			}
			.v-ex-left {
				flex: 0 0 45%;
			}
			.v-ex-id {
				font-weight: 800;
				font-size: 22px;
				color: var(--dark);
				margin-bottom: 12px;
			}
			.v-ex-store {
				font-weight: 700;
				font-size: 16px;
				color: var(--text);
			}
			.v-ex-addrlabel {
				font-weight: 500;
				font-style: italic;
				font-size: 13px;
				color: var(--muted);
				margin-top: 4px;
			}
			.v-ex-addr {
				font-weight: 400;
				font-size: 13px;
				color: var(--text);
				line-height: 1.6;
				margin-bottom: 16px;
			}
			.v-ex-meta {
				font-weight: 400;
				font-size: 13px;
				color: var(--text);
				line-height: 1.9;
			}
			.v-ex-pill {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				margin-top: 12px;
				padding: 6px 20px;
				border-radius: 100px;
				color: #fff;
				font-weight: 700;
				font-size: 13px;
			}
			.v-ex-pill .pdot {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background: rgba(0, 0, 0, 0.28);
			}
			.v-ex-pill.outstanding {
				background: #1ca7ec;
			}
			.v-ex-pill.due2w {
				background: #f5a623;
			}
			.v-ex-pill.overdue {
				background: #fe2c23;
			}
			.v-ex-pill.paid {
				background: #27ae60;
			}
			.v-ex-substatus {
				display: flex;
				flex-direction: column;
				gap: 2px;
				margin-top: 12px;
			}
			.v-ex-substatus .sk {
				font-weight: 500;
				font-size: 12px;
				color: var(--muted);
				text-transform: uppercase;
				letter-spacing: 0.06em;
			}
			.v-ex-substatus .sv {
				font-weight: 700;
				font-size: 14px;
			}
			.v-ex-substatus .sv.outstanding {
				color: #1ca7ec;
			}
			.v-ex-substatus .sv.due2w {
				color: #f5a623;
			}
			.v-ex-substatus .sv.overdue {
				color: #fe2c23;
			}
			.v-ex-substatus .sv.paid {
				color: #27ae60;
			}
			/* Tanda Terima tracker (PO rows only) */
			.tt-block {
				margin-top: 18px;
				border-top: 1px solid
					var(--border);
				padding-top: 14px;
			}
			.tt-title {
				font-weight: 600;
				font-size: 12px;
				color: var(--muted);
				text-transform: uppercase;
				letter-spacing: 0.06em;
				margin-bottom: 10px;
			}
			.tt-step {
				display: flex;
				align-items: center;
				gap: 11px;
				padding: 6px 0;
			}
			.tt-dot {
				width: 13px;
				height: 13px;
				border-radius: 50%;
				flex: 0 0 auto;
				border: 2px solid #e0e0e0;
				background: #fff;
			}
			.tt-step.done .tt-dot {
				background: var(--grad);
				border-color: transparent;
			}
			.tt-step.pending .tt-dot {
				background: #fff;
				border-color: #e0e0e0;
			}
			.tt-label {
				font-weight: 600;
				font-size: 13px;
				color: var(--text);
				flex: 1;
			}
			.tt-step.pending .tt-label {
				color: var(--muted);
			}
			.tt-step.done .tt-label {
				color: var(--dark);
			}
			.tt-date {
				font-weight: 500;
				font-size: 12px;
				color: var(--muted);
			}
			.tt-step.done .tt-date {
				color: var(--blue);
				font-weight: 700;
			}
			.tt-step.pending .tt-date {
				font-style: italic;
			}
			/* reminder / collection follow-up (expanded card) */
			.rm-block {
				margin-top: 18px;
				border-top: 1px solid
					var(--border);
				padding-top: 14px;
			}
			.rm-head {
				display: flex;
				align-items: center;
				gap: 10px;
				flex-wrap: wrap;
				margin-bottom: 14px;
			}
			.rm-pill {
				display: inline-flex;
				align-items: center;
				gap: 7px;
				font-weight: 700;
				font-size: 12px;
				padding: 5px 12px;
				border-radius: 100px;
				color: #fff;
			}
			.rm-pill .rm-dot {
				width: 7px;
				height: 7px;
				border-radius: 50%;
				background: #fff;
				opacity: 0.9;
			}
			.rm-none {
				background: #9aa7b6;
			}
			.rm-reminded {
				background: #f5a623;
			}
			.rm-promised {
				background: var(--blue);
			}
			.rm-disputed {
				background: var(--red);
			}
			.rm-meta {
				font-weight: 500;
				font-size: 12px;
				color: var(--muted);
			}
			.rm-seglabel {
				font-weight: 600;
				font-size: 11px;
				color: var(--muted);
				text-transform: uppercase;
				letter-spacing: 0.05em;
				margin-bottom: 8px;
			}
			.rm-seg {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				margin-bottom: 16px;
			}
			.rm-opt {
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 12px;
				color: var(--muted);
				background: #fff;
				border: 1px solid var(--border);
				border-radius: 100px;
				padding: 6px 14px;
				cursor: pointer;
				transition: 0.18s;
			}
			.rm-opt:hover {
				border-color: var(--blue);
				color: var(--blue);
			}
			.rm-opt.sel {
				color: #fff;
				border-color: transparent;
			}
			.rm-opt.rm-none.sel {
				background: #9aa7b6;
			}
			.rm-opt.rm-reminded.sel {
				background: #f5a623;
			}
			.rm-opt.rm-promised.sel {
				background: var(--blue);
			}
			.rm-opt.rm-disputed.sel {
				background: var(--red);
			}
			.rm-actions {
				display: flex;
				gap: 10px;
				flex-wrap: wrap;
			}
			.rm-send {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 700;
				font-size: 13px;
				color: #fff;
				background: #25d366;
				border: none;
				border-radius: 9px;
				padding: 10px 16px;
				cursor: pointer;
				transition: 0.18s;
				box-shadow: 0 2px 8px
					rgba(37, 211, 102, 0.25);
			}
			.rm-send:hover {
				filter: brightness(0.95);
				transform: translateY(-1px);
			}
			.rm-send.alt {
				background: var(--grad);
				box-shadow: 0 2px 8px
					rgba(28, 167, 236, 0.25);
			}
			.rm-send svg {
				flex: 0 0 auto;
			}
			/* sent confirmation toast */
			.ar-toast {
				position: fixed;
				left: 50%;
				bottom: 30px;
				transform: translate(
					-50%,
					20px
				);
				display: flex;
				align-items: center;
				gap: 9px;
				background: var(--dark);
				color: #fff;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 600;
				font-size: 13px;
				padding: 12px 18px;
				border-radius: 10px;
				box-shadow: 0 10px 30px
					rgba(18, 21, 103, 0.32);
				opacity: 0;
				pointer-events: none;
				transition:
					opacity 0.25s,
					transform 0.25s;
				z-index: 1000;
			}
			.ar-toast.show {
				opacity: 1;
				transform: translate(-50%, 0);
			}
			.ar-toast svg {
				flex: 0 0 auto;
				color: #25d366;
			}
			/* source badge (Retail / Project) */
			.ar-src {
				display: inline-block;
				font-weight: 700;
				font-size: 9px;
				text-transform: uppercase;
				letter-spacing: 0.04em;
				padding: 2px 6px;
				border-radius: 4px;
				color: #fff;
				margin-right: 7px;
				vertical-align: 1px;
			}
			.ar-src.retail {
				background: #1ca7ec;
			}
			.ar-src.project {
				background: #121567;
			}
			.v-ex-right {
				flex: 1;
				min-width: 0;
			}
			.li-row {
				display: flex;
				align-items: flex-start;
				gap: 12px;
				padding: 8px 0;
				border-bottom: 1px solid
					var(--border);
			}
			.li-main {
				flex: 1;
				min-width: 0;
			}
			.li-name {
				font-weight: 600;
				font-size: 14px;
				color: var(--text);
			}
			.li-unit {
				font-weight: 400;
				font-size: 12px;
				color: var(--muted);
				margin-top: 2px;
			}
			.li-qty {
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				min-width: 30px;
				text-align: center;
			}
			.li-total {
				font-weight: 600;
				font-size: 14px;
				color: var(--text);
				min-width: 110px;
				text-align: right;
			}
			.li-totalrow {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 8px;
			}
			.li-totalrow .tl {
				font-weight: 700;
				font-size: 15px;
				color: var(--text);
			}
			.li-totalrow .tv {
				font-weight: 800;
				font-size: 15px;
				color: var(--dark);
			}
			.v-ex-desc {
				margin-top: 16px;
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				line-height: 1.7;
				text-align: right;
			}
			/* collection assignee + note (under description) */
			.vc-block {
				margin-top: 16px;
				padding-top: 16px;
				border-top: 1px solid
					var(--border);
				text-align: left;
			}
			.vc-head {
				display: flex;
				align-items: center;
				gap: 11px;
				margin-bottom: 11px;
			}
			.vc-avatar {
				flex: 0 0 34px;
				width: 34px;
				height: 34px;
				border-radius: 50%;
				background: var(--grad);
				color: #fff;
				font-weight: 700;
				font-size: 14px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.vc-meta {
				display: flex;
				flex-direction: column;
				gap: 1px;
			}
			.vc-label {
				font-weight: 600;
				font-size: 10px;
				color: var(--muted);
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
			.vc-name {
				font-weight: 700;
				font-size: 14px;
				color: var(--dark);
			}
			.vc-note {
				position: relative;
				background: #f8fbff;
				border: 1px solid var(--border);
				border-radius: 10px;
				padding: 12px 14px 26px;
				font-size: 13px;
				line-height: 1.6;
				color: var(--text);
			}
			.vc-notemark {
				font-family: Georgia, serif;
				font-size: 22px;
				font-weight: 700;
				color: var(--blue);
				margin-right: 4px;
				line-height: 0;
				vertical-align: -4px;
			}
			.vc-notedate {
				position: absolute;
				right: 14px;
				bottom: 9px;
				font-size: 11px;
				font-weight: 600;
				color: var(--muted);
			}
			.vc-note.empty {
				color: var(--muted);
				font-style: italic;
				padding: 12px 14px;
			}
			.vc-avatar.empty {
				background: #eef1f5;
				color: #9aa7b6;
			}
			.vc-name.muted {
				color: var(--muted);
				font-weight: 600;
			}
			.vc-head .vc-btn {
				margin-left: auto;
			}
			.vc-btn {
				font-family:
					'Montserrat', sans-serif;
				font-weight: 700;
				font-size: 12px;
				border-radius: 8px;
				padding: 7px 13px;
				cursor: pointer;
				border: 1px solid var(--border);
				background: #fff;
				color: var(--text);
				transition: 0.18s;
				white-space: nowrap;
			}
			.vc-btn:hover {
				border-color: var(--blue);
				color: var(--blue);
			}
			.vc-btn.primary {
				background: var(--grad);
				border-color: transparent;
				color: #fff;
			}
			.vc-btn.primary:hover {
				filter: brightness(1.07);
				color: #fff;
			}
			.vc-edit {
				display: flex;
				gap: 8px;
				align-items: center;
				flex-wrap: wrap;
				margin-top: 8px;
			}
			.vc-select {
				flex: 1;
				min-width: 150px;
				font-family:
					'Montserrat', sans-serif;
				font-size: 13px;
				color: var(--text);
				border: 1px solid var(--border);
				border-radius: 8px;
				padding: 9px 11px;
				outline: none;
				background: #fff;
			}
			.vc-select:focus {
				border-color: var(--blue);
			}
			.vc-prev {
				font-size: 12px;
				color: var(--muted);
				margin-bottom: 10px;
			}
			.vc-prev b {
				color: var(--text);
				font-weight: 700;
			}

			.pagination {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				gap: 8px;
				margin-top: 20px;
				flex-wrap: wrap;
			}
			.pg-info {
				font-weight: 400;
				font-size: 13px;
				color: var(--muted);
				margin-right: 8px;
			}
			.pg-btn {
				height: 30px;
				padding: 0 14px;
				border: 1px solid var(--border);
				background: #fff;
				border-radius: 6px;
				cursor: pointer;
				font-family:
					'Montserrat', sans-serif;
				font-weight: 500;
				font-size: 13px;
				color: var(--muted);
				transition: 0.2s;
			}
			.pg-btn:hover:not(.active) {
				border-color: var(--blue);
				color: var(--blue);
			}
			.pg-btn.active {
				background: var(--grad);
				border-color: transparent;
				color: #fff;
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
					selected: 1,
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

			/* ====================== ACCOUNTS RECEIVABLE ====================== */
			const SP_PENDING = [
				{ n: 1, pending: 32 },
				{ n: 2, pending: 21 },
				{ n: 3, pending: 44 },
				{ n: 4, pending: 18 },
				{ n: 5, pending: 27 },
			];

			const STATUS_LABEL = {
				outstanding: 'Outstanding',
				due2w: 'Due in 2 Weeks',
				overdue: 'Overdue',
				paid: 'Paid',
			};
			const STORES = [
				'TB. Makmur Jaya',
				'TB. Sinar Abadi',
				'TB. Berkah Mandiri',
				'TB. Cahaya Baru',
				'TB. Sumber Rezeki',
				'TB. Harapan Kita',
				'TB. Subur Makmur',
				'TB. Sentosa Jaya',
			];
			const CLIENTS = [
				'PT Wijaya Karya',
				'PT Pembangunan Perumahan',
				'PT Adhi Karya',
				'PT Total Bangun Persada',
				'PT Nindya Karya',
				'PT Waskita Karya',
				'PT Hutama Karya',
				'PT Acset Indonusa',
			];
			const PROJ_NAMES = [
				'Apartemen Green Park Tower',
				'Gudang Logistik MM2100',
				'Pabrik Tekstil Cikupa',
				'Hotel Grand Serpong',
				'RS Medika Tangerang',
				'Mall Cibubur Junction',
				'Gedung Kantor BSD City',
				'Sekolah Citra Raya',
				'Pabrik Makanan Balaraja',
				'Cold Storage Marunda',
				'Apartemen Sky House',
				'Gudang Pendingin Cikarang',
				'Masjid Agung Karawaci',
				'Pabrik Otomotif Cibitung',
				'Data Center Lippo Village',
			];
			const ADDR = [
				'JL. Dipati Unus 25, Cibodas, Tangerang, Banten, 11254',
				'JL. Daan Mogot 88, Batuceper, Tangerang, Banten, 15122',
				'JL. KH. Hasyim 14, Karawaci, Tangerang, Banten, 15810',
				'JL. Imam Bonjol 7, Cikokol, Tangerang, Banten, 15117',
			];
			const STATUSES = [
				'outstanding',
				'due2w',
				'overdue',
				'paid',
				'outstanding',
				'due2w',
				'paid',
				'overdue',
			];
			const SUBSTATUS = {
				outstanding: [
					'Invoice Sent',
					'Awaiting Payment',
					'Partial Payment',
				],
				due2w: [
					'Due in 14 Days',
					'Due in 10 Days',
					'Reminder Scheduled',
				],
				overdue: [
					'Overdue 15 Days',
					'Overdue 30 Days',
					'Reminder Sent',
				],
				paid: [
					'Paid in Full',
					'Settled',
				],
			};
			const PRODNAMES = [
				'Rockwool RW80',
				'Glasswool GW24',
				'PU Panel 50mm',
				'Cement Board 9mm',
				'Acoustic Tile',
			];
			const COLLECTORS = [
				'Andi Saputra',
				'Budi Hartono',
				'Citra Lestari',
				'Dewi Anggraini',
				'Eka Pratama',
			];
			const COL_NOTES = [
				'Sudah ditelpon, klien minta perpanjangan 7 hari. Akan transfer sebagian minggu ini.',
				'Kunjungan langsung ke kantor klien. Bag. finance konfirmasi invoice masuk proses pembayaran.',
				'Klien menunggu TT ditandatangani PM. Follow up ulang setelah dokumen lengkap.',
				'Pembayaran sebagian sudah diterima, sisa dijadwalkan akhir bulan sesuai T.O.P.',
				'Belum ada respon via WhatsApp, akan dikunjungi langsung Senin depan.',
			];
			const DESC =
				'Catatan AR: tagihan diterbitkan setelah barang diterima, jatuh tempo mengikuti T.O.P yang disepakati. Penagihan dikoordinasikan oleh tim kolektor; pembayaran sebagian dicatat sebagai partial. Mohon lampirkan bukti transfer dan faktur pajak saat konfirmasi pelunasan.';

			function rupiah(n) {
				return (
					'Rp ' +
					n.toLocaleString('en-US')
				);
			}

			/* combined receivables: Retail orders + Project POs in one list */
			const AR = Array.from(
				{ length: 16 },
				function (_, i) {
					const isRetail = i % 2 === 0;
					const sp = (i % 5) + 1;
					const status =
						STATUSES[i % 8];
					const items = Array.from(
						{ length: 5 },
						function (_, j) {
							const qty =
								((i + j) % 4) + 1;
							const unit =
								(j + 2) * 1250000;
							return {
								name: PRODNAMES[j],
								qty: qty,
								unit: unit,
								total: qty * unit,
							};
						},
					);
					const total = items.reduce(
						function (s, it) {
							return s + it.total;
						},
						0,
					);
					const ttPhase = isRetail
						? -1
						: Math.floor(i / 2) % 3; // 0 grey · 1 shipped/waiting · 2 TT issued
					const ttIssued =
						!isRetail &&
						(status === 'paid' ||
							ttPhase === 2);
					const shipped =
						!isRetail &&
						(ttIssued || ttPhase >= 1);
					return {
						id:
							(isRetail
								? 'DKI2500'
								: 'PO2500') +
							(65 + i),
						source: isRetail
							? 'Retail'
							: 'Project',
						client: isRetail
							? STORES[
									i % STORES.length
								]
							: CLIENTS[
									i % CLIENTS.length
								],
						subject: isRetail
							? 'Retail Order'
							: PROJ_NAMES[
									i % PROJ_NAMES.length
								],
						date:
							'0' +
							((i % 9) + 1) +
							'/05/2026',
						delivery:
							'1' +
							(i % 9) +
							'/06/2026',
						value: total,
						sp: sp,
						status: status,
						substatus:
							SUBSTATUS[status][
								i %
									SUBSTATUS[status]
										.length
							],
						addr: ADDR[i % ADDR.length],
						dateAdded:
							'2026/05/0' +
							((i % 9) + 1),
						deliveryFull:
							'2026/06/1' + (i % 9),
						top:
							[30, 45, 60][i % 3] + 'd',
						items: items,
						total: total,
						shipped: shipped,
						shippedDate:
							'2026/05/' +
							(
								'0' +
								(((i * 2) % 25) + 1)
							).slice(-2),
						ttIssued: ttIssued,
						ttDate:
							'2026/05/' +
							(
								'0' +
								(((i * 2) % 25) + 5)
							).slice(-2),
						remindStatus:
							status === 'paid'
								? 'none'
								: [
										'none',
										'reminded',
										'promised',
										'reminded',
										'disputed',
									][i % 5],
						remindCount:
							status === 'paid'
								? 0
								: i % 4,
						lastRemind:
							i % 4
								? '2026/06/0' +
									((i % 9) + 1)
								: '',
						collector:
							i % 3 === 2
								? ''
								: COLLECTORS[
										i %
											COLLECTORS.length
									],
						prevCollector: '',
						collectorNote:
							status === 'paid' ||
							i % 3 === 2
								? ''
								: i % 3
									? COL_NOTES[
											i %
												COL_NOTES.length
										]
									: '',
						noteDate:
							'2026/06/0' +
							((i % 9) + 1),
					};
				},
			);

			const activeSP = new Set([
				1, 2, 3, 4, 5,
			]);
			let curStatus = 'all';
			let openRow = null;

			function applyFilters() {
				AR.forEach(function (o) {
					const r =
						document.querySelector(
							'.v-rowwrap[data-id="' +
								o.id +
								'"]',
						);
					if (!r) return;
					const show =
						activeSP.has(o.sp) &&
						(curStatus === 'all' ||
							o.status === curStatus);
					const shown =
						r.style.display !== 'none';
					if (show && !shown) {
						r.style.display = '';
						gsap.fromTo(
							r,
							{ opacity: 0 },
							{
								opacity: 1,
								duration: 0.3,
							},
						);
					} else if (!show && shown) {
						gsap.to(r, {
							opacity: 0,
							duration: 0.3,
							onComplete: function () {
								r.style.display =
									'none';
							},
						});
					}
				});
			}

			/* ---- value summary (total / outstanding / collected / target) ---- */
			const PENDING_STATUSES = [
					'outstanding',
					'due2w',
					'overdue',
				],
				VS_TITLE = 'Total Receivables',
				VS_PENDLABEL =
					'Outstanding Value';
			const REALIZED_STATUS = 'paid',
				VS_REALLABEL =
					'Collected Value';
			const FULL_TOTAL = AR.reduce(
				function (s, o) {
					return s + o.value;
				},
				0,
			);
			const FULL_TARGET =
				Math.ceil(
					(FULL_TOTAL * 1.25) / 1e7,
				) * 1e7;
			function renderValueSummary() {
				var act = AR.filter(
					function (o) {
						return activeSP.has(o.sp);
					},
				);
				var total = act.reduce(
					function (s, o) {
						return s + o.value;
					},
					0,
				);
				var pending = act
					.filter(function (o) {
						return (
							PENDING_STATUSES.indexOf(
								o.status,
							) >= 0
						);
					})
					.reduce(function (s, o) {
						return s + o.value;
					}, 0);
				var realized = act
					.filter(function (o) {
						return (
							o.status ===
							REALIZED_STATUS
						);
					})
					.reduce(function (s, o) {
						return s + o.value;
					}, 0);
				var target = Math.round(
					FULL_TARGET *
						(activeSP.size / 5),
				);
				var pct = target
					? Math.min(
							100,
							Math.round(
								(total / target) * 100,
							),
						)
					: 0;
				$('valSummary').innerHTML =
					'<div class="vs-head"><div><span class="vs-lbl">' +
					VS_TITLE +
					'</span><span class="vs-amt grad">' +
					rupiah(total) +
					'</span></div></div>' +
					'<div class="vs-track"><div class="vs-fill" style="width:' +
					pct +
					'%"></div></div>' +
					'<div class="vs-cap"><b>' +
					pct +
					'%</b> of target</div>' +
					'<div class="vs-subs">' +
					'<div class="vs-sub"><span class="dot pend"></span><span class="k">' +
					VS_PENDLABEL +
					'</span><span class="v">' +
					rupiah(pending) +
					'</span></div>' +
					'<div class="vs-sub"><span class="dot real"></span><span class="k">' +
					VS_REALLABEL +
					'</span><span class="v">' +
					rupiah(realized) +
					'</span></div>' +
					'<div class="vs-sub"><span class="dot tgt"></span><span class="k">Target</span><span class="v">' +
					rupiah(target) +
					'</span></div>' +
					'</div>';
			}

			/* ---- salesperson summary cards ---- */
			function renderSummary() {
				$('summaryRow').innerHTML =
					SP_PENDING.map(function (s) {
						return (
							'<div class="sum-card" data-sp="' +
							s.n +
							'">' +
							'<div class="sum-top"><div class="sum-avatar">S' +
							s.n +
							'</div><div class="sum-name">Sales ' +
							s.n +
							'</div></div>' +
							'<div class="sum-stat"><span class="k">Outstanding</span><span class="v">' +
							s.pending +
							'</span></div>' +
							'</div>'
						);
					}).join('');
				gsap.from(
					'#summaryRow .sum-card',
					{
						opacity: 0,
						y: 12,
						duration: 0.4,
						stagger: 0.06,
						ease: 'power2.out',
					},
				);
			}

			/* ---- salesperson filter ---- */
			function renderFilter() {
				$('spFilter').innerHTML = [
					1, 2, 3, 4, 5,
				]
					.map(function (n) {
						return (
							'<button class="sp-pill active" data-sp="' +
							n +
							'"><span class="dot"></span>Sales ' +
							n +
							'</button>'
						);
					})
					.join('');
				$('spFilter').addEventListener(
					'click',
					function (e) {
						const b =
							e.target.closest(
								'.sp-pill',
							);
						if (!b) return;
						const n = +b.dataset.sp;
						const on =
							b.classList.toggle(
								'active',
							);
						if (on) activeSP.add(n);
						else activeSP.delete(n);
						const card = $(
							'summaryRow',
						).querySelector(
							'.sum-card[data-sp="' +
								n +
								'"]',
						);
						if (card)
							collapseCard(card, on);
						renderValueSummary();
						applyFilters();
					},
				);
			}
			function collapseCard(
				card,
				show,
			) {
				gsap.killTweensOf(card);
				if (show) {
					card.style.display = '';
					card.style.flex = '0 0 auto';
					gsap.set(card, {
						width: 'auto',
						opacity: 1,
						paddingLeft: 16,
						paddingRight: 16,
					});
					const w = card.offsetWidth;
					gsap.fromTo(
						card,
						{
							width: 0,
							opacity: 0,
							paddingLeft: 0,
							paddingRight: 0,
						},
						{
							width: w,
							opacity: 1,
							paddingLeft: 16,
							paddingRight: 16,
							duration: 0.3,
							ease: 'power2.out',
							onComplete: function () {
								card.style.flex =
									'1 1 0';
								card.style.width = '';
							},
						},
					);
				} else {
					card.style.flex = '0 0 auto';
					const w = card.offsetWidth;
					gsap.fromTo(
						card,
						{ width: w, opacity: 1 },
						{
							width: 0,
							opacity: 0,
							paddingLeft: 0,
							paddingRight: 0,
							duration: 0.3,
							ease: 'power2.in',
							onComplete: function () {
								card.style.display =
									'none';
							},
						},
					);
				}
			}

			/* ---- status filter (radio) ---- */
			function renderStatusFilter() {
				const opts = [
					{ k: 'all', l: 'All' },
					{
						k: 'outstanding',
						l: 'Outstanding',
					},
					{
						k: 'due2w',
						l: 'Due in 2 Weeks',
					},
					{
						k: 'overdue',
						l: 'Overdue',
					},
					{ k: 'paid', l: 'Paid' },
				];
				$('statusFilter').innerHTML =
					opts
						.map(function (o) {
							return (
								'<button class="sf-pill' +
								(o.k === 'all'
									? ' active'
									: '') +
								'" data-status="' +
								o.k +
								'">' +
								o.l +
								'</button>'
							);
						})
						.join('');
				$(
					'statusFilter',
				).addEventListener(
					'click',
					function (e) {
						const b =
							e.target.closest(
								'.sf-pill',
							);
						if (!b) return;
						$('statusFilter')
							.querySelectorAll(
								'.sf-pill',
							)
							.forEach(function (x) {
								x.classList.remove(
									'active',
								);
							});
						b.classList.add('active');
						curStatus =
							b.dataset.status;
						applyFilters();
					},
				);
			}

			/* ---- receivables table ---- */
			function renderTable() {
				$('arTable').innerHTML = AR.map(
					function (o) {
						return (
							'<div class="v-rowwrap" data-sp="' +
							o.sp +
							'" data-id="' +
							o.id +
							'">' +
							'<div class="v-row">' +
							'<div class="v-oid">' +
							o.id +
							'</div>' +
							'<div class="v-store"><span class="vs-co">' +
							o.client +
							'</span><span class="vs-proj"><span class="ar-src ' +
							o.source.toLowerCase() +
							'">' +
							o.source +
							'</span>' +
							o.subject +
							'</span></div>' +
							'<div class="v-date">' +
							o.date +
							'</div>' +
							'<div class="v-delivery">' +
							o.delivery +
							'</div>' +
							'<div class="v-value">' +
							rupiah(o.value) +
							'</div>' +
							'<div class="v-salesman">Sales ' +
							o.sp +
							'</div>' +
							'<div class="v-status ' +
							o.status +
							'">' +
							STATUS_LABEL[o.status] +
							'</div>' +
							'<div class="v-view">View</div>' +
							'</div>' +
							'<div class="v-expand" id="exp-' +
							o.id +
							'"></div>' +
							'</div>'
						);
					},
				).join('');
				$('arTable').addEventListener(
					'click',
					function (e) {
						const wrap =
							e.target.closest(
								'.v-rowwrap',
							);
						if (!wrap) return;
						if (
							e.target.closest(
								'.v-expand',
							)
						)
							return;
						toggleExpand(
							wrap.dataset.id,
						);
					},
				);
			}
			var ICON_WA =
				'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.07-1.33A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.08-1.12l-.29-.17-3 .79.8-2.93-.19-.3A8 8 0 1 1 12 20Zm4.4-5.6c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.55 6.55 0 0 1-1.93-1.19 7.3 7.3 0 0 1-1.34-1.66c-.14-.24 0-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>';
			var ICON_MAIL =
				'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
			function expandHTML(o) {
				const items = o.items
					.map(function (it) {
						return (
							'<div class="li-row"><div class="li-main"><div class="li-name">' +
							it.name +
							'</div>' +
							'<div class="li-unit">' +
							rupiah(it.unit) +
							' / pc</div></div>' +
							'<div class="li-qty">x' +
							it.qty +
							'</div>' +
							'<div class="li-total">' +
							rupiah(it.total) +
							'</div></div>'
						);
					})
					.join('');
				var tt = '';
				if (o.source === 'Project') {
					var delivered =
						'<div class="tt-step done"><span class="tt-dot"></span><span class="tt-label">Goods Delivered</span><span class="tt-date">' +
						o.shippedDate +
						'</span></div>';
					var rec = o.ttIssued;
					var ttrow =
						'<div class="tt-step ' +
						(rec ? 'done' : 'pending') +
						'"><span class="tt-dot"></span><span class="tt-label">' +
						(rec
							? 'TT Received'
							: 'Waiting for TT') +
						'</span><span class="tt-date">' +
						(rec ? o.ttDate : '') +
						'</span></div>';
					tt =
						'<div class="tt-block"><div class="tt-title">Tanda Terima</div>' +
						delivered +
						ttrow +
						'</div>';
				}
				/* reminder / collection follow-up */
				var RLABEL = {
					none: 'Not Reminded',
					reminded: 'Reminder Sent',
					promised: 'FU (Followed Up)',
					disputed: 'Disputed',
				};
				var rs =
					o.remindStatus || 'none';
				var meta = o.remindCount
					? '<span class="rm-meta">' +
						o.remindCount +
						'\u00D7 sent' +
						(o.lastRemind
							? ' \u00B7 last ' +
								o.lastRemind
							: '') +
						'</span>'
					: '<span class="rm-meta">No reminders yet</span>';
				var seg = [
					'none',
					'reminded',
					'promised',
					'disputed',
				]
					.map(function (k) {
						return (
							'<button class="rm-opt rm-' +
							k +
							(rs === k ? ' sel' : '') +
							'" onclick="arSetRemind(\'' +
							o.id +
							"','" +
							k +
							'\')">' +
							RLABEL[k] +
							'</button>'
						);
					})
					.join('');
				var rm =
					'<div class="rm-block">' +
					'<div class="tt-title">Reminder</div>' +
					'<div class="rm-head"><span class="rm-pill rm-' +
					rs +
					'"><span class="rm-dot"></span>' +
					RLABEL[rs] +
					'</span>' +
					meta +
					'</div>' +
					'<div class="rm-seglabel">Update status</div>' +
					'<div class="rm-seg">' +
					seg +
					'</div>' +
					'<div class="rm-actions">' +
					'<button class="rm-send" onclick="arSendReminder(\'' +
					o.id +
					"','wa')\">" +
					ICON_WA +
					'Send via WhatsApp</button>' +
					'<button class="rm-send alt" onclick="arSendReminder(\'' +
					o.id +
					"','email')\">" +
					ICON_MAIL +
					'Email</button>' +
					'</div>' +
					'</div>';
				return (
					'<div class="v-expand-inner">' +
					'<div class="v-ex-left">' +
					'<div class="v-ex-id">#' +
					o.id +
					'</div>' +
					'<div class="v-ex-store">' +
					o.client +
					'</div>' +
					'<div class="v-ex-addrlabel">Source</div>' +
					'<div class="v-ex-addr">' +
					(o.source === 'Project'
						? 'Project PO \u00B7 ' +
							o.subject
						: 'Retail Order') +
					'</div>' +
					'<div class="v-ex-meta">Sales ' +
					o.sp +
					'<br>Invoice date: ' +
					o.dateAdded +
					'<br>Due date: ' +
					o.deliveryFull +
					'<br>T.O.P: ' +
					o.top +
					'<br>' +
					o.addr +
					'</div>' +
					'<div class="v-ex-pill ' +
					o.status +
					'"><span class="pdot"></span>' +
					STATUS_LABEL[o.status] +
					'</div>' +
					'<div class="v-ex-substatus"><span class="sk">Status Detail</span><span class="sv ' +
					o.status +
					'">' +
					o.substatus +
					'</span></div>' +
					tt +
					rm +
					'</div>' +
					'<div class="v-ex-right">' +
					items +
					'<div class="li-totalrow"><span class="tl">Receivable Total</span><span class="tv">' +
					rupiah(o.total) +
					'</span></div>' +
					'<div class="v-ex-desc">' +
					DESC +
					'</div>' +
					vcBlock(o) +
					'</div>' +
					'</div>'
				);
			}
			/* ---- collection assignee: select / transfer ---- */
			function vcBlock(o) {
				if (o._editAssignee) {
					var opts =
						COLLECTORS.map(
							function (c) {
								return (
									'<option' +
									(c === o.collector
										? ' selected'
										: '') +
									'>' +
									c +
									'</option>'
								);
							},
						).join('') +
						'<option value="__sales__">Sales \u2014 pemilik order (Sales ' +
						o.sp +
						')</option>' +
						'<option value="__manager__">Sales Manager (Hendra)</option>';
					var ttl = o.collector
						? 'Transfer ke penagih lain'
						: 'Pilih penagih';
					return (
						'<div class="vc-block"><div class="vc-label">' +
						ttl +
						'</div>' +
						'<div class="vc-edit"><select class="vc-select" id="asgSel-' +
						o.id +
						'">' +
						opts +
						'</select>' +
						'<button class="vc-btn primary" onclick="arSaveAssignee(\'' +
						o.id +
						'\')">Simpan</button>' +
						'<button class="vc-btn" onclick="arCancelAssignee(\'' +
						o.id +
						'\')">Batal</button></div></div>'
					);
				}
				if (!o.collector) {
					return (
						'<div class="vc-block"><div class="vc-head">' +
						'<span class="vc-avatar empty">?</span>' +
						'<div class="vc-meta"><span class="vc-label">Collection Assignee</span><span class="vc-name muted">Belum ditugaskan</span></div>' +
						'<button class="vc-btn primary" onclick="arPickAssignee(\'' +
						o.id +
						'\')">+ Pilih Penagih</button></div></div>'
					);
				}
				return (
					'<div class="vc-block"><div class="vc-head">' +
					'<span class="vc-avatar">' +
					o.collector.charAt(0) +
					'</span>' +
					'<div class="vc-meta"><span class="vc-label">Collection Assignee</span><span class="vc-name">' +
					o.collector +
					'</span></div>' +
					'<button class="vc-btn" onclick="arPickAssignee(\'' +
					o.id +
					'\')">Transfer</button></div>' +
					(o.prevCollector
						? '<div class="vc-prev">Dipindahkan dari <b>' +
							o.prevCollector +
							'</b></div>'
						: '') +
					(o.collectorNote
						? '<div class="vc-note"><span class="vc-notemark">\u201C</span>' +
							o.collectorNote +
							'<span class="vc-notedate">' +
							o.noteDate +
							'</span></div>'
						: '<div class="vc-note empty">Belum ada catatan dari kolektor.</div>') +
					'</div>'
				);
			}
			window.arPickAssignee = function (
				id,
			) {
				var o = AR.find(function (x) {
					return x.id === id;
				});
				if (!o) return;
				o._editAssignee = true;
				arRefresh(id);
			};
			window.arCancelAssignee =
				function (id) {
					var o = AR.find(function (x) {
						return x.id === id;
					});
					if (!o) return;
					o._editAssignee = false;
					arRefresh(id);
				};
			window.arSaveAssignee = function (
				id,
			) {
				var o = AR.find(function (x) {
					return x.id === id;
				});
				if (!o) return;
				var sel =
					document.getElementById(
						'asgSel-' + id,
					);
				var val = sel ? sel.value : '';
				if (val === '__sales__')
					val = 'Sales ' + o.sp;
				else if (val === '__manager__')
					val =
						'Hendra (Sales Manager)';
				var transferred =
					o.collector &&
					val &&
					val !== o.collector;
				if (transferred)
					o.prevCollector = o.collector;
				var wasEmpty = !o.collector;
				o.collector = val;
				o._editAssignee = false;
				arRefresh(id);
				arToast(
					wasEmpty
						? 'Penagih ditugaskan \u00B7 ' +
								val
						: transferred
							? 'Dialihkan ke ' +
								val +
								' (dari ' +
								o.prevCollector +
								')'
							: 'Penagih diperbarui',
				);
			};
			/* ---- reminder follow-up actions ---- */
			function arRefresh(id) {
				const panel =
					document.getElementById(
						'exp-' + id,
					);
				const o = AR.find(function (x) {
					return x.id === id;
				});
				if (!panel || !o) return;
				panel.innerHTML = expandHTML(o);
				gsap.set(panel, {
					height: 'auto',
				});
			}
			function arSetRemind(id, status) {
				const o = AR.find(function (x) {
					return x.id === id;
				});
				if (!o) return;
				o.remindStatus = status;
				arRefresh(id);
			}
			function arSendReminder(
				id,
				channel,
			) {
				const o = AR.find(function (x) {
					return x.id === id;
				});
				if (!o) return;
				o.remindCount =
					(o.remindCount || 0) + 1;
				const d = new Date();
				o.lastRemind =
					d.getFullYear() +
					'/' +
					(
						'0' +
						(d.getMonth() + 1)
					).slice(-2) +
					'/' +
					('0' + d.getDate()).slice(-2);
				if (o.remindStatus === 'none')
					o.remindStatus = 'reminded';
				arRefresh(id);
				arToast(
					'Reminder sent via ' +
						(channel === 'wa'
							? 'WhatsApp'
							: 'Email') +
						' \u00B7 ' +
						o.client,
				);
			}
			let arToastTimer = null;
			function arToast(msg) {
				let t =
					document.getElementById(
						'arToast',
					);
				if (!t) {
					t =
						document.createElement(
							'div',
						);
					t.id = 'arToast';
					t.className = 'ar-toast';
					document.body.appendChild(t);
				}
				t.innerHTML =
					ICON_WA +
					'<span>' +
					msg +
					'</span>';
				t.classList.add('show');
				clearTimeout(arToastTimer);
				arToastTimer = setTimeout(
					function () {
						t.classList.remove('show');
					},
					2600,
				);
			}

			function toggleExpand(id) {
				if (openRow === id) {
					closeExpand(id);
					openRow = null;
					return;
				}
				if (openRow !== null)
					closeExpand(openRow);
				const wrap =
					document.querySelector(
						'.v-rowwrap[data-id="' +
							id +
							'"]',
					);
				wrap.classList.add('open');
				const panel =
					document.getElementById(
						'exp-' + id,
					);
				const o = AR.find(function (x) {
					return x.id === id;
				});
				panel.innerHTML = expandHTML(o);
				gsap.set(panel, {
					height: 'auto',
				});
				const h = panel.offsetHeight;
				gsap.fromTo(
					panel,
					{ height: 0, opacity: 0 },
					{
						height: h,
						opacity: 1,
						duration: 0.4,
						ease: 'power2.out',
						onComplete: function () {
							gsap.set(panel, {
								height: 'auto',
							});
						},
					},
				);
				openRow = id;
			}
			function closeExpand(id) {
				const wrap =
					document.querySelector(
						'.v-rowwrap[data-id="' +
							id +
							'"]',
					);
				if (wrap)
					wrap.classList.remove('open');
				const panel =
					document.getElementById(
						'exp-' + id,
					);
				gsap.to(panel, {
					height: 0,
					opacity: 0,
					duration: 0.3,
					ease: 'power2.in',
					onComplete: function () {
						panel.innerHTML = '';
					},
				});
			}

			/* ---- date range pills ---- */
			document
				.querySelectorAll('.date-pill')
				.forEach(function (p) {
					const input =
						p.dataset.target === 'start'
							? $('dateStart')
							: $('dateEnd');
					p.addEventListener(
						'click',
						function () {
							if (input.showPicker) {
								try {
									input.showPicker();
								} catch (err) {
									input.focus();
								}
							} else input.focus();
						},
					);
					input.addEventListener(
						'change',
						function () {
							if (!input.value) return;
							const d = new Date(
								input.value,
							);
							const mm = String(
								d.getMonth() + 1,
							).padStart(2, '0');
							const dd = String(
								d.getDate(),
							).padStart(2, '0');
							p.textContent =
								mm + '/' + dd;
						},
					);
				});

			/* ---- monthly / weekly ---- */
			$('mwToggle').addEventListener(
				'click',
				function (e) {
					const b =
						e.target.closest('button');
					if (!b) return;
					$('mwToggle')
						.querySelectorAll('button')
						.forEach(function (x) {
							x.classList.remove(
								'active',
							);
						});
					b.classList.add('active');
				},
			);

			/* ---- view per page ---- */
			const PP = [10, 25, 50];
			let ppIdx = 0;
			$('perPage').addEventListener(
				'click',
				function () {
					ppIdx =
						(ppIdx + 1) % PP.length;
					$('perPage').textContent =
						PP[ppIdx];
					curPage = 1;
					renderPagination();
				},
			);

			/* ---- pagination ---- */
			const TOTAL = 120;
			let curPage = 1;
			function renderPagination() {
				const per = PP[ppIdx];
				const pages = Math.ceil(
					TOTAL / per,
				);
				if (curPage > pages)
					curPage = pages;
				const start =
					(curPage - 1) * per + 1;
				const end = Math.min(
					curPage * per,
					TOTAL,
				);
				let h =
					'<span class="pg-info">Showing ' +
					start +
					'-' +
					end +
					' of ' +
					TOTAL +
					'</span>';
				h +=
					'<button class="pg-btn" data-pg="prev">Prev</button>';
				for (
					let i = 1;
					i <= pages;
					i++
				) {
					h +=
						'<button class="pg-btn' +
						(i === curPage
							? ' active'
							: '') +
						'" data-pg="' +
						i +
						'">' +
						i +
						'</button>';
				}
				h +=
					'<button class="pg-btn" data-pg="next">Next</button>';
				$('pagination').innerHTML = h;
			}
			$('pagination').addEventListener(
				'click',
				function (e) {
					const b =
						e.target.closest('.pg-btn');
					if (!b) return;
					const per = PP[ppIdx];
					const pages = Math.ceil(
						TOTAL / per,
					);
					const v = b.dataset.pg;
					if (v === 'prev')
						curPage = Math.max(
							1,
							curPage - 1,
						);
					else if (v === 'next')
						curPage = Math.min(
							pages,
							curPage + 1,
						);
					else curPage = +v;
					renderPagination();
				},
			);

			/* ---- init + entrance ---- */
			renderSummary();
			renderValueSummary();
			renderFilter();
			renderStatusFilter();
			renderTable();
			renderPagination();
			gsap.from(
				'.main > .welcome, .export-row, .vcard',
				{
					opacity: 0,
					y: 16,
					duration: 0.5,
					stagger: 0.06,
					ease: 'power2.out',
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
			/* access-level: Staff sees only their own records (group totals stay visible) */
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
				if (!own) return; // supervisor / manager / superadmin: see all
				var idx = parseInt(
					String(own).replace(
						/\D/g,
						'',
					),
					10,
				);
				try {
					if (
						typeof activeSP !==
							'undefined' &&
						activeSP &&
						activeSP.clear
					) {
						activeSP.clear();
						activeSP.add(idx);
					}
					var f =
						document.getElementById(
							'spFilter',
						);
					if (f)
						f.style.display = 'none';
					document
						.querySelectorAll(
							'.summary-row',
						)
						.forEach(function (el) {
							el.style.display = 'none';
							var nx =
								el.nextElementSibling;
							while (
								nx &&
								getComputedStyle(nx)
									.display === 'none'
							)
								nx =
									nx.nextElementSibling;
							if (
								nx &&
								!nx.style.marginTop
							)
								nx.style.marginTop =
									'16px';
						});
					if (
						typeof applyFilters ===
						'function'
					) {
						applyFilters();
						if (window.gsap) {
							try {
								gsap.globalTimeline.progress(
									1,
								);
							} catch (e) {}
						}
					}
					if (
						typeof renderValueSummary ===
						'function'
					)
						renderValueSummary();
					if (
						typeof renderSummary ===
						'function'
					)
						renderSummary();
				} catch (e) {
					console.warn(
						'staff-lock skipped',
						e,
					);
				}
			})();
		</script>
	</body>
</html>
```
