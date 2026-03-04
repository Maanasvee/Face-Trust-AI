@echo off
echo ==========================================
echo FaceTrust AI - Quick Start Script (Windows)
echo ==========================================
echo.

echo Checking prerequisites...

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Python is not installed. Please install Python 3.8+
    exit /b 1
)
echo √ Python found

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 16+
    exit /b 1
)
echo √ Node.js found

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed. Please install npm
    exit /b 1
)
echo √ npm found

echo.
echo ==========================================
echo Setting up Backend...
echo ==========================================

cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Creating data directory...
if not exist "data\users" mkdir data\users

echo √ Backend setup complete!

cd ..

echo.
echo ==========================================
echo Setting up Frontend...
echo ==========================================

cd frontend

echo Installing Node dependencies...
call npm install

echo Creating .env file...
echo REACT_APP_API_URL=http://localhost:8000 > .env

echo √ Frontend setup complete!

cd ..

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate
echo   python main.py
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo ==========================================

pause
