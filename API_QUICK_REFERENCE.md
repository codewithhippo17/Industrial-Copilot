# API Quick Reference

## Base URL
```
http://localhost:8000
```

## Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/optimize` | Run energy optimization | None |
| GET | `/api/system-info` | Get system configuration | None |
| GET | `/api/scenarios` | Get predefined scenarios | None |
| GET | `/api/live` | Get live plant state | None |
| GET | `/api/health` | Health check | None |
| GET | `/docs` | Interactive API docs | None |

---

## Quick Start

### 1. Run Optimization

```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 60.0,
    "steam_demand": 400.0,
    "hour": 14
  }'
```

### 2. Get System Info

```bash
curl http://localhost:8000/api/system-info
```

### 3. Check Health

```bash
curl http://localhost:8000/api/health
```

---

## Common Constraints

```json
{
  "gta1_status": "OFF",           // Take GTA 1 offline
  "gta2_status": "MAINTENANCE",   // GTA 2 at 50% capacity
  "cap_steam": 420,               // Client CAP needs 420 T/hr
  "max_grid_import": 30,          // Limit grid to 30 MW
  "sulfur_max": 50,               // Sulfur plant at 50% (50 T/hr)
  "period": "peak"                // Force peak pricing
}
```

---

## Time Periods

| Hour Range | Period | Grid Cost |
|------------|--------|-----------|
| 17:00-22:00 | Peak | 1.271 DH/kWh |
| 07:00-17:00 | Standard | 0.897 DH/kWh |
| 22:00-07:00 | Off-Peak | 0.552 DH/kWh |

---

## System Limits

| Parameter | Limit | Unit |
|-----------|-------|------|
| Max Grid Import | 100 | MW |
| Max Total Power | 111 | MW |
| Max GTA Power | 37 | MW |
| Max GTA Admission | 190 | T/hr |
| Max GTA Soutirage | 100 | T/hr |
| Max Boiler Output | 200 | T/hr |
| Max Steam Production | 600 | T/hr |

---

## Response Structure

```json
{
  "status": "Optimal",
  "gtas": [...],
  "grid_import": 12.5,
  "boiler_output": 45.0,
  "sulfur_steam": 100.0,
  "total_cost": 35420.50,
  "savings": 23219.50,
  "recommendations": [
    {
      "icon": "💰",
      "title": "Optimization Savings Identified",
      "instruction": "...",
      "safety_check": "...",
      "impact": "+23,220 DH/hr",
      "priority": "high"
    }
  ]
}
```

---

## Cost Breakdown

| Source | Formula | Example |
|--------|---------|---------|
| Grid | `MW × Cost/kWh × 1000` | 12.5 × 0.897 × 1000 = 11,212 DH/hr |
| Boiler | `T/hr × 284` | 45 × 284 = 12,780 DH/hr |
| Sulfur | `T/hr × 20` | 100 × 20 = 2,000 DH/hr |
| GTA Fuel | `Admission × 65` | 190 × 65 = 12,350 DH/hr |

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid input / No solution |
| 422 | Validation error |
| 500 | Optimization error |

---

## TypeScript Types

```typescript
interface OptimizationRequest {
  elec_demand: number;    // 0-150 MW
  steam_demand: number;   // 0-600 T/hr
  constraints?: Record<string, any>;
  hour?: number;          // 0-23
  verbose?: boolean;
}

interface OperationalRecommendation {
  icon: string;
  title: string;
  instruction: string;
  safety_check?: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

## Interactive Docs

Visit **http://localhost:8000/docs** for:
- ✅ Full API explorer
- ✅ Try endpoints directly
- ✅ View request/response schemas
- ✅ Generate code examples

---

**Full Documentation:** See `API_DOCUMENTATION.md`
