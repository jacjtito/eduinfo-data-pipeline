-- Migration: Create educational_data and analytics schemas
-- Description: Create base schemas for educational data and analytics
-- Date: 2026-02-15
-- Week: 1

-- Create educational_data schema
CREATE SCHEMA IF NOT EXISTS educational_data;

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Add comments
COMMENT ON SCHEMA educational_data IS 'Educational and geographic data for eduInfo application';
COMMENT ON SCHEMA analytics IS 'Analytics and logging data separate from core educational data';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA educational_data TO your_app_user;
-- GRANT USAGE ON SCHEMA analytics TO your_app_user;

