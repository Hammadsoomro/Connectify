#!/bin/bash

echo "🚀 Preparing for Netlify deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checks..."
npm run typecheck

# Build the project
echo "🏗️ Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Files ready for deployment:"
    echo "   - dist/spa/ (frontend)"
    echo "   - netlify/functions/ (backend)"
    echo ""
    echo "🌐 Next steps:"
    echo "1. Push to GitHub: git add . && git commit -m 'Deploy to Netlify' && git push"
    echo "2. Connect to Netlify and deploy"
    echo "3. Set environment variables in Netlify dashboard"
    echo "4. Update Twilio webhook URLs"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed! Please fix errors before deployment."
    exit 1
fi
