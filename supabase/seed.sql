-- Seed data for development and testing
-- This file contains sample data to help with development

-- Note: In a real application, you would need actual user IDs from auth.users
-- For development, you can replace these UUIDs with actual user IDs after signup

-- Sample incidents for testing (replace user_id with actual user ID)
-- INSERT INTO incidents (
--     user_id,
--     incident_date,
--     severity,
--     symptoms,
--     foods,
--     activities,
--     environmental_factors,
--     medications,
--     duration_minutes,
--     notes
-- ) VALUES 
-- (
--     'your-user-id-here', -- Replace with actual user ID
--     '2024-01-15 14:30:00+00',
--     'Moderate',
--     ARRAY['Sneezing', 'Runny nose', 'Itchy eyes'],
--     ARRAY['Peanuts', 'Milk'],
--     ARRAY['Outdoor exercise', 'Gardening'],
--     '{"weather": "Sunny", "temperature": 75, "pollen_count": "High", "stress_level": 3}',
--     ARRAY['Antihistamine'],
--     120,
--     'Symptoms started after lunch, lasted about 2 hours'
-- ),
-- (
--     'your-user-id-here', -- Replace with actual user ID
--     '2024-01-10 09:15:00+00',
--     'Mild',
--     ARRAY['Itchy throat', 'Coughing'],
--     ARRAY['Shellfish'],
--     ARRAY['Eating out'],
--     '{"location": "Restaurant", "stress_level": 2}',
--     NULL,
--     45,
--     'Mild reaction at seafood restaurant'
-- ),
-- (
--     'your-user-id-here', -- Replace with actual user ID
--     '2024-01-05 16:45:00+00',
--     'Severe',
--     ARRAY['Hives', 'Swelling', 'Shortness of breath'],
--     ARRAY['Tree nuts'],
--     ARRAY['Social gathering'],
--     '{"location": "Friend''s house", "stress_level": 7}',
--     ARRAY['Epinephrine', 'Antihistamine'],
--     180,
--     'Severe reaction required emergency medication'
-- );

-- Create a function to generate sample data for a specific user
CREATE OR REPLACE FUNCTION create_sample_incidents(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO incidents (
        user_id,
        incident_date,
        severity,
        symptoms,
        foods,
        activities,
        environmental_factors,
        medications,
        duration_minutes,
        notes
    ) VALUES 
    (
        target_user_id,
        NOW() - INTERVAL '15 days',
        'Moderate',
        ARRAY['Sneezing', 'Runny nose', 'Itchy eyes'],
        ARRAY['Peanuts', 'Milk'],
        ARRAY['Outdoor exercise', 'Gardening'],
        '{"weather": "Sunny", "temperature": 75, "pollen_count": "High", "stress_level": 3}',
        ARRAY['Antihistamine'],
        120,
        'Symptoms started after lunch, lasted about 2 hours'
    ),
    (
        target_user_id,
        NOW() - INTERVAL '10 days',
        'Mild',
        ARRAY['Itchy throat', 'Coughing'],
        ARRAY['Shellfish'],
        ARRAY['Eating out'],
        '{"location": "Restaurant", "stress_level": 2}',
        NULL,
        45,
        'Mild reaction at seafood restaurant'
    ),
    (
        target_user_id,
        NOW() - INTERVAL '5 days',
        'Severe',
        ARRAY['Hives', 'Swelling', 'Shortness of breath'],
        ARRAY['Tree nuts'],
        ARRAY['Social gathering'],
        '{"location": "Friend''s house", "stress_level": 7}',
        ARRAY['Epinephrine', 'Antihistamine'],
        180,
        'Severe reaction required emergency medication'
    ),
    (
        target_user_id,
        NOW() - INTERVAL '25 days',
        'Mild',
        ARRAY['Sneezing', 'Watery eyes'],
        ARRAY['Dust mites'],
        ARRAY['Cleaning'],
        '{"weather": "Rainy", "humidity": 85, "stress_level": 4}',
        ARRAY['Nasal spray'],
        60,
        'Cleaning triggered dust allergy'
    ),
    (
        target_user_id,
        NOW() - INTERVAL '30 days',
        'Moderate',
        ARRAY['Skin rash', 'Itchy skin'],
        ARRAY['Eggs', 'Wheat'],
        ARRAY['Cooking', 'Eating out'],
        '{"location": "Home", "stress_level": 5}',
        ARRAY['Topical cream'],
        240,
        'Skin reaction after trying new recipe'
    );
END;
$$ LANGUAGE plpgsql;

-- Instructions for using sample data:
-- After creating a user account, run: SELECT create_sample_incidents('your-actual-user-id');