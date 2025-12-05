# 🏭 Energy Copilot - Real-Time Energy Optimization Platform

> **Business-Oriented Dynamic Constraint Solver** for Chemical Plant Operations

A full-stack real-time optimization platform that minimizes operating costs by optimally dispatching 3 Gas Turbo-Alternators (GTAs), Grid Imports, and Auxiliary Boilers to meet steam and electricity demands.

## 🎯 Key Features

### ✅ Business Oriented
- **Dynamic Constraint Engine**: Define real-world scenarios like "GTA 2 under maintenance" or "Client CAP needs 20T steam"
- **Merit Order Dispatch**: Automatically prioritizes cheapest sources (Sulfur Recovery → GTAs → Grid → Boiler)
- **Real-Time Cost Savings**: See financial impact with hourly, daily, and monthly projections

### 🧠 Advanced Optimization
- **PuLP Solver**: Linear programming for cost minimization
- **Hardcoded ML Models**: Stable, pre-trained coefficients for GTA power prediction
- **Physics-Based Constraints**: Respects turbine limits and thermodynamic laws

### 📊 Interactive Dashboard
- **Constraint Panel**: Rule-based UI for adding business constraints
- **Merit Order Chart**: Stacked bar visualization using Recharts
- **Cost Ticker**: Animated savings counter with detailed breakdown

---

## 📂 Project Structure

```
energy-copilot/
├── backend/                    # FastAPI + PuLP Optimization
│   ├── core/
│   │   ├── config.py          # Financial constants & Physics coefficients
│   │   └── optimizer.py       # PuLP Solver with ML models
│   ├── routers/
│   │   └── simulation.py      # API Endpoints
│   ├── data/
│   │   └── DATA_FINAL.csv     # Historical data (optional)
│   ├── main.py                # FastAPI app entrypoint
│   └── requirements.txt       # Python dependencies
│
└── frontend/                   # Next.js 14 (App Router)
    ├── src/
    │   ├── app/
    │   │   └── dashboard/
    │   │       └── page.tsx    # Main Command Center
    │   ├── components/
    │   │   ├── business/
    │   │   │   ├── ConstraintPanel.tsx  # Rule engine UI
    │   │   │   └── MeritOrderChart.tsx  # Stacked bar chart
    │   │   └── kpi/
    │   │       └── CostTicker.tsx       # Real-time savings
    │   └── lib/
    │       └── api.ts          # Axios client + React hooks
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** with pip
- **Node.js 18+** with npm/yarn
- **Terminal** (bash/zsh)

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd /home/bneay/Industrial-Copilot/backend

# Install Python dependencies
pip install -r requirements.txt

# Or use a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the FastAPI server
python main.py
```

**Backend will start on:** `http://localhost:8000`
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

### 2️⃣ Frontend Setup

```bash
# Navigate to project root
cd /home/bneay/Industrial-Copilot

# Install Node.js dependencies
npm install
# or
yarn install

# Run the Next.js development server
npm run dev
# or
yarn dev
```

**Frontend will start on:** `http://localhost:3000`
- Dashboard: http://localhost:3000/dashboard

---

## 🧪 Testing the System

### Method 1: Using the UI (Recommended)

1. Open http://localhost:3000/dashboard
2. Set demands:
   - Electricity: 60 MW
   - Steam: 400 T/hr
   - Hour: 14 (off-peak)
3. Add constraints (optional):
   - Click "Add Rule" → "GTA 2 Status" → "MAINTENANCE"
4. Click "Run Optimization"
5. View results in:
   - Cost Ticker (savings)
   - Merit Order Chart (dispatch strategy)

### Method 2: Using API Directly

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Run optimization
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 60.0,
    "steam_demand": 400.0,
    "hour": 14,
    "constraints": {
      "gta2_status": "MAINTENANCE"
    }
  }'
```

### Method 3: Using Python Script

```python
import requests

# Run optimization
response = requests.post('http://localhost:8000/api/optimize', json={
    'elec_demand': 60.0,
    'steam_demand': 400.0,
    'hour': 14,
    'constraints': {
        'gta2_status': 'MAINTENANCE',
        'cap_steam': 420
    }
})

result = response.json()
print(f"Total Cost: {result['total_cost']} DH/hr")
print(f"Savings: {result['savings']} DH/hr")
```

---

## 📐 Technical Details

### Physics Engine

**GTA Power Prediction Models** (Hardcoded from ML training):

- **GTA 1**: `P_elec = 0.2761 × A - 0.1805 × S - 2.72`
- **GTA 2**: `P_elec = 0.2560 × A - 0.1782 × S - 0.02`
- **GTA 3**: `P_elec = 0.2573 × A - 0.1723 × S + 0.06`

Where:
- `A` = Admission (HP steam, 0-200 T/hr)
- `S` = Soutirage (MP steam extraction, 0-A T/hr)
- `P_elec` = Electrical power output (MW)

### Financial Constants

| Source            | Cost           | Notes                     |
|-------------------|----------------|---------------------------|
| Grid (Off-Peak)   | 0.55 DH/kWh    | Outside 17h-22h          |
| Grid (Peak)       | 1.27 DH/kWh    | 17h-22h                  |
| Boiler            | 284 DH/Ton     | Most expensive           |
| Sulfuric Heat     | 20 DH/Ton      | Nearly free (recovery)   |
| GTA Fuel          | 0.65 DH/kWh    | Estimated gas cost       |

### Optimization Objective

```
Minimize: Total_Cost = Grid_Cost + Boiler_Cost + Sulfur_Cost + GTA_Fuel_Cost

