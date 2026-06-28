# Kolektor API Quick Reference

Quick reference for backend developers implementing the Kolektor Dashboard APIs.

## 📋 Endpoints Summary

| Method | Endpoint | Purpose | Query Params |
|--------|----------|---------|--------------|
| GET | `/api/collection/receivables` | Get overdue/due2w list | `bucket=overdue\|due2w` |
| GET | `/api/collection/performance` | Collection performance | `period=monthly\|weekly` |
| GET | `/api/collection/visits` | Visit statistics | `period=monthly\|weekly` |
| GET | `/api/collection/funnel` | Funnel stages | `period=monthly\|weekly&collectors=1,2,3` |
| POST | `/api/collection/receivables/:id/assign` | Assign collector | - |
| GET | `/api/collection/collectors` | List collectors | - |

---

## 🔍 Quick Examples

### 1. Receivables Endpoint

**Request:**
```
GET /api/collection/receivables?bucket=overdue
```

**Response Structure:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "bucket": "overdue",
    "items": [
      {
        "id": "PO250061",
        "src": "Project|Retail",
        "client": "Company Name",
        "subject": "Optional project name",
        "value": 182500000,
        "days": 38,
        "sales": "Sales Person Name",
        "assignee": {
          "name": "Collector Name",
          "role": "Collector",
          "username": "username"
        } // or null
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

---

### 2. Performance Endpoint

**Request:**
```
GET /api/collection/performance?period=monthly
```

**Response Structure:**
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
      }
    ]
  }
}
```

---

### 3. Visits Endpoint

**Request:**
```
GET /api/collection/visits?period=monthly
```

**Response Structure:**
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
      }
    ],
    "timeSeries": {
      "dates": ["Jun 1", "Jun 2", "Jun 3"],
      "visits": {
        "actual": [75, 82, 78],
        "target": [100, 100, 100]
      },
      "collected": {
        "actual": [150, 180, 165], // in millions
        "target": [200, 200, 200]
      }
    }
  }
}
```

---

### 4. Funnel Endpoint

**Request:**
```
GET /api/collection/funnel?period=monthly&collectors=1,3,5
```

**Response Structure:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "period": "monthly",
    "periodLabel": "June 2026",
    "stages": [
      { "key": "Outstanding", "value": 320 },
      { "key": "Reminded", "value": 210 },
      { "key": "Promised", "value": 96 },
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
      "dates": ["Jun 1", "Jun 2"],
      "outstanding": {
        "actual": [340, 335],
        "target": [300, 290]
      },
      "reminded": { "actual": [], "target": [] },
      "promised": { "actual": [], "target": [] },
      "collected": { "actual": [], "target": [] }
    }
  }
}
```

**Note:** When `collectors` param is provided, scale all values proportionally.

---

### 5. Assign Collector

**Request:**
```
POST /api/collection/receivables/PO250061/assign
Content-Type: application/json

