@echo off
title Genlysis - Local server
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 24 or later, then try again.
  pause
  exit /b 1
)
node scripts\dev.mjs --open
if errorlevel 1 (
  echo.
  echo Genlysis could not start. The error is shown above.
  pause
)
