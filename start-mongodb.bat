@echo off
echo Starting MongoDB for RecruBotX...
start "" /B "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%USERPROFILE%\mongodb-data" --logpath "%USERPROFILE%\mongodb-data\mongod.log" --logappend
echo MongoDB started. Data stored at: %USERPROFILE%\mongodb-data
echo Log file at: %USERPROFILE%\mongodb-data\mongod.log
echo.
echo You can now start the backend server.
pause
