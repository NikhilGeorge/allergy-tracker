-- Function to get user incident statistics
CREATE OR REPLACE FUNCTION get_user_incident_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    avg_per_month NUMERIC;
    most_common_sev severity_level;
    longest_streak INTEGER;
    current_streak INTEGER;
    this_month INTEGER;
    last_month INTEGER;
BEGIN
    -- Get total incident count
    SELECT COUNT(*) INTO total_count
    FROM incidents 
    WHERE user_id = user_uuid;
    
    -- Calculate average incidents per month
    SELECT 
        CASE 
            WHEN COUNT(DISTINCT DATE_TRUNC('month', incident_date)) = 0 THEN 0
            ELSE total_count::NUMERIC / COUNT(DISTINCT DATE_TRUNC('month', incident_date))
        END INTO avg_per_month
    FROM incidents 
    WHERE user_id = user_uuid;
    
    -- Get most common severity
    SELECT severity INTO most_common_sev
    FROM incidents 
    WHERE user_id = user_uuid
    GROUP BY severity 
    ORDER BY COUNT(*) DESC 
    LIMIT 1;
    
    -- Calculate longest streak without incidents (simplified)
    -- This is a basic implementation - could be enhanced for more accuracy
    SELECT COALESCE(MAX(days_between), 0) INTO longest_streak
    FROM (
        SELECT 
            EXTRACT(DAY FROM (lead(incident_date) OVER (ORDER BY incident_date) - incident_date)) as days_between
        FROM incidents 
        WHERE user_id = user_uuid
        ORDER BY incident_date
    ) streaks;
    
    -- Calculate current streak (days since last incident)
    SELECT 
        COALESCE(EXTRACT(DAY FROM (NOW() - MAX(incident_date))), 0) INTO current_streak
    FROM incidents 
    WHERE user_id = user_uuid;
    
    -- Get this month's count
    SELECT COUNT(*) INTO this_month
    FROM incidents 
    WHERE user_id = user_uuid 
    AND DATE_TRUNC('month', incident_date) = DATE_TRUNC('month', NOW());
    
    -- Get last month's count
    SELECT COUNT(*) INTO last_month
    FROM incidents 
    WHERE user_id = user_uuid 
    AND DATE_TRUNC('month', incident_date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month');
    
    -- Build result JSON
    result := json_build_object(
        'total_incidents', total_count,
        'average_per_month', ROUND(avg_per_month, 2),
        'most_common_severity', most_common_sev,
        'longest_streak_days', longest_streak,
        'current_streak_days', current_streak,
        'this_month_count', this_month,
        'last_month_count', last_month
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly trends
CREATE OR REPLACE FUNCTION get_monthly_trends(user_uuid UUID, months_back INTEGER DEFAULT 12)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'month', TO_CHAR(month_date, 'YYYY-MM'),
            'incident_count', incident_count,
            'severity_breakdown', severity_breakdown,
            'avg_duration_minutes', avg_duration
        ) ORDER BY month_date
    ) INTO result
    FROM (
        SELECT 
            DATE_TRUNC('month', incident_date) as month_date,
            COUNT(*) as incident_count,
            json_build_object(
                'Mild', COUNT(*) FILTER (WHERE severity = 'Mild'),
                'Moderate', COUNT(*) FILTER (WHERE severity = 'Moderate'),
                'Severe', COUNT(*) FILTER (WHERE severity = 'Severe')
            ) as severity_breakdown,
            ROUND(AVG(duration_minutes), 0) as avg_duration
        FROM incidents 
        WHERE user_id = user_uuid 
        AND incident_date >= NOW() - (months_back || ' months')::INTERVAL
        GROUP BY DATE_TRUNC('month', incident_date)
    ) monthly_data;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trigger frequency analysis
CREATE OR REPLACE FUNCTION get_trigger_frequency(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_incidents INTEGER;
BEGIN
    -- Get total incidents for percentage calculation
    SELECT COUNT(*) INTO total_incidents FROM incidents WHERE user_id = user_uuid;
    
    IF total_incidents = 0 THEN
        RETURN '[]'::JSON;
    END IF;
    
    SELECT json_agg(
        json_build_object(
            'trigger', trigger_name,
            'count', trigger_count,
            'percentage', ROUND((trigger_count::NUMERIC / total_incidents * 100), 1),
            'category', category
        ) ORDER BY trigger_count DESC
    ) INTO result
    FROM (
        -- Foods
        SELECT 
            unnest(foods) as trigger_name,
            COUNT(*) as trigger_count,
            'food' as category
        FROM incidents 
        WHERE user_id = user_uuid AND foods IS NOT NULL AND array_length(foods, 1) > 0
        GROUP BY unnest(foods)
        
        UNION ALL
        
        -- Activities  
        SELECT 
            unnest(activities) as trigger_name,
            COUNT(*) as trigger_count,
            'activity' as category
        FROM incidents 
        WHERE user_id = user_uuid AND activities IS NOT NULL AND array_length(activities, 1) > 0
        GROUP BY unnest(activities)
        
        ORDER BY trigger_count DESC
        LIMIT limit_count
    ) triggers;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get symptom frequency
CREATE OR REPLACE FUNCTION get_symptom_frequency(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_incidents INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_incidents FROM incidents WHERE user_id = user_uuid;
    
    IF total_incidents = 0 THEN
        RETURN '[]'::JSON;
    END IF;
    
    SELECT json_agg(
        json_build_object(
            'symptom', symptom_name,
            'count', symptom_count,
            'percentage', ROUND((symptom_count::NUMERIC / total_incidents * 100), 1),
            'severity_distribution', severity_dist
        ) ORDER BY symptom_count DESC
    ) INTO result
    FROM (
        SELECT 
            unnest(symptoms) as symptom_name,
            COUNT(*) as symptom_count,
            json_build_object(
                'Mild', COUNT(*) FILTER (WHERE severity = 'Mild'),
                'Moderate', COUNT(*) FILTER (WHERE severity = 'Moderate'),
                'Severe', COUNT(*) FILTER (WHERE severity = 'Severe')
            ) as severity_dist
        FROM incidents 
        WHERE user_id = user_uuid
        GROUP BY unnest(symptoms)
    ) symptoms;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;