#!/bin/bash

# 🚀 Control Room Dashboard - Installation Script
# Installs Nivo dependencies for Sankey diagram

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Energy Copilot - Control Room Dashboard Setup           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

echo "📦 Installing Nivo Sankey dependencies..."
npm install @nivo/core @nivo/sankey

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Backend is running: http://localhost:8000 ✓"
    echo "  2. Start frontend:     npm run dev"
    echo "  3. Open dashboard:     http://localhost:3000/dashboard"
    echo ""
    echo "🎛️  You should now see:"
    echo "  • Sankey flow diagram (MP Steam energy flow)"
    echo "  • Pressure heartbeat sparkline"
    echo "  • Live event feed with AI insights"
    echo "  • Compact status cards"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check your npm configuration."
    exit 1
fi
