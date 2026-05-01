# CutLog - Production-Ready Fitness Tracking PWA

A modern, feature-rich Progressive Web App for tracking calories, workouts, and body metrics with offline support and cloud sync.

## Features

### 🍎 Food Tracking
- Pre-built food library with 50+ common foods
- CSV bulk import for custom foods
- Search and filter foods by category
- Calculate macros automatically based on quantity
- Log meals by type (breakfast, lunch, snack, dinner)
- Edit and delete logs
- Custom food item creation

### 💪 Workout Logging
- Multiple workout types: Gym, Running, Cardio
- Automatic calorie burn estimation
- Body part tagging for gym workouts
- Distance and pace tracking for running
- Workout history and filtering

### 📊 Body Metrics
- Weight tracking with trend charts
- Waist measurement tracking
- Progress visualization
- Historical comparisons
- Weight loss projections

### ⚙️ Smart Calculations
- **BMR Calculator**: Mifflin-St Jeor formula
- **TDEE Calculator**: Based on activity level
- **Macro Calculator**: Automatic scaling by quantity
- **Calorie Burn Estimator**: Based on workout type and duration
- **Progress Tracking**: Consistency scores and trends

### 📱 PWA Features
- Works offline with service worker caching
- Install as native app on iOS/Android
- Responsive design for all device sizes
- Bottom navigation for easy mobile use
- Sync when connection restored

### 🔐 Data Management
- Supabase cloud sync
- Local cache with offline support
- Export as JSON or CSV
- Bulk import from CSV
- Real-time sync across devices

### 🎨 Modern UI
- Dark mode glassmorphism design
- Smooth animations and transitions
- Animated calorie ring
- Progress bars for macros
- Toast notifications
- Modal interactions

## Tech Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Storage**: Supabase (cloud) + localStorage (offline cache)
- **Backend**: Supabase PostgreSQL
- **Hosting**: GitHub Pages compatible
- **PWA**: Service Worker + manifest.json

## Project Structure

```
CutLog/
├── index.html                 # Main HTML template
├── styles.css                # All CSS (dark theme, glassmorphism)
├── app.js                     # Main application logic (3000+ lines)
├── manifest.json             # PWA manifest
├── service-worker.js         # Offline caching and sync
├── js/
│   ├── supabase.js          # Supabase client & API
│   ├── storage.js           # Local storage & caching
│   ├── macros.js            # Calculations (BMR, TDEE, macros)
│   ├── charts.js            # Chart rendering
│   └── notifications.js      # Toast notifications
├── sql/
│   ├── schema.sql           # Database tables
│   └── policies.sql         # Row-level security
├── assets/
│   └── icons/               # App icons (PWA)
├── sample-food-library.csv  # Sample food data
└── README.md               # This file
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings → API**
4. Copy your **Project URL** and **API Key** (anon/public key)

### 2. Setup Database

1. Go to **SQL Editor** in Supabase
2. Copy and paste contents of `sql/schema.sql`
3. Run the SQL to create tables and indexes
4. Then run contents of `sql/policies.sql` for security

### 3. Configure GitHub Pages

1. Create a new GitHub repository named `cutlog`
2. Clone it locally
3. Copy all CutLog files into the repository
4. Add `.nojekyll` file to root (tells GitHub Pages not to use Jekyll):
   ```bash
   touch .nojekyll
   ```
5. Commit and push:
   ```bash
   git add .
   git commit -m "Initial CutLog commit"
   git push origin main
   ```
6. Go to **Settings → Pages**
7. Set source to `main` branch
8. Your app will be at `https://<username>.github.io/cutlog`

### 4. First Time Setup

1. Open the app
2. Enter your Supabase URL and API Key
3. Import sample food library via CSV
4. Set up your profile
5. Start logging!

## Usage Guide

### Daily Logging
- **Today tab**: View daily summary, calories, macros
- **Add Food**: Search food library, enter quantity
- **Log Workout**: Select type, duration, auto-estimates calories
- **See macros**: Visual progress bars update in real-time

### Food Library
- **Search**: Find foods by name
- **Filter**: By category
- **Add Custom**: Create new food items
- **Import CSV**: Bulk add with proper format

### Progress Tracking
- **Weight Tab**: Add weights, see trend chart
- **Metrics Tab**: Track waist measurements
- **Stats Tab**: Overall statistics and consistency

