# AR (Accounts Receivable) API Documentation

## Overview

API untuk mengelola Piutang (Accounts Receivable) dengan fitur filtering, pagination, reminder workflow, dan assignment collector.

**Collection MongoDB**: `ar`

---

## Endpoints

### 1. GET `/api/collection/ar` - Get AR List

**Deskripsi**: Mengambil daftar AR dengan pagination dan filtering berdasarkan salesperson dan status

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sp` | string | Yes | Comma-separated salesperson user ObjectIDs from users collection with role=2 (contoh: "68dde5fb85164c9d9f280cfe,68dde5fb85164c9d9f280cff") |
| `status` | string | Yes | Filter status: "all", "outstanding", "due2w", "overdue", atau "paid" |
| `page` | number | Yes | Nomor halaman untuk pagination (mulai dari 1) |

**Logic**:

1. Parse parameter `sp` menjadi array ObjectID salesperson user IDs
2. Parse parameter `page` untuk pagination (10 items per halaman)
3. Build MongoDB filter:
   - Filter berdasarkan `sp` (salesperson user \_id) dengan operator `$in`
   - Jika status bukan "all", tambahkan filter status
4. Hitung total documents yang match dengan filter
5. Query dengan sort by `createdAt` descending, skip & limit untuk pagination
6. Transform hasil: ganti field `arItemId` menjadi `id` di response

**Request Example**:

```bash
GET /api/collection/ar?sp=68dde5fb85164c9d9f280cfe,68dde5fb85164c9d9f280cff&status=overdue&page=1
```

**Response Success (200)**:

```json
{
	"status": "success",
	"statusCode": 200,
	"data": {
		"rows": [
			{
				"id": "PO250065",
				"_id": "60d5ec49f1b2c8b1f8e4e1a1",
				"arItemId": "PO250065",
				"orderId": "DKI21162",
				"source": "Order",
				"client": "PT ABC Corporation",
				"contact": "0896-2611-1998",
				"subject": "Office Renovation Project",
				"date": "2026-05-15",
				"delivery": "2026-06-30",
				"value": 150000000,
				"sp": "68dde5fb85164c9d9f280cfe",
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
				"noteDate": "2026-06-22",
				"createdBy": "Ozi Ozi",
				"username": "ozi",
				"createdAt": "2026-05-15T08:00:00Z",
				"updatedAt": "2026-06-25T14:22:00Z"
			}
		],
		"total": 45
	}
}
```

**Response Error (400)**:

```json
{
	"status": "error",
	"statusCode": 400,
	"error": "Missing required parameters: sp, status, and page are required"
}
```

---

### 2. GET `/api/collection/ar/summary` - Get AR Summary

**Deskripsi**: Mengambil ringkasan agregasi AR (total, outstanding, collected, target) berdasarkan salesperson

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sp` | string | Yes | Comma-separated salesperson user ObjectIDs from users collection with role=2 (contoh: "68dde5fb85164c9d9f280cfe,68dde5fb85164c9d9f280cff") |

**Logic**:

1. Parse parameter `sp` menjadi array ObjectID user IDs
2. **Aggregation Pipeline 1** - Hitung summary global:
   - `$match`: Filter berdasarkan salesperson user ObjectIDs
   - `$group`: Agregasi untuk menghitung:
     - `total`: Sum semua nilai AR
     - `outstanding`: Sum nilai AR yang status BUKAN "paid"
     - `collected`: Sum nilai AR yang status "paid"
3. Hitung `target` = total × 1.25 (125% dari total)
4. Hitung `targetProgress` = (total / target) × 100
5. **Aggregation Pipeline 2** - Per-salesperson outstanding:
   - `$match`: Filter berdasarkan salesperson user ObjectIDs
   - `$group`: Group by `sp` (user ObjectID), sum outstanding per salesperson
   - `$sort`: Sort by salesperson ID ascending
6. Transform hasil per-salesperson: ganti `_id` menjadi `id`

**Request Example**:

```bash
GET /api/collection/ar/summary?sp=68dde5fb85164c9d9f280cfe,68dde5fb85164c9d9f280cff
```

