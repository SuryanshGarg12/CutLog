# CutLog - GitHub Pages Deployment Guide

Complete step-by-step guide to deploy CutLog to GitHub Pages with Supabase integration.

## Prerequisites

- GitHub account (free)
- Supabase account (free tier available)
- Git installed on your computer
- Any text editor

## Step 1: Create GitHub Repository

### 1.1 Create Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `cutlog`
3. Description: "Progressive Web App for fitness tracking"
4. Set to **Public** (required for GitHub Pages free tier)
5. Click **Create repository**

### 1.2 Clone Repository Locally

```bash
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/cutlog.git
cd cutlog
```

## Step 2: Add CutLog Files

### 2.1 Copy All Project Files

Copy all the CutLog files into the `cutlog` directory:

```
index.html
styles.css
app.js
service-worker.js
manifest.json
js/
  ├── supabase.js
  ├── storage.js
  ├── macros.js
  ├── charts.js
  └── notifications.js
sql/
  ├── schema.sql
  └── policies.sql
sample-food-library.csv
README.md
```

### 2.2 Create .nojekyll File

GitHub Pages uses Jekyll by default. Create `.nojekyll` in the root directory:

```bash
# On Mac/Linux
touch .nojekyll

# On Windows (PowerShell)
New-Item -Name ".nojekyll" -ItemType "file"
```

This file tells GitHub Pages not to process your site with Jekyll.

### 2.3 Create GitHub Pages Config

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

## Step 3: Commit and Push to GitHub

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial CutLog commit"

# Push to GitHub
git push origin main
```

## Step 4: Enable GitHub Pages

### 4.1 Go to Repository Settings

1. Go to your repository: `github.com/YOUR_USERNAME/cutlog`
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)

### 4.2 Configure Pages

1. Under **Source**, select `main` branch
2. Click **Save**
3. Wait 1-2 minutes for deployment

Your site will be available at: **https://YOUR_USERNAME.github.io/cutlog/**

## Step 5: Create Supabase Project

### 5.1 Sign Up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub (or email)
4. Create new organization

### 5.2 Create Project

1. Click **New project**
2. Enter project name: `cutlog`
3. Set a strong database password
4. Select region closest to you
5. Click **Create new project** (wait 1-2 minutes)

### 5.3 Get Project Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API** tab
3. Copy:
   - **Project URL**
   - **Anon/Public Key** (NOT the service_role key)

**IMPORTANT**: Save these credentials securely!

## Step 6: Setup Database

### 6.1 Create Tables

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Copy entire contents of `sql/schema.sql`
4. Paste into editor
5. Click **Run**
6. Wait for success message

### 6.2 Create Policies

1. Create another new query
2. Copy entire contents of `sql/policies.sql`
3. Paste into editor
4. Click **Run**
5. Wait for success message

### 6.3 Import Sample Food Data

1. Go to **SQL Editor** again
2. Create new query
3. Paste this SQL to insert sample foods:

```sql
INSERT INTO food_items (name, category, unit_type, base_unit_value, calories, protein, carbs, fat, created_by_user) VALUES
('Milk', 'Dairy', 'ml', 100, 60, 3.5, 5, 3, false),
('Oats', 'Grains', 'g', 100, 389, 17, 66, 7, false),
('Chicken Breast', 'Meat', 'g', 100, 165, 31, 0, 3.6, false),
('Rice (White)', 'Grains', 'g', 100, 130, 2.7, 28, 0.3, false),
('Banana', 'Fruit', 'piece', 100, 89, 1.1, 23, 0.3, false),
('Salmon', 'Fish', 'g', 100, 208, 20, 0, 13, false),
('Broccoli', 'Vegetable', 'g', 100, 34, 2.8, 7, 0.4, false),
('Egg', 'Dairy', 'piece', 50, 155, 13, 1.1, 11, false),
('Almonds', 'Nuts', 'g', 28, 164, 6, 6, 14, false),
('Yogurt', 'Dairy', 'g', 100, 59, 3.5, 3.3, 1.5, false);
```

4. Click **Run**

## Step 7: Test Your App

### 7.1 Open Your App

Visit: https://YOUR_USERNAME.github.io/cutlog/

### 7.2 First Time Setup

1. You'll see setup modal
2. Enter your Supabase credentials:
   - **URL**: Your project URL
   - **API Key**: Your anon key
3. Click **Connect**

### 7.3 Start Testing

1. Go to **Settings**
2. Fill in your profile
3. Import CSV or add foods manually
4. Log some meals and workouts
5. Check dashboard

## Step 8: Update Your Domain (Optional)

If you own a custom domain (like `cutlog.me`):

### 8.1 Configure Domain

1. Go to **Settings → Pages**
2. Under **Custom domain**, enter your domain
3. Follow DNS configuration steps
4. GitHub will provide specific DNS records

## Troubleshooting

### App Shows Blank Page

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for errors
- Verify .nojekyll file exists

### Service Worker Issues

- Service worker only works on HTTPS (which GitHub Pages provides)
- In DevTools → Application, check service worker status
- Clear cache and unregister old workers

### Supabase Connection Error

- Verify URL and API key are correct
- Check caps/spaces in credentials
- Try in incognito window
- Check if Project is active (not paused)

### CSV Import Not Working

- Verify CSV format matches specification
- All 8 columns must be present
- No blank rows at end
- Use sample file as template

### Changes Not Showing

- Wait 1-2 minutes after push
- Hard refresh browser (Ctrl+F5)
- Check GitHub Actions for deployment status
- Verify files are in root directory

## GitHub Actions Status

Check deployment status:

1. Go to your repository
2. Click **Actions** tab
3. Look for "Deploy to GitHub Pages" workflow
4. Should show green checkmark if successful

## Updating Your App

### 1. Make Changes Locally

```bash
# Edit files in your editor
```

### 2. Commit and Push

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

### 3. GitHub Pages Auto-Deploys

- Deployment happens automatically
- Check Actions tab for status
- Wait 1-2 minutes for live update

## Performance Optimization

### Enable Caching Headers

Create `_config.yml` in root:

```yaml
plugins:
  - jekyll-paginate

