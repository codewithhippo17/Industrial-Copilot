# Project Overview

We are building an **LLM-powered dashboard with integrated ML capabilities**. The platform allows users to create, manage, and share data visualizations while interacting with a chat interface powered by the LLM.
#### Dashboard
- Serves as the central showcase for all user-created content.
- Supports multiple **custom tabs**.
- Charts can be **added** either via:
    - **LLM chat prompts**, or
    - **Manual selection** from the workspace.
- Users can select **time frames** or **data windows** for each chart.
- Users can **share individual charts or entire tabs**.
#### Chat Interface
- Users can **select tabs, agents, sessions, and commands**:
    - **Tabs:** Dashboard tabs created by the user.
    - **Agents:** Natural language instructions describing how the LLM should behave.
    - **Sessions:** Conversation histories focused on specific topics.
    - **Commands:** Predefined tools implemented by the system.
- Users can **have where to input prompts and where to view conversations**.
- Users can **configure permissions** for agents and for the entire chat.
#### ML Model and Chart APIs
- Support two execution modes:
	- Designed for **energy optimization**.
    - **Manual triggering** via user prompt.
    - **Automatic triggering** when new data arrives.
- When triggered, a **notification is sent to the user** containing relevant details from previous chat interactions.
---
# Objectives

- Build an **interactive dashboard** that centralizes user-created charts, tabs, and visualizations.
- Integrate **LLM-powered assistance** for natural language interactions to create charts, trigger ML models, and retrieve insights.
- Develop an **energy optimization ML model** that can be executed manually or automatically based on incoming data.
- Provide **context-aware notifications** to inform users of model outputs and relevant updates.
- Enable **fine-grained control** over agents, sessions, commands, and chat permissions.
- Support **sharing and collaboration**, allowing users to share charts, tabs, and analysis seamlessly.
---
# Tech Stack & Dependencies

##### Frontend (Next.js)  
_Reason:_ Ideal for building dynamic dashboards with real-time interactions, server components, and smooth LLM chat embedding.
##### Backend (FastAPI: Python)  
_Reason:_ Fast, asynchronous, and integrates naturally with ML orchestration and event-driven pipelines.
##### Database (PostgreSQL)
_Reason:_
 - Perfect for **metadata** such as tabs, charts, agents, chat sessions, and permissions. Handles medium-scale datasets (GBs) reliably.
- Strong relational integrity for user-specific structures.
##### Real-Time Layer (WebSockets :FastAPI + Next.js)
_Reason:_
Delivers **real-time dashboard updates** and immediate notifications when charts refresh or the ML model triggers.
##### Authentication (Supabase Auth)
_Reason:_
- Works natively with Next.js using official helpers.
- Supports Email/Password + OAuth out of the box.
- Built on PostgreSQL, matching the project’s backend.
- Automatic, secure session handling.
- Easy permissions via Row-Level Security (RLS).
##### LLM Integration (Opencode SDK)  
_Reason:_
- Core of the system: handles chat interactions, agent instructions, tool calls, and chart creation.
##### Visualization Libraries (Plotly.js)
_Reason:_
- Supports dynamic frames, time windows, zooming, sharing, and complex energy charts.
- Fits the dashboard’s data visualization needs perfectly.
---
# System Components

#### ML Model for Energy Optimization && charting api capabilities :
- Predicts optimal energy usage patterns.
- Create charts.
#### Dashboard Module : 
- Manages tabs, charts, and sharing capabilities.
#### Chat Module :
- Manages user prompts, agent behavior, and sessions.
- manage LLm models
#### Permissions & Settings Module : 
- Controls access and user configuration.

---
# Architecture

- The system follows a **modular architecture** with clear separation between frontend, backend, ML model, and chat components.
---
# Repository Structure

#### Files the agent must read before starting its reasoning:
```
/ocp
├── README.md                     # Main project overview & quickstart
├── .env                          # Environment variables (backend + frontend)
├── .gitignore                    # Git ignore rules
├── .envrc                        # direnv config (loads Nix environment)
├── flake.nix                     # Nix development environment definition
├── flake.lock                    # Locked Nix dependency versions
│
├── /.opencode
│   ├── /context
│   │   └── opencode.md           # Full project spec for the Opencode agent
│   └── /docs
│       ├── ARCHITECTURE.md       # System architecture & data flow
│       ├── PRD.md                # Product requirements document
│       └── opencode_sdk.md       # Guide for using the Opencode SDK
│
├── /.direnv
│   ├── bin/                      # Helper scripts for direnv
│   ├── flake-inputs/             # Downloaded Nix dependencies
│   ├── flake-profile-*           # Cached Nix build profiles
│   └── flake-profile-*.rc        # Runtime config for Nix environment
│
├── /backend
│   ├── README.md                 # Backend overview and usage
│   ├── main.py                   # FastAPI application entrypoint
│   │
│   ├── /api                      # FastAPI route definitions (endpoints)
│   │   └── README.md
│   ├── /services                 # Business logic (ML triggers, workflows)
│   │   └── README.md
│   ├── /models                   # Database/ML models
│   │   └── README.md
│   ├── /schemas                  # Pydantic request/response schemas
│   │   └── README.md
│   └── /workers                  # Background jobs (async tasks, scheduling)
│       └── README.md
│
├── /config
│   └── README.md                 # Configuration docs (DB, ML, API, env)
│
├── /ml
│   └── README.md                 # Machine learning module overview
│
├── /scripts
│   └── README.md                 # Dev scripts (setup, tooling, automation)
│
├── /src                          # Frontend (Next.js 14 App Router)
│   ├── /app                      # Application routes
│   │   ├── README.md
│   │   ├── /dashboard            # Dashboard pages & components
│   │   │   └── README.md
│   │   ├── /chat                 # Chat UI & real-time components
│   │   │   └── README.md
│   │   ├── /settings             # User settings pages & permissions UI
│   │   │   └── README.md
│   │   └── /Workspace            # User workspace: saved charts, notes, assets
│   │       └── README.md
│   │
│   ├── /components               # Global reusable UI components
│   │   └── README.md
│   ├── /hooks                    # Custom React hooks
│   │   └── README.md
│   ├── /layouts                  # Page and dashboard layouts
│   │   └── README.md
│   ├── /lib                      # Frontend utilities & API facades
│   │   └── README.md
│   └── /styles                   # Tailwind/global styling
│       └── README.md
│
└── /tests
    └── README.md                 # Test structure overview (unit, integration)
```
---
