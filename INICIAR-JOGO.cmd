@echo off
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Instale as dependencias primeiro com: npm ci
  pause
  exit /b 1
)
echo Dungeon Master - Fundacao jogavel
echo Se o jogo ja estiver aberto, visite http://127.0.0.1:5173/
echo Mantenha esta janela aberta enquanto joga.
call npm.cmd run dev -- --port 5173 --strictPort --open
pause
