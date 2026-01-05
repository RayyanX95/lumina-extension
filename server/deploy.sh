#!/bin/bash

# ============================
# 🚀 Node.js Deployment Script
# ============================

PROJECT_DIR="/var/www/lumina-extension"

echo "🔹 Starting deployment..."
echo "📂 Navigating to project directory..."
cd $PROJECT_DIR || { echo "❌ Could not navigate to project directory"; exit 1; }

echo "📡 Pulling latest code from GitHub..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

echo "📂 Navigating to server directory..."
cd server || { echo "❌ Could not navigate to server directory"; exit 1; }

echo "📦 Installing dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

echo "🔄 Reloading Node.js app with PM2..."
sudo pm2 reload lumina-proxy || { echo "❌ PM2 reload failed"; exit 1; }

echo "✅ Deployment finished successfully! 🎉"
echo "📝 Check logs with: pm2 logs lumina-proxy"
