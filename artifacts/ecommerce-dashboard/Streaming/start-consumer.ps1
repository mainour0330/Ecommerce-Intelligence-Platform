# Start Spark Consumer - Fixed for spaces in path

$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:HADOOP_HOME = "C:\hadoop"
$env:hadoop_home = "C:\hadoop"
$env:PYSPARK_PYTHON = (Get-Command python).Path
$env:PYSPARK_DRIVER_PYTHON = (Get-Command python).Path

# Add to PATH
$env:Path = "$env:JAVA_HOME\bin;$env:HADOOP_HOME\bin;$env:Path"

Write-Host "Starting Spark Consumer..." -ForegroundColor Cyan
Write-Host "Java Home: $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "Hadoop Home: $env:HADOOP_HOME" -ForegroundColor Gray

# Activate venv and run
& ".\.venv\Scripts\Activate.ps1"
python consumer\spark_stream.py
