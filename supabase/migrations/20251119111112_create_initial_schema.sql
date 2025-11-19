/*
  # Create WeShare Platform Initial Schema

  ## Overview
  This migration sets up the complete database schema for the WeShare platform, enabling users to create and manage digital business cards with contact collection and analytics.

  ## New Tables

  ### 1. `profiles`
  - Extends Supabase auth.users with additional user profile information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `full_name` (text)
  - `avatar_url` (text)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 2. `sites`
  - Stores digital business card/site data for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, not null)
  - `internal_name` (text, not null) - User-facing name for the site
  - `data` (jsonb, not null) - Complete site configuration and content
  - `is_published` (boolean, default true)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 3. `contacts`
  - Stores contact form submissions from site visitors
  - `id` (uuid, primary key)
  - `site_id` (uuid, references sites, not null)
  - `user_id` (uuid, references profiles, not null)
  - `name` (text, not null)
  - `email` (text, not null)
  - `phone` (text)
  - `message` (text)
  - `created_at` (timestamptz, default now())

  ### 4. `analytics`
  - Tracks engagement metrics for each site
  - `id` (uuid, primary key)
  - `site_id` (uuid, references sites, not null)
  - `user_id` (uuid, references profiles, not null)
  - `views` (integer, default 0)
  - `clicks` (integer, default 0)
  - `saves` (integer, default 0)
  - `date` (date, not null, default today())
  - Unique constraint on (site_id, date)

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce user_id checks for all operations

  ### Profiles Table Policies
  - Users can view their own profile
  - Users can update their own profile
  - New profiles are auto-created via trigger on auth.users insert

  ### Sites Table Policies
  - Users can view their own sites
  - Users can create new sites
  - Users can update their own sites
  - Users can delete their own sites
  - Public read access for published sites (for sharing)

  ### Contacts Table Policies
  - Users can view contacts submitted to their sites
  - Anyone can insert contacts (for public form submissions)
  - Users can delete contacts from their sites

  ### Analytics Table Policies
  - Users can view analytics for their sites
  - System can insert/update analytics (upsert pattern)

  ## Indexes
  - Indexed foreign keys for performance
  - Indexed date fields for analytics queries
  - Indexed user_id fields for user data retrieval

  ## Triggers
  - Auto-update `updated_at` timestamp on row modification
  - Auto-create profile on user signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  internal_name text NOT NULL,
  data jsonb NOT NULL,
  is_published boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  views integer DEFAULT 0 NOT NULL,
  clicks integer DEFAULT 0 NOT NULL,
  saves integer DEFAULT 0 NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE(site_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_site_id ON contacts(site_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_site_id ON analytics(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Sites policies
CREATE POLICY "Users can view own sites"
  ON sites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sites"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON sites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON sites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published sites"
  ON sites FOR SELECT
  TO anon
  USING (is_published = true);

-- Contacts policies
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit contacts"
  ON contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can record analytics"
  ON analytics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON analytics FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_sites_updated_at ON sites;
CREATE TRIGGER set_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
