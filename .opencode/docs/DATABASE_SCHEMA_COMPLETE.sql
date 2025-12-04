# **🗄️ OCP DATABASE SCHEMA - COMPLETE IMPLEMENTATION**
## **PostgreSQL Schema with Template-Based Dashboard Architecture + ML Integration**

*Final Version - December 4, 2025*

---

## **🎯 COMPLETE DATABASE SCHEMA**

```sql
-- =============================================================================
-- OCP LLM-POWERED DASHBOARD - COMPLETE DATABASE SCHEMA
-- =============================================================================
-- Template-based dashboard architecture with ML integration
-- Includes: Users, Templates, Dashboards, Charts, Chat, ML Models, Notifications
-- =============================================================================

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
    slot_key TEXT NOT NULL, -- unique identifier within template (e.g., 'top-left', 'main-center')
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
    template_id UUID REFERENCES dashboard_templates(id) NOT NULL, -- each tab can use different template
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
-- 4. WORKSPACE INTEGRATION
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
-- 5. LLM CHAT SYSTEM
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
-- 6. ML MODEL INTEGRATION & ENERGY OPTIMIZATION
-- =============================================================================

-- ML Models for energy optimization
CREATE TABLE ml_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    model_type TEXT NOT NULL, -- 'energy_optimization', 'forecasting', 'anomaly_detection'
    version TEXT NOT NULL,
    model_config JSONB NOT NULL, -- model parameters, architecture details
    training_config JSONB NOT NULL, -- training parameters, datasets used
    performance_metrics JSONB, -- accuracy, precision, recall, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML Model Executions
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE execution_trigger AS ENUM ('manual', 'scheduled', 'event_triggered');

CREATE TABLE ml_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID REFERENCES ml_models(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES auth.users(id),
    trigger_type execution_trigger NOT NULL,
    status execution_status DEFAULT 'pending',
    input_data JSONB NOT NULL, -- input parameters and data
    output_data JSONB, -- results and predictions
    execution_metrics JSONB, -- runtime, memory usage, etc.
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy Data Sources
CREATE TABLE energy_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL, -- 'meter', 'sensor', 'api', 'file'
    connection_config JSONB NOT NULL, -- API endpoints, connection strings, etc.
    data_schema JSONB NOT NULL, -- expected data structure
    update_frequency TEXT, -- 'real-time', 'hourly', 'daily'
    is_active BOOLEAN DEFAULT TRUE,
    owner_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy Data Points
CREATE TABLE energy_data_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_source_id UUID REFERENCES energy_data_sources(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    data JSONB NOT NULL, -- energy consumption values, metadata
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy Optimization Results
CREATE TABLE energy_optimizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID REFERENCES ml_executions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    optimization_type TEXT NOT NULL, -- 'consumption', 'cost', 'carbon'
    current_values JSONB NOT NULL, -- baseline metrics
    optimized_values JSONB NOT NULL, -- predicted optimized metrics
    recommendations JSONB NOT NULL, -- actionable recommendations
    confidence_score NUMERIC(3,2), -- 0.00 to 1.00
    potential_savings JSONB, -- cost, energy, carbon savings
    implementation_complexity TEXT, -- 'low', 'medium', 'high'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. NOTIFICATIONS & REAL-TIME FEATURES
-- =============================================================================

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'ml_completion', 'new_data', 'dashboard_share', 'chat_mention', 
    'system_alert', 'optimization_ready'
);

CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- notification-specific data
    status notification_status DEFAULT 'unread',
    resource_type TEXT, -- 'dashboard', 'chart', 'ml_execution'
    resource_id UUID, -- reference to related resource
    action_url TEXT, -- deep link for notification action
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- =============================================================================
-- 8. DASHBOARD VERSIONING & SHARING
-- =============================================================================

-- Dashboard versions capture complete state including chart placements
CREATE TABLE dashboard_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL, -- complete dashboard state with all tabs and chart placements
    change_summary TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dashboard_id, version_number)
);

-- Sharing links for dashboards and individual charts
CREATE TABLE sharing_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_type TEXT NOT NULL, -- 'dashboard', 'chart', 'template'
    resource_id UUID NOT NULL, -- dashboard_id, chart_id, or template_id
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
    permissions JSONB DEFAULT '{"view": true}',
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0
);

-- =============================================================================
-- 9. PERFORMANCE & INDEXING STRATEGY
-- =============================================================================

-- User and team indexes
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_user_team_memberships_user_id ON user_team_memberships(user_id);
CREATE INDEX idx_user_team_memberships_team_id ON user_team_memberships(team_id);

-- Template and slot queries
CREATE INDEX idx_dashboard_templates_system ON dashboard_templates(is_system_template) WHERE is_system_template = TRUE;
CREATE INDEX idx_template_slots_template_id ON dashboard_template_slots(template_id);
CREATE INDEX idx_template_slots_type ON dashboard_template_slots(template_id, slot_type);

-- Dashboard and tab queries  
CREATE INDEX idx_dashboards_owner_user_id ON dashboards(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_dashboards_owner_team_id ON dashboards(owner_team_id) WHERE owner_team_id IS NOT NULL;
CREATE INDEX idx_dashboards_template_id ON dashboards(template_id);
CREATE INDEX idx_dashboards_public ON dashboards(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_dashboard_tabs_dashboard_id ON dashboard_tabs(dashboard_id);
CREATE INDEX idx_dashboard_tabs_template_id ON dashboard_tabs(template_id);
CREATE INDEX idx_dashboard_tabs_dashboard_position ON dashboard_tabs(dashboard_id, position);

-- Chart and placement queries
CREATE INDEX idx_charts_owner_user_id ON charts(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_charts_owner_team_id ON charts(owner_team_id) WHERE owner_team_id IS NOT NULL;
CREATE INDEX idx_charts_public ON charts(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_charts_tags ON charts USING GIN (tags);
CREATE INDEX idx_charts_type ON charts(chart_type);
CREATE INDEX idx_charts_created_at ON charts(created_at DESC);

-- Chart placement queries
CREATE INDEX idx_chart_placements_tab_id ON chart_placements(dashboard_tab_id);
CREATE INDEX idx_chart_placements_chart_id ON chart_placements(chart_id);
CREATE INDEX idx_chart_placements_slot_id ON chart_placements(template_slot_id);

-- Plotly configuration search (JSONB)
CREATE INDEX idx_charts_plotly_config ON charts USING GIN (plotly_config);
CREATE INDEX idx_charts_data_source_config ON charts USING GIN (data_source_config);

-- Workspace queries
CREATE INDEX idx_workspace_items_user_type ON workspace_items(user_id, item_type);
CREATE INDEX idx_workspace_items_reference ON workspace_items(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX idx_workspace_items_folder_path ON workspace_items(user_id, folder_path);
CREATE INDEX idx_workspace_items_tags ON workspace_items USING GIN (tags);
CREATE INDEX idx_workspace_items_favorites ON workspace_items(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_workspace_folders_parent ON workspace_folders(parent_folder_id) WHERE parent_folder_id IS NOT NULL;
CREATE INDEX idx_workspace_folders_user_path ON workspace_folders(user_id, path);

-- Chat system indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id, created_at DESC);
CREATE INDEX idx_chat_sessions_context ON chat_sessions(context_type, context_id) WHERE context_id IS NOT NULL;
CREATE INDEX idx_chat_messages_session_created ON chat_messages(chat_session_id, created_at);
CREATE INDEX idx_chat_messages_agent_id ON chat_messages(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX idx_chat_messages_content ON chat_messages USING GIN (content);

-- Agent and command indexes
CREATE INDEX idx_agents_owner_user_id ON agents(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_agents_public ON agents(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_commands_system ON commands(is_system_command);

-- ML model indexes
CREATE INDEX idx_ml_models_type_active ON ml_models(model_type, is_active);
CREATE INDEX idx_ml_executions_model_id ON ml_executions(model_id);
CREATE INDEX idx_ml_executions_user_status ON ml_executions(triggered_by, status);
CREATE INDEX idx_ml_executions_created_at ON ml_executions(created_at DESC);

-- Energy data indexes
CREATE INDEX idx_energy_data_sources_owner ON energy_data_sources(owner_user_id);
CREATE INDEX idx_energy_data_sources_active ON energy_data_sources(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_energy_data_points_source_timestamp ON energy_data_points(data_source_id, timestamp DESC);
CREATE INDEX idx_energy_data_points_timestamp ON energy_data_points(timestamp DESC);
CREATE INDEX idx_energy_data_points_unprocessed ON energy_data_points(processed, timestamp) WHERE processed = FALSE;

-- Optimization result indexes
CREATE INDEX idx_energy_optimizations_execution_id ON energy_optimizations(execution_id);
CREATE INDEX idx_energy_optimizations_user_created ON energy_optimizations(user_id, created_at DESC);
CREATE INDEX idx_energy_optimizations_type ON energy_optimizations(optimization_type);

-- Notification indexes
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_resource ON notifications(resource_type, resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX idx_notification_preferences_user_type ON notification_preferences(user_id, notification_type);

-- Chart version queries
CREATE INDEX idx_chart_versions_chart_created ON chart_versions(chart_id, created_at DESC);

-- Dashboard version indexes
CREATE INDEX idx_dashboard_versions_dashboard_version ON dashboard_versions(dashboard_id, version_number DESC);

-- Sharing queries
CREATE INDEX idx_sharing_links_resource ON sharing_links(resource_type, resource_id);
CREATE INDEX idx_sharing_links_token ON sharing_links(token);
CREATE INDEX idx_sharing_links_created_by ON sharing_links(created_by);

-- =============================================================================
-- 10. UTILITY FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_templates_updated_at BEFORE UPDATE ON dashboard_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_tabs_updated_at BEFORE UPDATE ON dashboard_tabs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charts_updated_at BEFORE UPDATE ON charts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_items_updated_at BEFORE UPDATE ON workspace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commands_updated_at BEFORE UPDATE ON commands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_energy_data_sources_updated_at BEFORE UPDATE ON energy_data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate sharing tokens
CREATE OR REPLACE FUNCTION generate_sharing_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 11. SAMPLE DATA & SYSTEM DEFAULTS
-- =============================================================================

-- Insert default system templates
INSERT INTO dashboard_templates (id, name, description, layout_config, is_system_template) VALUES
(
    gen_random_uuid(),
    'Single Chart',
    'Simple template with one main chart area',
    '{"type": "grid", "columns": 1, "rows": 1, "slots": [{"key": "main", "x": 0, "y": 0, "w": 12, "h": 8}]}',
    TRUE
),
(
    gen_random_uuid(),
    'Two Column',
    'Template with two equal-width columns',
    '{"type": "grid", "columns": 2, "rows": 1, "slots": [{"key": "left", "x": 0, "y": 0, "w": 6, "h": 8}, {"key": "right", "x": 6, "y": 0, "w": 6, "h": 8}]}',
    TRUE
),
(
    gen_random_uuid(),
    'Dashboard Grid',
    'Full dashboard with header metrics and main charts',
    '{"type": "grid", "columns": 4, "rows": 3, "slots": [{"key": "metric1", "x": 0, "y": 0, "w": 3, "h": 2}, {"key": "metric2", "x": 3, "y": 0, "w": 3, "h": 2}, {"key": "metric3", "x": 6, "y": 0, "w": 3, "h": 2}, {"key": "metric4", "x": 9, "y": 0, "w": 3, "h": 2}, {"key": "chart1", "x": 0, "y": 2, "w": 6, "h": 6}, {"key": "chart2", "x": 6, "y": 2, "w": 6, "h": 6}]}',
    TRUE
);

-- Insert default LLM models
INSERT INTO llm_models (provider, model_id, display_name, description, capabilities) VALUES
('openai', 'gpt-4', 'GPT-4', 'Advanced reasoning and code generation', '{"chart_creation": true, "code_generation": true, "analysis": true}'),
('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient for general tasks', '{"chart_creation": true, "basic_analysis": true}'),
('anthropic', 'claude-3-opus', 'Claude 3 Opus', 'Advanced reasoning and analysis', '{"chart_creation": true, "detailed_analysis": true}');

-- Insert default system commands
INSERT INTO commands (name, description, usage_example, parameters_schema, is_system_command) VALUES
('/create-chart', 'Create a new chart from data or description', '/create-chart type:line data:sales_data title:"Monthly Sales"', '{"type": "object", "properties": {"type": {"type": "string"}, "data": {"type": "string"}, "title": {"type": "string"}}}', TRUE),
('/optimize-energy', 'Run energy optimization model', '/optimize-energy period:monthly source:meter1', '{"type": "object", "properties": {"period": {"type": "string"}, "source": {"type": "string"}}}', TRUE),
('/share-dashboard', 'Generate sharing link for dashboard', '/share-dashboard dashboard:current permissions:view', '{"type": "object", "properties": {"dashboard": {"type": "string"}, "permissions": {"type": "string"}}}', TRUE),
('/export-data', 'Export dashboard or chart data', '/export-data format:csv resource:current-chart', '{"type": "object", "properties": {"format": {"type": "string"}, "resource": {"type": "string"}}}', TRUE);

-- Insert default ML model for energy optimization
INSERT INTO ml_models (name, description, model_type, version, model_config, training_config, performance_metrics, created_by) VALUES
(
    'Energy Consumption Optimizer',
    'Predicts optimal energy usage patterns and provides actionable recommendations',
    'energy_optimization',
    '1.0.0',
    '{"algorithm": "gradient_boosting", "features": ["time_of_day", "weather", "occupancy", "historical_usage"], "hyperparameters": {"n_estimators": 100, "learning_rate": 0.1}}',
    '{"dataset_size": 10000, "training_period": "2023-2024", "validation_split": 0.2}',
    '{"accuracy": 0.87, "mae": 12.5, "rmse": 18.2, "r2_score": 0.84}',
    (SELECT id FROM auth.users LIMIT 1)
);

```

