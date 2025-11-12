-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT CHECK (char_length(full_name) > 0),
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('worker', 'customer', 'company')),
  location TEXT CHECK (char_length(location) > 0),
  
  -- Worker-specific
  skills TEXT[],
  bio TEXT,
  hourly_rate INTEGER CHECK (hourly_rate >= 0),
  portfolio TEXT[],          -- array of image URLs
  bank_name TEXT,
  account_number TEXT,
  branch_code TEXT,
  id_number TEXT,
  total_earnings NUMERIC DEFAULT 0.0, -- For workers
  average_rating NUMERIC(2,1) DEFAULT 0.0, -- For workers
  
  -- Customer/Company
  company_name TEXT,
  team_size INTEGER DEFAULT 0,
  preferred_categories TEXT[], -- New field for customer's preferred job categories
  total_spent NUMERIC DEFAULT 0.0, -- For customers
  saved_pros_count INTEGER DEFAULT 0, -- For customers
  active_projects INTEGER DEFAULT 0, -- For companies
  
  -- Verification & Subscription
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  plan_name TEXT DEFAULT 'Basic', -- 'Basic', 'Pro', 'Elite' (worker) or 'Starter', 'Business', 'Enterprise' (company)
  plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'trialing', 'canceled', 'past_due')),
  stripe_customer_id TEXT,
  current_period_end TIMESTAMPTZ,
  job_leads_used INTEGER DEFAULT 0,
  leads_limit INTEGER DEFAULT 5 -- Default limit for job leads
);

-- 2. JOBS
CREATE TABLE public.jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g. 'electricians'
  location TEXT NOT NULL CHECK (char_length(location) > 0),
  min_budget INTEGER CHECK (min_budget >= 0),
  max_budget INTEGER CHECK (max_budget >= 0),
  preferred_date DATE,
  images TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-progress', 'completed', 'cancelled')),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. PAYMENTS
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Customer or Company
  payee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL  -- Worker or Company
);

-- 4. REVIEWS
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Customer or Company
  reviewed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Worker or Company
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT
);

-- 5. SAVED PROS (for customers to save workers)
CREATE TABLE public.saved_pros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(customer_id, worker_id)
);

-- 6. APPLICATIONS (for Apply → Approve flow)
CREATE TABLE public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  UNIQUE(job_id, worker_id)
);

-- 4. CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Allow one conversation per job, or general if no job
  UNIQUE(customer_id, worker_id, job_id)
);

-- 5. MESSAGES
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) > 0)
);

-- 6. COMPANY PROJECTS (for companies)
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  team_size INTEGER DEFAULT 0,
  budget_amount INTEGER,
  rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COMPANY TEAM MEMBERS (for companies)
CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'removed')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(company_id, worker_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Jobs
CREATE POLICY "Customers can manage their jobs"
  ON public.jobs
  FOR ALL
  USING (auth.uid() = customer_id);

CREATE POLICY "Workers can view open jobs"
  ON public.jobs
  FOR SELECT
  USING (status = 'open');

-- Payments
CREATE POLICY "Users can view their payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Saved Pros
CREATE POLICY "Customers can manage their saved pros"
  ON public.saved_pros
  FOR ALL
  USING (auth.uid() = customer_id);

-- Applications
CREATE POLICY "Workers can apply to jobs"
  ON public.applications
  FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can view their applications"
  ON public.applications
  FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Customers can manage applications for their jobs"
  ON public.applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_id AND j.customer_id = auth.uid()
    )
  );

-- Conversations
CREATE POLICY "Participants can access conversation"
  ON public.conversations
  FOR ALL
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = worker_id
  );

-- Messages
CREATE POLICY "Participants can read messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.worker_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.worker_id = auth.uid())
    )
  );

-- Projects (company-only)
CREATE POLICY "Companies can manage their projects"
  ON public.projects
  FOR ALL
  USING (auth.uid() = company_id);

-- Team Members (company-only)
CREATE POLICY "Companies can manage their team"
  ON public.team_members
  FOR ALL
  USING (auth.uid() = company_id);

-- Function: Auto-create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    role, 
    location,
    company_name,
    preferred_categories,
    leads_limit
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'company_name',
    ARRAY[]::TEXT[], -- Initialize as empty array
    COALESCE((NEW.raw_user_meta_data->>'leads_limit')::INTEGER, 5) -- Default to 5 if not provided
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
