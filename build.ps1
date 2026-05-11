# Build script for Reacting Deep module
Write-Host "Building Reacting Deep module..." -ForegroundColor Green

# Create build directory
$buildDir = "build\reacting-deep"
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

# Copy required files
$filesToCopy = @(
    "module.json",
    "README.md", 
    "CHANGELOG.md",
    "LICENSE",
    "lang\en.json",
    "styles\chat-dialog.css",
    "templates\chat-dialog.html"
)

foreach ($file in $filesToCopy) {
    $destDir = Join-Path $buildDir (Split-Path $file -Parent)
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item $file (Join-Path $buildDir $file) -Force
    Write-Host "Copied: $file" -ForegroundColor Cyan
}

# Copy scripts directory
if (Test-Path "scripts") {
    $scriptsDest = Join-Path $buildDir "scripts"
    Copy-Item -Recurse "scripts" $scriptsDest -Force
    Write-Host "Copied: scripts directory" -ForegroundColor Cyan
}

# Create zip archive
$zipFile = "reacting-deep.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

# Use Compress-Archive for PowerShell 5+
try {
    Compress-Archive -Path "$buildDir\*" -DestinationPath $zipFile -CompressionLevel Optimal
    Write-Host "Created archive: $zipFile" -ForegroundColor Green
    
    # List files in archive
    Write-Host "`nFiles included in archive:" -ForegroundColor Yellow
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zipFile)
    foreach ($entry in $archive.Entries) {
        Write-Host "  - $($entry.FullName)" -ForegroundColor Gray
    }
    $archive.Dispose()
    
} catch {
    Write-Host "Error creating zip archive: $_" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative method using .NET
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
    [System.IO.Compression.ZipFile]::CreateFromDirectory($buildDir, $zipFile, $compressionLevel, $false)
    Write-Host "Created archive using .NET: $zipFile" -ForegroundColor Green
}

Write-Host "`nBuild completed successfully!" -ForegroundColor Green