#!/bin/bash

# LokAI n8n Automation Setup Script
# This script sets up and starts the n8n automation environment

echo "🚀 Starting LokAI n8n Automation Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your actual API keys and configuration."
    echo "   Required: GROQ_API_KEY, LOKAI_API_KEY"
    read -p "Press Enter after updating .env.local to continue..."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p n8n/data
mkdir -p n8n/logs
mkdir -p data/postgres

# Set permissions for n8n data directory
echo "🔒 Setting permissions..."
chmod 777 n8n/data

# Start the n8n and PostgreSQL services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if n8n is running
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ n8n is running at http://localhost:5678"
else
    echo "❌ n8n failed to start. Check docker logs:"
    docker-compose logs n8n
    exit 1
fi

# Check if PostgreSQL is running
if docker-compose exec postgres pg_isready -U n8n > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start. Check docker logs:"
    docker-compose logs postgres
    exit 1
fi

# Import workflows
echo "📥 Importing n8n workflows..."

# Function to import workflow
import_workflow() {
    local workflow_file=$1
    local workflow_name=$2
    
    if [ -f "$workflow_file" ]; then
        echo "  📋 Importing $workflow_name..."
        # This would require n8n CLI or API call
        # For now, we'll just indicate the file is ready for manual import
        echo "     ➡️  Ready for import: $workflow_file"
    else
        echo "  ❌ Workflow file not found: $workflow_file"
    fi
}

import_workflow "n8n/workflows/government-circular-scraper.json" "Government Circular Scraper"
import_workflow "n8n/workflows/document-processor-webhook.json" "Document Processor Webhook"
import_workflow "n8n/workflows/multi-city-alert-monitor.json" "Multi-City Alert Monitor"

echo ""
echo "🎉 LokAI n8n Automation Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open n8n at http://localhost:5678"
echo "2. Set up your admin account"
echo "3. Import the workflow files from n8n/workflows/"
echo "4. Configure your credentials (Groq API key, etc.)"
echo "5. Activate the workflows"
echo ""
echo "🔗 Key URLs:"
echo "   n8n Dashboard: http://localhost:5678"
echo "   LokAI API: http://localhost:3000"
echo "   Webhook Endpoints:"
echo "     - Circulars: http://localhost:3000/api/circulars"
echo "     - Alerts: http://localhost:3000/api/alerts"
echo "     - Documents: http://localhost:3000/api/documents"
echo "     - Urgent Notifications: http://localhost:3000/api/notifications/urgent"
echo ""
echo "📊 To monitor:"
echo "   docker-compose logs -f n8n"
echo "   docker-compose logs -f postgres"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""

# Show current status
echo "📈 Current Status:"
docker-compose ps
