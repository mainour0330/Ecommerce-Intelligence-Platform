# Streaming Pipeline Startup Script
# سكريبت تشغيل الـ Streaming Pipeline

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Streaming Pipeline Startup Script" -ForegroundColor Cyan
Write-Host "  سكريبت تشغيل الـ Streaming Pipeline" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration / الإعدادات
$STREAMING_DIR = "e:\ECommerce-Platform (1)\ECommerce-Platform\artifacts\ecommerce-dashboard\Streaming"
$KAFKA_DIR = "C:\kafka\kafka_2.13-3.9.1"
$JAVA_HOME = "C:\Program Files\Java\jdk-17"
$HADOOP_HOME = "C:\hadoop"

# Verify paths exist / التحقق من وجود المسارات
Write-Host "Verifying installation paths..." -ForegroundColor Yellow
Write-Host "التحقق من مسارات التثبيت..." -ForegroundColor Yellow
Write-Host ""

$pathsValid = $true

if (-not (Test-Path $STREAMING_DIR)) {
    Write-Host "ERROR: Streaming directory not found: $STREAMING_DIR" -ForegroundColor Red
    Write-Host "خطأ: مجلد Streaming غير موجود" -ForegroundColor Red
    $pathsValid = $false
}

if (-not (Test-Path $KAFKA_DIR)) {
    Write-Host "ERROR: Kafka directory not found: $KAFKA_DIR" -ForegroundColor Red
    Write-Host "خطأ: مجلد Kafka غير موجود" -ForegroundColor Red
    Write-Host "Please update the KAFKA_DIR variable in this script with your correct Kafka path" -ForegroundColor Yellow
    Write-Host "يرجى تحديث متغير KAFKA_DIR في هذا السكريبت بالمسار الصحيح لـ Kafka" -ForegroundColor Yellow
    $pathsValid = $false
}

if (-not (Test-Path $JAVA_HOME)) {
    Write-Host "ERROR: Java JDK not found: $JAVA_HOME" -ForegroundColor Red
    Write-Host "خطأ: Java JDK غير موجود" -ForegroundColor Red
    $pathsValid = $false
}

if (-not (Test-Path $HADOOP_HOME)) {
    Write-Host "WARNING: Hadoop directory not found: $HADOOP_HOME" -ForegroundColor Yellow
    Write-Host "تحذير: مجلد Hadoop غير موجود" -ForegroundColor Yellow
}

if (-not $pathsValid) {
    Write-Host ""
    Write-Host "Please fix the path issues and run this script again." -ForegroundColor Red
    Write-Host "يرجى إصلاح مشاكل المسارات وتشغيل السكريبت مرة أخرى." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "All paths verified successfully!" -ForegroundColor Green
Write-Host "تم التحقق من جميع المسارات بنجاح!" -ForegroundColor Green
Write-Host ""

# Set environment variables / تعيين متغيرات البيئة
$env:JAVA_HOME = $JAVA_HOME
$env:HADOOP_HOME = $HADOOP_HOME
$env:hadoop_home = $HADOOP_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:HADOOP_HOME\bin;$env:Path"

Write-Host "Environment variables configured" -ForegroundColor Green
Write-Host "تم تكوين متغيرات البيئة" -ForegroundColor Green
Write-Host ""

# Function to start a process in a new window
function Start-ProcessInNewWindow {
    param(
        [string]$Title,
        [string]$TitleAr,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    Write-Host "Starting: $Title / $TitleAr" -ForegroundColor Cyan
    
    $psCommand = "cd '$WorkingDirectory'; $Command; Read-Host 'Press Enter to close'"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $psCommand -WindowStyle Normal
    
    Start-Sleep -Seconds 2
}

# Start Zookeeper / تشغيل Zookeeper
Write-Host ""
Write-Host "Step 1/4: Starting Zookeeper..." -ForegroundColor Yellow
Write-Host "الخطوة 1/4: تشغيل Zookeeper..." -ForegroundColor Yellow
Start-ProcessInNewWindow `
    -Title "Zookeeper Server" `
    -TitleAr "خادم Zookeeper" `
    -WorkingDirectory $KAFKA_DIR `
    -Command ".\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties"

Write-Host "Waiting for Zookeeper to start..." -ForegroundColor Yellow
Write-Host "انتظار بدء Zookeeper..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Kafka Server / تشغيل Kafka Server
Write-Host ""
Write-Host "Step 2/4: Starting Kafka Server..." -ForegroundColor Yellow
Write-Host "الخطوة 2/4: تشغيل Kafka Server..." -ForegroundColor Yellow
Start-ProcessInNewWindow `
    -Title "Kafka Server" `
    -TitleAr "خادم Kafka" `
    -WorkingDirectory $KAFKA_DIR `
    -Command ".\bin\windows\kafka-server-start.bat .\config\server.properties"

Write-Host "Waiting for Kafka Server to start..." -ForegroundColor Yellow
Write-Host "انتظار بدء Kafka Server..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start Spark Consumer / تشغيل Spark Consumer
Write-Host ""
Write-Host "Step 3/4: Starting Spark Consumer..." -ForegroundColor Yellow
Write-Host "الخطوة 3/4: تشغيل Spark Consumer..." -ForegroundColor Yellow
$sparkCommand = @"
`$env:JAVA_HOME='$JAVA_HOME'; `
`$env:HADOOP_HOME='$HADOOP_HOME'; `
`$env:hadoop_home='$HADOOP_HOME'; `
`$env:Path="`$env:JAVA_HOME\bin;`$env:HADOOP_HOME\bin;`$env:Path"; `
.\.venv\Scripts\activate; `
python consumer\spark_stream.py
"@
Start-ProcessInNewWindow `
    -Title "Spark Streaming Consumer" `
    -TitleAr "مستهلك Spark Streaming" `
    -WorkingDirectory $STREAMING_DIR `
    -Command $sparkCommand

Write-Host "Waiting for Spark Consumer to initialize..." -ForegroundColor Yellow
Write-Host "انتظار تهيئة Spark Consumer..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Kafka Producer / تشغيل Kafka Producer
Write-Host ""
Write-Host "Step 4/4: Starting Kafka Producer..." -ForegroundColor Yellow
Write-Host "الخطوة 4/4: تشغيل Kafka Producer..." -ForegroundColor Yellow
$producerCommand = ".\.venv\Scripts\activate; python producer\kafka_producer.py"
Start-ProcessInNewWindow `
    -Title "Kafka Producer" `
    -TitleAr "منتج Kafka" `
    -WorkingDirectory $STREAMING_DIR `
    -Command $producerCommand

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All components started successfully!" -ForegroundColor Green
Write-Host "  تم تشغيل جميع المكونات بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Running components / المكونات العاملة:" -ForegroundColor Cyan
Write-Host "  1. Zookeeper (Port 2181)" -ForegroundColor White
Write-Host "  2. Kafka Server (Port 9092)" -ForegroundColor White
Write-Host "  3. Spark Consumer" -ForegroundColor White
Write-Host "  4. Kafka Producer" -ForegroundColor White
Write-Host ""
Write-Host "To stop all components:" -ForegroundColor Yellow
Write-Host "لإيقاف جميع المكونات:" -ForegroundColor Yellow
Write-Host "  - Close each PowerShell window (or press Ctrl+C in each)" -ForegroundColor White
Write-Host "  - أغلق كل نافذة PowerShell (أو اضغط Ctrl+C في كل واحدة)" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
Write-Host "اضغط أي مفتاح لإغلاق هذه النافذة..." -ForegroundColor Gray
pause
