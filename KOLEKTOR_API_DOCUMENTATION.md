# Kolektor Dashboard API Documentation

This document provides complete API specifications for the Kolektor (Collection) Dashboard backend implementation.

## Base URL

```
http://localhost:8080/api/collection
```

Or use the environment variable: `NEXT_PUBLIC_API_URL`

---

## API Endpoints

### 1. Get Receivables (Overdue / Due in 2 Weeks)

Get list of receivables that are either overdue or due within 2 weeks.

**Endpoint:** `GET /api/collection/receivables`

**Query Parameters:**
- `bucket` (required): `"overdue"` or `"due2w"`

**Request Example:**
```bash
GET /api/collection/receivables?bucket=overdue
GET /api/collection/receivables?bucket=due2w
```

**Response Body:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "bucket": "overdue",
    "items": [
      {
        "id": "PO250061",
        "src": "Project",
        "client": "PT Waskita Karya",
        "subject": "Apartemen Green Park Tower",
        "value": 182500000,
        "days": 38,
        "sales": "Sales 2",
        "assignee": {
          "name": "Andi",
          "role": "Collector",
          "username": "andi.collector"
        }
      },
      {
        "id": "INV250234",
        "src": "Retail",
        "client": "Toko Bangunan Sejahtera",
        "value": 15750000,
        "days": 22,
        "sales": "Sales 1",
        "assignee": null
      }
    ],
    "summary": {
      "totalAmount": 443250000,
      "assignedCount": 2,
      "unassignedCount": 1
    }
  }
}
```

**Field Descriptions:**
- `id`: Invoice or PO number
- `src`: Source type - `"Retail"` or `"Project"`
- `client`: Customer/company name
- `subject`: Project subject (only for Project type, optional)
- `value`: Amount in Rupiah (integer)
- `days`: Days overdue (for overdue) or days until due (for due2w)
- `sales`: Sales person name
- `assignee`: Assigned collector object or `null` if unassigned
  - `name`: Collector display name
  - `role`: Always "Collector"
  - `username`: System username for assignment

---

### 2. Get Collection Performance Metrics

Get performance data including to-be-collected vs collected amounts, with breakdown by collector.

**Endpoint:** `GET /api/collection/performance`

**Query Parameters:**
- `period` (optional): `"monthly"` or `"weekly"` (default: `"monthly"`)

**Request Example:**
```bash
GET /api/collection/performance?period=monthly
GET /api/collection/performance?period=weekly
```

**Response Body:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "period": "monthly",
    "periodLabel": "June 2026",
    "toBeCollected": {
      "actual": 4000000000,
      "target": 5000000000,
      "percentage": 80.0
    },
    "collected": {
      "actual": 1200000000,
      "target": 5000000000,
      "percentage": 24.0
    },
    "byCollector": [
      {
        "id": 1,
        "name": "Collector 1",
        "value": 350000000,
        "percentage": 29.2
      },
      {
        "id": 2,
        "name": "Collector 2",
        "value": 280000000,
        "percentage": 23.3
      },
      {
        "id": 3,
        "name": "Collector 3",
        "value": 240000000,
        "percentage": 20.0
      },
      {
        "id": 4,
        "name": "Collector 4",
        "value": 200000000,
        "percentage": 16.7
      },
      {
        "id": 5,
        "name": "Collector 5",
        "value": 130000000,
        "percentage": 10.8
      }
    ]
  }
}
```

**Field Descriptions:**
- `period`: The requested period type
- `periodLabel`: Human-readable period label (e.g., "June 2026", "Week 24 2026")
- `toBeCollected`: Outstanding collections
  - `actual`: Current outstanding amount in Rupiah
  - `target`: Target collection amount
  - `percentage`: Achievement percentage
- `collected`: Completed collections
  - Same structure as toBeCollected
- `byCollector`: Array of per-collector breakdown
  - `id`: Collector ID (1-5)
  - `name`: Collector display name
  - `value`: Amount collected by this collector
  - `percentage`: Contribution percentage

---

### 3. Get Collector Visit Metrics

Get visit statistics including target vs actual visits, with breakdown by collector and time series data.

**Endpoint:** `GET /api/collection/visits`

**Query Parameters:**
- `period` (optional): `"monthly"` or `"weekly"` (default: `"monthly"`)

**Request Example:**
```bash
GET /api/collection/visits?period=monthly
GET /api/collection/visits?period=weekly
```

