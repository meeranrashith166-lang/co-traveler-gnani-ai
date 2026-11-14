@echo off
title Co-Traveler — Sovereign AI Highway Voice Co-Pilot
color 0B

echo =====================================================================
echo           CO-TRAVELER - SOVEREIGN HIGHWAY VOICE CO-PILOT
echo        Built for The Great Indian AI Internship Challenge (Gnani.ai)
echo =====================================================================
echo.

:: Change to script directory
cd /d "%~dp0"

:: Check Python installation
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Python is not found in PATH!
    echo Please install Python 3.10+ from python.org and ensure "Add Python to PATH" is checked.
    echo.
    pause
    exit /b 1
)

:: Ensure dependencies are present
echo [1/3] Verifying Python dependencies...
python -c "import fastapi, uvicorn, httpx, dotenv" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] Installing required dependencies from requirements.txt...
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo [OK] All dependencies are ready.
)

echo.
echo [2/3] Launching Web Browser at http://localhost:8000 ...
start "" http://localhost:8000

echo.
echo [3/3] Starting Co-Traveler Server...
echo =====================================================================
echo Server running at: http://127.0.0.1:8000 (Press CTRL+C to stop)
echo =====================================================================
echo.

python server.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo Server stopped with an exit code.
    pause
)
