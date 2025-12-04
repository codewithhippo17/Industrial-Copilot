# **🗄️ OCP DATABASE SCHEMA DESIGN (PRELIMINARY)**
## **PostgreSQL Schema for LLM-Powered Dashboard with ML Integration**

*Based on requirements gathered as of December 3, 2025. This schema provides the foundation for a hybrid personal/team architecture with unlimited dashboards, complex charts, full versioning, and unlimited chat sessions.*

---

## **🏗️ SCHEMA OVERVIEW**

### **Core Design Principles:**
- **Hybrid Architecture**: Personal + shared team spaces
- **Unlimited Scalability**: No limits on dashboards, tabs, or chat sessions
- **Rich Content Support**: JSONB for complex configurations and rich chat content
- **Full Versioning**: Complete dashboard history with diffs
- **Performance Optimized**: Strategic indexing and query optimization
- **Supabase Integration**: Extends auth.users with custom profile data

---

## **📊 CORE TABLES**

### **1. User Management & Teams**

```sql
-- Extends Supabase auth.users table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}', -- theme, language, notifications
    workspace_settings JSONB DEFAULT '{}', -- preferred chart types, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams for shared collaboration
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Team memberships with roles
CREATE TYPE team_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE user_team_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);
```

### **2. Dashboard Architecture**

```sql
-- Main dashboards (can be personal or team-owned)
CREATE TABLE dashboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    owner_user_id UUID REFERENCES auth.users(id),
    owner_team_id UUID REFERENCES teams(id),
    is_public BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}', -- layout preferences, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: must have either user or team owner, not both
    CONSTRAINT dashboard_owner_check CHECK (
        (owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
        (owner_user_id IS NULL AND owner_team_id IS NOT NULL)
    )
);

-- Dashboard tabs (unlimited per dashboard)
CREATE TABLE dashboard_tabs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL, -- for tab ordering
    settings JSONB DEFAULT '{}', -- tab-specific settings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dashboard_id, position)
);

-- Charts (max 10 per tab)
CREATE TABLE charts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_tab_id UUID REFERENCES dashboard_tabs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    chart_type TEXT NOT NULL, -- line, bar, pie, heatmap, etc.
    configuration JSONB NOT NULL, -- complex chart config: styling, calculations, data sources
    position INTEGER NOT NULL, -- for chart ordering within tab
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dashboard_tab_id, position)
);

-- Enforce max 10 charts per tab
CREATE OR REPLACE FUNCTION check_max_charts_per_tab()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM charts WHERE dashboard_tab_id = NEW.dashboard_tab_id) >= 10 THEN
        RAISE EXCEPTION 'Maximum 10 charts allowed per dashboard tab';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_charts_per_tab
    BEFORE INSERT ON charts
    FOR EACH ROW
    EXECUTE FUNCTION check_max_charts_per_tab();
```

### **3. Dashboard Versioning System**

```sql
-- Dashboard versions for full history tracking
CREATE TABLE dashboard_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL, -- complete dashboard state
    change_summary TEXT, -- what changed in this version
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dashboard_id, version_number)
);

-- Auto-increment version numbers
CREATE OR REPLACE FUNCTION increment_dashboard_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version_number := COALESCE(
        (SELECT MAX(version_number) FROM dashboard_versions WHERE dashboard_id = NEW.dashboard_id), 0
    ) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_dashboard_version
    BEFORE INSERT ON dashboard_versions
    FOR EACH ROW
    EXECUTE FUNCTION increment_dashboard_version();
```

### **4. LLM Chat System**

