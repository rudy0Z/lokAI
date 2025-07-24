# LokAI - Indian Legal Assistant

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AI](https://img.shields.io/badge/AI-Groq_LLM-FF6B6B?style=flat&logo=artificial-intelligence&logoColor=white)](https://groq.com/)

A comprehensive AI-powered legal assistant specifically designed for Indian laws, with advanced automation capabilities coming soon.

## 🎯 Overview

LokAI is an intelligent AI legal assistant that provides:
- **AI Legal Chatbot**: Specialized in Indian laws (RTI, Consumer Protection, Income Tax, Aadhaar)
- **Smart Legal Guidance**: Context-aware responses with conversation memory
- **Indian Legal Focus**: Comprehensive knowledge of Indian legal procedures and documentation
- **Advanced Automation**: Government data monitoring and document processing *(coming soon)*

## ✨ Features

### 🤖 AI Legal Assistant
- **Specialized Knowledge**: RTI Act 2005, Consumer Protection Act 2019, Income Tax Act 1961, Aadhaar procedures
- **Conversation Memory**: Context-aware responses with session-based memory
- **Smart Suggestions**: AI-powered follow-up questions and guidance
- **Indian Legal Focus**: Tailored specifically for Indian legal procedures and documentation

### 🔄 Automation Workflows (Coming Soon!)
- **Government Circular Monitoring**: Automated collection from PIB, MHA, and other ministries
- **City Alert Monitoring**: Real-time tracking of municipal and local government updates  
- **Document Processing**: Webhook-based document analysis and classification
- **API Integration**: Seamless data flow between automation and AI systems

> 🚧 **Note**: The n8n automation platform is currently under active development and will be released soon with comprehensive setup documentation and production-ready workflows.

### 🎨 Modern Interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Adaptive theming for better user experience
- **Professional UI**: Clean, intuitive interface designed for legal professionals
- **Real-time Chat**: Interactive conversation with the AI assistant

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rudy0Z/lokAI.git
   cd lokAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   LOKAI_API_KEY=your_secret_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to start using LokAI!

> 🔄 **Automation Setup**: The n8n automation platform setup will be documented and released in an upcoming update.

## 🏗️ Architecture

### Frontend
- **Next.js 15.2.4**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality UI components

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **Groq LLM**: AI model for legal assistance (llama3-8b-8192)
- **Custom Legal Chain**: Specialized Indian legal knowledge system

### Automation (In Development)
- **n8n**: Visual workflow automation platform *(coming soon)*
- **Docker**: Containerized automation services *(coming soon)*
- **PostgreSQL**: Database for workflow data *(coming soon)*

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Main AI chat analysis |
| `/api/circulars` | POST | Government circular processing *(for automation)* |
| `/api/alerts` | POST | City alert handling *(for automation)* |
| `/api/documents` | POST | Document analysis *(for automation)* |
| `/api/notifications/urgent` | POST | Urgent notification routing *(for automation)* |

> 📋 **Note**: Endpoints marked *(for automation)* are designed for the upcoming n8n workflow integration.

## 🛠️ Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat interface
│   └── ...                # Other pages
├── components/            # React components
├── lib/                   # Utilities and configurations
├── public/                # Static assets
└── scripts/               # Utility scripts
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔧 Configuration

### AI Configuration
The AI assistant can be customized through `lib/indian-legal-chain.ts`:
- Legal knowledge base
- Response templates
- Conversation flows
- Suggestion algorithms
