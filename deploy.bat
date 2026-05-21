@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   SplatShow - GitHub Pages 一键部署脚本
echo ============================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git，请先安装: https://git-scm.com/downloads
    pause
    exit /b 1
)

where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 未检测到 GitHub CLI，将使用 Git 方式部署...
)

if not exist ".git" (
    echo [1/5] 初始化 Git 仓库...
    git init
    git add -A
    git commit -m "init: SplatShow 3D Gaussian Splatting Viewer"
) else (
    echo [1/5] Git 仓库已存在，跳过初始化
)

if not exist ".github\workflows\deploy.yml" (
    echo [错误] 缺少 .github/workflows/deploy.yml
    pause
    exit /b 1
)

echo.
echo [2/5] 请选择操作:
echo   1) 创建新仓库并推送 (需要 GitHub 账号)
echo   2) 仅推送到已有远程仓库
echo   3) 查看当前状态
set /p choice=请输入选项 (1/2/3):

if "%choice%"=="3" (
    git status
    git remote -v
    pause
    exit /b 0
)

if "%choice%"=="1" (
    echo.
    set /p repo_name=输入仓库名称 (如 splatshow-viewer):
    if "%repo_name%"=="" set repo_name=splatshow-viewer
    
    echo [3/5] 创建 GitHub 仓库并推送...
    gh repo create "%repo_name%" --public --source=. --push --push 2>nul
    if %errorlevel% equ 0 (
        echo.
        echo ============================================
        echo   部署成功!
        echo ============================================
        echo.
        echo 仓库地址: https://github.com/%USERNAME%/%repo_name%
        echo.
        echo 接下来请执行:
        echo   1. 打开 https://github.com/%USERNAME%/%repo_name%/settings/pages
        echo   2. Source 选择 ^"GitHub Actions^"
        echo   3. 等待 Actions 构建完成（约 2 分钟）
        echo   4. 访问 https://%%USERNAME%%.github.io/%repo_name%/
        echo.
    ) else (
        echo [备选] gh CLI 不可用，请手动操作:
        echo   1. 打开 https://github.com/new 创建仓库 "%repo_name%"
        echo   2. 执行以下命令:
        echo      git remote add origin https://github.com/YOUR_USER/%repo_name%.git
        echo      git branch -M main
        echo      git push -u origin main
        echo   3. 在仓库 Settings ^> Pages 中启用 GitHub Actions
    )
)

if "%choice%"=="2" (
    echo [3/5] 推送到远程仓库...
    for /f "tokens=2" %%i in ('git remote get-url origin 2^>nul') do set remote_url=%%i
    if defined remote_url (
        echo 远程地址: %remote_url%
        git add -A
        git commit --allow-empty -m "deploy: update"
        git push
        echo.
        echo 已推送! 请在 GitHub 仓库 Settings ^> Pages 启用 Actions
    ) else (
        echo [错误] 未设置远程仓库。先运行选项 1 或手动添加:
        echo   git remote add origin https://github.com/YOUR_USER/REPO.git
    )
)

pause