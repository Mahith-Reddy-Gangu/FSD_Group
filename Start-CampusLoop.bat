@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo CampusLoop dependencies are missing. Run npm install in this folder first.
  pause
  exit /b 1
)

set "API_PORT="
for /L %%P in (4300,1,4399) do (
  curl.exe -fsS --connect-timeout 1 --max-time 1 "http://127.0.0.1:%%P/api/health" 2>nul | findstr /I /C:"campusloop-api" >nul
  if not errorlevel 1 (
    set "API_PORT=%%P"
    goto HAVE_API
  )
)

set "API_PORT=4300"
:CHECK_API_PORT
netstat -ano -p tcp | findstr /R /C:":%API_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  set /a API_PORT+=1
  if %API_PORT% geq 4400 goto API_PORT_UNAVAILABLE
  goto CHECK_API_PORT
)
set "START_API=1"

:HAVE_API
if not defined START_API (
  for /L %%P in (5200,1,5229) do (
    curl.exe -fsS --connect-timeout 1 --max-time 1 "http://127.0.0.1:%%P/" 2>nul | findstr /I /C:"CampusLoop" >nul
    if not errorlevel 1 (
      set "UI_PORT=%%P"
      goto HAVE_WEBSITE
    )
  )
)

set "UI_PORT=5200"
:CHECK_UI_PORT
netstat -ano -p tcp | findstr /R /C:":%UI_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  set /a UI_PORT+=1
  if %UI_PORT% geq 5230 goto UI_PORT_UNAVAILABLE
  goto CHECK_UI_PORT
)
set "START_UI=1"

:HAVE_WEBSITE
if not defined API_PORT (
  echo Could not find an available port for the CampusLoop API.
  pause
  exit /b 1
)
if not defined UI_PORT (
  echo Could not find an available port for the CampusLoop website.
  pause
  exit /b 1
)

if defined START_API (
  set "PORT=%API_PORT%"
  start "CampusLoop API" /min /D "%~dp0" cmd /k "npm run server"
)
if defined START_UI (
  set "VITE_API_URL=http://localhost:%API_PORT%/api"
  start "CampusLoop Website" /min /D "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1 --port %UI_PORT% --strictPort"
)

echo Starting CampusLoop...
if not defined START_API if not defined START_UI goto OPEN_WEBSITE
if not defined START_API goto WAIT_FOR_WEBSITE
set /a ATTEMPTS=0
:WAIT_FOR_API
curl.exe -fsS "http://127.0.0.1:%API_PORT%/api/health" >nul 2>nul
if not errorlevel 1 goto WAIT_FOR_WEBSITE
set /a ATTEMPTS+=1
if %ATTEMPTS% geq 30 goto STARTUP_FAILED
timeout /t 1 /nobreak >nul
goto WAIT_FOR_API

:WAIT_FOR_WEBSITE
set /a ATTEMPTS=0
:CHECK_WEBSITE
curl.exe -fsS "http://127.0.0.1:%UI_PORT%/" | findstr /I /C:"CampusLoop" >nul
if not errorlevel 1 goto OPEN_WEBSITE
set /a ATTEMPTS+=1
if %ATTEMPTS% geq 30 goto STARTUP_FAILED
timeout /t 1 /nobreak >nul
goto CHECK_WEBSITE

:OPEN_WEBSITE
start "" "http://127.0.0.1:%UI_PORT%/"
echo CampusLoop opened in your browser.
exit /b 0

:STARTUP_FAILED
echo CampusLoop did not start in time. Check the minimized API and Website windows for errors.
pause
exit /b 1

:API_PORT_UNAVAILABLE
set "API_PORT="
goto API_PORT_ERROR
:UI_PORT_UNAVAILABLE
set "UI_PORT="
goto UI_PORT_ERROR
:API_PORT_ERROR
echo Could not find an available port for the CampusLoop API.
pause
exit /b 1
:UI_PORT_ERROR
echo Could not find an available port for the CampusLoop website.
pause
exit /b 1