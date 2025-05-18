# Create distribution folder
$distPath = ".\dist\WirelessWalkieTalkie"
New-Item -ItemType Directory -Force -Path $distPath

# Copy necessary files
Copy-Item "index.html" -Destination $distPath
Copy-Item "main.js" -Destination $distPath
Copy-Item "renderer.js" -Destination $distPath
Copy-Item "package.json" -Destination $distPath
Copy-Item "assets" -Destination $distPath -Recurse -Force
Copy-Item "Start Walkie-Talkie.bat" -Destination $distPath

# Create a modules folder and copy only required node_modules
$modulesPath = "$distPath\node_modules"
New-Item -ItemType Directory -Force -Path $modulesPath

# Copy only the required node_modules (excluding dev dependencies)
$requiredModules = @(
    "network-list",
    "socket.io",
    "socket.io-client",
    "wifi-control",
    "electron"
)

foreach ($module in $requiredModules) {
    Copy-Item -Path ".\node_modules\$module" -Destination "$modulesPath\$module" -Recurse -Force
    # Copy dependencies of the module if any exist
    $packageJson = Get-Content ".\node_modules\$module\package.json" | ConvertFrom-Json
    if ($packageJson.dependencies) {
        foreach ($dep in $packageJson.dependencies.PSObject.Properties) {
            Copy-Item -Path ".\node_modules\$($dep.Name)" -Destination "$modulesPath\$($dep.Name)" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# Create a launcher script
$launcherContent = @"
@echo off
echo Starting Wireless Walkie Talkie...
start /min cmd /c "npm start"
"@

Set-Content -Path "$distPath\Launch Walkie-Talkie.bat" -Value $launcherContent

# Create readme
$readmeContent = @"
Wireless Walkie-Talkie Application
================================

Requirements:
1. Node.js must be installed on your computer
2. Wireless network capability on your device

Installation:
1. Install Node.js from https://nodejs.org/ (if not already installed)
2. Extract this folder to your desired location
3. Double-click on 'Launch Walkie-Talkie.bat' to start the application

Note:
- The application will minimize to system tray when running
- Right-click the tray icon for more options
- Make sure your wireless network is enabled

For support or issues, please contact the developer.
"@

Set-Content -Path "$distPath\README.txt" -Value $readmeContent

Write-Host "Distribution package created successfully in $distPath"
Write-Host "You can now zip the folder and distribute it to users."
