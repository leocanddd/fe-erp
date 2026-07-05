# Backend API Changes Required for PO Page

## Overview
The new PO page requires a specific API endpoint that provides aggregated data including per-salesperson summaries, value summaries, and filtered PO rows.

## New API Endpoint Required

### Endpoint
```
GET /project/po
```

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `reps` | string | No | Comma-separated salesperson IDs (1-5) | `1,2,3,4,5` or `1..5` |
| `status` | string | No | Filter by status: `all`, `processing`, `delivered`, `cancelled` | `all` |
| `page` | number | No | Page number (default: 1) | `1` |
| `per` | number | No | Items per page (default: 10) | `10` |

### Response Schema

```typescript
{
  perSales: Array<{
    rep: number;        // Salesperson number (1-5)
    count: number;      // Number of open POs for this salesperson
    value: number;      // Total value of POs for this salesperson
  }>;

  value: {
    total: number;      // Total value of all filtered POs
    processing: number; // Total value of POs with status "processing"
    realized: number;   // Total value of POs with status "delivered"
    target: number;     // Target value (can be calculated as total * 1.25)
  };

  rows: Array<PO>;      // Array of PO objects (see PO model below)

  total: number;        // Total count of filtered POs (for pagination)
}
```

## PO Data Model

Each PO object in the `rows` array should have:

```typescript
{
  id: string;           // PO ID (e.g., "PO250001")
  client: string;       // Client/Store name (was "store" in frontend, map from "customer")
  project: string;      // Project name (can be from description or a new field)
  date: string;         // PO date in format "DD/MM/YYYY" (from orderDate)
  delivery: string;     // Delivery date in format "DD/MM/YYYY" (from shipmentTime)
  value: number;        // Total PO value (totalValue)

  sp: number;           // Salesperson ID (1-5) - NEW FIELD NEEDED

  status: "processing" | "delivered" | "cancelled";  // PO status
  substatus: string;    // Detailed substatus (e.g., "PO Confirmed", "In Production")

  addr: string;         // Delivery address - NEW FIELD NEEDED
  dateAdded: string;    // Date added in format "YYYY/MM/DD" (from createdAt)
  deliveryFull: string; // Full delivery date in format "YYYY/MM/DD"
  top: string;          // Terms of Payment (e.g., "30d", "45d", "60d") (from termin field)

  items: Array<{
    name: string;       // Product name
    qty: number;        // Quantity
    unit: number;       // Unit price
    total: number;      // Line item total (qty * unit)
  }>;

  total: number;        // Total PO value (same as value field)
}
```

## Status Mapping

The backend should map your current order statuses to the PO status model:

### Main Status (`status` field)
- `processing` - When order is approved and being processed
- `delivered` - When shipment is completed
- `cancelled` - When order is cancelled

### Substatus (`substatus` field)
Based on the main status, provide more detailed information:

**Processing:**
- "PO Confirmed" - When price approved or approved
- "In Production" - When processed
- "Out for Delivery" - When shipment initiated

**Delivered:**
- "Delivered — Signed" - When received confirmation exists
- "Delivered" - When shipment completed

**Cancelled:**
- "Cancelled by Client" - When cancelled by user
- "Cancelled — Stock" - When cancelled due to stock issues

## New Database Fields Required

Add these fields to your Orders/PO table:

1. **`sp`** (integer, 1-5) - Salesperson ID assigned to this PO
2. **`addr`** (text) - Delivery address for the PO
3. **`project`** (text) - Project name/description

## Example API Response

```json
{
  "perSales": [
    { "rep": 1, "count": 32, "value": 45000000 },
    { "rep": 2, "count": 21, "value": 32000000 },
    { "rep": 3, "count": 44, "value": 58000000 },
    { "rep": 4, "count": 18, "value": 28000000 },
    { "rep": 5, "count": 27, "value": 39000000 }
  ],
  "value": {
    "total": 202000000,
    "processing": 85000000,
    "realized": 112000000,
    "target": 252500000
  },
  "rows": [
    {
      "id": "PO2500A",
      "client": "PT Wijaya Karya",
      "project": "Apartemen Green Park Tower",
      "date": "01/05/2026",
      "delivery": "10/06/2026",
      "value": 18750000,
      "sp": 1,
      "status": "processing",
      "substatus": "PO Confirmed",
      "addr": "JL. Dipati Unus 25, Cibodas, Tangerang, Banten, 11254",
      "dateAdded": "2026/05/01",
      "deliveryFull": "2026/06/10",
      "top": "30d",
      "items": [
        {
          "name": "Rockwool RW80",
          "qty": 2,
          "unit": 2500000,
          "total": 5000000
        },
        {
          "name": "Glasswool GW24",
          "qty": 3,
          "unit": 3750000,
          "total": 11250000
        }
      ],
      "total": 18750000
    }
  ],
  "total": 15
}
```

## Alternative: Use Existing Orders API with Transformation

If you want to avoid creating a new endpoint, you can:

1. Keep using `GET /api/orders?type=project&page=1&limit=10`
2. Create a frontend service layer that:
   - Fetches data from existing orders API
   - Transforms it to match the PO page requirements
   - Calculates aggregations (perSales, value summaries) on the frontend

However, this approach:
- ✅ Requires no backend changes
- ❌ Requires the new fields (sp, addr, project) to still be added to database
- ❌ Less efficient (client-side aggregations)
- ❌ Cannot properly filter by salesperson on the backend

## Recommendation

**Option 1 (Recommended):** Create the new `/project/po` endpoint
- Better performance
- Proper filtering and aggregation on backend
- Cleaner separation of concerns
- Follows the specification in po.md

**Option 2 (Quick workaround):** Use mock data temporarily
- The current implementation uses mock data
- Can be used for UI development/testing
- Replace with real API calls once backend is ready

## Migration Steps

1. **Add new database fields:**
   - `sp` (integer)
   - `addr` (text)
   - `project` (text)

2. **Create new API endpoint** `GET /project/po` with query params

3. **Implement aggregation logic:**
   - Group by salesperson
   - Calculate totals by status
   - Apply filters

4. **Update frontend** to call new endpoint (when ready):
   ```typescript
   // In src/lib/orders.ts or new src/lib/po.ts
   export const getPOs = async (
     reps: number[],
     status: string,
     page: number,
     per: number
   ) => {
     const params = new URLSearchParams({
       reps: reps.join(','),
       status,
       page: page.toString(),
       per: per.toString()
     });

     const response = await fetch(
       `${getApiUrl()}/project/po?${params}`,
       { headers: getAuthHeaders() }
     );

     return response.json();
   };
   ```

## Questions?

Let me know if you need:
- SQL schema definitions for the new fields
- Sample aggregation queries
- Help with the backend implementation in your specific framework
