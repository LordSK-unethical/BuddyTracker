$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
$sdkmanager = "C:\Users\Soham\AppData\Local\Android\Sdk\cmdline-tools\latest-2\bin\sdkmanager.bat"
"y" | & $sdkmanager "build-tools;35.0.0"
