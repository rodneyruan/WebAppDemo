$nodePath = Join-Path $PSScriptRoot ".tools\node-v24.15.0-win-x64"
$env:Path = "$nodePath;$env:Path"

Write-Host "Node.js is ready for this PowerShell session."
node --version
npm.cmd --version
