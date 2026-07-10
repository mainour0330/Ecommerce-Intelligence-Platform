@echo off
echo.
echo ========================================
echo   StreamIQ Logo Verification
echo ========================================
echo.

set "logo_path=public\streamiq-logo.png"

if exist "%logo_path%" (
    echo [SUCCESS] Logo file found!
    echo Location: %cd%\%logo_path%
    echo.
    echo Your logo is ready to use.
    echo.
    echo Next steps:
    echo 1. Start the server: npm start
    echo 2. Open: http://localhost:3000/landing
    echo 3. Open: http://localhost:3000/dashboard
    echo.
) else (
    echo [WARNING] Logo file NOT found!
    echo.
    echo Expected location: %cd%\%logo_path%
    echo.
    echo Please save your StreamIQ logo as:
    echo   streamiq-logo.png
    echo.
    echo In this folder:
    echo   %cd%\public\
    echo.
    echo Instructions: See LOGO_SETUP.md for help
    echo.
)

echo ========================================
echo.
pause