```sql
-- Chat sessions (unlimited per user)
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    context_type TEXT, -- 'dashboard', 'workspace', 'global'
    context_id UUID, -- dashboard_id if context_type = 'dashboard'
    settings JSONB DEFAULT '{}', -- session preferences
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM Models available in the system
CREATE TABLE llm_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL, -- anthropic, openai, etc.
    model_id TEXT NOT NULL, -- claude-3-5-sonnet-20241022
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    capabilities JSONB DEFAULT '{}', -- features, limits, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, model_id)
);

-- Agents (user-customizable)
CREATE TABLE agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL, -- agent behavior instructions
    owner_user_id UUID REFERENCES auth.users(id),
    owner_team_id UUID REFERENCES teams(id),
    is_public BOOLEAN DEFAULT FALSE, -- shareable agents
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: must have either user or team owner
    CONSTRAINT agent_owner_check CHECK (
        (owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
        (owner_user_id IS NULL AND owner_team_id IS NOT NULL)
    )
);

-- Custom commands (user-defined)
CREATE TABLE custom_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    command_pattern TEXT NOT NULL, -- regex pattern for command matching
    handler_config JSONB NOT NULL, -- how to execute the command
    owner_user_id UUID REFERENCES auth.users(id),
    owner_team_id UUID REFERENCES teams(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: must have either user or team owner
    CONSTRAINT command_owner_check CHECK (
        (owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
        (owner_user_id IS NULL AND owner_team_id IS NOT NULL)
    )
);

-- Chat messages with rich content support
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content JSONB NOT NULL, -- rich content: text, charts, files, etc.
    agent_id UUID REFERENCES agents(id), -- which agent was used
    llm_model_id UUID REFERENCES llm_models(id), -- which model was used
    output_routing JSONB, -- where outputs were placed: dashboard, workspace, etc.
    metadata JSONB DEFAULT '{}', -- token usage, processing time, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **5. Workspace & Output Management**

```sql
-- User workspace for saved items
CREATE TABLE workspace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'chart', 'file', 'note', 'analysis'
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- item data
    tags TEXT[], -- for organization
    created_from_message_id UUID REFERENCES chat_messages(id), -- if from chat
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **6. Sharing & Public Access**

```sql
-- Public sharing links for dashboards
CREATE TABLE sharing_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL, -- public access token
    permissions JSONB DEFAULT '{"view": true}', -- what's allowed
    expires_at TIMESTAMPTZ, -- optional expiration
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);
```

---

## **🔍 INDEXING STRATEGY**

### **Performance Optimization Indexes:**

```sql
-- User and team queries
CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX idx_user_team_memberships_user_id ON user_team_memberships(user_id);
CREATE INDEX idx_user_team_memberships_team_id ON user_team_memberships(team_id);

-- Dashboard queries
CREATE INDEX idx_dashboards_owner_user_id ON dashboards(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_dashboards_owner_team_id ON dashboards(owner_team_id) WHERE owner_team_id IS NOT NULL;
CREATE INDEX idx_dashboards_public ON dashboards(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_dashboards_updated_at ON dashboards(updated_at DESC);

-- Dashboard structure
CREATE INDEX idx_dashboard_tabs_dashboard_id ON dashboard_tabs(dashboard_id);
CREATE INDEX idx_dashboard_tabs_position ON dashboard_tabs(dashboard_id, position);
CREATE INDEX idx_charts_dashboard_tab_id ON charts(dashboard_tab_id);
CREATE INDEX idx_charts_position ON charts(dashboard_tab_id, position);

-- Chart configuration queries (JSONB)
CREATE INDEX idx_charts_configuration_gin ON charts USING GIN (configuration);

-- Dashboard versioning
CREATE INDEX idx_dashboard_versions_dashboard_id ON dashboard_versions(dashboard_id);
CREATE INDEX idx_dashboard_versions_created_at ON dashboard_versions(dashboard_id, created_at DESC);

-- Chat system
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_context ON chat_sessions(context_type, context_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(chat_session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(chat_session_id, created_at DESC);

-- Full-text search on chat messages
CREATE INDEX idx_chat_messages_content_search ON chat_messages USING GIN ((content->>'text'));

-- Agent and command queries
CREATE INDEX idx_agents_owner_user_id ON agents(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_agents_public ON agents(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_custom_commands_owner_user_id ON custom_commands(owner_user_id) WHERE owner_user_id IS NOT NULL;

-- Workspace queries
CREATE INDEX idx_workspace_items_user_id ON workspace_items(user_id);
CREATE INDEX idx_workspace_items_type ON workspace_items(user_id, item_type);
CREATE INDEX idx_workspace_items_tags ON workspace_items USING GIN (tags);
```

---

## **🔐 ROW LEVEL SECURITY (RLS) POLICIES**

### **Supabase RLS Implementation:**

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_links ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Dashboard access policies
CREATE POLICY "Users can view own dashboards" ON dashboards
    FOR SELECT USING (
        owner_user_id = auth.uid() OR
        owner_team_id IN (
            SELECT team_id FROM user_team_memberships 
            WHERE user_id = auth.uid()
        ) OR
        is_public = TRUE
    );

-- Chat session policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Workspace policies
CREATE POLICY "Users can manage own workspace" ON workspace_items
    FOR ALL USING (user_id = auth.uid());