# Cache configuration
compress_output: true
```

This tells GitHub Pages to serve with proper caching headers.

### Monitor Performance

1. Go to your app
2. Open DevTools (F12)
3. Go to **Performance** tab
4. Click Record, then reload
5. Check load times

## Security Best Practices

1. **API Key**: Your public key is safe in client code
2. **Never commit**: Private keys or service_role keys
3. **Monitor usage**: Check Supabase dashboard for abuse
4. **Enable Auth**: For multi-user setup (future feature)

## Using Custom Domain with GitHub Pages

If you want `cutlog.yoursite.com`:

```bash
# In repository root, create CNAME file
echo "cutlog.yoursite.com" > CNAME

# Push changes
git add CNAME
git commit -m "Add custom domain"
git push origin main

# Then configure DNS records with your domain provider
```

## Rollback to Previous Version

If something goes wrong:

```bash
# View commit history
git log --oneline

# Revert to previous commit
git revert <commit-id>

# Push to deploy previous version
git push origin main
```

## Monitor Your App

### Check Supabase Usage

1. Go to Supabase dashboard
2. **Home** tab shows:
   - Database storage used
   - Realtime connections
   - API requests

### Free Tier Limits

- Database: 500MB
- Monthly active users: 100
- API requests: 50,000/month
- Storage: 1GB

### Upgrade if Needed

When approaching limits, upgrade to paid plan or optimize queries.

## Next Steps

1. ✅ App deployed on GitHub Pages
2. ✅ Database setup on Supabase
3. ⏭️ Customize app branding
4. ⏭️ Add more users
5. ⏭️ Monitor and optimize

## Support

### Common Issues

**Q: GitHub pages showing 404**
A: Ensure .nojekyll file exists and files are in root directory

**Q: Supabase connection failing**
A: Double-check URL and API key, no extra spaces

**Q: Changes not appearing**
A: Wait 2 minutes, hard refresh, check Actions tab

## Additional Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Supabase Docs](https://supabase.com/docs)
- [Service Workers Guide](https://developers.google.com/web/tools/service-worker-libraries)

---

**You're all set! 🎉 Your CutLog app is now live!**

Visit: https://YOUR_USERNAME.github.io/cutlog/

