# ⚡ Energy Copilot - Quick Reference Guide

## 🚀 Start the Application

### Option 1: Automated Setup (First Time)
```bash
./setup.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Or: venv\Scripts\activate on Windows
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000/dashboard | Main UI |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/api/health | Backend status |

---

## 🎯 Quick Test

### Using UI (Recommended)

1. Open: http://localhost:3000/dashboard
2. Set values:
   - Electricity: `60` MW
   - Steam: `400` T/hr
   - Hour: `14`
3. Click: **"Run Optimization"**
4. View results in charts and cost ticker

### Using API (curl)

```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "elec_demand": 60.0,
    "steam_demand": 400.0,
    "hour": 14
  }'
```

### Using Python

```python
import requests

response = requests.post('http://localhost:8000/api/optimize', json={
    'elec_demand': 60.0,
    'steam_demand': 400.0,
    'hour': 14,
    'constraints': {'gta2_status': 'MAINTENANCE'}
})

print(response.json())
```

---

## 🔧 Common Constraints

### GTA Status
```json
{
  "gta1_status": "OFF",          // GTA 1 completely offline
  "gta2_status": "MAINTENANCE",  // GTA 2 at 50% capacity
  "gta3_status": "OFF"           // GTA 3 offline
}
```

### Client Requirements
```json
{
  "cap_steam": 420,              // Client CAP needs 420 T/hr minimum
  "min_total_steam": 450         // Total plant minimum steam
}
```

### Grid Limits
```json
{
  "max_grid_import": 30          // Limit grid import to 30 MW
}
```

### Combined Example
```json
{
  "gta2_status": "MAINTENANCE",
  "cap_steam": 420,
  "max_grid_import": 30
}
```

---

## 📊 Reading Results

### Cost Ticker
- **Green Number**: Hourly savings (DH/hr)
- **Percentage**: Cost reduction vs baseline
- **Breakdown**: Click "Show Breakdown" for details

### Merit Order Chart
- **🟩 Green** (Bottom): Sulfur recovery - Cheapest
- **🟦 Blue**: GTAs - Medium cost
- **🟨 Yellow**: Grid import - Variable cost
- **🟥 Red** (Top): Boiler - Most expensive (avoid!)

### GTA Operations
- **Admission**: HP steam input (T/hr)
- **Soutirage**: MP steam extraction (T/hr)
- **Power**: Electrical output (MW)

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Problem**: `ModuleNotFoundError: No module named 'pulp'`
```bash
pip install -r backend/requirements.txt
```

**Problem**: Port 8000 already in use
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Problem**: `Module not found: recharts`
```bash
npm install
```

**Problem**: API connection failed
- Ensure backend is running: `curl http://localhost:8000/api/health`
- Check console for CORS errors

### Optimization Fails

**Problem**: "No optimal solution found"
- Demands may be too high (>150 MW or >600 T/hr)
- Conflicting constraints (e.g., all GTAs offline + high demand)
- Try reducing demands or removing constraints

---

## 📁 Key Files

### Backend
```
backend/
├── core/
│   ├── config.py       ← Financial constants
│   └── optimizer.py    ← PuLP solver
├── routers/
│   └── simulation.py   ← API endpoints
└── main.py            ← Entry point
```

### Frontend
```
src/
├── app/dashboard/
│   └── page.tsx           ← Main dashboard
├── components/
│   ├── business/
│   │   ├── ConstraintPanel.tsx  ← Rule engine
│   │   └── MeritOrderChart.tsx  ← Charts
│   └── kpi/
│       └── CostTicker.tsx       ← Savings display
└── lib/
    └── api.ts                    ← API client
```

---

## 🎓 Understanding the Math

### Power Prediction Formula
```
P_elec = coef_A × Admission + coef_S × Soutirage + intercept

GTA 1: P = 0.2761×A - 0.1805×S - 2.72
GTA 2: P = 0.2560×A - 0.1782×S - 0.02
GTA 3: P = 0.2573×A - 0.1723×S + 0.06
```

### Cost Function (Minimized)
```
Total_Cost = Grid_Cost + Boiler_Cost + Sulfur_Cost + GTA_Fuel_Cost

Where:
  Grid_Cost = Grid_Import × Grid_Price × 1000  (MW → kW)
  Boiler_Cost = Boiler_Output × 284 DH/Ton
  Sulfur_Cost = Sulfur_Steam × 20 DH/Ton
  GTA_Fuel_Cost = Σ(Admission × 65 DH/Ton)
```

### Grid Pricing
- **Peak Hours** (17h-22h): 1.27 DH/kWh
- **Off-Peak**: 0.55 DH/kWh

---

## 💡 Tips & Best Practices

### Optimization Tips
1. ✅ Run during off-peak hours to leverage cheap grid
2. ✅ Use sulfur recovery (free steam) to maximum
3. ✅ Avoid boiler usage when possible (most expensive)
4. ✅ Test constraints one at a time

### Development Tips
1. 📖 Check API docs: http://localhost:8000/docs
2. 🔍 Use browser DevTools to see API requests
3. 📊 Test with pre-defined scenarios first
4. 🧪 Validate inputs before optimization

### Performance Tips
1. ⚡ Optimization typically completes in <1 second
2. 📉 Large constraint sets may take longer
3. 🔄 Frontend caches results until new optimization
4. 💾 Consider saving frequently-used scenarios

---

## 📞 Quick Commands

### Install Dependencies
```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
npm install
```

### Run Tests
```bash
# Backend (if tests exist)
pytest backend/tests/

# Frontend
npm test
```

### Format Code
```bash
# Backend (Python)
black backend/

# Frontend (JavaScript/TypeScript)
npm run lint
```

### Check API Health
```bash
curl http://localhost:8000/api/health
```

### Get System Info
```bash
curl http://localhost:8000/api/system-info
```

---

## 🎯 Sample Scenarios

### Scenario 1: Normal Operation
```json
{
  "elec_demand": 60.0,
  "steam_demand": 400.0,
  "hour": 14,
  "constraints": {}
}
```
**Expected**: All GTAs used, minimal grid, no boiler

### Scenario 2: Peak Hours
```json
{
  "elec_demand": 70.0,
  "steam_demand": 450.0,
  "hour": 19,
  "constraints": {}
}
```
**Expected**: Higher GTA usage to avoid expensive grid

### Scenario 3: Maintenance Mode
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
**Expected**: GTA 2 limited to 50%, others compensate

### Scenario 4: Client Priority
```json
{
  "elec_demand": 65.0,
  "steam_demand": 450.0,
  "hour": 15,
  "constraints": {
    "cap_steam": 460
  }
}
```
**Expected**: Total steam ≥ 460 T/hr guaranteed

---

## 📚 Documentation Links

- **Full README**: `ENERGY_COPILOT_README.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: http://localhost:8000/docs (when running)
- **Setup Script**: `./setup.sh`

---

## ✅ Checklist for Production

- [ ] Install all dependencies (`./setup.sh`)
- [ ] Test with pre-defined scenarios
- [ ] Verify API health check works
- [ ] Test constraint combinations
- [ ] Configure environment variables (`.env.local`)
- [ ] Set up process monitoring (systemd/PM2)
- [ ] Configure reverse proxy (nginx)
- [ ] Enable HTTPS
- [ ] Set up logging
- [ ] Configure backup for optimization history

---

## 🎉 You're Ready!

Everything is set up and ready to use. Start with:

1. Run `./setup.sh` (first time only)
2. Start backend: `cd backend && python main.py`
3. Start frontend: `npm run dev`
4. Open: http://localhost:3000/dashboard

**Happy Optimizing! 🏭⚡💰**
