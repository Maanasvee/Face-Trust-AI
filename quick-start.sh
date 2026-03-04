#!/bin/bash

echo "=========================================="
echo "FaceTrust AI - Quick Start Script"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi
echo "✅ Python 3 found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi
echo "✅ Node.js found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi
echo "✅ npm found"

echo ""
echo "=========================================="
echo "Setting up Backend..."
echo "=========================================="

cd backend

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create data directory
echo "Creating data directory..."
mkdir -p data/users

echo "✅ Backend setup complete!"

cd ..

echo ""
echo "=========================================="
echo "Setting up Frontend..."
echo "=========================================="

cd frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Create .env file
echo "Creating .env file..."
echo "REACT_APP_API_URL=http://localhost:8000" > .env

echo "✅ Frontend setup complete!"

cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "  python main.py"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "=========================================="
