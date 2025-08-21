@echo off

REM Load environment variables from .env.local file (or .env if it exists)
if exist .env.local (
    for /f "usebackq tokens=*" %%a in (".env.local") do (
        echo %%a | findstr /v "^#" > nul && set %%a
    )
) else if exist .env (
    for /f "usebackq tokens=*" %%a in (".env") do (
        echo %%a | findstr /v "^#" > nul && set %%a
    )
)

REM Start Claude Code
claude
