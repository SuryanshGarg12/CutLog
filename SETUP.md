# CutLog - Complete Setup Guide

This guide will walk you through setting up CutLog from scratch, including all database setup, configuration, and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Configuration](#database-configuration)
4. [Local Testing](#local-testing)
5. [GitHub Pages Deployment](#github-pages-deployment)
6. [First Use](#first-use)

## Prerequisites

You will need:

- A GitHub account (free at github.com)
- A Supabase account (free tier available)
- Git installed on your computer
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Sublime, Notepad++, etc.)

## Supabase Setup

### Step 1: Create Supabase Account

1. Visit [supabase.com](https://supabase.com)
2. Click **Start Your Project**
3. Sign up with GitHub (recommended) or email
4. Create or join an organization

### Step 2: Create New Project

1. Click **New Project**
2. Fill in:
   - **Name**: `cutlog` (or your preference)
   - **Database Password**: Create strong password (you'll need this)
   - **Region**: Choose closest to you
3. Click **Create new project**
4. Wait 1-2 minutes for project to initialize

### Step 3: Get API Credentials

**IMPORTANT: Save these credentials somewhere safe**

1. In Supabase dashboard, click **Settings** (gear icon)
2. Click **API** tab
3. Copy these values:
   - **Project URL**: https://[your-project].supabase.co
   - **API Key (anon/public)**: ey[...long key...]

**DO NOT use the service_role key. Always use the anon/public key.**

Keep these values safe - you'll enter them in the app later.

## Database Configuration

### Step 1: Create Tables

1. In Supabase, go to **SQL Editor** tab
2. Click **New Query**
3. Delete any default text
4. Open file: `sql/schema.sql`
5. Copy entire contents
6. Paste into SQL Editor
7. Click **Run** (blue button)
8. Wait for success (you should see table names listed)

### Step 2: Enable Row-Level Security

1. Create another **New Query**
2. Open file: `sql/policies.sql`
3. Copy entire contents
4. Paste into editor
5. Click **Run**
6. Wait for completion

### Step 3: Import Sample Food Data

1. Create another **New Query**
2. Paste this SQL:

```sql
INSERT INTO public.food_items 
(name, category, unit_type, base_unit_value, calories, protein, carbs, fat, created_by_user) 
VALUES
('Milk', 'Dairy', 'ml', 100, 60, 3.5, 5, 3, false),
('Oats', 'Grains', 'g', 100, 389, 17, 66, 7, false),
('Chicken Breast', 'Meat', 'g', 100, 165, 31, 0, 3.6, false),
('Rice (White)', 'Grains', 'g', 100, 130, 2.7, 28, 0.3, false),
('Banana', 'Fruit', 'piece', 100, 89, 1.1, 23, 0.3, false),
('Salmon', 'Fish', 'g', 100, 208, 20, 0, 13, false),
('Egg', 'Dairy', 'piece', 50, 155, 13, 1.1, 11, false),
('Broccoli', 'Vegetable', 'g', 100, 34, 2.8, 7, 0.4, false),
('Almonds', 'Nuts', 'g', 28, 164, 6, 6, 14, false),
('Greek Yogurt', 'Dairy', 'g', 100, 59, 10, 3.3, 0.4, false),
('Spinach', 'Vegetable', 'g', 100, 23, 2.9, 3.6, 0.4, false),
('Carrot', 'Vegetable', 'g', 100, 41, 0.9, 10, 0.2, false),
('Sweet Potato', 'Vegetable', 'g', 100, 86, 1.6, 20, 0.1, false),
('Peanut Butter', 'Protein', 'tbsp', 32, 188, 8, 7, 16, false),
('Dark Chocolate', 'Snack', 'g', 28, 168, 3, 15, 12, false);
```

3. Click **Run**

### Step 4: Verify Tables

1. Go to **Table Editor**
2. You should see:
   - `food_items` (with 15 items imported)
   - `food_logs`
   - `workout_logs`
   - `body_metrics`
   - `profiles`

✅ Database is now ready!

## Local Testing

### Step 1: Start Local Server

You need a local web server to test (service workers require HTTPS or localhost).

**Option A: Python 3**
```bash
# Navigate to CutLog folder
cd /path/to/CutLog

# Start server
python -m http.server 8000
```

**Option B: Node.js**
```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server
cd /path/to/CutLog
http-server
```

**Option C: VSCode Live Server**
- Install extension: "Live Server" by Ritwick Dey
- Right-click `index.html`
- Select "Open with Live Server"

### Step 2: Open App

Visit: `http://localhost:8000/` (or whatever port shown)

### Step 3: Configure App

1. You should see setup modal
2. Enter your Supabase credentials:
   - **URL**: Your Project URL
   - **API Key**: Your anon/public API key
3. Click **Connect**

### Step 4: Test Features

1. Go to **Settings**
2. Fill in your profile:
   - Age, gender, height, weight
   - Activity level, target weight
3. Set calorie goals (default values are fine)
4. Click **Save Profile**
5. Go to **Today**
6. Click **+ Add Food**
7. Select a food from library
8. Enter quantity (e.g., 200ml milk)
9. Click **Log Food**
10. See it appear in today's dashboard

Congratulations! Your app is working! 🎉

## GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `cutlog`
3. **Description**: Optional (e.g., "Fitness tracking PWA")
4. **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2: Prepare Repository

1. Open terminal/command prompt
2. Navigate to CutLog folder
3. Initialize git repository:

```bash
cd /path/to/CutLog

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial CutLog commit"
```

### Step 3: Add Remote and Push

```bash
# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/cutlog.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** (left sidebar)
4. Under **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes

Your app is now live at: `https://YOUR_USERNAME.github.io/cutlog/`

### Step 5: Update Base Paths (If Needed)

If your app is at `github.com/cutlog` (not personal domain), you may need to update relative paths. The current setup should work, but if you see CSS/JS not loading:

Add to top of `index.html` in `<head>`:
```html
<base href="/cutlog/">
```

## First Use

### Setup Wizard

On first visit:

1. **Setup Modal**: Enter Supabase credentials
   - These are saved in browser localStorage
   - Clear browser data to reset

2. **Profile Settings**:
   - Age, gender, height, weight (for BMR calculation)
   - Activity level (affects TDEE)
   - Target weight (for tracking)

3. **Goals Settings**:
   - Daily calorie target
   - Protein, carbs, fat goals

### Adding Data

**Add Food:**
1. Click **Log** tab
2. Click **+ Add Food** or use **Log Food** tab
3. Search for food in library
4. Enter quantity (app auto-calculates macros)
5. Select meal type (breakfast/lunch/snack/dinner)
6. Click **Log Food**

**Log Workout:**
1. Go to **Log** tab
2. Click **Workout** tab
3. Select workout type (gym/running/cardio)
4. Choose subtype (e.g., "Push" for gym)
5. Enter duration in minutes
6. Optional: Enter calories burned (auto-estimates if blank)
7. Click **Log Workout**

**Track Weight:**
1. Go to **Progress** tab
2. Go to **Weight** tab
3. Enter date and weight
4. Click **Log Weight**
5. See trend chart

### Import More Foods

1. Go to **Food** tab
2. Click **📥 Import CSV**
3. Use file: `sample-food-library.csv`
4. Or create your own CSV with format:
   ```
   name,category,unit_type,base_unit_value,calories,protein,carbs,fat
   ```

## Troubleshooting

### App Doesn't Load

**Issue**: Blank page or 404 error

**Solution**:
1. Hard refresh browser: Ctrl+Shift+Delete (clear cache)
2. Then: Ctrl+F5 (hard refresh)
3. Check browser console (F12 → Console tab) for errors

### Supabase Connection Fails

**Issue**: "Failed to initialize app" or connection error

**Solution**:
1. Verify you copied credentials correctly (no extra spaces)
2. Check credentials are for correct project
3. Use anon/public key, NOT service_role key
4. Ensure project status is "Active" (not paused)

### Service Worker Not Working

**Issue**: "Service Worker failed to register"

**Solution**:
1. Service Worker only works on HTTPS or localhost
2. On GitHub Pages, it works automatically (HTTPS)
3. For localhost, ensure you're on correct port
4. Clear service workers: DevTools → Application → Service Workers → Unregister

### CSV Import Not Working

**Issue**: "Failed to import CSV" or data not appearing

**Solution**:
1. Verify CSV format:
   - Exactly 8 columns (name,category,unit_type,base_unit_value,calories,protein,carbs,fat)
   - No blank lines at end
   - No special characters in names
2. Use sample file as template
3. Check browser console for specific error

### Changes Not Appearing After Update

**Issue**: Pushed changes but GitHub Pages not updating

**Solution**:
1. Wait 2 minutes (GitHub Pages takes time to deploy)
2. Hard refresh: Ctrl+F5
3. Check **Actions** tab on GitHub for deployment status
4. Ensure .nojekyll file exists in root

## Performance Tips

1. **Cache**: First load slower (service worker caching), subsequent loads instant
2. **Offline**: Works fully offline with local cache
3. **Sync**: Data syncs every 5 minutes when online
4. **Storage**: ~2MB of cache per month of data

## Next Steps

After setup:

1. ✅ Customize your profile
2. ✅ Import foods you eat regularly  
3. ✅ Start logging meals
4. ✅ Track workouts
5. ⏭️ Monitor progress over time
6. ⏭️ Adjust goals based on trends

## Support Resources

- **README.md**: Feature overview and calculations
- **DEPLOYMENT.md**: GitHub Pages deployment details
- **sql/schema.sql**: Database structure
- **Browser Console**: Press F12 for error messages

## Getting Help

1. Check browser console for error messages (F12)
2. Clear cache and try again
3. Verify all setup steps completed
4. Test with sample data first
5. Check GitHub Actions for deployment status

---

**You're ready to use CutLog! 🚀**

Start tracking your fitness journey today!

Questions? Check the README.md or DEPLOYMENT.md files.
