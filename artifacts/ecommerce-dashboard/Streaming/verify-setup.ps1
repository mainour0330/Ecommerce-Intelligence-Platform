# Setup Verification Script
# سكريبت التحقق من الإعداد

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Verification Script" -ForegroundColor Cyan
Write-Host "  سكريبت التحقق من الإعداد" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allChecksPass = $true

# Configuration / الإعدادات
$STREAMING_DIR = "e:\ECommerce-Platform (1)\ECommerce-Platform\artifacts\ecommerce-dashboard\Streaming"
$KAFKA_DIR = "C:\kafka\kafka_2.13-3.9.1"
$JAVA_HOME = "C:\Program Files\Java\jdk-17"
$HADOOP_HOME = "C:\hadoop"

# Function to print check result
function Print-CheckResult {
    param(
        [bool]$Pass,
        [string]$Message,
        [string]$MessageAr
    )
    
    if ($Pass) {
        Write-Host "  ✓ " -ForegroundColor Green -NoNewline
        Write-Host "$Message / $MessageAr" -ForegroundColor White
    }
    else {
        Write-Host "  ✗ " -ForegroundColor Red -NoNewline
        Write-Host "$Message / $MessageAr" -ForegroundColor Yellow
        $script:allChecksPass = $false
    }
}

# Check 1: Streaming Directory
Write-Host "1. Checking Streaming Directory..." -ForegroundColor Cyan
Write-Host "   التحقق من مجلد Streaming..." -ForegroundColor Cyan
$streamingExists = Test-Path $STREAMING_DIR
Print-CheckResult -Pass $streamingExists `
    -Message "Streaming directory found" `
    -MessageAr "تم العثور على مجلد Streaming"
Write-Host ""

# Check 2: Virtual Environment
Write-Host "2. Checking Virtual Environment..." -ForegroundColor Cyan
Write-Host "   التحقق من البيئة الافتراضية..." -ForegroundColor Cyan
$venvExists = Test-Path (Join-Path $STREAMING_DIR ".venv")
Print-CheckResult -Pass $venvExists `
    -Message "Virtual environment exists" `
    -MessageAr "البيئة الافتراضية موجودة"

if ($venvExists) {
    $pythonExe = Join-Path $STREAMING_DIR ".venv\Scripts\python.exe"
    $pythonExists = Test-Path $pythonExe
    Print-CheckResult -Pass $pythonExists `
        -Message "Python executable found in venv" `
        -MessageAr "تم العثور على Python في البيئة الافتراضية"
}
Write-Host ""

# Check 3: Python Files
Write-Host "3. Checking Python Files..." -ForegroundColor Cyan
Write-Host "   التحقق من ملفات Python..." -ForegroundColor Cyan
$producerExists = Test-Path (Join-Path $STREAMING_DIR "producer\kafka_producer.py")
Print-CheckResult -Pass $producerExists `
    -Message "kafka_producer.py found" `
    -MessageAr "تم العثور على kafka_producer.py"

$consumerExists = Test-Path (Join-Path $STREAMING_DIR "consumer\spark_stream.py")
Print-CheckResult -Pass $consumerExists `
    -Message "spark_stream.py found" `
    -MessageAr "تم العثور على spark_stream.py"
Write-Host ""

# Check 4: Data File
Write-Host "4. Checking Data File..." -ForegroundColor Cyan
Write-Host "   التحقق من ملف البيانات..." -ForegroundColor Cyan
$dataExists = Test-Path (Join-Path $STREAMING_DIR "data\fact_orders.csv")
Print-CheckResult -Pass $dataExists `
    -Message "fact_orders.csv found" `
    -MessageAr "تم العثور على fact_orders.csv"
Write-Host ""

# Check 5: Java Installation
Write-Host "5. Checking Java Installation..." -ForegroundColor Cyan
Write-Host "   التحقق من تثبيت Java..." -ForegroundColor Cyan
$javaHomeExists = Test-Path $JAVA_HOME
Print-CheckResult -Pass $javaHomeExists `
    -Message "Java directory exists" `
    -MessageAr "مجلد Java موجود"

