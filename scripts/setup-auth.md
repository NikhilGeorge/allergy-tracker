# 🔐 Real User Authentication Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be ready (~2 minutes)

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3: Update Environment Variables
Replace the dummy values in `.env.local`:

```bash
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Step 4: Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to create tables and security policies
4. Copy and paste the contents of `supabase/migrations/002_performance_indexes.sql`
5. Click **Run** to add performance optimizations

### Step 5: Configure Authentication
1. Go to **Authentication > Settings**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**: `http://localhost:3000/auth/callback`
4. **Save** settings

### Step 6: Test Real Authentication
1. Restart your dev server: `npm run dev`
2. Go to sign up page and create a real account
3. Check your email for confirmation (if email confirmation is enabled)
4. Sign in and start using the app with real data!

## Alternative: Local Supabase (Advanced)

If you want to run Supabase locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Start local Supabase
supabase start

# This will give you local URLs and keys to use
```

## User Management

### Creating Users Programmatically
You can create users via the Supabase dashboard:

1. Go to **Authentication > Users**
2. Click **Add User**
3. Enter email and password
4. User will be created instantly

### Bulk User Creation
For testing, you can run this SQL in the SQL Editor:

```sql
-- Create test users (replace with real emails)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

## Features You Get With Real Auth

✅ **Real User Accounts**: Persistent data across sessions
✅ **Email Verification**: Optional email confirmation
✅ **Password Reset**: Built-in password recovery
✅ **User Profiles**: Store additional user information
✅ **Data Isolation**: Each user sees only their data
✅ **Social Login**: Can add Google, GitHub, etc. later
✅ **Session Management**: Automatic token refresh

## Switching Between Demo and Real Auth

The app automatically detects:
- **Demo Mode**: When `localStorage.demo-mode = true`
- **Real Auth**: When Supabase credentials are configured

Users can:
1. Try demo mode first (no signup required)
2. Create real account when ready
3. Switch between modes easily

## Troubleshooting

### Common Issues:

**"Invalid API key"**
- Check your `.env.local` file has correct values
- Restart dev server after changing environment variables

**"User not found"**
- Make sure you've run the database migrations
- Check RLS policies are set up correctly

**"CORS errors"**
- Add your local URL to Supabase Auth settings
- Make sure Site URL is set to `http://localhost:3000`

**"Email not confirmed"**
- Check Authentication > Settings > Email Auth
- Disable email confirmation for testing, or check spam folder

### Getting Help:
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Check browser console for detailed error messages
- Verify database schema in Supabase dashboard

## Next Steps

Once authentication is working:
1. Users can create real accounts
2. Data persists across sessions
3. Each user has isolated data
4. You can deploy to production with same setup
5. Add social logins, email templates, etc.

The demo mode will still work alongside real authentication! 🎉