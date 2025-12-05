#!/bin/bash

##############################################################################
# Energy Copilot - Quick Setup Script
##############################################################################

echo "🏭 Energy Copilot - Quick Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python
echo "📋 Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.9+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python found:${NC} $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found:${NC} $(node --version)"
echo ""

# Backend Setup
echo "🔧 Setting up Backend..."
echo "------------------------"

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

cd ..
echo ""

# Frontend Setup
echo "🎨 Setting up Frontend..."
echo "------------------------"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "================================"
echo ""
echo "📖 Quick Start Guide:"
echo ""
echo "1️⃣  Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "2️⃣  Start Frontend (in new terminal):"
echo "   npm run dev"
echo ""
echo "3️⃣  Open Dashboard:"
echo "   http://localhost:3000/dashboard"
echo ""
echo "4️⃣  View API Docs:"
echo "   http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}💡 Tip: Read ENERGY_COPILOT_README.md for detailed instructions${NC}"
echo ""
