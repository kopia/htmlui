set build_dir=%~dp0..\htmluibuild\build\
rd /s /q %build_dir%
md %build_dir%
xcopy /e %~dp0build\ %build_dir%