@echo off
echo Copying Overdrive Shield logo to project...
echo.

REM Create assets folder if it doesn't exist
if not exist "assets" mkdir assets

REM Copy logo from OneDrive to assets folder
copy "C:\Users\hp\OneDrive\Documents\Overdrive\Overdrive Shield logo\Overdrive_Shield_Logo_no_bg.png" "assets\"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Logo copied successfully!
    echo.
    echo File location: e:\mev-dashboard\assets\Overdrive_Shield_Logo_no_bg.png
    echo.
    echo Now refresh your browser to see the logo!
) else (
    echo.
    echo ❌ Failed to copy logo. Please copy manually:
    echo.
    echo FROM: C:\Users\hp\OneDrive\Documents\Overdrive\Overdrive Shield logo\Overdrive_Shield_Logo_no_bg.png
    echo TO:   e:\mev-dashboard\assets\
    echo.
)

pause
