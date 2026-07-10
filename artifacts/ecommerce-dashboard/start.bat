@echo off
title StreamIQ — E-Commerce Intelligence Platform
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║      StreamIQ  E-Commerce Intelligence Platform        ║
echo  ║   Smart Insights. Smarter Decisions.                 ║
echo  ║                                                      ║
echo  ║  Stack: Python Flask  Olist Dataset  ML Models       ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Checking Python...
python --version 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Python not found. Install Python 3.11+ from python.org
    pause
    exit /b 1
)
echo.
echo  Installing Flask (if not already installed)...
python -m pip install flask --quiet
echo.
echo  Starting StreamIQ backend on http://localhost:3000
echo  Press Ctrl+C to stop the server.
echo.
start "" http://localhost:3000
python backend\server.py
pause