{
  "collectorUsername": "andi.collector"
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "PO250061",
    "src": "Project",
    "client": "PT Waskita Karya",
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

### 6. Get Collectors

**Request:**
```
GET /api/collection/collectors
```

**Response:**
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
    }
  ]
}
```

---

## 🗄️ Database Schema Suggestions

### Table: `receivables`
```sql
CREATE TABLE receivables (
  id VARCHAR(50) PRIMARY KEY,
  src ENUM('Retail', 'Project'),
  client VARCHAR(255),
  subject VARCHAR(255), -- nullable
  value BIGINT,
  due_date DATE,
  sales_username VARCHAR(100),
  assigned_collector_username VARCHAR(100), -- nullable
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Table: `collector_visits`
```sql
CREATE TABLE collector_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  collector_username VARCHAR(100),
  visit_date DATE,
  client VARCHAR(255),
  amount_collected BIGINT,
  created_at TIMESTAMP
);
```

### Table: `collection_targets`
```sql
CREATE TABLE collection_targets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_type ENUM('monthly', 'weekly'),
  period_start DATE,
  period_end DATE,
  target_amount BIGINT,
  target_visits INT,
  created_at TIMESTAMP
);
```

---

## 🔐 Authentication

All endpoints should check for valid JWT token:

```javascript
// Middleware example
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      error: 'Authentication required'
    });
  }
  // Verify token...
  next();
};
```

---

## 🧮 Calculation Logic

### Period Calculation
```javascript
// Monthly: Current month
const monthlyStart = new Date(year, month, 1);
const monthlyEnd = new Date(year, month + 1, 0);

// Weekly: Last 7 days
const weeklyEnd = new Date();
const weeklyStart = new Date();
weeklyStart.setDate(weeklyStart.getDate() - 6);
```

### Overdue Calculation
```javascript
const daysOverdue = Math.floor(
  (new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24)
);
```

### Due in 2 Weeks
```javascript
const today = new Date();
const twoWeeksLater = new Date();
twoWeeksLater.setDate(today.getDate() + 14);

// Select where due_date BETWEEN today AND twoWeeksLater
```

### Percentage Calculation
```javascript
const percentage = (actual / target) * 100;
```

### Conversion Rate (Funnel)
```javascript
const conversionRate = (nextStage / currentStage) * 100;
```

---

## ⚠️ Error Handling

Standard error response:
```json
{
  "status": "error",
  "statusCode": 400,
  "error": "Descriptive error message"
}
```

**Common Errors:**
- `400`: Invalid bucket/period parameter
- `401`: Authentication required
- `404`: Receivable not found
- `404`: Collector not found
- `500`: Database error

---

## 🧪 Testing Data

Sample test data for development:

```sql
-- Sample Receivables
INSERT INTO receivables VALUES
('PO250061', 'Project', 'PT Waskita Karya', 'Apartemen Green Park Tower', 182500000, '2026-05-01', 'sales2', 'andi.collector', NOW(), NOW()),
('INV250234', 'Retail', 'Toko Bangunan Sejahtera', NULL, 15750000, '2026-06-02', 'sales1', NULL, NOW(), NOW());

-- Sample Visits
INSERT INTO collector_visits VALUES
(NULL, 'andi.collector', '2026-06-01', 'Toko ABC', 5000000, NOW()),
(NULL, 'budi.collector', '2026-06-01', 'PT XYZ', 8000000, NOW());

-- Sample Targets
INSERT INTO collection_targets VALUES
(NULL, 'monthly', '2026-06-01', '2026-06-30', 5000000000, 1200, NOW());
```

---

## 📊 Performance Tips

1. **Indexing**: Add indexes on `due_date`, `assigned_collector_username`, `visit_date`
2. **Caching**: Cache performance metrics for 5-10 minutes
3. **Aggregation**: Pre-calculate daily/weekly aggregates in a separate table
4. **Pagination**: For receivables list, add pagination support
5. **Query Optimization**: Use JOINs instead of multiple queries

---

## 🚀 Implementation Priority

1. ✅ **Phase 1**: Receivables endpoint (overdue & due2w)
2. ✅ **Phase 2**: Collectors list endpoint
3. ✅ **Phase 3**: Assign collector endpoint
4. ✅ **Phase 4**: Performance metrics (without time series)
5. ⬜ **Phase 5**: Visits endpoint (without time series)
6. ⬜ **Phase 6**: Funnel endpoint (without time series)
7. ⬜ **Phase 7**: Add time series data to all endpoints
8. ⬜ **Phase 8**: Implement collector filtering for funnel

---

## 📞 Support

For questions about the frontend implementation or expected data format, see:
- Full documentation: `KOLEKTOR_API_DOCUMENTATION.md`
- Frontend code: `src/lib/kolektor.ts`
- TypeScript interfaces: `src/lib/kolektor.ts` (line 15-120)
