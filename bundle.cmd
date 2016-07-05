@echo off
setlocal
if not exist "%~dp0bundle" mkdir "%~dp0bundle"
set /p SHEBANG=<"%~dp0bundle/conflagrate.js"
"%~dp0node_modules\.bin\browserify" "%~dp0conflagrate.js" | "%~dp0node_modules\.bin\uglifyjs" >> "%~dp0bundle/conflagrate.js"
endlocal
