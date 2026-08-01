@echo off
setlocal
set "PATH=%~dp0tools\node-v22.14.0-win-x64;%PATH%"
call "%~dp0tools\node-v22.14.0-win-x64\npm.cmd" %*

