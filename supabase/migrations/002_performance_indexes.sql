-- Performance optimization indexes for the allergy tracker

-- Index for user-specific incident queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_incidents_user_date 
ON incidents(user_id, incident_date DESC);

-- Index for severity filtering
CREATE INDEX IF NOT EXISTS idx_incidents_user_severity 
ON incidents(user_id, severity);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_incidents_date_range 
ON incidents(incident_date) 
WHERE incident_date IS NOT NULL;

-- Composite index for dashboard queries (user + date + severity)
CREATE INDEX IF NOT EXISTS idx_incidents_dashboard 
ON incidents(user_id, incident_date DESC, severity);

-- Index for symptom searches (using GIN for array operations)
CREATE INDEX IF NOT EXISTS idx_incidents_symptoms 
ON incidents USING GIN(symptoms);

-- Index for food trigger searches
CREATE INDEX IF NOT EXISTS idx_incidents_foods 
ON incidents USING GIN(foods);

-- Index for activity searches
CREATE INDEX IF NOT EXISTS idx_incidents_activities 
ON incidents USING GIN(activities);

-- Index for medication searches
CREATE INDEX IF NOT EXISTS idx_incidents_medications 
ON incidents USING GIN(medications);

-- Partial index for recent incidents (last 30 days)
CREATE INDEX IF NOT EXISTS idx_incidents_recent 
ON incidents(user_id, incident_date DESC) 
WHERE incident_date >= (CURRENT_DATE - INTERVAL '30 days');

-- Index for analytics queries (monthly aggregations)
CREATE INDEX IF NOT EXISTS idx_incidents_monthly 
ON incidents(user_id, DATE_TRUNC('month', incident_date));

-- Index for duration-based queries
CREATE INDEX IF NOT EXISTS idx_incidents_duration 
ON incidents(user_id, duration_minutes) 
WHERE duration_minutes IS NOT NULL;

-- Analyze tables to update statistics
ANALYZE incidents;