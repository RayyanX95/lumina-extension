#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXTENSION_DIR="$SCRIPT_DIR/extension"
BUILDS_DIR="$SCRIPT_DIR/builds"

# Extract version from package.json
VERSION=$(jq -r .version "$EXTENSION_DIR/package.json")
ZIP_NAME="lumina-extension-v$VERSION.zip"

echo "========================================"
echo "🚀 Building Lumina Extension v$VERSION"
echo "========================================"

# Navigate to extension directory
cd "$EXTENSION_DIR"

# Clean previous build artifacts
echo "🧹 Cleaning old builds..."
rm -f "$BUILDS_DIR/$ZIP_NAME"
mkdir -p "$BUILDS_DIR"

# Build the project
echo "🛠️ Compiling..."
npm run build

# Zip the dist folder
echo "📦 Packaging..."
# Use -j to avoid including the 'dist/' folder structure if preferred, 
# but usually for Chrome store we zip the contents or the folder itself.
# Here we zip the contents of dist/ to avoid nested folder issues.
cd dist && zip -r "$BUILDS_DIR/$ZIP_NAME" ./*

echo "========================================"
echo "✅ Build Complete!"
echo "📦 Archive: builds/$ZIP_NAME"
echo "========================================"