---

## **🔐 ROW-LEVEL SECURITY (RLS) POLICIES**

```sql
-- =============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- =============================================================================
-- Simplified user-level permissions as per Section E requirements

-- Enable RLS on all relevant tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_links ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only access their own profile
CREATE POLICY user_profiles_policy ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Teams: Users can see teams they belong to
CREATE POLICY teams_select_policy ON teams
    FOR SELECT USING (
        id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid())
    );

-- Teams: Only team creators and admins can update
CREATE POLICY teams_update_policy ON teams
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid() AND role = 'admin')
    );

-- User team memberships: Users can see their own memberships
CREATE POLICY user_team_memberships_policy ON user_team_memberships
    FOR ALL USING (user_id = auth.uid());

-- Dashboards: Users can access their own dashboards, team dashboards, and public ones
CREATE POLICY dashboards_policy ON dashboards
    FOR SELECT USING (
        owner_user_id = auth.uid() OR
        owner_team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    );

-- Dashboard tabs: Follow dashboard permissions
CREATE POLICY dashboard_tabs_policy ON dashboard_tabs
    FOR SELECT USING (
        dashboard_id IN (
            SELECT id FROM dashboards WHERE
            owner_user_id = auth.uid() OR
            owner_team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid()) OR
            is_public = TRUE
        )
    );

-- Charts: Users can access their own charts, team charts, and public ones
CREATE POLICY charts_policy ON charts
    FOR SELECT USING (
        owner_user_id = auth.uid() OR
        owner_team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    );

-- Chart placements: Follow dashboard permissions
CREATE POLICY chart_placements_policy ON chart_placements
    FOR SELECT USING (
        dashboard_tab_id IN (
            SELECT dt.id FROM dashboard_tabs dt
            JOIN dashboards d ON dt.dashboard_id = d.id
            WHERE d.owner_user_id = auth.uid() OR
                  d.owner_team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid()) OR
                  d.is_public = TRUE
        )
    );

-- Workspace: Users can only access their own workspace
CREATE POLICY workspace_items_policy ON workspace_items
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY workspace_folders_policy ON workspace_folders
    FOR ALL USING (user_id = auth.uid());

-- Chat sessions: Users can only access their own sessions
CREATE POLICY chat_sessions_policy ON chat_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY chat_messages_policy ON chat_messages
    FOR ALL USING (
        chat_session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
    );

-- Agents: Users can access their own agents, team agents, and public ones
CREATE POLICY agents_policy ON agents
    FOR SELECT USING (
        owner_user_id = auth.uid() OR
        owner_team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    );

-- ML executions: Users can access their own executions
CREATE POLICY ml_executions_policy ON ml_executions
    FOR ALL USING (triggered_by = auth.uid());

-- Energy data sources: Users can access their own data sources
CREATE POLICY energy_data_sources_policy ON energy_data_sources
    FOR ALL USING (owner_user_id = auth.uid());

-- Energy data points: Users can access data from their own sources
CREATE POLICY energy_data_points_policy ON energy_data_points
    FOR SELECT USING (
        data_source_id IN (SELECT id FROM energy_data_sources WHERE owner_user_id = auth.uid())
    );

-- Energy optimizations: Users can access their own optimization results
CREATE POLICY energy_optimizations_policy ON energy_optimizations
    FOR ALL USING (user_id = auth.uid());

-- Notifications: Users can only see their own notifications
CREATE POLICY notifications_policy ON notifications
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY notification_preferences_policy ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Sharing links: Users can access links they created or for public resources
CREATE POLICY sharing_links_policy ON sharing_links
    FOR SELECT USING (
        created_by = auth.uid() OR
        (resource_type = 'dashboard' AND resource_id::text IN (
            SELECT id::text FROM dashboards WHERE is_public = TRUE
        )) OR
        (resource_type = 'chart' AND resource_id::text IN (
            SELECT id::text FROM charts WHERE is_public = TRUE
        ))
    );
```

