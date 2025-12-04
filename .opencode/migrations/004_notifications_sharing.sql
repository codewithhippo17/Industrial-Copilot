-- =============================================================================
-- MIGRATION 004: NOTIFICATIONS & SHARING
-- =============================================================================
-- Adds notifications, sharing, and versioning capabilities
-- Run after 003_ml_energy.sql

-- =============================================================================
-- 1. NOTIFICATIONS SYSTEM
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
-- 2. DASHBOARD VERSIONING & SHARING
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

-- Migration tracking table (if not exists)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CONFIRM MIGRATION 004 COMPLETED
-- =============================================================================

INSERT INTO schema_migrations (version, applied_at) VALUES ('004', NOW())
ON CONFLICT (version) DO NOTHING;
