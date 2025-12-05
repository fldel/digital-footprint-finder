-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits_remaining INTEGER DEFAULT 3 NOT NULL,
  plan TEXT DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create searches table to track user searches
CREATE TABLE public.searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  query_type TEXT DEFAULT 'name' NOT NULL,
  status TEXT DEFAULT 'completed' NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on searches
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

-- Searches RLS policies
CREATE POLICY "Users can view own searches"
ON public.searches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own searches"
ON public.searches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own searches"
ON public.searches FOR DELETE
USING (auth.uid() = user_id);

-- Create search_results table
CREATE TABLE public.search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID REFERENCES public.searches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  result_type TEXT NOT NULL,
  platform TEXT,
  profile_url TEXT,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  location TEXT,
  followers_count INTEGER,
  posts_count INTEGER,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on search_results
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;

-- Search results RLS policies
CREATE POLICY "Users can view own search results"
ON public.search_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search results"
ON public.search_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to decrement credits
CREATE OR REPLACE FUNCTION public.decrement_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits_remaining INTO current_credits
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF current_credits > 0 THEN
    UPDATE public.profiles
    SET credits_remaining = credits_remaining - 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN current_credits - 1;
  ELSE
    RETURN 0;
  END IF;
END;
$$;