-- =============================================================================
-- MIGRATION 003: ML INTEGRATION & ENERGY OPTIMIZATION
-- =============================================================================
-- Adds ML models and energy optimization capabilities
-- Run after 002_workspace_chat.sql

-- =============================================================================
-- 1. ML MODEL INTEGRATION
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

-- =============================================================================
-- 2. ENERGY DATA MANAGEMENT
-- =============================================================================

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
-- CONFIRM MIGRATION 003 COMPLETED
-- =============================================================================

INSERT INTO schema_migrations (version, applied_at) VALUES ('003', NOW())
ON CONFLICT (version) DO NOTHING;