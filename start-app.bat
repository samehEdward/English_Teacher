@echo off
title EchoSpeak - English Fluency Studio
echo ========================================================
echo   EchoSpeak - Local English Fluency Studio
echo   Starting local development server...
echo ========================================================
echo.
echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/
call npm.cmd run dev
pause
