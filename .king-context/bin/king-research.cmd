@echo off
setlocal
set "LOCAL_KING_RESEARCH=%~dp0..\core\venv\Scripts\king-research.exe"
if exist "%LOCAL_KING_RESEARCH%" (
  "%LOCAL_KING_RESEARCH%" %*
) else (
  king-research %*
)
