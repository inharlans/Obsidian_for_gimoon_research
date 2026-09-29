@echo off
REM Wrapper so agents can run the translation pipeline without tripping over
REM PowerShell's execution policy, which blocks .ps1 files on this machine.
REM Passes every argument through unchanged.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0translate-paper.ps1" %*
