# 🧪 Testing Guide - Bento Grid Dashboard

## Quick Start

### 1. Backend Status ✅
Backend is already running on port 8000 with new steam economics fields.

```bash
# Verify backend is serving data
curl http://localhost:8000/api/live | python3 -m json.tool | head -50
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "steam_economics": {
      "blended_cost_per_ton": 28.04,
      "total_steam_cost_per_hour": 15800.0,
      "source_breakdown": {
        "sulfur_percent": 14.2,
        "gta_percent": 76.9,
        "boiler_percent": 8.9
      }
    },
    "mp_pressure": 8.53
  }
}
```

### 2. Start Frontend

```bash
cd /home/bneay/Industrial-Copilot
npm run dev
```

### 3. Open Dashboard

Navigate to: `http://localhost:3000/dashboard`

## 🎯 What to Test

### Row 1: KPI Ticker
- [ ] **Cost Rate** card shows value in DH/h
- [ ] **Avg Steam Cost** shows blended cost (should be < 100 DH/T)
- [ ] **Plant Efficiency** shows percentage with color coding
- [ ] **MP Pressure** shows bar value with status
  - Green if > 9.0 bar
  - Yellow if 8.5-9.0 bar  
  - Red if < 8.5 bar

### Row 2: Main Visuals

#### Left Side (8 cols): PlantSchematic
- [ ] Sulfur Plant node (green) visible
- [ ] Aux Boiler node (red) visible
- [ ] Grid node (yellow) visible
- [ ] GTAs (blue) visible
- [ ] MP Steam Header (gray) visible
- [ ] Animated flow lines moving
- [ ] If boiler active (> 0), red line pulses
- [ ] If pressure < 8.5, steam header pulses red

#### Right Side (4 cols): Steam Economics + GTA Summary

**Top Panel: SteamEconomics**
- [ ] Donut chart renders with 3 colored segments
  - Green: Sulfur (Free)
  - Blue: GTA Extraction
  - Red: Boiler
- [ ] Center shows blended cost (large number)
- [ ] Business insight text shows percentage
- [ ] Alert banner if boiler active

**Bottom Panel: GTA Status**
- [ ] GTA 1 power output shown
- [ ] GTA 2 power output shown
- [ ] GTA 3 power output shown
- [ ] Total output highlighted in green

### Row 3: Historical Trends
- [ ] LiveTrendChart displays with dual Y-axis
- [ ] Power trend line (blue/green)
- [ ] Pressure trend line (orange/yellow)
- [ ] Auto-updates every 5 seconds

## 🔍 Visual Checks

### Layout
- [ ] No overlapping components
- [ ] Consistent spacing (16px gaps)
- [ ] All cards have rounded corners (12px radius)
- [ ] Background is slate-950
- [ ] Cards are slate-900

### Typography
- [ ] All numbers use monospaced font
- [ ] Icons are consistently sized (16px, 20px, 32px)
- [ ] Text hierarchy is clear (sm/xs/lg)

### Colors
- [ ] Critical alerts are red/rose
- [ ] Warnings are yellow/amber
- [ ] Success indicators are green/emerald
- [ ] Neutral text is slate-300/400/500

### Animations
- [ ] Flow lines animate continuously
- [ ] Pulsing dots on active status indicators
- [ ] Smooth transitions on data updates
- [ ] No jank or performance issues

## 🐛 Known Non-Critical Issues

These don't affect dashboard functionality:

1. Icon name type errors in other components (ConstraintPanel, MeritOrderChart, etc.)
   - Only affects `/optimize` page
   - Dashboard uses valid icon names

2. TradeOffSimulator parseFloat warnings
   - Component works correctly
   - Type casting issue only

## ✅ Success Criteria

Dashboard is working correctly if:

1. ✅ All 4 KPI cards display with correct values
2. ✅ PlantSchematic renders with animated flows
3. ✅ SteamEconomics donut chart shows cost breakdown
4. ✅ GTA status summary updates in real-time
5. ✅ LiveTrendChart displays historical data
6. ✅ Auto-refresh works (5-second interval)
7. ✅ No layout shifts or overlapping
8. ✅ Colors match design system

## 📸 Expected Appearance

```
╔═══════════════════════════════════════════════════════════════╗
║  [💰 Cost]  [💧 Steam]  [⚡ Efficiency]  [📊 Pressure]        ║
╠════════════════════════════════════╦══════════════════════════╣
║                                    ║  🍩 Steam Economics      ║
║   🏭 Plant Schematic               ║  (Donut Chart)           ║
║   (Animated Flows)                 ║  ────────────────────    ║
║                                    ║  📊 GTA Summary          ║
║                                    ║  GTA1: 18.6 MW          ║
║                                    ║  GTA2: 23.9 MW          ║
║                                    ║  GTA3: 20.9 MW          ║
╠════════════════════════════════════╩══════════════════════════╣
║  📈 Historical Trends (Power & Pressure)                      ║
╚═══════════════════════════════════════════════════════════════╝
```

## 🚀 Performance Targets

- Page load: < 2 seconds
- Data refresh: < 500ms
- Animation FPS: 60fps
- Memory usage: < 200MB

## 📝 Testing Checklist

Complete this checklist to verify full functionality:

### Backend Integration
- [ ] `/api/live` endpoint returns data
- [ ] `steam_economics` field present
- [ ] `mp_pressure` field present
- [ ] Data updates every 5 seconds

### Layout & Styling
- [ ] Bento Grid renders correctly
- [ ] Responsive on large screens (1920px+)
- [ ] No horizontal scrolling
- [ ] Vertical scrolling works smoothly

### Components
- [ ] StatCard: All 4 render
- [ ] PlantSchematic: Animations work
- [ ] SteamEconomics: Chart displays
- [ ] LiveTrendChart: Updates in real-time

### Interactions
- [ ] "Optimization Mode" button navigates to `/optimize`
- [ ] Auto-refresh doesn't cause flashing
- [ ] Error handling works (if backend down)
- [ ] Retry button works on errors

---

**Test Status:** 🟡 Ready for Testing  
**Last Updated:** December 5, 2025  
**Tester:** Run `npm run dev` and navigate to `/dashboard`
