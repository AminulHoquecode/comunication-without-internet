$electronPath = "./node_modules/electron/dist/electron.exe"
$appPath = "."

Start-Process -FilePath $electronPath -ArgumentList $appPath
