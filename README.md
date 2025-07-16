# lokAI Civic Assistant

## Overview
lokAI is a civic assistant platform designed to provide multilingual, accessible, and AI-powered support for legal, civic, and voice-based interactions. It features a modern web interface, voice input/output, and document processing capabilities.

## Features
- Multilingual support
- Voice assistant and recorder
- Legal document processing
- Theming and accessibility
- Firebase integration
- Modular UI components (React + Tailwind)
- Python backend utilities

## Project Structure
```
app/                # Next.js app pages and layouts
components/         # UI and functional components (React, Python)
contexts/           # React context providers
hooks/              # Custom React hooks
lib/                # Utility libraries (Firebase, translations)
data/               # Legal knowledge base
utils/              # Python backend utilities
public/             # Static assets
styles/             # Global CSS
```

## Getting Started
### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.9+ recommended)
- pnpm (or npm/yarn)

### Installation
```
1. **Clone the repository:**
   ```sh
git clone https://github.com/rudy0Z/lokAI.git
cd lokAI
```
```
2. **Install Node dependencies:**
   ```sh
pnpm install
```
```
3. **Install Python dependencies:**
   ```sh
pip install -r requirements.txt
```

### Running the App
```
- **Frontend (Next.js):**
  ```sh
pnpm run dev
```
```
```
- **Backend (Python scripts):**
```
  Run individual Python scripts as needed, e.g.:
  ```sh
python utils/ai_agent.py
```
```
```
## Configuration
- Edit `config.py` for backend settings.
- Edit `next.config.mjs` and `tailwind.config.ts` for frontend settings.

## Contributing
Pull requests and issues are welcome! Please follow conventional commit messages and document your code.

## License
MIT

## Maintainers
- [rudy0Z](https://github.com/rudy0Z)

---
For more details, see the code comments and individual module documentation.