```

---

## **📈 EXAMPLE QUERIES**

### **Common Query Patterns:**

```sql
-- Get user's dashboards with latest version
SELECT 
    d.id,
    d.title,
    d.description,
    d.updated_at,
    dv.version_number as latest_version
FROM dashboards d
LEFT JOIN dashboard_versions dv ON d.id = dv.dashboard_id
WHERE d.owner_user_id = $1
ORDER BY d.updated_at DESC;

-- Get dashboard with all tabs and charts
SELECT 
    d.title as dashboard_title,
    dt.title as tab_title,
    dt.position as tab_position,
    c.title as chart_title,
    c.chart_type,
    c.configuration,
    c.position as chart_position
FROM dashboards d
JOIN dashboard_tabs dt ON d.id = dt.dashboard_id
LEFT JOIN charts c ON dt.id = c.dashboard_tab_id
WHERE d.id = $1
ORDER BY dt.position, c.position;

-- Search chat messages across all sessions
SELECT 
    cs.title as session_title,
    cm.content,
    cm.created_at
FROM chat_messages cm
JOIN chat_sessions cs ON cm.chat_session_id = cs.id
WHERE cs.user_id = $1
    AND cm.content->>'text' ILIKE '%search_term%'
ORDER BY cm.created_at DESC;

-- Get team dashboards with member access
SELECT 
    d.id,
    d.title,
    t.name as team_name,
    utm.role as user_role
FROM dashboards d
JOIN teams t ON d.owner_team_id = t.id
JOIN user_team_memberships utm ON t.id = utm.team_id
WHERE utm.user_id = $1
ORDER BY d.updated_at DESC;
```

---

## **⚡ PERFORMANCE CONSIDERATIONS**

### **Optimization Strategies:**

1. **JSONB Usage**: Complex configurations stored efficiently with GIN indexes
2. **Partial Indexes**: Only index active/relevant records
3. **Query Planning**: Designed for common access patterns
4. **Connection Pooling**: Use pgBouncer for connection management
5. **Prepared Statements**: Cache frequently used queries
6. **Batch Operations**: Group related inserts/updates

### **Scalability Preparations:**

- **Partitioning Ready**: Chat messages can be partitioned by date if needed
- **Read Replicas**: Schema supports read-only replicas for reporting
- **Caching Layer**: Redis can cache dashboard configurations
- **CDN Integration**: Chart images and assets can be CDN-cached

---

## **🚀 MIGRATION STRATEGY**

### **Initial Setup Script:**

```sql
-- Run migrations in order:
-- 1. Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- 2. Create custom types
-- (included in table definitions above)

-- 3. Create tables in dependency order
-- (user_profiles, teams, user_team_memberships, etc.)

-- 4. Create indexes
-- (all indexes listed above)

-- 5. Enable RLS and create policies
-- (all policies listed above)

-- 6. Create triggers and functions
-- (constraint enforcement functions above)
```

---

## **📊 SCHEMA SUMMARY**

### **Tables Created:** 13 core tables
- **User Management**: user_profiles, teams, user_team_memberships
- **Dashboards**: dashboards, dashboard_tabs, charts, dashboard_versions
- **Chat System**: chat_sessions, chat_messages, agents, llm_models, custom_commands
- **Workspace**: workspace_items
- **Sharing**: sharing_links

### **Key Features Supported:**
- ✅ Hybrid personal + team architecture
- ✅ Unlimited dashboards with unlimited tabs
- ✅ Max 10 charts per tab (enforced by trigger)
- ✅ Complex chart configurations (JSONB)
- ✅ Full dashboard versioning with history
- ✅ Unlimited chat sessions with rich content
- ✅ Per-prompt agent and model selection
- ✅ Custom commands and external integrations
- ✅ Public dashboard sharing
- ✅ Workspace for saved items
- ✅ Full-text search on chat history
- ✅ Performance-optimized with strategic indexing

### **Performance Optimizations:**
- 25+ strategic indexes for fast queries
- GIN indexes for JSONB search capabilities
- Row Level Security for data isolation
- Prepared for horizontal scaling

---

**🎯 STATUS:** Schema design covers all current requirements and provides foundation for remaining features

**➡️ NEXT STEPS:**
1. Complete remaining questionnaire sections (C, E, F, G, H, I, J)
2. Refine schema based on additional requirements
3. Add ML model integration tables
4. Design notification system tables
5. Create comprehensive API endpoint specifications

*This schema provides a robust foundation that can evolve as requirements are refined.*