**Response Body:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "period": "monthly",
    "target": 1200,
    "actual": 560,
    "percentage": 46.7,
    "byCollector": [
      {
        "id": 1,
        "name": "Collector 1",
        "visits": 145,
        "dailyAverage": 4.8
      },
      {
        "id": 2,
        "name": "Collector 2",
        "visits": 132,
        "dailyAverage": 4.4
      },
      {
        "id": 3,
        "name": "Collector 3",
        "visits": 118,
        "dailyAverage": 3.9
      },
      {
        "id": 4,
        "name": "Collector 4",
        "visits": 98,
        "dailyAverage": 3.3
      },
      {
        "id": 5,
        "name": "Collector 5",
        "visits": 67,
        "dailyAverage": 2.2
      }
    ],
    "timeSeries": {
      "dates": ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
      "visits": {
        "actual": [75, 82, 78, 85, 80, 88, 72],
        "target": [100, 100, 100, 100, 100, 100, 100]
      },
      "collected": {
        "actual": [150, 180, 165, 190, 175, 200, 140],
        "target": [200, 200, 200, 200, 200, 200, 200]
      }
    }
  }
}
```

**Field Descriptions:**
- `period`: The requested period type
- `target`: Target number of visits for the period
- `actual`: Actual visits completed
- `percentage`: Achievement percentage
- `byCollector`: Per-collector visit breakdown
  - `id`: Collector ID (1-5)
  - `name`: Collector name
  - `visits`: Total visits by this collector
  - `dailyAverage`: Average visits per day
- `timeSeries`: Data for line charts
  - `dates`: Array of date labels (formatted for display)
  - `visits`: Visit count data
    - `actual`: Array of actual visit counts
    - `target`: Array of target visit counts
  - `collected`: Collection amount data (in millions of Rupiah)
    - `actual`: Array of actual collected amounts
    - `target`: Array of target amounts

---

### 4. Get Collection Funnel Metrics

Get funnel stage data showing progression from Outstanding → Reminded → Promised → Collected.

**Endpoint:** `GET /api/collection/funnel`

**Query Parameters:**
- `period` (optional): `"monthly"` or `"weekly"` (default: `"monthly"`)
- `collectors` (optional): Comma-separated collector IDs to filter (e.g., `"1,3,5"`)

**Request Example:**
```bash
GET /api/collection/funnel?period=monthly
GET /api/collection/funnel?period=weekly&collectors=1,2,3
```

**Response Body:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "period": "monthly",
    "periodLabel": "June 2026",
    "stages": [
      {
        "key": "Outstanding",
        "value": 320
      },
      {
        "key": "Reminded",
        "value": 210
      },
      {
        "key": "Promised",
        "value": 96
      },
      {
        "key": "Collected",
        "value": 1200,
        "isMoney": true,
        "target": 1500
      }
    ],
    "conversions": {
      "outstandingToReminded": 65.6,
      "remindedToPromised": 45.7,
      "promisedToCollected": 80.0
    },
    "timeSeries": {
      "dates": ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
      "outstanding": {
        "actual": [340, 335, 330, 325, 322, 320, 318],
        "target": [300, 290, 280, 270, 260, 250, 240]
      },
      "reminded": {
        "actual": [185, 190, 195, 200, 205, 210, 212],
        "target": [200, 200, 200, 200, 200, 200, 200]
      },
      "promised": {
        "actual": [82, 85, 88, 91, 93, 96, 98],
        "target": [100, 100, 100, 100, 100, 100, 100]
      },
      "collected": {
        "actual": [800, 900, 950, 1050, 1100, 1200, 1250],
        "target": [1000, 1100, 1200, 1300, 1400, 1500, 1600]
      }
    }
  }
}
```

**Field Descriptions:**
- `period`: The requested period type
- `periodLabel`: Human-readable period label
- `stages`: Array of funnel stages (in order)
  - `key`: Stage name ("Outstanding", "Reminded", "Promised", "Collected")
  - `value`: Count for first 3 stages, amount in Rupiah millions for Collected
  - `isMoney`: `true` for Collected stage (indicates value is money)
  - `target`: Target value (only for Collected stage)
- `conversions`: Conversion rates between stages (percentages)
- `timeSeries`: Time series data for each stage
  - `dates`: Array of date labels
  - Each stage has `actual` and `target` arrays
  - Collected values are in Rupiah millions

**Note on Collector Filtering:**
When `collectors` parameter is provided, the funnel values are scaled proportionally based on the selected collectors' contribution weights.

---

### 5. Assign Collector to Receivable

Assign a collector to handle a specific receivable.

**Endpoint:** `POST /api/collection/receivables/:id/assign`

**URL Parameters:**
- `id`: The receivable ID (e.g., "PO250061", "INV250234")

**Request Body:**
```json
{
  "collectorUsername": "andi.collector"
}
```