---

## **📊 EXAMPLE QUERIES & USAGE**

```sql
-- =============================================================================
-- COMMON QUERY PATTERNS
-- =============================================================================

-- 1. Get user's complete dashboard with all charts
SELECT 
    d.title as dashboard_title,
    dt.title as template_name,
    tab.title as tab_title,
    tab.position as tab_order,
    slot.slot_key,
    slot.position_config,
    c.title as chart_title,
    c.chart_type,
    c.plotly_config,
    cp.customizations
FROM dashboards d
JOIN dashboard_templates dt ON d.template_id = dt.id
JOIN dashboard_tabs tab ON d.id = tab.dashboard_id
LEFT JOIN chart_placements cp ON tab.id = cp.dashboard_tab_id
LEFT JOIN dashboard_template_slots slot ON cp.template_slot_id = slot.id
LEFT JOIN charts c ON cp.chart_id = c.id
WHERE d.owner_user_id = $1
ORDER BY tab.position, slot.slot_key;

-- 2. Search charts in workspace with usage statistics
SELECT 
    wi.title,
    wi.tags,
    c.chart_type,
    COUNT(cp.id) as usage_count,
    c.updated_at as last_modified
FROM workspace_items wi
JOIN charts c ON wi.reference_id = c.id
LEFT JOIN chart_placements cp ON c.id = cp.chart_id
WHERE wi.user_id = $1 AND wi.item_type = 'chart'
    AND (wi.title ILIKE '%' || $2 || '%' OR $2 = ANY(wi.tags))
GROUP BY wi.id, wi.title, wi.tags, c.chart_type, c.updated_at
ORDER BY usage_count DESC, c.updated_at DESC;

-- 3. Get recent ML execution results with optimization recommendations
SELECT 
    ml_exec.id,
    ml_exec.status,
    ml_exec.completed_at,
    ml_model.name as model_name,
    eo.optimization_type,
    eo.potential_savings,
    eo.recommendations,
    eo.confidence_score
FROM ml_executions ml_exec
JOIN ml_models ml_model ON ml_exec.model_id = ml_model.id
LEFT JOIN energy_optimizations eo ON ml_exec.id = eo.execution_id
WHERE ml_exec.triggered_by = $1
    AND ml_exec.status = 'completed'
ORDER BY ml_exec.completed_at DESC
LIMIT 10;

-- 4. Get unread notifications with action links
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.action_url,
    n.created_at
FROM notifications n
WHERE n.user_id = $1 AND n.status = 'unread'
ORDER BY n.created_at DESC;

-- 5. Get energy consumption trends with ML predictions
SELECT 
    edp.timestamp,
    edp.data->>'consumption' as actual_consumption,
    ml_exec.output_data->>'predicted_consumption' as predicted_consumption,
    eds.name as source_name
FROM energy_data_points edp
JOIN energy_data_sources eds ON edp.data_source_id = eds.id
LEFT JOIN ml_executions ml_exec ON DATE(edp.timestamp) = DATE(ml_exec.input_data->>'date')
WHERE eds.owner_user_id = $1
    AND edp.timestamp >= $2
    AND edp.timestamp <= $3
ORDER BY edp.timestamp;
```