**Response Success (200)**:

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
				"id": "68dde5fb85164c9d9f280cfe",
				"outstanding": 450000000
			},
			{
				"id": "68dde5fb85164c9d9f280cff",
				"outstanding": 380000000
			}
		]
	}
}
```

**Response Error (400)**:

```json
{
	"status": "error",
	"statusCode": 400,
	"error": "Missing required parameter: sp"
}
```

---

### 3. POST `/api/collection/ar/:id/remind` - Update Reminder Status

**Deskripsi**: Update status reminder untuk item AR tertentu

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | AR Item ID (contoh: "PO250065") |

**Request Body**:

```json
{
	"status": "reminded"
}
```

**Allowed Status Values**:

- `"none"`: Tidak ada reminder
- `"reminded"`: Reminder sudah dikirim
- `"promised"`: Client berjanji untuk bayar
- `"disputed"`: Payment sedang disengketakan

**Logic**:

1. Parse AR Item ID dari URL parameter
2. Validasi request body (field `status` required)
3. Validasi nilai status (harus salah satu dari 4 nilai yang diperbolehkan)
4. Find AR item berdasarkan `arItemId` field
5. Update document dengan logic:
   - **Jika status = "none"**:
     - Set `remindStatus` = "none"
     - Set `remindCount` = 0
     - Set `lastRemind` = null
   - **Jika status selain "none"**:
     - Set `remindStatus` = status dari request
     - Increment `remindCount` by 1
     - Set `lastRemind` = current timestamp
6. Update `updatedAt` timestamp
7. Fetch updated document dan return

**Request Example**:

```bash
POST /api/collection/ar/PO250065/remind
Content-Type: application/json

{
  "status": "reminded"
}
```

**Response Success (200)**:

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

**Response Error (404)**:

```json
{
	"status": "error",
	"statusCode": 404,
	"error": "AR item not found"
}
```

**Response Error (400)**:

```json
{
	"status": "error",
	"statusCode": 400,
	"error": "Invalid status. Must be one of: none, reminded, promised, disputed"
}
```

---

### 4. POST `/api/collection/ar/:id/send-reminder` - Send Reminder

**Deskripsi**: Mengirim reminder pembayaran via WhatsApp atau Email

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | AR Item ID (contoh: "PO250065") |

**Request Body**:

```json
{
	"channel": "whatsapp"
}
```

**Allowed Channel Values**:

- `"whatsapp"`: Kirim via WhatsApp
- `"email"`: Kirim via Email

**Logic**:

1. Parse AR Item ID dari URL parameter
2. Validasi request body (field `channel` required)
3. Validasi channel (harus "whatsapp" atau "email")
4. Find AR item berdasarkan `arItemId`
5. **TODO**: Implement actual WhatsApp/Email sending logic
   - Reminder message should include:
     - Invoice ID (AR Item ID)
     - Client name
     - Amount due
     - Due date
     - Payment instructions
6. Update database:
   - Increment `remindCount` by 1
   - Set `lastRemind` = current timestamp
   - Set `remindStatus` = "reminded"
   - Update `updatedAt`
7. Return success message dengan channel info

**Request Example**:

```bash
POST /api/collection/ar/PO250065/send-reminder
Content-Type: application/json

{
  "channel": "whatsapp"
}
```

**Response Success (200)**:

```json
{
	"status": "success",
	"statusCode": 200,
	"data": {
		"message": "Reminder sent successfully via whatsapp"
	}
}
```

**Response Error (404)**:

```json
{
	"status": "error",
	"statusCode": 404,
	"error": "AR item not found"
}
```

**Response Error (400)**:

```json
{
	"status": "error",
	"statusCode": 400,
	"error": "Invalid channel. Must be 'whatsapp' or 'email'"
}
```

---

### 5. PUT `/api/collection/ar/:id/collector` - Update Collector

**Deskripsi**: Update collector yang assigned ke AR item

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | AR Item ID (contoh: "PO250065") |

**Request Body**:

```json
{
	"collector": "Andi Wijaya"
}
```

**Logic**:

1. Parse AR Item ID dari URL parameter
2. Validasi request body (field `collector` required)
3. Check apakah AR item dengan `arItemId` tersebut ada
4. Update field `collector` dengan nilai dari request
5. Update `updatedAt` timestamp
6. Return success message dengan collector name

**Request Example**:

```bash
PUT /api/collection/ar/PO250065/collector
Content-Type: application/json

