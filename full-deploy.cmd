@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo =============================================
echo   STEP 1: FIX @/ IMPORTS ON DISK
echo =============================================
powershell -ExecutionPolicy Bypass -Command "$f='src\App.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/components/layout/Layout'\",\"from './components/layout/Layout'\"); $c=$c.Replace(\"from '@/pages/HomePage'\",\"from './pages/HomePage'\"); $c=$c.Replace(\"from '@/pages/GalleryPage'\",\"from './pages/GalleryPage'\"); $c=$c.Replace(\"from '@/pages/ViewerPage'\",\"from './pages/ViewerPage'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'App.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\pages\ViewerPage.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/components/viewer/SplatCanvas'\",\"from '../components/viewer/SplatCanvas'\"); $c=$c.Replace(\"from '@/components/viewer/ViewerToolbar'\",\"from '../components/viewer/ViewerToolbar'\"); $c=$c.Replace(\"from '@/components/viewer/InfoPanel'\",\"from '../components/viewer/InfoPanel'\"); $c=$c.Replace(\"from '@/components/viewer/ProgressBar'\",\"from '../components/viewer/ProgressBar'\"); $c=$c.Replace(\"from '@/components/viewer/FileDropZone'\",\"from '../components/viewer/FileDropZone'\"); $c=$c.Replace(\"from '@/hooks/useSplatViewer'\",\"from '../hooks/useSplatViewer'\"); $c=$c.Replace(\"from '@/types'\",\"from '../types'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'ViewerPage.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\pages\HomePage.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/components/home/HeroSection'\",\"from '../components/home/HeroSection'\"); $c=$c.Replace(\"from '@/components/home/FeaturedModels'\",\"from '../components/home/FeaturedModels'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'HomePage.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\pages\GalleryPage.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/components/gallery/ModelCard'\",\"from '../components/gallery/ModelCard'\"); $c=$c.Replace(\"from '@/components/gallery/SearchBar'\",\"from '../components/gallery/SearchBar'\"); $c=$c.Replace(\"from '@/data/models'\",\"from '../data/models'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'GalleryPage.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\hooks\useSplatViewer.ts'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/types'\",\"from '../types'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'useSplatViewer.ts OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\data\models.ts'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/types'\",\"from '../types'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'models.ts OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\components\viewer\ViewerToolbar.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/types'\",\"from '../../types'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'ViewerToolbar.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\components\home\FeaturedModels.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/data/models'\",\"from '../../data/models'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'FeaturedModels.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\components\gallery\ModelCard.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/types'\",\"from '../../types'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'ModelCard.tsx OK'"

powershell -ExecutionPolicy Bypass -Command "$f='src\components\Empty.tsx'; $c=[System.IO.File]::ReadAllText($f); $c=$c.Replace(\"from '@/lib/utils'\",\"from '../lib/utils'\"); [System.IO.File]::WriteAllText($f,$c); Write-Host 'Empty.tsx OK'"

echo.
echo =============================================
echo   STEP 2: VERIFY NO @/ REMAINING
echo =============================================
powershell -ExecutionPolicy Bypass -Command "$r=0; Get-ChildItem 'src' -Recurse -Include *.ts,*.tsx | ForEach-Object { if ([System.IO.File]::ReadAllText($_.FullName) -match ""from '@/"") { $r++; Write-Host $_.FullName } }; if ($r -eq 0) { Write-Host 'ALL CLEAN!' } else { Write-Host \"$r files still have @/!\" }"

echo.
echo =============================================
echo   STEP 3: COMMIT CHANGES TO GIT
echo =============================================
git add src\App.tsx src\pages\ViewerPage.tsx src\pages\HomePage.tsx src\pages\GalleryPage.tsx src\hooks\useSplatViewer.ts src\data\models.ts src\components\viewer\ViewerToolbar.tsx src\components\home\FeaturedModels.tsx src\components\gallery\ModelCard.tsx src\components\Empty.tsx vite.config.ts
git commit -m "fix: replace @/ with relative paths for CMD build" --allow-empty

echo.
echo =============================================
echo   STEP 4: BUILD + DEPLOY
echo =============================================

taskkill /F /IM git.exe >nul 2>&1
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\index.lock" attrib -R -S -H ".git\index.lock" & del /f /q ".git\index.lock"

call npm install
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

git add -A
git diff --cached --quiet
if %errorlevel% neq 0 call git commit -m "build artifacts"
call git push origin main

xcopy /E /Y /I dist _deploy_temp\ >nul
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
echo   Ctrl+F5: https://sky12341455.github.io/splatshow-viewer/
echo.
pause