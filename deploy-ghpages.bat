@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   SplatShow - Build & Deploy to gh-pages
echo ============================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

echo [1/4] Running npm install...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo       Done!
echo.

echo [2/4] Building with vite build...
call npx vite build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo       Done! Output: dist/
echo.

echo [3/4] Committing to main branch...
git add -A
git diff --cached --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo       No changes to commit
) else (
    git commit -m "chore: update source code"
)
git push origin main 2>nul
echo.

echo [4/4] Deploying to gh-pages branch...
git checkout gh-pages 2>nul
if %errorlevel% neq 0 (
    echo       Creating gh-pages branch...
    git checkout --orphan gh-pages
    git rm -rf . 2>nul
) else (
    git pull origin gh-pages 2>nul)
echo       Copying dist contents to root...
xcopy /E /Y /I dist\*.* .\ 2>nul
git add -A
git commit -m "deploy: %date% %time%" --allow-empty
git push origin gh-pages --force
echo.
git checkout main

echo.
echo ============================================
echo   DEPLOY COMPLETE!
echo ============================================
echo.
echo   URL: https://sky12341455.github.io/splatshow-viewer/
echo.
echo   If still 404, check:
echo   https://github.com/sky12341455/splatshow-viewer/settings/pages
echo   Source = Deploy from a branch
echo   Branch = gh-pages, Folder = / (root)
echo.
pause