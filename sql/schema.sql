-- ============================================
-- CutLog Database Schema
-- ============================================

-- Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_type VARCHAR(20) NOT NULL, -- g, ml, piece
    base_unit_value INT NOT NULL DEFAULT 100,
    calories FLOAT NOT NULL,
    protein FLOAT NOT NULL,
    carbs FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    created_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, category)
);

-- Food Logs Table
CREATE TABLE IF NOT EXISTS food_logs (
    id BIGSERIAL PRIMARY KEY,
    food_item_id BIGINT REFERENCES food_items(id) ON DELETE SET NULL,
    food_name VARCHAR(255),
    quantity FLOAT NOT NULL,
    unit VARCHAR(20),
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, snack, dinner
    date DATE NOT NULL,
    calories FLOAT NOT NULL,
    protein FLOAT NOT NULL,
    carbs FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Logs Table
CREATE TABLE IF NOT EXISTS workout_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    workout_type VARCHAR(50) NOT NULL, -- gym, running, cardio
    subtype VARCHAR(100),
    duration INT NOT NULL, -- in minutes
    calories_burned INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Body Metrics Table
CREATE TABLE IF NOT EXISTS body_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    weight FLOAT, -- in kg
    waist FLOAT, -- in cm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Profile Table
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    age INT,
    gender VARCHAR(20), -- male, female, other
    weight FLOAT, -- in kg
    height FLOAT, -- in cm
    activity_level VARCHAR(20), -- sedentary, light, moderate, active, veryactive
    target_weight FLOAT, -- in kg
    calorie_goal INT,
    protein_goal INT,
    carb_goal INT,
    fat_goal INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_food_logs_food_item_id ON food_logs(food_item_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_type ON workout_logs(workout_type);
CREATE INDEX IF NOT EXISTS idx_body_metrics_date ON body_metrics(date);
CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);

-- Timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_logs_updated_at BEFORE UPDATE ON food_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_logs_updated_at BEFORE UPDATE ON workout_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_body_metrics_updated_at BEFORE UPDATE ON body_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
