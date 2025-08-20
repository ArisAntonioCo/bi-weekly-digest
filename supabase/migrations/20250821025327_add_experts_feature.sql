-- Migration: Add Experts Feature
-- Description: Complete implementation of experts management system
-- Date: 2025-08-21
-- 
-- This migration includes:
-- 1. Table creation for experts and user preferences
-- 2. Indexes for performance
-- 3. Update triggers for timestamps
-- 4. Row-level security policies
-- 5. Initial data seeding with default experts
--
-- ROLLBACK INSTRUCTIONS:
-- To rollback this migration, run the SQL commands in the ROLLBACK section at the bottom

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- Create experts table
CREATE TABLE IF NOT EXISTS experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  focus_areas TEXT,
  investing_law TEXT NOT NULL,
  framework_description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  category TEXT CHECK (category IN ('value', 'growth', 'tech', 'macro', 'custom')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_expert_preferences table
CREATE TABLE IF NOT EXISTS user_expert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_ids UUID[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_experts_is_active ON experts(is_active);
CREATE INDEX IF NOT EXISTS idx_experts_category ON experts(category);
CREATE INDEX IF NOT EXISTS idx_experts_display_order ON experts(display_order);
CREATE INDEX IF NOT EXISTS idx_user_expert_preferences_user_id ON user_expert_preferences(user_id);

-- ============================================
-- STEP 3: CREATE TRIGGERS
-- ============================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_experts_updated_at ON experts;
CREATE TRIGGER update_experts_updated_at 
  BEFORE UPDATE ON experts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_expert_preferences_updated_at ON user_expert_preferences;
CREATE TRIGGER update_user_expert_preferences_updated_at 
  BEFORE UPDATE ON user_expert_preferences
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: SETUP ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on both tables
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expert_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can read active experts" ON experts;
DROP POLICY IF EXISTS "Admins can manage experts" ON experts;
DROP POLICY IF EXISTS "Service role has full access to experts" ON experts;
DROP POLICY IF EXISTS "Users can read own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Users can create own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Service role has full access to user_expert_preferences" ON user_expert_preferences;

-- Experts table policies
-- Everyone can read active experts
CREATE POLICY "Public can read active experts" ON experts
  FOR SELECT USING (is_active = true);

-- Only admins can insert, update, delete experts
CREATE POLICY "Admins can manage experts" ON experts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Service role bypass for cron jobs and admin operations
CREATE POLICY "Service role has full access to experts" ON experts
  FOR ALL USING (auth.role() = 'service_role');

-- User expert preferences policies
-- Users can read their own preferences
CREATE POLICY "Users can read own preferences" ON user_expert_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create own preferences" ON user_expert_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_expert_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_expert_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass for admin operations
CREATE POLICY "Service role has full access to user_expert_preferences" ON user_expert_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- STEP 5: SEED DEFAULT EXPERTS DATA
-- ============================================

-- Insert default experts (only if they don't exist)
INSERT INTO experts (name, title, focus_areas, investing_law, framework_description, is_default, is_active, display_order, category) 
VALUES
  (
    'Bill Gurley',
    'Legendary VC at Benchmark',
    'Valuation discipline, marketplace dynamics, network effects',
    'All revenue is not created equal - focus on high-margin, recurring revenue with pricing power',
    'Focuses on sustainable unit economics and competitive moats',
    true,
    true,
    1,
    'value'
  ),
  (
    'Brad Gerstner',
    'Founder of Altimeter Capital',
    'AI transformation, growth at reasonable prices, tech platforms',
    'The best investments combine secular growth trends with reasonable valuations',
    'Seeks companies at the intersection of growth and value',
    true,
    true,
    2,
    'growth'
  ),
  (
    'Stanley Druckenmiller',
    'Legendary Macro Investor',
    'Macro trends, market cycles, risk management',
    'It''s not whether you''re right or wrong, but how much money you make when you''re right and how much you lose when you''re wrong',
    'Macro-driven approach with focus on risk/reward asymmetry',
    true,
    true,
    3,
    'macro'
  ),
  (
    'Mary Meeker',
    'Partner at Bond Capital, "Queen of the Internet"',
    'Internet trends, digital transformation, data-driven insights',
    'Data is the new oil - companies that harness it effectively will dominate their industries',
    'Deep analysis of technology adoption curves and network effects',
    true,
    true,
    4,
    'tech'
  ),
  (
    'Beth Kindig',
    'Lead Tech Analyst at I/O Fund',
    'Deep tech research, semiconductor cycles, AI infrastructure',
    'The biggest returns come from identifying technology inflection points before the crowd',
    'Technical analysis combined with fundamental research',
    true,
    true,
    5,
    'tech'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROLLBACK SECTION
-- ============================================
-- To rollback this migration, uncomment and run the following SQL:

/*
-- Drop policies
DROP POLICY IF EXISTS "Public can read active experts" ON experts;
DROP POLICY IF EXISTS "Admins can manage experts" ON experts;
DROP POLICY IF EXISTS "Service role has full access to experts" ON experts;
DROP POLICY IF EXISTS "Users can read own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Users can create own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_expert_preferences;
DROP POLICY IF EXISTS "Service role has full access to user_expert_preferences" ON user_expert_preferences;

-- Drop triggers
DROP TRIGGER IF EXISTS update_experts_updated_at ON experts;
DROP TRIGGER IF EXISTS update_user_expert_preferences_updated_at ON user_expert_preferences;

-- Drop indexes
DROP INDEX IF EXISTS idx_experts_is_active;
DROP INDEX IF EXISTS idx_experts_category;
DROP INDEX IF EXISTS idx_experts_display_order;
DROP INDEX IF EXISTS idx_user_expert_preferences_user_id;

-- Drop tables (this will also delete all data)
DROP TABLE IF EXISTS user_expert_preferences;
DROP TABLE IF EXISTS experts;

-- Note: The update_updated_at_column() function is kept as it may be used by other tables
*/