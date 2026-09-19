@echo off
REM Heatt · zero-install preview server.
REM Uses the Python that ships with Windows tooling here; there is no Node on
REM this machine, which is exactly why this file exists.
cd /d "%~dp0.."
echo.
echo   Serving the repository root.
echo   Open  http://localhost:8000/preview/
echo   Stop with Ctrl+C.
echo.
python -m http.server 8000
