@echo off
REM Streaming Pipeline Startup Script
REM سكريبت تشغيل الـ Streaming Pipeline

echo ========================================
echo   Streaming Pipeline Startup Script
echo   سكريبت تشغيل الـ Streaming Pipeline
echo ========================================
echo.

REM Set paths - تعيين المسارات
set "STREAMING_DIR=%~dp0"
set "KAFKA_DIR=C:\kafka\kafka_2.13-3.9.1"
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "HADOOP_HOME=C:\hadoop"

REM Verify Java installation - التحقق من تثبيت Java
echo Verifying Java installation...
echo التحقق من تثبيت Java...
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo ERROR: Java JDK not found at %JAVA_HOME%
    echo خطأ: Java JDK غير موجود
    pause
    exit /b 1
)

REM Verify Kafka installation - التحقق من تثبيت Kafka
echo Verifying Kafka installation...
echo التحقق من تثبيت Kafka...
if not exist "%KAFKA_DIR%" (
    echo ERROR: Kafka directory not found at %KAFKA_DIR%
    echo خطأ: مجلد Kafka غير موجود
    echo Please update the KAFKA_DIR variable in this script
    echo يرجى تحديث متغير KAFKA_DIR في هذا السكريبت
    pause
    exit /b 1
)

echo All prerequisites verified!
echo تم التحقق من جميع المتطلبات!
echo.

REM Set environment variables - تعيين متغيرات البيئة
set "PATH=%JAVA_HOME%\bin;%HADOOP_HOME%\bin;%PATH%"

REM Start Zookeeper - تشغيل Zookeeper
echo Step 1/4: Starting Zookeeper...
echo الخطوة 1/4: تشغيل Zookeeper...
start "Zookeeper Server" cmd /k "cd /d %KAFKA_DIR% && .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties"
timeout /t 10 /nobreak > nul

REM Start Kafka Server - تشغيل Kafka Server
echo Step 2/4: Starting Kafka Server...
echo الخطوة 2/4: تشغيل Kafka Server...
start "Kafka Server" cmd /k "cd /d %KAFKA_DIR% && .\bin\windows\kafka-server-start.bat .\config\server.properties"
timeout /t 15 /nobreak > nul

REM Start Spark Consumer - تشغيل Spark Consumer
echo Step 3/4: Starting Spark Consumer...
echo الخطوة 3/4: تشغيل Spark Consumer...
start "Spark Consumer" cmd /k "cd /d %STREAMING_DIR% && .venv\Scripts\activate && set JAVA_HOME=%JAVA_HOME% && set HADOOP_HOME=%HADOOP_HOME% && set PATH=%JAVA_HOME%\bin;%HADOOP_HOME%\bin;%PATH% && python consumer\spark_stream.py"
timeout /t 10 /nobreak > nul

REM Start Kafka Producer - تشغيل Kafka Producer
echo Step 4/4: Starting Kafka Producer...
echo الخطوة 4/4: تشغيل Kafka Producer...
start "Kafka Producer" cmd /k "cd /d %STREAMING_DIR% && .venv\Scripts\activate && python producer\kafka_producer.py"

echo.
echo ========================================
echo   All components started successfully!
echo   تم تشغيل جميع المكونات بنجاح!
echo ========================================
echo.
echo Running components:
echo   1. Zookeeper (Port 2181)
echo   2. Kafka Server (Port 9092)
echo   3. Spark Consumer
echo   4. Kafka Producer
echo.
echo To stop: Close each command window
echo للإيقاف: أغلق كل نافذة أوامر
echo.
pause