{
  "collector": "Budi Santoso"
}
```

**Response Success (200)**:

```json
{
	"status": "success",
	"statusCode": 200,
	"message": "Collector updated successfully",
	"data": {
		"collector": "Budi Santoso"
	}
}
```

**Response Error (404)**:

```json
{
	"status": "error",
	"statusCode": 404,
	"error": "AR item not found"
}
```

---

### 6. POST `/api/collection/ar` - Create AR Item

**Deskripsi**: Membuat AR item baru

**Request Body**:

```json
{
	"arItemId": "PO250999",
	"orderId": "DKI12345",
	"source": "Order",
	"client": "PT Example Corp",
	"contact": "0812-3456-7890",
	"subject": "Example Project",
	"date": "2026-06-25",
	"delivery": "2026-07-25",
	"value": 100000000,
	"sp": "68dde5fb85164c9d9f280cfe",
	"status": "outstanding",
	"substatus": "Due in 30 days",
	"addr": "Jl. Example No. 1, Jakarta",
	"items": [
		{
			"name": "Product A",
			"qty": 10,
			"unit": "piece",
			"total": 50000000
		},
		{
			"name": "Product B",
			"qty": 5,
			"unit": "set",
			"total": 50000000
		}
	],
	"total": 100000000,
	"shipped": false,
	"shippedDate": null,
	"ttIssued": false,
	"ttDate": null,
	"collector": "Andi Wijaya",
	"collectorNote": "",
	"noteDate": "",
	"createdBy": "John Doe",
	"username": "john"
}
```

**Note**: Fields `orderId`, `contact`, `createdBy`, and `username` are optional and typically populated when creating AR from an order.

**Logic**:

1. Parse request body menjadi AR model struct
2. Set timestamps:
   - `createdAt` = current time
   - `updatedAt` = current time
3. Set default values:
   - `remindStatus` = "none" (jika kosong)
   - `remindCount` = 0 (jika kosong)
4. Insert document ke collection `ar`
5. Set `ID` field dengan inserted MongoDB ObjectID
6. Return created AR item

**Request Example**:

```bash
POST /api/collection/ar
Content-Type: application/json

{
  "arItemId": "PO250999",
  "source": "Retail",
  "client": "Toko Example",
  "subject": "Monthly Order",
  "date": "2026-06-25",
  "delivery": "2026-07-10",
  "value": 50000000,
  "sp": "68dde5fb85164c9d9f280cfe",
  "status": "outstanding",
  "substatus": "Due in 15 days",
  "addr": "Jl. Contoh No. 10, Bandung",
  "items": [
    {
      "name": "Item 1",
      "qty": 100,
      "unit": "piece",
      "total": 50000000
    }
  ],
  "total": 50000000,
  "shipped": false,
  "collector": "Budi Santoso"
}
```

**Response Success (201)**:

```json
{
	"status": "success",
	"statusCode": 201,
	"message": "AR item created successfully",
	"data": {
		"id": "60d5ec49f1b2c8b1f8e4e1a1",
		"arItemId": "PO250999",
		"source": "Retail",
		"client": "Toko Example",
		"subject": "Monthly Order",
		"date": "2026-06-25",
		"delivery": "2026-07-10",
		"value": 50000000,
		"sp": "68dde5fb85164c9d9f280cfe",
		"status": "outstanding",
		"substatus": "Due in 15 days",
		"addr": "Jl. Contoh No. 10, Bandung",
		"items": [
			{
				"name": "Item 1",
				"qty": 100,
				"unit": "piece",
				"total": 50000000
			}
		],
		"total": 50000000,
		"shipped": false,
		"shippedDate": null,
		"ttIssued": false,
		"ttDate": null,
		"remindStatus": "none",
		"remindCount": 0,
		"lastRemind": null,
		"collector": "Budi Santoso",
		"collectorNote": "",
		"noteDate": "",
		"createdAt": "2026-06-25T10:00:00Z",
		"updatedAt": "2026-06-25T10:00:00Z"
	}
}
```

**Response Error (400)**:

```json
{
	"status": "error",
	"statusCode": 400,
	"error": "Invalid data"
}
```

---

## Data Model

### AR Model Structure

```go
type AR struct {
    ID             primitive.ObjectID  // MongoDB ObjectID
    ARItemID       string              // PO Number seperti "PO250065"
    OrderID        string              // (Optional) Link to orders.orderId - hanya diisi jika source="Order"
    Source         string              // "Project", "Order", atau "Retail"
    Client         string              // Nama client (maps to orders.customer)
    Contact        string              // (Optional) Customer contact (from orders.contact)
    Subject        string              // Subjek/deskripsi order
    Date           string              // Tanggal order (YYYY-MM-DD)
    Delivery       string              // Tanggal delivery (YYYY-MM-DD)
    Value          float64             // Nilai total (maps to orders.totalValue)
    SP             primitive.ObjectID  // Salesperson user ID (reference to users collection with role=2)
    Status         string              // "outstanding", "due2w", "overdue", "paid"
    Substatus      string              // Detail status (contoh: "15 days overdue")
    Addr           string              // Alamat client
    Items          []ARItem            // Array item dalam order (maps to orders.products)
    Total          float64             // Total nilai
    Shipped        bool                // Sudah dikirim?
    ShippedDate    *string             // Tanggal pengiriman
    TTIssued       bool                // Tanda Terima sudah diissue?
    TTDate         *string             // Tanggal TT
    RemindStatus   string              // "none", "reminded", "promised", "disputed"
    RemindCount    int                 // Jumlah reminder yang sudah dikirim
    LastRemind     *time.Time          // Timestamp reminder terakhir
    Collector      string              // Nama collector
    CollectorNote  string              // Catatan dari collector
    NoteDate       string              // Tanggal catatan
    CreatedBy      string              // (Optional) From orders.createdBy
    Username       string              // (Optional) From orders.username
    CreatedAt      time.Time           // Timestamp dibuat
    UpdatedAt      time.Time           // Timestamp diupdate
}

