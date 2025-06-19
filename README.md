# Acute Algo - Algorithm Detection & Analysis Platform

Acute Algo is a platform for detecting, understanding, and versioning algorithms across software projects with AI-powered analysis capabilities.

## Features

- 🔍 **Repository Analysis**: Analyze GitHub repositories to detect and catalog functions
- 🤖 **AI-Powered Analysis**: Generate pseudocode, flowcharts, and insights using DigitalOcean's AI services
- 📊 **Function Insights**: Get complexity analysis, optimization suggestions, and potential issue detection
- 🔄 **Interactive Flowcharts**: View Mermaid-generated flowcharts for algorithm visualization
- 📝 **Pseudocode Generation**: AI-generated pseudocode for better algorithm understanding

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Tree-sitter** - Code parsing and function detection
- **DigitalOcean AI** - Serverless inference for AI analysis
- **Python 3.11+** - Runtime environment

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Mermaid** - Diagram and flowchart rendering
- **Axios** - HTTP client for API calls

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- DigitalOcean account (for AI features)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies using uv** (recommended)
   ```bash
   pip install uv
   uv pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DO_MODEL_ACCESS_KEY=your_digitalocean_model_access_key_here
   ```

   To get your DigitalOcean AI API key:
   - Log in to [DigitalOcean Cloud Console](https://cloud.digitalocean.com)
   - Navigate to GenAI Platform → Model access keys
   - Create a new model access key
   - Copy the key and add it to your `.env` file

4. **Run the backend server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## Using AI Features

### Setting up DigitalOcean AI

1. **Create DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)

2. **Generate Model Access Key**:
   - Go to GenAI Platform → Model access keys
   - Click "Create model access key"
   - Choose a name for your key
   - Copy the generated key (you can only see it once!)

3. **Configure Backend**:
   ```bash
   # In backend/.env
   DO_MODEL_ACCESS_KEY=dop_v1_your_actual_key_here
   ```

4. **Available Models**: The system uses `llama3.3-70b-instruct` by default, but supports multiple models from the DigitalOcean catalog.

### AI Analysis Features

Once configured, you can:

- **Analyze Functions**: Click the "🤖 AI Analysis" button on any function
- **View Pseudocode**: See AI-generated pseudocode in the Pseudocode tab
- **Interactive Flowcharts**: Visualize function logic with Mermaid diagrams
- **Complexity Analysis**: Get Big O analysis and performance insights
- **Optimization Suggestions**: Receive actionable improvement recommendations
- **Issue Detection**: Identify potential bugs and code quality issues

## API Endpoints

### Core Analysis
- `POST /api/analyze-repo` - Analyze GitHub repository
- `GET /api/test-functions/{test_file}` - Test function detection

### AI Analysis
- `POST /api/ai/analyze-function` - Comprehensive AI function analysis
- `GET /api/ai/status` - Check AI service availability
- `GET /api/ai/models` - List available AI models

### Health
- `GET /health` - Service health check

## Development

### Code Conventions

**Python (Backend)**:
- Use type hints for all functions
- Follow snake_case naming
- Use async/await for I/O operations
- Return camelCase to frontend using Pydantic aliases

**TypeScript (Frontend)**:
- Use PascalCase for components
- Define prop types with interfaces
- Use camelCase for all fields
- Prefer function components

### Project Structure

```
Acute_Algo/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   └── services/
│       ├── ai_service.py    # DigitalOcean AI integration
│       ├── file_scanner.py  # Repository scanning
│       └── function_counter.py # Function detection
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── lib/            # API utilities
    │   └── app/            # Next.js pages
    └── package.json        # Node dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the established code conventions
4. Test your changes thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs` (when backend is running)
- Review DigitalOcean AI documentation for API-related questions 