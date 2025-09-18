# Database Setup Instructions

This guide will help you set up your Supabase database for the Allergy Tracker application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key
4. Update your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Run Database Migrations

In your Supabase project dashboard:

1. Go to the SQL Editor
2. Run the migrations in order:

#### Step 1: Run Initial Schema
Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` into the SQL Editor and execute it.

#### Step 2: Run Analytics Functions
Copy and paste the contents of `supabase/migrations/002_analytics_functions.sql` into the SQL Editor and execute it.

### 3. Configure Authentication (Optional)

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL: `http://localhost:3000` (for development)
3. Add any additional redirect URLs you need
4. Configure email templates if desired

### 4. Test Your Setup

1. Start your development server: `npm run dev`
2. Try creating a user account
3. After signup, you can add sample data by running this in the SQL Editor:

```sql
SELECT create_sample_incidents('your-user-id-here');
```

Replace `'your-user-id-here'` with your actual user ID from the auth.users table.

## Database Schema Overview

### Tables

- **incidents**: Main table storing allergy incident data
  - Includes symptoms, triggers, environmental factors
  - Row Level Security (RLS) enabled for user data isolation
  - Optimized indexes for common queries

### Functions

- **get_user_incident_stats()**: Returns user statistics
- **get_monthly_trends()**: Returns monthly incident trends
- **get_trigger_frequency()**: Returns most common triggers
- **get_symptom_frequency()**: Returns symptom frequency analysis
- **create_sample_incidents()**: Creates sample data for testing

### Security

- Row Level Security (RLS) policies ensure users can only access their own data
- All functions are security definer functions
- Proper authentication required for all operations

## Troubleshooting

### Common Issues

1. **Environment Variables**: Make sure your `.env.local` file has the correct Supabase URL and key
2. **RLS Policies**: If you can't access data, check that RLS policies are properly set up
3. **Authentication**: Ensure you're signed in when testing the application

### Getting Help

- Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review the SQL migration files for detailed schema information
- Check the browser console for any authentication or API errors