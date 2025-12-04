# **🗄️ OCP DATABASE SCHEMA (REVISED)**
## **PostgreSQL Schema for Template-Based Dashboard Architecture**

*Updated December 4, 2025 - Incorporates template-based dashboard system with flexible chart placement*

---

## **🏗️ REVISED SCHEMA OVERVIEW**

### **Key Architecture Changes:**
- **Template-Based Dashboards**: Grid/frame layouts defined separately from instances
- **Flexible Chart Placement**: Charts can be placed in any slot within template frames
- **Metadata Separation**: Chart configuration separate from actual data
- **Chart Reusability**: Same chart can be used across multiple dashboards
- **Workspace Integration**: Charts originate from user workspace

---

## **📊 REVISED CORE TABLES**

### **1. User Management (Unchanged)**

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

### **2. Template-Based Dashboard Architecture**

```sql
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
```

### **3. Chart System with Reusability**

```sql
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
```

### **4. Workspace Integration**

```sql
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
```

### **5. LLM Chat System (Enhanced)**

```sql
-- Chat sessions (unchanged core structure)
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

-- Chat messages with chart/template creation outputs
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content JSONB NOT NULL, -- rich content including charts, templates
    agent_id UUID REFERENCES agents(id),
    llm_model_id UUID REFERENCES llm_models(id),
    output_routing JSONB, -- where outputs were placed
    created_items JSONB, -- references to charts/templates created
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **6. Dashboard Versioning & Sharing**

```sql
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
    token TEXT UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{"view": true}',
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);
```

---

## **🔍 ENHANCED INDEXING STRATEGY**

```sql
-- Template and slot queries
CREATE INDEX idx_dashboard_templates_system ON dashboard_templates(is_system_template) WHERE is_system_template = TRUE;
CREATE INDEX idx_template_slots_template_id ON dashboard_template_slots(template_id);
CREATE INDEX idx_template_slots_type ON dashboard_template_slots(template_id, slot_type);

-- Dashboard and tab queries  
CREATE INDEX idx_dashboards_template_id ON dashboards(template_id);
CREATE INDEX idx_dashboard_tabs_template_id ON dashboard_tabs(template_id);
CREATE INDEX idx_dashboard_tabs_dashboard_position ON dashboard_tabs(dashboard_id, position);

-- Chart and placement queries
CREATE INDEX idx_charts_owner_user_id ON charts(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_charts_public ON charts(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_charts_tags ON charts USING GIN (tags);
CREATE INDEX idx_charts_type ON charts(chart_type);

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
CREATE INDEX idx_workspace_folders_parent ON workspace_folders(parent_folder_id) WHERE parent_folder_id IS NOT NULL;

-- Chart version queries
CREATE INDEX idx_chart_versions_chart_created ON chart_versions(chart_id, created_at DESC);

-- Sharing queries
CREATE INDEX idx_sharing_links_resource ON sharing_links(resource_type, resource_id);
CREATE INDEX idx_sharing_links_token ON sharing_links(token);
```

---

## **📈 EXAMPLE QUERIES FOR NEW ARCHITECTURE**

```sql
-- Get dashboard with template info and all chart placements
SELECT 
    d.title as dashboard_title,
    dt.title as template_name,
    dt.layout_config as template_layout,
    tab.title as tab_title,
    slot.slot_key,
    slot.position_config,
    c.title as chart_title,
    c.chart_type,
    cp.customizations
FROM dashboards d
JOIN dashboard_templates dt ON d.template_id = dt.id
JOIN dashboard_tabs tab ON d.id = tab.dashboard_id
JOIN chart_placements cp ON tab.id = cp.dashboard_tab_id
JOIN dashboard_template_slots slot ON cp.template_slot_id = slot.id
JOIN charts c ON cp.chart_id = c.id
WHERE d.id = $1
ORDER BY tab.position, slot.slot_key;

-- Find charts by user with usage count across dashboards
SELECT 
    c.id,
    c.title,
    c.chart_type,
    COUNT(cp.id) as placement_count,
    ARRAY_AGG(DISTINCT d.title) as used_in_dashboards
FROM charts c
LEFT JOIN chart_placements cp ON c.id = cp.chart_id
LEFT JOIN dashboard_tabs dt ON cp.dashboard_tab_id = dt.id
LEFT JOIN dashboards d ON dt.dashboard_id = d.id
WHERE c.owner_user_id = $1
GROUP BY c.id, c.title, c.chart_type
ORDER BY placement_count DESC, c.updated_at DESC;

-- Get available templates with slot count
SELECT 
    dt.id,
    dt.name,
    dt.description,
    dt.layout_config,
    COUNT(dts.id) as slot_count
FROM dashboard_templates dt
LEFT JOIN dashboard_template_slots dts ON dt.id = dts.template_id
WHERE dt.is_system_template = TRUE OR dt.created_by = $1
GROUP BY dt.id, dt.name, dt.description, dt.layout_config
ORDER BY dt.name;

-- Search workspace charts with metadata
SELECT 
    wi.id,
    wi.title,
    wi.tags,
    wi.folder_path,
    c.chart_type,
    c.plotly_config->>'title' as chart_config_title
FROM workspace_items wi
JOIN charts c ON wi.reference_id = c.id
WHERE wi.user_id = $1 
    AND wi.item_type = 'chart'
    AND (wi.title ILIKE '%' || $2 || '%' OR $2 = ANY(wi.tags))
ORDER BY wi.updated_at DESC;
```

---

## **⚡ ARCHITECTURAL BENEFITS**

### **Template System Advantages:**
1. **Consistency**: Standardized layouts across dashboards
2. **Flexibility**: Users can choose different templates per tab
3. **Scalability**: New templates can be added without schema changes
4. **Customization**: Per-placement customizations while preserving base template

### **Chart Reusability Benefits:**
1. **Efficiency**: Same chart can appear in multiple dashboards
2. **Maintenance**: Update chart once, reflects everywhere
3. **Sharing**: Charts can be shared independently of dashboards
4. **Versioning**: Full change history for each chart

### **Performance Optimizations:**
1. **Metadata Separation**: Fast dashboard rendering without data fetching
2. **Strategic Indexing**: Optimized for common query patterns
3. **JSONB Usage**: Flexible configuration storage with fast search
4. **Template Caching**: Layout definitions can be cached effectively

---

## **🎯 STATUS UPDATE**

**✅ Completed:**
- Section C requirements fully integrated
- Template-based dashboard architecture designed
- Chart reusability and metadata separation implemented
- Enhanced workspace integration
- Flexible chart placement system

**⏳ Next Priority:** 
- Complete Section E (Permissions & Security) for proper RLS policies
- Complete Section F (ML Integration) for energy optimization tables
- Add notification and real-time features based on remaining sections

**🔄 Schema Evolution:** Current design provides solid foundation that can accommodate all remaining requirements without breaking changes.