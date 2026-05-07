@echo off
setlocal
set "LOCAL_KING_SCRAPE=%~dp0..\core\venv\Scripts\king-scrape.exe"
if exist "%LOCAL_KING_SCRAPE%" (
  "%LOCAL_KING_SCRAPE%" %*
) else (
  king-scrape %*
)
