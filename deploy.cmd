@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo =============================================
echo   KILLING STALE GIT PROCESSES...
echo =============================================
taskkill /F /IM git.exe >nul 2>&1
taskkill /F /IM git-remote-https.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo [1/9] Delete git lock...
if exist ".git\index.lock" (
    del /f /q ".git\index.lock"
    if exist ".git\index.lock" (
        attrib -R -S -H ".git\index.lock"
        del /f /q ".git\index.lock"
    )
)
if exist ".git\index.lock" (
    echo     *** LOCK STILL EXISTS ***
    pause
    exit /b 1
)
echo     OK!

echo [2/9] Clean untracked files...
for %%f in (*) do (
    if not "%%f"==".gitignore" (
        if not "%%f"=="deploy.cmd" (
            del /q "%%f" 2>nul
        )
    )
)

echo [3/9] Force checkout main...
git checkout -f main
if errorlevel 1 (
    git clean -fd
    git checkout -f main
)

echo [4/9] Check for source files...
if not exist "package.json" (
    echo     ERROR: package.json not found!
    git branch --show-current
    dir
    pause
    exit /b 1
)
echo     Found package.json on: 
git branch --show-current

echo [5/9] npm install (full)...
call npm install

echo [6/9] vite build...
if exist "node_modules\.bin\vite.cmd" (
    call node_modules\.bin\vite.cmd build
) else (
    call npx vite@6 build
)
if errorlevel 1 (
    echo     BUILD FAILED!
    pause
    exit /b 1
)

echo [7/9] Push main...
git add -A
git diff --cached --quiet
if %errorlevel% neq 0 call git commit -m "fix: base path + alias + fileBytes loading"
call git push origin main

echo [8/9] Save dist to temp...
xcopy /E /Y /I dist _deploy_temp\ >nul
if not exist "_deploy_temp\index.html" (
    echo     ERROR: dist copy failed!
    pause
    exit /b 1
)

echo [9/9] Deploy to gh-pages...
git checkout gh-pages
call git pull origin gh-pages
for /d %%d in (*) do if not "%%d"==".git" rd /s /q "%%d" 2>nul
for %%f in (*) do del /q "%%f" 2>nul
xcopy /E /Y /I _deploy_temp\*.* .\
rd /s /q _deploy_temp 2>nul
git add -A
call git commit -m "deploy: %date% %time%" --allow-empty
call git push origin gh-pages --force
git checkout main
rd /s /q _deploy_temp 2>nul

echo.
echo =============================================
echo   DEPLOY COMPLETE!
echo =============================================
echo   URL: https://sky12341455.github.io/splatshow-viewer/
echo   Press Ctrl+F5!
echo.
pause