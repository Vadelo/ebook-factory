@echo off
setlocal
set "LOCAL_KCTX=%~dp0..\core\venv\Scripts\kctx.exe"
if exist "%LOCAL_KCTX%" (
  "%LOCAL_KCTX%" %*
) else (
  kctx %*
)
