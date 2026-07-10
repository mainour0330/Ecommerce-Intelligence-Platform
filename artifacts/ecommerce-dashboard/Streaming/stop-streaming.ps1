# Streaming Pipeline Shutdown Script
# سكريبت إيقاف الـ Streaming Pipeline

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Streaming Pipeline Shutdown Script" -ForegroundColor Cyan
Write-Host "  سكريبت إيقاف الـ Streaming Pipeline" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to stop processes by window title
function Stop-ProcessByWindowTitle {
    param(
        [string]$TitlePattern,
        [string]$DisplayName
    )
    
    Write-Host "Stopping: $DisplayName..." -ForegroundColor Yellow
    
    $processes = Get-Process | Where-Object { $_.MainWindowTitle -like "*$TitlePattern*" }
    
    if ($processes) {
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc.Id -Force
                Write-Host "  ✓ Stopped $DisplayName (PID: $($proc.Id))" -ForegroundColor Green
            }
            catch {
                Write-Host "  ✗ Failed to stop process (PID: $($proc.Id))" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "  No $DisplayName process found" -ForegroundColor Gray
    }
}

# Function to stop Java processes (Kafka, Zookeeper)
function Stop-JavaProcesses {
    Write-Host "Stopping Java processes (Kafka/Zookeeper)..." -ForegroundColor Yellow
    
    $javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue
    
    if ($javaProcesses) {
        foreach ($proc in $javaProcesses) {
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
            
            if ($commandLine -like "*kafka*" -or $commandLine -like "*zookeeper*") {
                try {
                    Stop-Process -Id $proc.Id -Force
                    Write-Host "  ✓ Stopped Java process (PID: $($proc.Id))" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ✗ Failed to stop process (PID: $($proc.Id))" -ForegroundColor Red
                }
            }
        }
    }
    else {
        Write-Host "  No Java processes found" -ForegroundColor Gray
    }
}

# Function to stop Python processes
function Stop-PythonStreamingProcesses {
    Write-Host "Stopping Python streaming processes..." -ForegroundColor Yellow
    
    $pythonProcesses = Get-Process -Name python -ErrorAction SilentlyContinue
    
    if ($pythonProcesses) {
        foreach ($proc in $pythonProcesses) {
            try {
                $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
                
                if ($commandLine -like "*kafka_producer*" -or $commandLine -like "*spark_stream*") {
                    Stop-Process -Id $proc.Id -Force
                    Write-Host "  ✓ Stopped Python process (PID: $($proc.Id))" -ForegroundColor Green
                }
            }
            catch {
                # Process might have already exited
            }
        }
    }
    else {
        Write-Host "  No Python processes found" -ForegroundColor Gray
    }
}

# Stop components in reverse order / إيقاف المكونات بالترتيب العكسي
Write-Host "Stopping components in reverse order..." -ForegroundColor Cyan
Write-Host "إيقاف المكونات بالترتيب العكسي..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop Producer
Write-Host "Step 1/4: Stopping Kafka Producer..." -ForegroundColor Yellow
Write-Host "الخطوة 1/4: إيقاف Kafka Producer..." -ForegroundColor Yellow
Stop-ProcessByWindowTitle -TitlePattern "Kafka Producer" -DisplayName "Kafka Producer"
Stop-PythonStreamingProcesses
Write-Host ""
Start-Sleep -Seconds 2

# Step 2: Stop Consumer
Write-Host "Step 2/4: Stopping Spark Consumer..." -ForegroundColor Yellow
Write-Host "الخطوة 2/4: إيقاف Spark Consumer..." -ForegroundColor Yellow
Stop-ProcessByWindowTitle -TitlePattern "Spark Consumer" -DisplayName "Spark Consumer"
Write-Host ""
Start-Sleep -Seconds 2

# Step 3: Stop Kafka Server
Write-Host "Step 3/4: Stopping Kafka Server..." -ForegroundColor Yellow
Write-Host "الخطوة 3/4: إيقاف Kafka Server..." -ForegroundColor Yellow
Stop-ProcessByWindowTitle -TitlePattern "Kafka Server" -DisplayName "Kafka Server"
Write-Host ""
Start-Sleep -Seconds 3

# Step 4: Stop Zookeeper
Write-Host "Step 4/4: Stopping Zookeeper..." -ForegroundColor Yellow
Write-Host "الخطوة 4/4: إيقاف Zookeeper..." -ForegroundColor Yellow
Stop-ProcessByWindowTitle -TitlePattern "Zookeeper" -DisplayName "Zookeeper Server"
Write-Host ""
Start-Sleep -Seconds 2

# Clean up any remaining Java processes
Write-Host "Cleaning up remaining processes..." -ForegroundColor Yellow
Write-Host "تنظيف العمليات المتبقية..." -ForegroundColor Yellow
Stop-JavaProcesses
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Shutdown complete!" -ForegroundColor Green
Write-Host "  اكتمل الإيقاف!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "All streaming components have been stopped." -ForegroundColor White
Write-Host "تم إيقاف جميع مكونات الـ Streaming." -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
Write-Host "اضغط أي مفتاح للخروج..." -ForegroundColor Gray
pause
