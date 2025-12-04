-- =============================================================================
-- MIGRATION 005: ROW-LEVEL SECURITY POLICIES
-- =============================================================================
-- Implements simplified user-level security as per requirements
-- Run after all schema migrations (001-004)

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

-- =============================================================================
-- USER & TEAM POLICIES
-- =============================================================================

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

-- =============================================================================
-- DASHBOARD POLICIES
-- =============================================================================

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

-- =============================================================================
-- CHART POLICIES
-- =============================================================================

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

-- =============================================================================
-- WORKSPACE POLICIES
-- =============================================================================

-- Workspace: Users can only access their own workspace
CREATE POLICY workspace_items_policy ON workspace_items
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY workspace_folders_policy ON workspace_folders
    FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- CHAT POLICIES
-- =============================================================================

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

-- =============================================================================
-- ML & ENERGY POLICIES
-- =============================================================================

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

-- =============================================================================
-- NOTIFICATION POLICIES
-- =============================================================================

-- Notifications: Users can only see their own notifications
CREATE POLICY notifications_policy ON notifications
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY notification_preferences_policy ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- SHARING POLICIES
-- =============================================================================

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

-- =============================================================================
-- CONFIRM MIGRATION 005 COMPLETED
-- =============================================================================

INSERT INTO schema_migrations (version, applied_at) VALUES ('005', NOW())
ON CONFLICT (version) DO NOTHING;