**Response Body:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "PO250061",
    "src": "Project",
    "client": "PT Waskita Karya",
    "subject": "Apartemen Green Park Tower",
    "value": 182500000,
    "days": 38,
    "sales": "Sales 2",
    "assignee": {
      "name": "Andi",
      "role": "Collector",
      "username": "andi.collector"
    }
  },
  "message": "Collector assigned successfully"
}
```

---

### 6. Get Available Collectors

Get list of collectors available for assignment.

**Endpoint:** `GET /api/collection/collectors`

**Request Example:**
```bash
GET /api/collection/collectors
```

**Response Body:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "name": "Andi",
      "role": "Collector",
      "username": "andi.collector"
    },
    {
      "name": "Budi",
      "role": "Collector",
      "username": "budi.collector"
    },
    {
      "name": "Citra",
      "role": "Collector",
      "username": "citra.collector"
    },
    {
      "name": "Dewi",
      "role": "Collector",
      "username": "dewi.collector"
    },
    {
      "name": "Eka",
      "role": "Collector",
      "username": "eka.collector"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "statusCode": 400,
  "error": "Error message description"
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Frontend Integration

### Installation

The API functions are available in `/src/lib/kolektor.ts`. Import them in your React components:

```typescript
import {
  getReceivables,
  getPerformanceMetrics,
  getVisitMetrics,
  getFunnelMetrics,
  assignCollector,
  getCollectors,
  formatCurrency,
  formatPercentage,
} from '@/lib/kolektor';
```

### Usage Examples

#### 1. Fetch Overdue Receivables

```typescript
const fetchOverdueData = async () => {
  const response = await getReceivables('overdue');

  if (response.statusCode === 200 && response.data) {
    const { items, summary } = response.data;
    console.log('Total overdue:', formatCurrency(summary.totalAmount));
    console.log('Items:', items);
  } else {
    console.error('Error:', response.error);
  }
};
```

#### 2. Fetch Performance Metrics

```typescript
const [period, setPeriod] = useState<Period>('monthly');

const fetchPerformance = async () => {
  const response = await getPerformanceMetrics(period);

  if (response.statusCode === 200 && response.data) {
    console.log('Period:', response.data.periodLabel);
    console.log('Collected:', formatCurrency(response.data.collected.actual));
    console.log('By Collector:', response.data.byCollector);
  }
};
```

#### 3. Fetch Funnel with Collector Filter

```typescript
const [activeCollectors, setActiveCollectors] = useState([1, 2, 3, 4, 5]);

const fetchFunnel = async () => {
  const response = await getFunnelMetrics('monthly', activeCollectors);

  if (response.statusCode === 200 && response.data) {
    console.log('Stages:', response.data.stages);
    console.log('Conversions:', response.data.conversions);
  }
};
```

#### 4. Assign Collector

```typescript
const handleAssign = async (receivableId: string, username: string) => {
  const response = await assignCollector(receivableId, username);

  if (response.statusCode === 200) {
    alert('Collector assigned successfully!');
    // Refresh receivables list
    fetchOverdueData();
  } else {
    alert(`Error: ${response.error}`);
  }
};
```

---

## Data Flow

```
Frontend Component
    ↓
  API Function (src/lib/kolektor.ts)
    ↓
  HTTP Request
    ↓
  Backend API (/api/collection/*)
    ↓
  Database Query
    ↓
  Response (JSON)
    ↓
  Frontend State Update
    ↓
  UI Render
```

---

## Backend Implementation Checklist

- [ ] Create `/api/collection/receivables` endpoint
- [ ] Create `/api/collection/performance` endpoint
- [ ] Create `/api/collection/visits` endpoint
- [ ] Create `/api/collection/funnel` endpoint
- [ ] Create `/api/collection/receivables/:id/assign` endpoint
- [ ] Create `/api/collection/collectors` endpoint
- [ ] Implement period filtering (monthly/weekly)
- [ ] Implement collector filtering for funnel
- [ ] Add authentication middleware
- [ ] Add input validation
- [ ] Add error handling
- [ ] Test all endpoints with sample data

---

## Testing

### Sample cURL Commands

```bash
# Get overdue receivables
curl -X GET "http://localhost:8080/api/collection/receivables?bucket=overdue"

# Get performance metrics
curl -X GET "http://localhost:8080/api/collection/performance?period=monthly"

# Get visits
curl -X GET "http://localhost:8080/api/collection/visits?period=weekly"

# Get funnel (filtered)
curl -X GET "http://localhost:8080/api/collection/funnel?period=monthly&collectors=1,3,5"

# Assign collector
curl -X POST "http://localhost:8080/api/collection/receivables/PO250061/assign" \
  -H "Content-Type: application/json" \
  -d '{"collectorUsername": "andi.collector"}'

# Get collectors
curl -X GET "http://localhost:8080/api/collection/collectors"
```

---

## Notes

1. **Authentication**: All endpoints should require authentication. Add bearer token to headers:
   ```
   Authorization: Bearer <token>
   ```

2. **Date Formatting**: Dates in `timeSeries.dates` should be formatted for display (e.g., "Jun 1", "Week 24").

3. **Currency Values**: All monetary values are in Rupiah (IDR), stored as integers (no decimals).

4. **Collector IDs**: Collectors are numbered 1-5 for the funnel weighting system.

5. **Period Calculation**:
   - Monthly: Full calendar month
   - Weekly: Last 7 days or current week

6. **Performance**: Consider caching for performance metrics as they may be computationally expensive.
