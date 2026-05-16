Set-Location -Path "C:\Users\Soham\Desktop\Extra\BuddyTracker\android"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
Write-Host "Building APK..."
& .\gradlew.bat app:assembleDebug -x lint -x test
if ($LASTEXITCODE -eq 0) {
    Write-Host "BUILD SUCCESSFUL"
} else {
    Write-Host "BUILD FAILED with exit code $LASTEXITCODE"
}
