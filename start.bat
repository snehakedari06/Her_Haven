@echo off
setlocal

:: Get the current root directory
set "ROOT_DIR=%~dp0"

echo.
echo  🌸 [95mStarting Haven Project: Classic Light Pink Deployment[0m 🌸
echo  --------------------------------------------------
echo.

:: 1. Start Main Backend (Python/FastAPI)
echo  🚀 [1/4] Starting [96mMain Backend (Python/FastAPI)[0m...
start "Haven - Main Backend (Python)" cmd /k "cd /d %ROOT_DIR% && .venv\Scripts\activate && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001"

:: 2. Start Main Frontend (Next.js)
echo  🚀 [2/4] Starting [95mMain Frontend (Next.js)[0m...
start "Haven - Main Frontend (Next.js)" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

:: 3. Start AI Avatar Backend (Node.js)
echo  🚀 [3/4] Starting [96mAI Avatar Backend (Node.js)[0m...
start "Haven - AI Avatar Backend (Node.js)" cmd /k "cd /d %ROOT_DIR%ai-avatar\ai-avatar-backend && npm run dev"

:: 4. Start AI Avatar Frontend (Vite)
echo  🚀 [4/4] Starting [95mAI Avatar Frontend (Vite)[0m...
start "Haven - AI Avatar Frontend (Vite)" cmd /k "cd /d %ROOT_DIR%ai-avatar\ai-avatar-frontend && npm run dev"

echo.
echo  ✨ [92mAll services are launching in separate windows![0m
echo  --------------------------------------------------
echo  [94mMain Frontend:[0m http://localhost:3000
echo  [94mMain Backend:[0m  http://localhost:8001
echo  [94mTherapy Bot:[0m   http://localhost:5173
echo  --------------------------------------------------
echo.
echo  [93mClose the separate windows to stop each service individually.[0m
echo.
pause
