-- =============================================================================
-- MIGRATION 001: INITIAL SCHEMA SETUP
-- =============================================================================
-- Creates core tables for template-based dashboard architecture
-- Run first after database creation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. USER MANAGEMENT & AUTHENTICATION
-- =============================================================================

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

-- =============================================================================
-- 2. TEMPLATE-BASED DASHBOARD ARCHITECTURE
-- =============================================================================

-- Dashboard templates define layout grids/frames
CREATE TABLE dashboard_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    layout_config JSONB NOT NULL, -- grid definition, frame sizes, etc.
    preview_image_url TEXT, -- template preview
    is_system_template BOOLEAN DEFAULT FALSE, -- built-in vs custom
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template slots define where charts can be placed
CREATE TABLE dashboard_template_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES dashboard_templates(id) ON DELETE CASCADE,
    slot_key TEXT NOT NULL, -- unique identifier within template
    position_config JSONB NOT NULL, -- x, y, width, height, constraints
    slot_type TEXT DEFAULT 'chart', -- 'chart', 'text', 'metric', etc.
    constraints JSONB DEFAULT '{}', -- allowed chart types, size limits, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(template_id, slot_key)
);

-- Dashboard instances using templates
CREATE TABLE dashboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    template_id UUID REFERENCES dashboard_templates(id) NOT NULL,
    owner_user_id UUID REFERENCES auth.users(id),
    owner_team_id UUID REFERENCES teams(id),
    is_public BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}', -- dashboard-specific overrides
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: must have either user or team owner, not both
    CONSTRAINT dashboard_owner_check CHECK (
        (owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
        (owner_user_id IS NULL AND owner_team_id IS NOT NULL)
    )
);

-- Dashboard tabs using templates
CREATE TABLE dashboard_tabs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    template_id UUID REFERENCES dashboard_templates(id) NOT NULL,
    position INTEGER NOT NULL, -- tab ordering
    settings JSONB DEFAULT '{}', -- tab-specific template overrides
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dashboard_id, position)
);

-- =============================================================================
-- 3. CHART SYSTEM WITH REUSABILITY
-- =============================================================================

-- Charts store metadata and Plotly configurations
CREATE TABLE charts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    chart_type TEXT NOT NULL, -- 'line', 'bar', 'pie', 'heatmap', 'energy', etc.
    plotly_config JSONB NOT NULL, -- complete Plotly.js configuration
    data_source_config JSONB NOT NULL, -- how to fetch/process data
    owner_user_id UUID REFERENCES auth.users(id),
    owner_team_id UUID REFERENCES teams(id),
    is_public BOOLEAN DEFAULT FALSE, -- shareable charts
    tags TEXT[], -- for organization and search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: must have either user or team owner
    CONSTRAINT chart_owner_check CHECK (
        (owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
        (owner_user_id IS NULL AND owner_team_id IS NOT NULL)
    )
);

-- Chart placements link charts to dashboard slots
CREATE TABLE chart_placements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_tab_id UUID REFERENCES dashboard_tabs(id) ON DELETE CASCADE,
    chart_id UUID REFERENCES charts(id) ON DELETE CASCADE,
    template_slot_id UUID REFERENCES dashboard_template_slots(id) NOT NULL,
    customizations JSONB DEFAULT '{}', -- placement-specific chart customizations
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure one chart per slot per tab
    UNIQUE(dashboard_tab_id, template_slot_id)
);

-- Chart versions for tracking changes
CREATE TABLE chart_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chart_id UUID REFERENCES charts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    plotly_config JSONB NOT NULL, -- configuration at this version
    data_source_config JSONB NOT NULL,
    change_summary TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chart_id, version_number)
);

-- Auto-increment chart version numbers
CREATE OR REPLACE FUNCTION increment_chart_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version_number := COALESCE(
        (SELECT MAX(version_number) FROM chart_versions WHERE chart_id = NEW.chart_id), 0
    ) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_chart_version
    BEFORE INSERT ON chart_versions
    FOR EACH ROW
    EXECUTE FUNCTION increment_chart_version();

-- =============================================================================
-- CONFIRM MIGRATION 001 COMPLETED
-- =============================================================================

-- Insert confirmation record
INSERT INTO schema_migrations (version, applied_at) VALUES ('001', NOW())
ON CONFLICT (version) DO NOTHING;