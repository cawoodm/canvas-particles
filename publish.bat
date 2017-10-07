@ECHO OFF
SETLOCAL
CD %dp0%

SET PUB=..\..\..\cawoodm.github.io\canvas-particles

SET STR=%~1
IF "%STR%"=="" (SET STR=Build %date% %time%)

:: Commit local changes
git add .
git commit -m "%STR%"
git push origin master

:: Copy to local cawoodm github site
DEL /Q /S %PUB%\*.*
XCOPY .\build\*.* %PUB% /Y /S
ECHO Ready to test in %PUB% folder
PAUSE

:: Publish to github
CD %PUB%
git add .
git commit -m "%STR%"
git push origin master
ECHO "Ready to test at http://cawoodm.github.io/canvas-particles/
START http://cawoodm.github.io/canvas-particles/
