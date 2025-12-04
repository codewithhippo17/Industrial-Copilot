-- =============================================================================
-- MIGRATION 002: WORKSPACE & CHAT SYSTEM
-- =============================================================================
-- Adds workspace integration and LLM chat system
-- Run after 001_initial_setup.sql

-- =============================================================================
-- 1. WORKSPACE INTEGRATION
-- =============================================================================

-- Enhanced workspace for chart library
CREATE TABLE workspace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'chart', 'template', 'dataset', 'note'
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- item-specific data
    reference_id UUID, -- links to charts, templates, etc.
    tags TEXT[], -- for organization
    folder_path TEXT, -- hierarchical organization
    is_favorite BOOLEAN DEFAULT FALSE,
    created_from_message_id UUID, -- if generated from chat
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace folders for organization
CREATE TABLE workspace_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_folder_id UUID REFERENCES workspace_folders(id), -- for nested folders
    path TEXT NOT NULL, -- computed path for fast queries
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, path)
);

-- =============================================================================
-- 2. LLM CHAT SYSTEM
-- =============================================================================

-- Chat sessions
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    context_type TEXT, -- 'dashboard', 'workspace', 'global'
    context_id UUID, -- dashboard_id if context_type = 'dashboard'
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM Models 
CREATE TABLE llm_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    capabilities JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, model_id)
);

-- Agents with template/chart creation capabilities
CREATE TABLE agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    capabilities JSONB DEFAULT '{}', -- chart creation, template design, etc.
    owner_user_id UUID REFERENCES auth.users(id),
    owner_team_id UUID REFERENCES teams(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT agent_owner_check CHECK (
        (owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
        (owner_user_id IS NULL AND owner_team_id IS NOT NULL)
    )
);

-- Commands for chat system
CREATE TABLE commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    usage_example TEXT,
    parameters_schema JSONB DEFAULT '{}', -- JSON schema for command parameters
    is_system_command BOOLEAN DEFAULT FALSE,
    owner_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages with chart/template creation outputs
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content JSONB NOT NULL, -- rich content including charts, templates
    agent_id UUID REFERENCES agents(id),
    llm_model_id UUID REFERENCES llm_models(id),
    command_id UUID REFERENCES commands(id),
    output_routing JSONB, -- where outputs were placed
    created_items JSONB, -- references to charts/templates created
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CONFIRM MIGRATION 002 COMPLETED
-- =============================================================================

INSERT INTO schema_migrations (version, applied_at) VALUES ('002', NOW())
ON CONFLICT (version) DO NOTHING;