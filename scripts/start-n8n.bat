@echo off
REM LokAI n8n Automation Setup Script for Windows
REM This script sets up and starts the n8n automation environment

echo 🚀 Starting LokAI n8n Automation Setup...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env.local" (
    echo ⚠️  .env.local file not found. Creating from .env.example...
    copy .env.example .env.local
    echo 📝 Please edit .env.local with your actual API keys and configuration.
    echo    Required: GROQ_API_KEY, LOKAI_API_KEY
    echo.
    pause
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist "n8n\data" mkdir n8n\data
if not exist "n8n\logs" mkdir n8n\logs
if not exist "data\postgres" mkdir data\postgres

REM Start the n8n and PostgreSQL services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if n8n is running
curl -f http://localhost:5678/healthz >nul 2>&1
if errorlevel 1 (
    echo ❌ n8n failed to start. Check docker logs:
    docker-compose logs n8n
    pause
    exit /b 1
) else (
    echo ✅ n8n is running at http://localhost:5678
)

REM Check if PostgreSQL is running
docker-compose exec postgres pg_isready -U n8n >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL failed to start. Check docker logs:
    docker-compose logs postgres
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL is running
)

REM Import workflows
echo 📥 n8n workflows are ready for import...

if exist "n8n\workflows\government-circular-scraper.json" (
    echo   📋 Ready: Government Circular Scraper
) else (
    echo   ❌ Missing: government-circular-scraper.json
)

if exist "n8n\workflows\document-processor-webhook.json" (
    echo   📋 Ready: Document Processor Webhook
) else (
    echo   ❌ Missing: document-processor-webhook.json
)

if exist "n8n\workflows\multi-city-alert-monitor.json" (
    echo   📋 Ready: Multi-City Alert Monitor
) else (
    echo   ❌ Missing: multi-city-alert-monitor.json
)

echo.
echo 🎉 LokAI n8n Automation Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Open n8n at http://localhost:5678
echo 2. Set up your admin account
echo 3. Import the workflow files from n8n/workflows/
echo 4. Configure your credentials (Groq API key, etc.)
echo 5. Activate the workflows
echo.
echo 🔗 Key URLs:
echo    n8n Dashboard: http://localhost:5678
echo    LokAI API: http://localhost:3000
echo    Webhook Endpoints:
echo      - Circulars: http://localhost:3000/api/circulars
echo      - Alerts: http://localhost:3000/api/alerts
echo      - Documents: http://localhost:3000/api/documents
echo      - Urgent Notifications: http://localhost:3000/api/notifications/urgent
echo.
echo 📊 To monitor:
echo    docker-compose logs -f n8n
echo    docker-compose logs -f postgres
echo.
echo 🛑 To stop:
echo    docker-compose down
echo.

REM Show current status
echo 📈 Current Status:
docker-compose ps

echo.
echo Press any key to open n8n dashboard...
pause >nul
start http://localhost:5678
