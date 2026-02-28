-- ============================================
-- GoHoliday Supabase Database Schema
-- ============================================
-- This file contains SQL commands to set up the necessary tables
-- for user authentication and reviews in your Supabase project.
--
-- Instructions:
-- 1. Go to your Supabase Dashboard (https://app.supabase.com)
-- 2. Navigate to the SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute the commands
-- ============================================

-- Enable Row Level Security (RLS) on auth.users table is already enabled by default

-- ============================================
-- Create profiles table
-- ============================================
-- This table stores additional user profile information
-- It automatically creates a profile when a new user signs up

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  gender TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
-- Allow users to view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Create reviews table
-- ============================================
-- This table stores tour reviews and ratings
-- IMPORTANT: user_id references public.profiles(id) to enable proper joins
-- This fixes the PGRST200 relationship error when fetching reviews with profiles

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id INTEGER NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  comment_en TEXT,
  comment_th TEXT,
  comment_zh TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure a user can only review a tour once
  UNIQUE(tour_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
-- Allow anyone to view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Create function to handle new user signup
-- ============================================
-- This function automatically creates a profile when a new user signs up
-- It handles Google OAuth full_name splitting and enhanced email parsing
-- For Google sign-up: Splits full_name into first_name (first word) and last_name (remaining words)
-- For email parsing: Extracts names from email username using dots, underscores, and hyphens as separators

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_username TEXT;
  name_parts TEXT[];
  extracted_first_name TEXT;
  extracted_last_name TEXT;
  google_full_name TEXT;
  google_name_parts TEXT[];
BEGIN
  -- Check if user signed up with Google and has a full_name
  google_full_name := NEW.raw_user_meta_data->>'full_name';
  
  IF google_full_name IS NOT NULL AND google_full_name != '' THEN
    -- Split full_name by spaces
    google_name_parts := string_to_array(trim(google_full_name), ' ');
    
    IF array_length(google_name_parts, 1) >= 2 THEN
      -- First part is first_name, rest is last_name
      extracted_first_name := google_name_parts[1];
      extracted_last_name := array_to_string(google_name_parts[2:array_length(google_name_parts, 1)], ' ');
    ELSIF array_length(google_name_parts, 1) = 1 THEN
      -- Only one name provided
      extracted_first_name := google_name_parts[1];
      extracted_last_name := '';
    ELSE
      extracted_first_name := google_full_name;
      extracted_last_name := '';
    END IF;
  ELSE
    -- No full_name from Google, extract from email
    email_username := split_part(NEW.email, '@', 1);
    
    -- Replace common separators (underscore, hyphen) with dots for consistent parsing
    email_username := replace(replace(email_username, '_', '.'), '-', '.');
    
    -- Split by dot to get potential first and last name
    name_parts := string_to_array(email_username, '.');
    
    -- Extract first and last names with proper capitalization
    IF array_length(name_parts, 1) >= 2 THEN
      extracted_first_name := initcap(name_parts[1]);
      -- If more than 2 parts, concatenate remaining parts as last name
      IF array_length(name_parts, 1) > 2 THEN
        extracted_last_name := initcap(array_to_string(name_parts[2:array_length(name_parts, 1)], ' '));
      ELSE
        extracted_last_name := initcap(name_parts[2]);
      END IF;
    ELSIF array_length(name_parts, 1) = 1 THEN
      -- Single name extracted from email
      extracted_first_name := initcap(name_parts[1]);
      extracted_last_name := '';
    ELSE
      -- Empty or invalid array (edge case)
      extracted_first_name := '';
      extracted_last_name := '';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(google_full_name, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', extracted_first_name),
    COALESCE(NEW.raw_user_meta_data->>'last_name', extracted_last_name),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create trigger for new user signup
-- ============================================
-- This trigger calls the handle_new_user function when a new user is created

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Create function to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at automatically
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_reviews ON public.reviews;
CREATE TRIGGER set_updated_at_reviews
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Create indexes for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS reviews_tour_id_idx ON public.reviews(tour_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- ============================================
-- Verification queries (Optional)
-- ============================================
-- Run these to verify your tables were created successfully:

-- SELECT * FROM public.profiles;
-- SELECT * FROM public.reviews;

-- ============================================
-- Done!
-- ============================================
-- Your Supabase database is now ready for user authentication and reviews.
-- Make sure to update your .env.local file with:
-- NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
