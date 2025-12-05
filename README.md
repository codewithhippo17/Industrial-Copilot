# Energy Copilot - OCP (Optimization & Control Platform)

A Next.js-based energy optimization and monitoring platform with AI-powered chat capabilities using Ollama and OpenCode.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Ollama** installed and running
- **OpenCode** extension/integration

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ocp
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- And other project dependencies

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# OpenCode Configuration
OPENCODE_API_URL=http://localhost:3001
OPENCODE_API_KEY=your_api_key_here

# Application Settings
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🤖 Ollama Setup with OpenCode

### Step 1: Install Ollama

#### On Linux/WSL:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### On macOS:
```bash
brew install ollama
```

#### On Windows:
Download from [ollama.ai](https://ollama.ai)

### Step 2: Start Ollama Service

```bash
ollama serve
```

The service will run on `http://localhost:11434`

### Step 3: Pull Required Models

```bash
# Recommended for chat
ollama pull llama2

# Alternative models
ollama pull mistral
ollama pull codellama
ollama pull deepseek-coder
```

### Step 4: Verify Ollama Installation

```bash
curl http://localhost:11434/api/tags
```

You should see a list of installed models.

### Step 5: OpenCode Integration

1. **Install OpenCode Extension** (if using VS Code or compatible IDE)
2. **Configure OpenCode** to use Ollama as the backend:

```json
{
  "opencode.provider": "ollama",
  "opencode.ollamaUrl": "http://localhost:11434",
  "opencode.model": "llama2"
}
```

3. **Test OpenCode Connection**:
```bash
# The application will automatically connect to Ollama through OpenCode
# Check the /api/chat endpoint for functionality
```

---

## 🏗️ Build Process

### Development Build

```bash
npm run dev
```

The application will start on `http://localhost:3000`

**What happens during development:**
- Next.js starts in development mode with hot-reload
- TypeScript compilation happens on-the-fly
- Tailwind CSS processes styles dynamically
- API routes are available at `/api/*`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

**Build output:**
- Optimized JavaScript bundles in `.next/` directory
- Static assets in `.next/static/`
- Server-side rendered pages ready for deployment

### Build Verification

```bash
# Check build size and performance
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Static pages generated
# ✓ Lambda functions optimized
```

---

## 📁 Project Structure

```
ocp/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── api/          # API routes (chat, agent, config)
│   │   ├── chat/         # Chat interface
│   │   ├── dashboard/    # Monitoring dashboard
│   │   ├── optimize/     # Optimization tools
│   │   └── workspace/    # Workspace management
│   ├── components/       # React components
│   │   ├── business/     # Business logic components
│   │   ├── chat/         # Chat UI components
│   │   ├── kpi/          # KPI displays
│   │   ├── monitoring/   # Real-time monitoring
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities and API clients
│   ├── styles/           # Global styles
│   └── types/            # TypeScript definitions
├── backend/              # Python backend (optional)
│   ├── core/             # Core optimization logic
│   └── routers/          # API routers
├── public/               # Static assets
└── ml/                   # Machine learning data
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Create optimized production build
npm start            # Start production server

# Utilities
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

---

## 🌐 API Endpoints

### Chat API
- **POST** `/api/chat` - Send messages to AI agent via Ollama

### Agent API
- **GET** `/api/agent` - Get available agents
- **POST** `/api/agent` - Execute agent actions

### Config API
- **GET** `/api/config` - Get application configuration
- **GET** `/api/config/providers` - Get AI provider settings

---

## 🎯 Features

- **Real-time Energy Monitoring** - Live steam, pressure, and cost tracking
- **AI Chat Assistant** - Powered by Ollama + OpenCode
- **Optimization Tools** - Scenario building and trade-off simulation
- **Interactive Dashboards** - Sankey diagrams, gauges, trend charts
- **Fleet Management** - GTA (Gas Turbine) monitoring
- **Cost Analytics** - Real-time cost tracking and forecasting

---

## 🐛 Troubleshooting

### Ollama Not Connecting

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
pkill ollama
ollama serve
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [OpenCode Documentation](https://opencode.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Quick Reference

**Start Everything:**
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Application
npm install
npm run dev
```

**Access:**
- Application: http://localhost:3000
- Ollama API: http://localhost:11434
- Chat Interface: http://localhost:3000/chat
- Dashboard: http://localhost:3000/dashboard

---

**Built with ❤️ using Next.js, Ollama, and OpenCode**
