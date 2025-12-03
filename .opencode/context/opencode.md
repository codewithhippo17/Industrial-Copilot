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
project-root/
│
├── README.md                     # Project overview
├── package.json                  # Frontend dependencies
├── tailwind.config.js            # Tailwind setup
├── next.config.js                # Next.js config
├── pyproject.toml / requirements.txt  # Backend dependencies
├── .env                          # Environment variables
│
├── /.opencode
│   ├── /context
│   │   └── opencode.md           # Full project spec for agent reasoning
│   └── /docs
│   │   ├── architecture.md       # Architecture diagrams + flow
│   │   ├── workflows.md          # Step-by-step workflows
│   │   └── guides.md             # Setup and developer guides
│
├── /src
│   ├── /app                      # Next.js App Router pages
│   │   ├── /dashboard            # Dashboard pages and components
│   │   ├── /chat                 # Chat interface components
│   │   └── /settings             # User settings and permissions
│   │   └── /Workspace            # User workspace area
│   │
│   ├── /components               # Reusable UI components
│   ├── /hooks                    # React hooks
│   ├── /layouts                  # Layouts for dashboard / chat / pages
│   ├── /lib                      # Utilities, API clients (Supabase, ML API, Opencode)
│   └── /styles                   # Tailwind + global styles
│
├── /backend
│   ├── /api                      # FastAPI routes
│   ├── /services                 # Business logic (ML triggers, notifications)
│   ├── /models                   # ML model definitions
│   ├── /schemas                  # Pydantic schemas for API requests/responses
│   ├── /workers                  # Background jobs, scheduled tasks
│   └── main.py                   # FastAPI entrypoint
│
├── /ml
│   ├── /models                   # Energy optimization models
│   ├── /preprocessing            # Data cleaning, transformation scripts
│   ├── /training                 # Training scripts
│   └── /evaluation               # Evaluation scripts / metrics
│
├── /agents
│   ├── /instructions             # Agent prompt templates
│   ├── /tools                    # Custom LLM tools / command definitions
│   └── /schemas                  # Agent input/output schemas
│
├── /config
│   ├── supabase.js / ts          # Supabase client setup
│   ├── db.js / ts                # Database client
│   ├── ml_config.yaml            # ML hyperparameters
│   └── notifications.js          # Notification settings / API keys
│
├── /tests
│   ├── /frontend                 # Jest / RTL tests
│   ├── /backend                  # Pytest tests
│   ├── /ml                       # Model unit tests
│   └── /integration              # Full-stack integration tests
│
└── /scripts


```

