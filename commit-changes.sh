#!/bin/bash

# Commit and Push Script for Webapp Changes
echo "🚀 Starting git commit and push process..."

# Check if we're in the webapp directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in webapp directory. Please run this from the webapp folder."
    exit 1
fi

# Show current status
echo "📋 Current git status:"
git status

# Ask for confirmation
echo ""
read -p "Do you want to add all changes? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add all changes
    echo "📦 Adding all changes..."
    git add .
    
    # Show what will be committed
    echo "📝 Files to be committed:"
    git diff --cached --name-only
    
    # Ask for commit confirmation
    echo ""
    read -p "Proceed with commit? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Commit changes
        echo "💾 Committing changes..."
        git commit -m "feat: Enhanced location detection and address search functionality

- Added progressive GPS location detection with 3-tier fallback strategy
- Implemented AddressSearchBox with Google Places autocomplete
- Added AddressContext for global address state management
- Enhanced GoogleMapPicker with real-time debugging panel
- Added LocationDiagnostics component for location troubleshooting
- Fixed WebSocket connection issues (changed HMR port to 24679)
- Updated Header with integrated address search dropdown
- Added docs folder to .gitignore
- Improved location accuracy validation and user feedback
- Fixed circular dependency issues in AddressPage
- Enhanced geolocation options with progressive accuracy detection"
        
        # Show current branch
        echo "🌿 Current branch:"
        git branch --show-current
        
        # Ask for push confirmation
        echo ""
        read -p "Push to remote repository? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Get current branch name
            BRANCH=$(git branch --show-current)
            
            # Push to remote
            echo "🚀 Pushing to origin/$BRANCH..."
            git push origin $BRANCH
            
            echo "✅ Successfully pushed changes to remote repository!"
        else
            echo "⏸️ Changes committed locally but not pushed to remote."
        fi
    else
        echo "❌ Commit cancelled."
    fi
else
    echo "❌ Operation cancelled."
fi

echo ""
echo "🏁 Git operation completed."