type ARItem struct {
    Name  string   // Nama produk/service
    Qty   int      // Quantity
    Unit  string   // Unit (piece, gallon, set, dll)
    Total float64  // Total harga item
}
```

### Field Mapping from Orders Collection

When creating AR from an order:

- `orders.orderId` → `ar.orderId`
- `orders.customer` → `ar.client`
- `orders.contact` → `ar.contact`
- `orders.totalValue` → `ar.value` and `ar.total`
- `orders.products` → `ar.items` (transform structure)
- `orders.createdBy` → `ar.createdBy`
- `orders.username` → `ar.username`
- Set `source` = "Order"

---

## Status Definitions

### AR Status

- **`outstanding`**: Piutang belum jatuh tempo (due date > 14 hari dari sekarang)
- **`due2w`**: Jatuh tempo dalam 2 minggu (due date antara hari ini sampai +14 hari)
- **`overdue`**: Sudah lewat jatuh tempo (due date < hari ini)
- **`paid`**: Sudah dibayar

### Remind Status

- **`none`**: Belum ada aktivitas reminder
- **`reminded`**: Reminder sudah dikirim ke client
- **`promised`**: Client sudah berjanji untuk bayar
- **`disputed`**: Invoice sedang dalam dispute

---

## Seeder

Untuk mengisi data sample AR:

```bash
go run seed_ar_data.go
```

Seeder akan:

1. Query users collection untuk mendapatkan semua user dengan `role=2` (salespeople)
2. Membuat 12 sample AR items dengan:
   - 4 items status overdue
   - 3 items status due2w
   - 3 items status outstanding
   - 2 items status paid
3. Distribusi items secara merata ke semua salesperson yang ditemukan
4. Jika tidak ada user dengan role=2, seeder akan error - buat user salesperson dulu

**Note**: Pastikan sudah ada user dengan `role=2` di collection `users` sebelum run seeder!

---

## Testing Examples

### 1. Get all overdue AR for specific salespeople

```bash
# Ganti dengan user ObjectID yang sebenarnya dari collection users
curl "http://localhost:8080/api/collection/ar?sp=68dde5fb85164c9d9f280cfe,68dde5fb85164c9d9f280cff&status=overdue&page=1"
```

### 2. Get summary for all salespeople

```bash
# Ganti dengan user ObjectID yang sebenarnya dari collection users
curl "http://localhost:8080/api/collection/ar/summary?sp=68dde5fb85164c9d9f280cfe,68dde5fb85164c9d9f280cff"
```

### 3. Update reminder status

```bash
curl -X POST http://localhost:8080/api/collection/ar/PO250065/remind \
  -H "Content-Type: application/json" \
  -d '{"status": "reminded"}'
```

### 4. Send WhatsApp reminder

```bash
curl -X POST http://localhost:8080/api/collection/ar/PO250065/send-reminder \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp"}'
```

### 5. Assign collector

```bash
curl -X PUT http://localhost:8080/api/collection/ar/PO250065/collector \
  -H "Content-Type: application/json" \
  -d '{"collector": "Budi Santoso"}'
```

---

## Notes

1. **Pagination**: Setiap halaman menampilkan maksimal 10 items
2. **Salesperson Reference**: Field `sp` adalah ObjectID yang mereferensi ke `users._id` dengan `role=2`
3. **User Role Structure**:
   - `role=1`: Admin atau role lain
   - `role=2`: Salesperson (untuk AR tracking)
4. **WhatsApp/Email Integration**: Endpoint `/send-reminder` sudah disiapkan, tapi logic pengiriman actual perlu diimplementasi (TODO di code)
5. **Tanda Terima (TT)**: Hanya relevan untuk source="Project"
6. **MongoDB Collections**:
   - AR data disimpan di collection `ar`
   - Salesperson data ada di collection `users` (filter by role=2)