### Settings
- **Profile**: Age, gender, height, weight, activity level
- **Goals**: Calorie and macro targets
- **Export**: Save as JSON or CSV
- **Sync**: Manual sync button for cloud updates

## CSV Import Format

```
name,category,unit_type,base_unit_value,calories,protein,carbs,fat
Milk,Dairy,ml,100,60,3.5,5,3
Oats,Grains,g,100,389,17,66,7
Chicken,Meat,g,100,165,31,0,3.6
```

**Parameters:**
- `name`: Food name
- `category`: Category for filtering
- `unit_type`: g, ml, or piece
- `base_unit_value`: Base quantity (usually 100)
- `calories`: Per base unit
- `protein`: Grams per base unit
- `carbs`: Grams per base unit
- `fat`: Grams per base unit

## Calculations Reference

### BMR (Basal Metabolic Rate)
Using Mifflin-St Jeor formula:
- **Men**: (10 × weight) + (6.25 × height) - (5 × age) + 5
- **Women**: (10 × weight) + (6.25 × height) - (5 × age) - 161

### TDEE (Total Daily Energy Expenditure)
- Sedentary (little exercise): BMR × 1.2
- Light (1-3 days/week): BMR × 1.375
- Moderate (3-5 days/week): BMR × 1.55
- Active (6-7 days/week): BMR × 1.725
- Very Active (intense daily): BMR × 1.9

### Macro Calculation
When user logs quantity:
```
Multiplier = User Quantity / Base Unit Value
Macro = Base Macro × Multiplier
```

Example: User logs 180ml milk (base 100ml):
```
Multiplier = 180 / 100 = 1.8
Calories = 60 × 1.8 = 108 cal
Protein = 3.5 × 1.8 = 6.3g
```

### Calorie Burn Estimation
Based on activity type and duration (adjusted for 70kg bodyweight):
- **Gym Push/Pull**: 6-7 cal/min
- **Gym Legs**: 8 cal/min
- **Running**: 12 cal/min
- **Cycling**: 8 cal/min
- **Walking**: 4 cal/min

## Offline Support

- **Service Worker**: Caches all assets
- **Sync Queue**: Queues changes when offline
- **Auto-sync**: Syncs when connection restored
- **Local Cache**: Falls back to localStorage
- **Stale Cache**: 5-minute refresh interval

## Performance Tips

1. **First Load**: ~2-3 seconds (service worker caches assets)
2. **Subsequent Loads**: <500ms (cached)
3. **Sync**: Background sync every 5 minutes
4. **Cache Size**: ~500KB for typical usage

## Browser Support

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ iOS Safari (14+)
- ✅ Android Chrome

## Security

- **HTTPS Only**: Required for PWA and service worker
- **RLS Policies**: All data protected with Supabase RLS
- **API Keys**: Use anon/public key (not service role)
- **CORS**: Supabase handles CORS automatically

## API Endpoints

All requests go through Supabase REST API:

```javascript
// Example from supabase.js
await fetch(`${SUPABASE_URL}/rest/v1/food_items`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY
    }
});
```

## Troubleshooting

### Service Worker Not Working
- Check HTTPS is enabled
- Clear browser cache
- Unregister old service workers in DevTools

### Supabase Connection Error
- Verify URL and API key are correct
- Check CORS settings in Supabase
- Ensure RLS policies allow your key

### CSV Import Fails
- Check CSV format matches specification
- Verify all 8 columns present
- No commas in field values (use quotes if needed)

### Offline Sync Issues
- Manual sync from settings
- Check Network tab in DevTools
- Verify data format before sync

## Environment Variables

For advanced setup, create `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

(Note: Current setup stores these in localStorage for simplicity)

## Development

### Local Testing
```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or Node.js
npx http-server
```

### Production Build
No build step needed! Everything is vanilla JS.

### Update Service Worker
Change `CACHE_NAME` in service-worker.js to bust cache:
```javascript
const CACHE_NAME = 'cutlog-v2'; // Increment version
```

## Contributing

Submit issues and pull requests to improve the app!

## License

MIT License - Feel free to use and modify

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Test with sample data first
4. Clear cache and reload

## Future Features

- 📈 Advanced analytics
- 🎯 Custom meal plans
- 👥 Social sharing
- 🔔 Push notifications
- 📱 Native iOS/Android apps
- 🤖 AI meal suggestions
- 📊 PDF reports

---

**Built with ❤️ for fitness enthusiasts**

Version 1.0 | Last Updated: May 2026
# CutLog