Subject to:
  - Total_Power ≥ Electricity_Demand
  - Total_Steam ≥ Steam_Demand
  - Soutirage ≤ Admission (for each GTA)
  - 0 ≤ Admission ≤ 200 T/hr
  - Business Constraints (e.g., GTA2 = OFF)
```

---

## 🔧 Available Business Constraints

| Constraint Key      | Type    | Description                           | Example                  |
|---------------------|---------|---------------------------------------|--------------------------|
| `gta1_status`       | string  | GTA 1 status                         | `"OFF"`, `"MAINTENANCE"` |
| `gta2_status`       | string  | GTA 2 status                         | `"OFF"`, `"MAINTENANCE"` |
| `gta3_status`       | string  | GTA 3 status                         | `"OFF"`, `"MAINTENANCE"` |
| `cap_steam`         | number  | Minimum steam for Client CAP (T/hr)  | `420`                    |
| `max_grid_import`   | number  | Override max grid import (MW)        | `30`                     |
| `min_total_steam`   | number  | Minimum total steam production       | `450`                    |

### Examples

```json
{
  "constraints": {
    "gta2_status": "MAINTENANCE",  // GTA 2 at 50% capacity
    "cap_steam": 420,               // Client CAP needs 420 T/hr minimum
    "max_grid_import": 30           // Limit grid to 30 MW
  }
}
```

---

## 🌐 API Endpoints

### `POST /api/optimize`
Run optimization with demands and constraints.

**Request:**
```json
{
  "elec_demand": 60.0,
  "steam_demand": 400.0,
  "hour": 14,
  "constraints": {
    "gta2_status": "MAINTENANCE"
  }
}
```

**Response:**
```json
{
  "status": "Optimal",
  "total_cost": 18420.50,
  "savings": 4125.30,
  "gtas": [
    {"gta_number": 1, "admission": 175.2, "soutirage": 140.5, "power": 22.3},
    {"gta_number": 2, "admission": 95.0, "soutirage": 75.0, "power": 12.1},
    {"gta_number": 3, "admission": 180.0, "soutirage": 145.0, "power": 23.5}
  ],
  "grid_import": 2.1,
  "boiler_output": 39.5,
  "sulfur_steam": 50.0
}
```

### `GET /api/system-info`
Get financial constants and physics coefficients.

### `GET /api/scenarios`
Get pre-defined test scenarios.

### `GET /api/health`
Health check endpoint.

---

## 🎨 UI Components

### 1. Constraint Panel
- **Add Rule Button**: Opens constraint form
- **Rule Types**: Dropdown with target selection
- **Active Rules**: List with remove buttons
- **Simulate Button**: Triggers optimization

### 2. Merit Order Chart
- **Stacked Bar Chart**: Visualizes dispatch strategy
- **Color Coding**:
  - 🟩 Green: Sulfur Recovery (Cheapest)
  - 🟦 Blue: GTAs (Medium cost)
  - 🟨 Yellow: Grid Import (Variable)
  - 🟥 Red: Boiler (Most expensive - avoid!)

### 3. Cost Ticker
- **Animated Counter**: Savings display
- **Cost Breakdown**: Collapsible detailed view
- **Projections**: Daily/Weekly/Monthly savings

---

## 🔥 Key Differentiators

### vs. Static Dashboards
❌ Static: "Here's what happened yesterday"
✅ Energy Copilot: "Here's the optimal plan for right now"

### vs. Rule-Based Systems
❌ Rules: "If X then Y" (brittle)
✅ Energy Copilot: Mathematical optimization (flexible)

### vs. Manual Dispatch
❌ Manual: Human intuition (suboptimal)
✅ Energy Copilot: PuLP solver (provably optimal)

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'pulp'`
```bash
pip install pulp
```

**Problem:** `CORS error` in browser console
- Check that FastAPI is running on port 8000
- Verify CORS middleware in `backend/main.py`

**Problem:** `No optimal solution found`
- Demands may be too high (>150 MW or >600 T/hr)
- Check constraints for conflicts (e.g., all GTAs offline)

### Frontend Issues

**Problem:** `Module not found: Can't resolve 'recharts'`
```bash
npm install recharts axios
```

**Problem:** API connection failed
- Ensure backend is running: `curl http://localhost:8000/api/health`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

---

## 📈 Future Enhancements

- [ ] WebSocket support for real-time monitoring
- [ ] Historical optimization logs with database
- [ ] Multi-objective optimization (cost + emissions)
- [ ] Predictive maintenance integration
- [ ] Mobile-responsive optimizations
- [ ] Export results to PDF/Excel
- [ ] User authentication and multi-tenant support

---

## 👨‍💻 Development

### Running Tests

**Backend:**
```bash
cd backend
python -m pytest tests/
```

**Frontend:**
```bash
npm run test
```

### Code Style

**Backend:** PEP 8 (use `black` formatter)
```bash
pip install black
black backend/
```

**Frontend:** ESLint + Prettier
```bash
npm run lint
```

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- **GitHub Issues**: [Repository Issues](https://github.com/yourusername/energy-copilot/issues)
- **Email**: support@energy-copilot.com
- **Documentation**: http://localhost:8000/docs

---

## 🎉 Acknowledgments

- **PuLP**: Linear programming library
- **FastAPI**: Modern web framework
- **Next.js**: React framework
- **Recharts**: Charting library
- **OCP Team**: Domain expertise and requirements

---

**Built with ❤️ for Chemical Plant Operations**