if ($javaHomeExists) {
    $javaExe = Join-Path $JAVA_HOME "bin\java.exe"
    $javaExeExists = Test-Path $javaExe
    Print-CheckResult -Pass $javaExeExists `
        -Message "java.exe found" `
        -MessageAr "تم العثور على java.exe"
    
    if ($javaExeExists) {
        try {
            $javaVersion = & $javaExe -version 2>&1 | Select-String "version" | Select-Object -First 1
            Write-Host "    Java Version: $javaVersion" -ForegroundColor Gray
        }
        catch {
            Write-Host "    Could not determine Java version" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Check 6: Kafka Installation
Write-Host "6. Checking Kafka Installation..." -ForegroundColor Cyan
Write-Host "   التحقق من تثبيت Kafka..." -ForegroundColor Cyan
$kafkaExists = Test-Path $KAFKA_DIR
Print-CheckResult -Pass $kafkaExists `
    -Message "Kafka directory exists" `
    -MessageAr "مجلد Kafka موجود"

if ($kafkaExists) {
    $zookeeperBat = Join-Path $KAFKA_DIR "bin\windows\zookeeper-server-start.bat"
    $zkExists = Test-Path $zookeeperBat
    Print-CheckResult -Pass $zkExists `
        -Message "zookeeper-server-start.bat found" `
        -MessageAr "تم العثور على zookeeper-server-start.bat"
    
    $kafkaBat = Join-Path $KAFKA_DIR "bin\windows\kafka-server-start.bat"
    $kafkaServerExists = Test-Path $kafkaBat
    Print-CheckResult -Pass $kafkaServerExists `
        -Message "kafka-server-start.bat found" `
        -MessageAr "تم العثور على kafka-server-start.bat"
}
Write-Host ""

# Check 7: Hadoop Installation
Write-Host "7. Checking Hadoop Installation..." -ForegroundColor Cyan
Write-Host "   التحقق من تثبيت Hadoop..." -ForegroundColor Cyan
$hadoopExists = Test-Path $HADOOP_HOME
if ($hadoopExists) {
    Print-CheckResult -Pass $true `
        -Message "Hadoop directory exists" `
        -MessageAr "مجلد Hadoop موجود"
}
else {
    Write-Host "  ⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host "Hadoop directory not found (optional) / مجلد Hadoop غير موجود (اختياري)" -ForegroundColor Gray
}
Write-Host ""

# Check 8: Running Processes
Write-Host "8. Checking Running Processes..." -ForegroundColor Cyan
Write-Host "   التحقق من العمليات الجارية..." -ForegroundColor Cyan

$zookeeperRunning = Get-Process | Where-Object { $_.MainWindowTitle -like "*Zookeeper*" }
if ($zookeeperRunning) {
    Write-Host "  ✓ Zookeeper is running / Zookeeper يعمل" -ForegroundColor Green
}
else {
    Write-Host "  ○ Zookeeper is not running / Zookeeper لا يعمل" -ForegroundColor Gray
}

$kafkaRunning = Get-Process | Where-Object { $_.MainWindowTitle -like "*Kafka Server*" }
if ($kafkaRunning) {
    Write-Host "  ✓ Kafka Server is running / Kafka Server يعمل" -ForegroundColor Green
}
else {
    Write-Host "  ○ Kafka Server is not running / Kafka Server لا يعمل" -ForegroundColor Gray
}

$consumerRunning = Get-Process | Where-Object { $_.MainWindowTitle -like "*Spark Consumer*" }
if ($consumerRunning) {
    Write-Host "  ✓ Spark Consumer is running / Spark Consumer يعمل" -ForegroundColor Green
}
else {
    Write-Host "  ○ Spark Consumer is not running / Spark Consumer لا يعمل" -ForegroundColor Gray
}

$producerRunning = Get-Process | Where-Object { $_.MainWindowTitle -like "*Kafka Producer*" }
if ($producerRunning) {
    Write-Host "  ✓ Kafka Producer is running / Kafka Producer يعمل" -ForegroundColor Green
}
else {
    Write-Host "  ○ Kafka Producer is not running / Kafka Producer لا يعمل" -ForegroundColor Gray
}
Write-Host ""

# Check 9: Ports
Write-Host "9. Checking Ports..." -ForegroundColor Cyan
Write-Host "   التحقق من المنافذ..." -ForegroundColor Cyan

$zookeeperPort = netstat -ano | Select-String "2181" | Select-Object -First 1
if ($zookeeperPort) {
    Write-Host "  ✓ Port 2181 (Zookeeper) is in use / المنفذ 2181 (Zookeeper) مستخدم" -ForegroundColor Green
}
else {
    Write-Host "  ○ Port 2181 (Zookeeper) is free / المنفذ 2181 (Zookeeper) متاح" -ForegroundColor Gray
}

$kafkaPort = netstat -ano | Select-String "9092" | Select-Object -First 1
if ($kafkaPort) {
    Write-Host "  ✓ Port 9092 (Kafka) is in use / المنفذ 9092 (Kafka) مستخدم" -ForegroundColor Green
}
else {
    Write-Host "  ○ Port 9092 (Kafka) is free / المنفذ 9092 (Kafka) متاح" -ForegroundColor Gray
}
Write-Host ""

# Check 10: Output File
Write-Host "10. Checking Output File..." -ForegroundColor Cyan
Write-Host "    التحقق من ملف الناتج..." -ForegroundColor Cyan
$outputExists = Test-Path (Join-Path $STREAMING_DIR "live_orders.json")
if ($outputExists) {
    Write-Host "  ✓ live_orders.json exists / live_orders.json موجود" -ForegroundColor Green
    $outputSize = (Get-Item (Join-Path $STREAMING_DIR "live_orders.json")).Length
    Write-Host "    Size: $outputSize bytes" -ForegroundColor Gray
}
else {
    Write-Host "  ○ live_orders.json not created yet / live_orders.json لم يُنشأ بعد" -ForegroundColor Gray
}
Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($allChecksPass) {
    Write-Host "  ✓ All Checks Passed!" -ForegroundColor Green
    Write-Host "  ✓ جميع الفحوصات نجحت!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your setup is ready to run!" -ForegroundColor White
    Write-Host "إعدادك جاهز للتشغيل!" -ForegroundColor White
    Write-Host ""
    Write-Host "To start the pipeline, run:" -ForegroundColor Yellow
    Write-Host "لتشغيل البايبلاين، شغّل:" -ForegroundColor Yellow
    Write-Host "  .\start-streaming.ps1" -ForegroundColor Cyan
}
else {
    Write-Host "  ✗ Some Checks Failed" -ForegroundColor Red
    Write-Host "  ✗ بعض الفحوصات فشلت" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please fix the issues above before running." -ForegroundColor Yellow
    Write-Host "يرجى إصلاح المشاكل أعلاه قبل التشغيل." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For detailed setup instructions, see:" -ForegroundColor White
    Write-Host "للحصول على تعليمات الإعداد المفصلة، راجع:" -ForegroundColor White
    Write-Host "  SETUP_GUIDE.md" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
pause
