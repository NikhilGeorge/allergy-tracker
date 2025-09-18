-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE severity_level AS ENUM ('Mild', 'Moderate', 'Severe');

-- Create incidents table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    incident_date TIMESTAMPTZ NOT NULL,
    severity severity_level NOT NULL,
    symptoms TEXT[] NOT NULL CHECK (array_length(symptoms, 1) > 0),
    foods TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    environmental_factors JSONB DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 10080), -- Max 7 days
    notes TEXT CHECK (length(notes) <= 2000),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_user_date ON incidents(user_id, incident_date DESC);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_symptoms ON incidents USING GIN(symptoms);
CREATE INDEX idx_incidents_foods ON incidents USING GIN(foods);
CREATE INDEX idx_incidents_activities ON incidents USING GIN(activities);
CREATE INDEX idx_incidents_environmental ON incidents USING GIN(environmental_factors);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_incidents_updated_at 
    BEFORE UPDATE ON incidents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own incidents
CREATE POLICY "Users can view own incidents" ON incidents
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own incidents
CREATE POLICY "Users can insert own incidents" ON incidents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own incidents
CREATE POLICY "Users can update own incidents" ON incidents
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own incidents
CREATE POLICY "Users can delete own incidents" ON incidents
    FOR DELETE USING (auth.uid() = user_id);