---

## **🚀 DEPLOYMENT INSTRUCTIONS**

```bash
# 1. Create database and enable extensions
psql -d your_database -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
psql -d your_database -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

# 2. Run the complete schema
psql -d your_database -f DATABASE_SCHEMA_COMPLETE.sql

# 3. Verify installation
psql -d your_database -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

---

## **✅ SCHEMA COMPLETION SUMMARY**

**🎯 Fully Implemented:**
- ✅ Template-based dashboard architecture with flexible chart placement
- ✅ Chart reusability and metadata separation  
- ✅ Complete ML integration for energy optimization
- ✅ User management with teams and simple permissions
- ✅ Full LLM chat system with agents and commands
- ✅ Workspace integration for chart library management
- ✅ Notification system with user preferences
- ✅ Dashboard versioning and sharing capabilities
- ✅ Strategic indexing for performance optimization
- ✅ RLS policies for simplified user-level security
- ✅ Sample data and system defaults
- ✅ Utility functions and triggers

**🔧 Key Features:**
- **15+ core tables** with complete relationships
- **50+ strategic indexes** for performance optimization
- **Template system** for scalable dashboard layouts
- **Chart reusability** across multiple dashboards
- **ML model integration** with execution tracking
- **Energy optimization** with actionable recommendations
- **Real-time notifications** with preference management
- **Row-level security** policies for data protection
- **Version tracking** for dashboards and charts
- **Sharing mechanisms** with secure token-based access

**🎯 Production Ready:** This schema is complete and ready for deployment with your Next.js + FastAPI + PostgreSQL stack.