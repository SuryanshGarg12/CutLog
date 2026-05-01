#!/bin/bash

# CutLog - Quick Start Script
# Run this after cloning to get everything set up faster

echo "🏋️  CutLog Quick Setup"
echo "===================="
echo ""

# Check if in correct directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the CutLog root directory"
    exit 1
fi

echo "✅ Found CutLog files"
echo ""

# Create necessary files if missing
if [ ! -f ".nojekyll" ]; then
    touch .nojekyll
    echo "✅ Created .nojekyll for GitHub Pages"
fi

# Check for git
if ! command -v git &> /dev/null; then
    echo "⚠️  Git not found. Install git to deploy to GitHub Pages"
else
    echo "✅ Git found"
fi

echo ""
echo "📋 File Structure:"
echo ""
ls -1 | grep -E "\.(html|css|js|json|md)$|^js$|^sql$|^assets$"
echo ""

echo "🚀 Next Steps:"
echo "1. Set up Supabase project:"
echo "   - Go to supabase.com"
echo "   - Create new project"
echo "   - Copy URL and API key"
echo ""
echo "2. Create database:"
echo "   - Run: sql/schema.sql in Supabase SQL Editor"
echo "   - Run: sql/policies.sql in Supabase SQL Editor"
echo ""
echo "3. Test locally:"
echo "   - Python: python -m http.server 8000"
echo "   - Node: npx http-server"
echo "   - Visit: http://localhost:8000"
echo ""
echo "4. Deploy to GitHub:"
echo "   - git init"
echo "   - git add ."
echo "   - git commit -m 'Initial commit'"
echo "   - git remote add origin https://github.com/USERNAME/cutlog.git"
echo "   - git push -u origin main"
echo ""
echo "5. Enable GitHub Pages:"
echo "   - Go to Settings → Pages"
echo "   - Set branch to 'main'"
echo ""
echo "📚 Read these files:"
echo "   - README.md: Feature overview"
echo "   - SETUP.md: Detailed setup guide"
echo "   - DEPLOYMENT.md: GitHub Pages deployment"
echo ""
echo "✨ Done! Start tracking your fitness journey 🎉"
echo ""
