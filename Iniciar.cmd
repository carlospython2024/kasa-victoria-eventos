@echo off
setlocal
cd /d "%~dp0"
set "INVITACIONES_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "INVITACIONES_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%INVITACIONES_NODE%" --version >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Instala Node.js 24 o posterior.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Faltan las dependencias del proyecto.
  echo Ejecuta npm install en esta carpeta antes de iniciar.
  pause
  exit /b 1
)
echo.
echo Invitaciones
echo Pagina: http://127.0.0.1:5173/
echo Gestion: http://127.0.0.1:5173/gestion
echo.
"%INVITACIONES_NODE%" "scripts\check-running.mjs"
if not errorlevel 1 (
  echo El proyecto ya esta encendido. Puedes abrir los enlaces de arriba.
  echo No es necesario iniciarlo otra vez.
  pause
  exit /b 0
)
echo Mantener esta ventana abierta durante la revision.
"%INVITACIONES_NODE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173 --strictPort
if errorlevel 1 (
  echo.
  echo Si el puerto 5173 ya esta en uso, abre la direccion indicada arriba.
  echo Si no abre, revisa el error anterior.
  pause
)
endlocal
