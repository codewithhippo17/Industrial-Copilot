# Energy Copilot API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`  
**Protocol:** REST API with JSON payloads  
**Authentication:** None (internal use)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Endpoints](#core-endpoints)
   - [POST /api/optimize](#post-apioptimize)
   - [GET /api/system-info](#get-apisystem-info)
   - [GET /api/scenarios](#get-apiscenarios)
   - [GET /api/live](#get-apilive)
   - [GET /api/health](#get-apihealth)
3. [Root Endpoints](#root-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Overview

The Energy Copilot API provides real-time energy optimization for industrial chemical plants. It uses linear programming (PuLP solver) to minimize operating costs while meeting electricity and steam demands under various business constraints.

**Key Features:**
- Multi-source energy dispatch optimization (GTAs, Grid, Boiler, Sulfur Recovery)
- Real-world tariff modeling (ONE Tariff with peak/standard/off-peak pricing)
- GTA Technical Sheet constraints (190 T/h admission, 100 T/h extraction, 37 MW power)
- Operational command generation with safety checks
- Baseline comparison for savings quantification
- Live plant monitoring with streaming data

---

## Core Endpoints

### POST /api/optimize

**Description:**  
Main optimization endpoint. Solves the energy dispatch problem to minimize operating costs while meeting electricity and steam demands with optional business constraints.

**URL:** `/api/optimize`  
**Method:** `POST`  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "elec_demand": 60.0,
  "steam_demand": 400.0,
  "constraints": {
    "gta2_status": "MAINTENANCE",
    "cap_steam": 420
  },
  "hour": 14,
  "verbose": false
}
```

#### Request Parameters

| Field | Type | Required | Description | Constraints | Example |
|-------|------|----------|-------------|-------------|---------|
| `elec_demand` | float | ✅ Yes | Electrical power demand in MW | 0 ≤ value ≤ 150 | 60.0 |
| `steam_demand` | float | ✅ Yes | MP steam demand in T/hr | 0 ≤ value ≤ 600 | 400.0 |
| `constraints` | object | ❌ No | Business constraints dictionary | See [Constraints](#constraints) | `{"gta2_status": "OFF"}` |
| `hour` | integer | ❌ No | Hour of day (0-23) for grid pricing | 0 ≤ value ≤ 23 | 14 |
| `verbose` | boolean | ❌ No | Print detailed optimization log | - | false |

#### Constraints

The `constraints` field accepts various business rules:

**GTA Availability:**
- `{"gta1_status": "OFF"}` - Take GTA 1 completely offline (0 MW)
- `{"gta2_status": "MAINTENANCE"}` - Run GTA 2 at 50% capacity (18.5 MW max)
- `{"gta3_status": "OFF"}` - Take GTA 3 offline

**Steam Requirements:**
- `{"cap_steam": 420}` - Client CAP requires minimum 420 T/hr steam
- `{"pte_steam": 150}` - Client PTE requires minimum 150 T/hr steam

**Grid Limits:**
- `{"max_grid_import": 30}` - Limit grid import to 30 MW (e.g., substation work)

**Sulfur Recovery:**
- `{"sulfur_max": 50}` - Limit sulfur steam to 50 T/hr (e.g., sulfur plant at 50% capacity)
- `{"sulfur_max": 0}` - Sulfur plant offline

**Time Period:**
- `{"period": "peak"}` - Force peak pricing (1.271 DH/kWh)
- `{"period": "off-peak"}` - Force off-peak pricing (0.552 DH/kWh)

#### Response (200 OK)

```json
{
  "status": "Optimal",
  "gtas": [
    {
      "gta_number": 1,
      "admission": 190.0,
      "soutirage": 100.0,
      "power": 37.5
    },
    {
      "gta_number": 2,
      "admission": 150.0,
      "soutirage": 80.0,
      "power": 25.3
    },
    {
      "gta_number": 3,
      "admission": 0.0,
      "soutirage": 0.0,
      "power": 0.0
    }
  ],
  "grid_import": 12.5,
  "boiler_output": 45.0,
  "sulfur_steam": 100.0,
  "total_cost": 35420.50,
  "cost_breakdown": {
    "grid": 11231.25,
    "boiler": 12780.00,
    "sulfur": 2000.00,
    "gta_fuel": 9409.25
  },
  "baseline_cost": 58640.00,
  "baseline": {
    "grid_import": 35.0,
    "boiler_output": 164.5,
    "gta_load_percent": 50.0
  },
  "savings": 23219.50,
  "recommendations": [
    {
      "icon": "💰",
      "title": "Optimization Savings Identified",
      "instruction": "Total potential savings: 23,220 DH/hr (203,406,800 DH/year) vs baseline operation.",
      "safety_check": null,
      "impact": "+23,220 DH/hr",
      "priority": "high"
    },
    {
      "icon": "⚙️",
      "title": "Push GTA 1 to Capacity",
      "instruction": "Increase Admission Valve setpoint to 190.0 T/h. Ramp slowly over 5 minutes to avoid thermal shock.",
      "safety_check": "⚠️ Monitor Condenser Vacuum: High flow may degrade vacuum. Ensure Sea Water Pumps are running at full capacity.",
      "impact": "37.5 MW generation",
      "priority": "high"
    },
    {
      "icon": "🛑",
      "title": "Shutdown Auxiliary Boiler",
      "instruction": "Ramp down Boiler firing rate to 0 over 10 minutes. Switch steam supply to Sulfur Recovery + GTA extraction.",
      "safety_check": "✅ Pressure Watch: Verify MP Header maintains > 8.5 bar on Sulfur steam alone. Install pressure transmitter PT-201 as backup.",
      "impact": "Saves 12,780 DH/hr (284 DH/T fuel avoided)",
      "priority": "high"
    }
  ],
  "demands": {
    "electricity": 60.0,
    "steam": 400.0
  },
  "constraints_applied": {
    "gta2_status": "MAINTENANCE",
    "cap_steam": 420
  },
  "timestamp": "2025-12-05T14:30:45.123456"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Solver status: "Optimal", "Infeasible", "Unbounded" |
| `gtas` | array | GTA operations (see [GTAResult](#gtaresult)) |
| `grid_import` | float | Grid electricity import in MW |
| `boiler_output` | float | Auxiliary boiler steam output in T/hr |
| `sulfur_steam` | float | Recovered steam from sulfuric acid in T/hr |
| `total_cost` | float | Total operating cost in DH/hr |
| `cost_breakdown` | object | Detailed cost breakdown (see [CostBreakdown](#costbreakdown)) |
| `baseline_cost` | float | Cost with naive strategy (50% GTA load + balance from boiler/grid) |
| `baseline` | object | Baseline scenario details (see [BaselineComparison](#baselinecomparison)) |
| `savings` | float | Cost savings vs baseline in DH/hr |
| `recommendations` | array | Operational commands with safety checks (see [OperationalRecommendation](#operationalrecommendation)) |
| `demands` | object | Input demands (electricity, steam) |
| `constraints_applied` | object | Applied constraints |
| `timestamp` | string | ISO 8601 timestamp |

#### Error Responses

**400 Bad Request** - No optimal solution found
```json
{
  "detail": "No optimal solution found. Status: Infeasible"
}
```

**422 Validation Error** - Invalid input parameters
```json
{
  "detail": [
    {
      "loc": ["body", "elec_demand"],
      "msg": "ensure this value is less than or equal to 150",
      "type": "value_error.number.not_le"
    }
  ]
}
```

**500 Internal Server Error** - Optimization error
```json
{
  "detail": "Optimization error: Division by zero in GTA coefficients"
}
```

---

### GET /api/system-info

**Description:**  
Get system configuration and constraints. Returns financial constants, physics coefficients, and system limits. Useful for frontend to display available options and validate inputs.

**URL:** `/api/system-info`  
**Method:** `GET`

#### Response (200 OK)

```json
{
  "financial_constants": {
    "grid_peak_cost": 1.271,
    "grid_standard_cost": 0.897,
    "grid_off_peak_cost": 0.552,
    "boiler_cost": 284.0,
    "sulfuric_heat_cost": 20.0,
    "gta_fuel_cost": 65.0,
    "peak_hours_start": 17,
    "peak_hours_end": 22
  },
  "physics_coefficients": {
    "gta1": {
      "coef_a": 0.1987,
      "coef_s": 0.0123,
      "intercept": -0.45,
      "max_admission": 190.0,
      "max_soutirage": 100.0,
      "max_power": 37.0,
      "min_power": 10.0
    },
    "gta2": {
      "coef_a": 0.1056,
      "coef_s": 0.0098,
      "intercept": 1.23,
      "max_admission": 190.0,
      "max_soutirage": 100.0,
      "max_power": 37.0,
      "min_power": 10.0
    },
    "gta3": {
      "coef_a": 0.1654,
      "coef_s": 0.0187,
      "intercept": 0.78,
      "max_admission": 190.0,
      "max_soutirage": 100.0,
      "max_power": 37.0,
      "min_power": 10.0
    },
    "max_admission": 190.0,
    "min_admission": 10.0
  },
  "system_constraints": {
    "max_total_steam_production": 600.0,
    "max_total_power_production": 111.0,
    "max_grid_import": 100.0,
    "max_boiler_capacity": 200.0,
    "steam_safety_margin": 1.1,
    "power_safety_margin": 1.05
  },
  "gta_models": [
    {
      "gta_number": 1,
      "formula": "P_elec = 0.1987*A + 0.0123*S + -0.45"
    },
    {
      "gta_number": 2,
      "formula": "P_elec = 0.1056*A + 0.0098*S + 1.23"
    },
    {
      "gta_number": 3,
      "formula": "P_elec = 0.1654*A + 0.0187*S + 0.78"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `financial_constants` | object | Tariff rates and fuel costs |
| `financial_constants.grid_peak_cost` | float | Peak grid electricity rate (DH/kWh) - 17:00-22:00 |
| `financial_constants.grid_standard_cost` | float | Standard grid rate (DH/kWh) - 07:00-17:00 |
| `financial_constants.grid_off_peak_cost` | float | Off-peak grid rate (DH/kWh) - 22:00-07:00 |
| `financial_constants.boiler_cost` | float | Boiler steam cost (DH/T) |
| `financial_constants.sulfuric_heat_cost` | float | Sulfur recovery steam cost (DH/T) |
| `financial_constants.gta_fuel_cost` | float | GTA fuel cost (DH/T steam) |
| `physics_coefficients` | object | GTA performance models and limits |
| `physics_coefficients.gta1/2/3` | object | Individual GTA coefficients (coef_a, coef_s, intercept) |
| `system_constraints` | object | Plant-wide capacity limits |
| `system_constraints.max_grid_import` | float | Substation limit (MW) |
| `system_constraints.max_total_power_production` | float | Total plant capacity (MW) = 3×37 |
| `gta_models` | array | GTA power generation formulas |

#### Use Cases

- Display tariff rates in UI
- Validate user inputs against system limits
- Show GTA capacity in dashboard
- Calculate theoretical maximum outputs

---

### GET /api/scenarios

**Description:**  
Get pre-defined optimization scenarios for testing. Returns common business scenarios that can be used as examples or quick-start templates.

**URL:** `/api/scenarios`  
**Method:** `GET`

#### Response (200 OK)

```json
{
  "scenarios": [
    {
      "name": "Normal Operation",
      "description": "Typical daytime operation with all GTAs available",
      "params": {
        "elec_demand": 60.0,
        "steam_demand": 400.0,
        "constraints": {},
        "hour": 14
      }
    },
    {
      "name": "GTA 2 Maintenance",
      "description": "GTA 2 is under maintenance, running at reduced capacity",
      "params": {
        "elec_demand": 60.0,
        "steam_demand": 400.0,
        "constraints": {
          "gta2_status": "MAINTENANCE"
        },
        "hour": 14
      }
    },
    {
      "name": "GTA 3 Offline",
      "description": "GTA 3 is completely offline for repairs",
      "params": {
        "elec_demand": 55.0,
        "steam_demand": 380.0,
        "constraints": {
          "gta3_status": "OFF"
        },
        "hour": 10
      }
    },
    {
      "name": "Peak Hours High Demand",
      "description": "High demand during expensive peak hours (17h-22h)",
      "params": {
        "elec_demand": 70.0,
        "steam_demand": 450.0,
        "constraints": {},
        "hour": 19
      }
    },
    {
      "name": "Client CAP High Steam",
      "description": "Client CAP requires minimum 460 T/hr steam",
      "params": {
        "elec_demand": 65.0,
        "steam_demand": 450.0,
        "constraints": {
          "cap_steam": 460
        },
        "hour": 15
      }
    },
    {
      "name": "Night Operation",
      "description": "Low demand during night with off-peak pricing",
      "params": {
        "elec_demand": 40.0,
        "steam_demand": 300.0,
        "constraints": {},
        "hour": 2
      }
    }
  ]
}
```

#### Use Cases

- Populate scenario dropdown in frontend
- Quick testing of optimization engine
- Training operators on different situations
- API integration examples

---

### GET /api/live

**Description:**  
Get current live plant state from streaming data. Returns real-time metrics including GTA operations, sulfur flows, MP pressure, cost estimates, and system efficiency.

**URL:** `/api/live`  
**Method:** `GET`

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "timestamp": "2025-12-05T14:30:45.123456",
    "gtas": [
      {
        "gta_number": 1,
        "admission_hp": 185.5,
        "soutirage_mp": 95.2,
        "power_output": 36.8,
        "efficiency": 92.5,
        "status": "running"
      },
      {
        "gta_number": 2,
        "admission_hp": 120.0,
        "soutirage_mp": 65.0,
        "power_output": 18.5,
        "efficiency": 88.3,
        "status": "running"
      },
      {
        "gta_number": 3,
        "admission_hp": 0.0,
        "soutirage_mp": 0.0,
        "power_output": 0.0,
        "efficiency": 0.0,
        "status": "stopped"
      }
    ],
    "sulfur": {
      "flow_rate": 87.5,
      "free_steam": 87.5,
      "temperature": 160.0,
      "plant_status": "operational"
    },
    "steam": {
      "mp_pressure": 9.2,
      "mp_temperature": 184.5,
      "total_production": 247.7,
      "total_demand": 420.0,
      "pressure_status": "normal"
    },
    "electrical": {
      "total_generation": 55.3,
      "grid_import": 12.5,
      "total_demand": 67.8,
      "power_factor": 0.95
    },
    "boiler": {
      "output": 84.8,
      "firing_rate": 72.5,
      "efficiency": 85.0,
      "status": "running"
    },
    "cost_estimate": {
      "cost_per_hour": 42580.50,
      "grid_cost": 11231.25,
      "boiler_cost": 24082.00,
      "gta_fuel_cost": 5267.25,
      "sulfur_cost": 2000.00
    },
    "efficiency": {
      "overall_efficiency": 78.5,
      "cogeneration_ratio": 0.82,
      "fuel_utilization": 85.3
    },
    "alerts": [
      {
        "level": "warning",
        "message": "Boiler running at high load (84.8 T/hr)",
        "component": "boiler"
      },
      {
        "level": "info",
        "message": "GTA 3 is offline",
        "component": "gta3"
      }
    ]
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | API call success status |
| `data.timestamp` | string | Current timestamp |
| `data.gtas` | array | Real-time GTA operations |
| `data.sulfur` | object | Sulfur recovery metrics |
| `data.steam` | object | Steam system metrics with MP pressure |
| `data.electrical` | object | Electrical system metrics |
| `data.boiler` | object | Auxiliary boiler status |
| `data.cost_estimate` | object | Real-time cost breakdown |
| `data.efficiency` | object | System efficiency metrics |
| `data.alerts` | array | Active warnings and notifications |

#### Use Cases

- SCADA dashboard real-time display
- Live Asset Synoptic visualization
- Monitoring MP pressure (8.5 bar minimum)
- Tracking sulfur recovery free steam
- Cost per hour calculation

---

### GET /api/health

**Description:**  
Health check endpoint. Returns server status and optimizer readiness.

**URL:** `/api/health`  
**Method:** `GET`

#### Response (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2025-12-05T14:30:45.123456",
  "optimizer_ready": true,
  "sulfur_data_loaded": true
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Server health status: "healthy" or "unhealthy" |
| `timestamp` | string | Current timestamp |
| `optimizer_ready` | boolean | Whether optimizer is initialized |
| `sulfur_data_loaded` | boolean | Whether sulfur recovery data is loaded |

#### Use Cases

- Load balancer health checks
- Kubernetes liveness/readiness probes
- Monitoring service availability
- Pre-flight checks before optimization

---

## Root Endpoints

### GET /

**Description:** API information and endpoint directory

**Response:**
```json
{
  "name": "Energy Copilot API",
  "version": "1.0.0",
  "description": "Real-Time Energy Optimization Platform",
  "status": "operational",
  "timestamp": "2025-12-05T14:30:45.123456",
  "endpoints": {
    "optimization": "/api/optimize",
    "system_info": "/api/system-info",
    "scenarios": "/api/scenarios",
    "health": "/api/health",
    "live": "/api/live",
    "docs": "/docs"
  }
}
```

### GET /api

**Description:** API root with endpoint list

**Response:**
```json
{
  "message": "Energy Copilot API",
  "version": "1.0.0",
  "endpoints": [
    "POST /api/optimize - Run optimization",
    "GET /api/system-info - Get system configuration",
    "GET /api/scenarios - Get pre-defined scenarios",
    "GET /api/live - Get live plant state",
    "GET /api/health - Health check"
  ]
}
```

### GET /docs

**Description:** Interactive API documentation (Swagger UI)

**URL:** `http://localhost:8000/docs`

Provides interactive API explorer where you can:
- View all endpoints
- Test API calls directly in browser
- See request/response schemas
- Generate code examples

### GET /redoc

**Description:** Alternative API documentation (ReDoc)

**URL:** `http://localhost:8000/redoc`

Provides clean, responsive documentation with:
- Three-panel layout
- Code samples in multiple languages
- Search functionality
- Downloadable OpenAPI spec

---

## Data Models

### GTAResult

GTA operation result from optimization.

```typescript
{
  gta_number: number;      // GTA unit number (1, 2, or 3)
  admission: number;        // HP steam admission in T/hr (0-190)
  soutirage: number;        // MP steam extraction in T/hr (0-100)
  power: number;            // Electrical power output in MW (0-37)
}
```

**Example:**
```json
{
  "gta_number": 1,
  "admission": 190.0,
  "soutirage": 100.0,
  "power": 37.5
}
```

---

### CostBreakdown

Detailed cost breakdown by energy source.

```typescript
{
  grid: number;       // Grid import cost in DH/hr
  boiler: number;     // Boiler operation cost in DH/hr
  sulfur: number;     // Sulfur recovery cost in DH/hr
  gta_fuel: number;   // GTA fuel cost in DH/hr
}
```

**Example:**
```json
{
  "grid": 11231.25,
  "boiler": 12780.00,
  "sulfur": 2000.00,
  "gta_fuel": 9409.25
}
```

**Cost Calculation:**
- **Grid:** `grid_import (MW) × grid_cost (DH/kWh) × 1000`
- **Boiler:** `boiler_output (T/hr) × 284 (DH/T)`
- **Sulfur:** `sulfur_steam (T/hr) × 20 (DH/T)`
- **GTA Fuel:** `Σ(admission (T/hr) × 65 (DH/T))` for all GTAs

---

### BaselineComparison

Baseline scenario for cost savings comparison.

```typescript
{
  grid_import: number;        // Baseline grid import in MW
  boiler_output: number;      // Baseline boiler output in T/hr
  gta_load_percent: number;   // Baseline GTA load percentage
}
```

**Example:**
```json
{
  "grid_import": 35.0,
  "boiler_output": 164.5,
  "gta_load_percent": 50.0
}
```

**Baseline Strategy:**
- All GTAs run at 50% load (95 T/h admission)
- Balance electricity from grid
- Balance steam from boiler
- No optimization applied

---

### OperationalRecommendation

Structured operational command with safety checks.

```typescript
{
  icon: string;              // Visual indicator (emoji)
  title: string;             // Command headline
  instruction: string;        // Specific operational action
  safety_check?: string;     // Critical safety monitoring (optional)
  impact: string;            // Financial/operational benefit
  priority: 'high' | 'medium' | 'low';
}
```

**Example:**
```json
{
  "icon": "⚙️",
  "title": "Push GTA 1 to Capacity",
  "instruction": "Increase Admission Valve setpoint to 190.0 T/h. Ramp slowly over 5 minutes to avoid thermal shock.",
  "safety_check": "⚠️ Monitor Condenser Vacuum: High flow may degrade vacuum. Ensure Sea Water Pumps are running at full capacity.",
  "impact": "37.5 MW generation",
  "priority": "high"
}
```

**Priority Levels:**
- **high:** Critical financial impact or safety concern
- **medium:** Important operational adjustments
- **low:** Informational confirmations

**Common Icons:**
- `💰` Financial savings
- `⚙️` GTA adjustments
- `🛑` Boiler shutdown
- `⚡` Peak tariff alerts
- `⚠️` Safety warnings
- `✅` Success confirmations
- `🔴` Critical issues
- `🟢` Off-peak advantages

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or no optimal solution |
| 404 | Not Found | Endpoint does not exist |
| 422 | Validation Error | Request body validation failed |
| 500 | Internal Server Error | Server-side error (optimization failure) |

### Error Response Format

All errors follow FastAPI standard format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Validation errors** include field-specific details:

```json
{
  "detail": [
    {
      "loc": ["body", "elec_demand"],
      "msg": "ensure this value is less than or equal to 150",
      "type": "value_error.number.not_le"
    }
  ]
}
```

### Common Error Scenarios

**1. Demand Exceeds Capacity**

Request:
```json
{
  "elec_demand": 120.0,
  "steam_demand": 400.0
}
```

Response (400):
```json
{
  "detail": "No optimal solution found. Status: Infeasible"
}
```

**Explanation:** 120 MW exceeds max plant capacity (111 MW = 3×37 MW)

---

**2. Invalid Constraint Value**

Request:
```json
{
  "elec_demand": 60.0,
  "steam_demand": 400.0,
  "constraints": {
    "gta1_status": "BROKEN"
  }
}
```

Response (500):
```json
{
  "detail": "Optimization error: Unknown GTA status: BROKEN"
}
```

**Valid values:** "OFF", "MAINTENANCE" (case-sensitive)

---

**3. Conflicting Constraints**

Request:
```json
{
  "elec_demand": 60.0,
  "steam_demand": 400.0,
  "constraints": {
    "gta1_status": "OFF",
    "gta2_status": "OFF",
    "gta3_status": "OFF"
  }
}
```

Response (400):
```json
{
  "detail": "No optimal solution found. Status: Infeasible"
}
```

**Explanation:** Cannot meet demand with all GTAs offline

---

## Examples

### Example 1: Basic Optimization

**Request:**
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 60.0,
    "steam_demand": 400.0,
    "hour": 14
  }'
```

**Response:**
```json
{
  "status": "Optimal",
  "gtas": [
    {"gta_number": 1, "admission": 190.0, "soutirage": 100.0, "power": 37.5},
    {"gta_number": 2, "admission": 150.0, "soutirage": 80.0, "power": 25.3},
    {"gta_number": 3, "admission": 0.0, "soutirage": 0.0, "power": 0.0}
  ],
  "grid_import": 0.0,
  "boiler_output": 120.0,
  "sulfur_steam": 100.0,
  "total_cost": 35420.50,
  "savings": 23219.50,
  "recommendations": [...]
}
```

---

### Example 2: GTA Maintenance Scenario

**Request:**
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 60.0,
    "steam_demand": 400.0,
    "constraints": {
      "gta2_status": "MAINTENANCE"
    },
    "hour": 14
  }'
```

**Effect:** GTA 2 limited to 18.5 MW (50% capacity)

---

### Example 3: Peak Hours Optimization

**Request:**
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 70.0,
    "steam_demand": 450.0,
    "hour": 19
  }'
```

**Effect:** Grid cost = 1.271 DH/kWh (peak tariff)

**Expected Recommendation:**
```json
{
  "icon": "⚡",
  "title": "Peak Tariff Alert (1.271 DH/kWh)",
  "instruction": "Maximize internal generation. Current grid import: 15.5 MW. If GTAs are maxed out, request load shedding from Downstream Plants (CAP, PTE).",
  "priority": "high"
}
```

---

### Example 4: Client Steam Requirement

**Request:**
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 65.0,
    "steam_demand": 450.0,
    "constraints": {
      "cap_steam": 460
    },
    "hour": 15
  }'
```

**Effect:** Solver ensures total steam production ≥ 460 T/hr

---

### Example 5: Get System Configuration

**Request:**
```bash
curl http://localhost:8000/api/system-info
```

**Use Case:** Frontend needs to display max GTA capacity

**Response Extract:**
```json
{
  "physics_coefficients": {
    "gta1": {
      "max_power": 37.0,
      "max_admission": 190.0,
      "max_soutirage": 100.0
    }
  }
}
```

---

### Example 6: Get Pre-defined Scenarios

**Request:**
```bash
curl http://localhost:8000/api/scenarios
```

**Use Case:** Populate dropdown menu in simulation lab

**Response Extract:**
```json
{
  "scenarios": [
    {
      "name": "Normal Operation",
      "params": {
        "elec_demand": 60.0,
        "steam_demand": 400.0
      }
    }
  ]
}
```

---

### Example 7: Health Check

**Request:**
```bash
curl http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "optimizer_ready": true,
  "sulfur_data_loaded": true
}
```

---

### Example 8: Live Plant State

**Request:**
```bash
curl http://localhost:8000/api/live
```

**Use Case:** Update SCADA dashboard every 5 seconds

**Response Extract:**
```json
{
  "data": {
    "gtas": [
      {
        "gta_number": 1,
        "power_output": 36.8,
        "status": "running"
      }
    ],
    "steam": {
      "mp_pressure": 9.2,
      "pressure_status": "normal"
    },
    "cost_estimate": {
      "cost_per_hour": 42580.50
    }
  }
}
```

---

## TypeScript Integration

### API Client Example

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface OptimizationRequest {
  elec_demand: number;
  steam_demand: number;
  constraints?: Record<string, any>;
  hour?: number;
  verbose?: boolean;
}

export interface OptimizationResult {
  status: string;
  gtas: GTAResult[];
  grid_import: number;
  boiler_output: number;
  sulfur_steam: number;
  total_cost: number;
  cost_breakdown: CostBreakdown;
  baseline_cost: number;
  baseline: BaselineComparison;
  savings: number;
  recommendations: OperationalRecommendation[];
  demands: { electricity: number; steam: number };
  constraints_applied: Record<string, any>;
  timestamp: string;
}

export async function optimizeEnergy(
  request: OptimizationRequest
): Promise<OptimizationResult> {
  const response = await axios.post(`${API_BASE_URL}/api/optimize`, request);
  return response.data;
}

export async function getSystemInfo(): Promise<SystemInfoResponse> {
  const response = await axios.get(`${API_BASE_URL}/api/system-info`);
  return response.data;
}

export async function getLiveState(): Promise<LiveStateResponse> {
  const response = await axios.get(`${API_BASE_URL}/api/live`);
  return response.data;
}
```

---

## Rate Limiting

**Current Status:** No rate limiting implemented

**Recommendations for Production:**
- Implement rate limiting at nginx/load balancer level
- Suggested limit: 100 requests per minute per IP
- Optimization endpoint: 10 requests per minute (computationally expensive)

---

## Versioning

**Current Version:** 1.0.0

**Future Versions:** API versioning will be introduced via URL path:
- `/api/v1/optimize`
- `/api/v2/optimize`

---

## Security Considerations

**Current State:** No authentication (internal network only)

**Production Recommendations:**
1. **API Keys:** Implement API key authentication
2. **CORS:** Restrict origins to known frontend domains
3. **HTTPS:** Enforce TLS for all endpoints
4. **Input Validation:** Already implemented via Pydantic
5. **Rate Limiting:** Prevent abuse of compute-heavy optimization
6. **Audit Logging:** Track all optimization requests

---

## Performance

### Response Times (Typical)

| Endpoint | Average | Description |
|----------|---------|-------------|
| `/api/optimize` | 150-300ms | PuLP solver execution time |
| `/api/system-info` | <10ms | Configuration read |
| `/api/scenarios` | <5ms | Static data |
| `/api/live` | 20-50ms | Streaming data query |
| `/api/health` | <5ms | Simple status check |

### Optimization Scalability

- **Single Request:** 150-300ms (typical)
- **Concurrent Requests:** Linear scaling up to 10 requests
- **Bottleneck:** PuLP solver is CPU-bound
- **Recommendation:** Use task queue (Celery) for production

---

## Support & Contact

**Documentation:** `http://localhost:8000/docs`  
**Project:** Industrial-Copilot  
**Version:** 1.0.0  
**Last Updated:** December 5, 2025

---

**End of API Documentation**
