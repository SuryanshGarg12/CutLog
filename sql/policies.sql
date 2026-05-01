-- ============================================
-- CutLog Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Food Items Policies
-- ============================================

-- Allow everyone to read food items
CREATE POLICY "food_items_select_public" ON food_items
    FOR SELECT USING (true);

-- Allow authenticated users to create food items
CREATE POLICY "food_items_insert_authenticated" ON food_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own food items
CREATE POLICY "food_items_update_own" ON food_items
    FOR UPDATE USING (
        created_by_user = true OR auth.uid() IS NOT NULL
    );

-- Allow deletion of user-created items
CREATE POLICY "food_items_delete_own" ON food_items
    FOR DELETE USING (created_by_user = true);

-- ============================================
-- Food Logs Policies
-- ============================================

-- Allow authenticated users to create food logs
CREATE POLICY "food_logs_insert_authenticated" ON food_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view all their food logs
CREATE POLICY "food_logs_select_authenticated" ON food_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own food logs
CREATE POLICY "food_logs_update_own" ON food_logs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow users to delete their own food logs
CREATE POLICY "food_logs_delete_own" ON food_logs
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Workout Logs Policies
-- ============================================

-- Allow authenticated users to create workout logs
CREATE POLICY "workout_logs_insert_authenticated" ON workout_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view all their workout logs
CREATE POLICY "workout_logs_select_authenticated" ON workout_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own workout logs
CREATE POLICY "workout_logs_update_own" ON workout_logs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow users to delete their own workout logs
CREATE POLICY "workout_logs_delete_own" ON workout_logs
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Body Metrics Policies
-- ============================================

-- Allow authenticated users to create body metrics
CREATE POLICY "body_metrics_insert_authenticated" ON body_metrics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view all their body metrics
CREATE POLICY "body_metrics_select_authenticated" ON body_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own body metrics
CREATE POLICY "body_metrics_update_own" ON body_metrics
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow users to delete their own body metrics
CREATE POLICY "body_metrics_delete_own" ON body_metrics
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Profile Policies
-- ============================================

-- Allow authenticated users to create profile
CREATE POLICY "profiles_insert_authenticated" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view their own profile
CREATE POLICY "profiles_select_authenticated" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Note: In production, you might want to restrict profiles to one per user
-- by using auth.uid() in a user_id column. This simplified version allows
-- any authenticated user to access all data for MVP purposes.
