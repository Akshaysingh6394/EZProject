# Secure File Sharing System

A production-ready secure file sharing system built with **FastAPI** (Python) backend and React frontend.

## Features

### Backend (FastAPI)
- **Role-based Authentication**: Operations and Client users with JWT tokens
- **Secure File Upload**: Only .pptx, .docx, .xlsx files allowed for Ops users
- **Encrypted Download URLs**: Time-limited secure download links for Client users
- **Email Verification**: Encrypted verification URLs for new users
- **Comprehensive API**: RESTful endpoints with proper error handling
- **Database Integration**: SQLAlchemy ORM with PostgreSQL/SQLite support
- **Security**: Password hashing, JWT tokens, URL encryption
- **File Management**: Upload validation, secure storage, download tracking

### Frontend (React + TypeScript)
- **Modern UI**: Beautiful glassmorphism design with Tailwind CSS
- **Role-based Dashboards**: Separate interfaces for Ops and Client users
- **File Operations**: Drag-and-drop upload, secure download, history tracking
- **Authentication Flow**: Login, signup, email verification
- **Responsive Design**: Mobile-first approach with smooth animations

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Client user registration with encrypted URL
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/login` - User login (ops/client)
- `GET /api/auth/me` - Get current user info

### Files (Operations Users)
- `POST /api/files/upload` - Upload files (.pptx, .docx, .xlsx only)
- `GET /api/files/uploaded` - List uploaded files

### Files (Client Users)
- `GET /api/files/list` - List all available files
- `GET /api/files/download-file/{file_id}` - Generate secure download URL
- `GET /api/files/secure-download/{token}` - Download file with secure token
- `GET /api/files/download-history` - View download history

## Installation & Setup

### Backend Setup
```bash
# Install dependencies
python -m pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Start the server
python run.py
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Testing

Run the comprehensive test suite:
```bash
# Install test dependencies
python -m pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v
```

### Test Coverage
- Authentication flow (signup, login, verification)
- File upload validation and security
- Download URL generation and access control
- Role-based permissions
- Error handling and edge cases

## Production Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-super-secret-key-32-chars-min
ENCRYPTION_KEY=your-encryption-key-32-chars-long
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Deployment Options

1. **Docker + PostgreSQL**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Cloud Platforms**
   - **Heroku**: Use Procfile with gunicorn
   - **AWS ECS**: Deploy with Docker containers
   - **Google Cloud Run**: Serverless container deployment
   - **DigitalOcean App Platform**: Git-based deployment

3. **Traditional VPS**
   ```bash
   # Install dependencies
   python -m pip install -r requirements.txt
   
   # Use gunicorn for production
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Security Considerations
- Use strong SECRET_KEY and ENCRYPTION_KEY in production
- Enable HTTPS with SSL certificates
- Configure CORS properly for your domain
- Set up proper database backups
- Monitor file upload limits and storage
- Implement rate limiting for API endpoints
- Use environment variables for sensitive data

### Monitoring & Logging
- FastAPI automatic OpenAPI documentation at `/docs`
- Health check endpoint at `/health`
- Structured logging with uvicorn
- Database query monitoring with SQLAlchemy
- File upload/download tracking

## Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP/HTTPS
Backend (FastAPI/Python)
    ↓ SQLAlchemy ORM
Database (PostgreSQL/SQLite)
    ↓ File System
Secure File Storage
```

## Security Features
- JWT-based authentication with expiration
- Password hashing with bcrypt
- URL encryption for verification and downloads
- Role-based access control (RBAC)
- File type validation and size limits
- Secure file storage with unique filenames
- Time-limited download URLs (24-hour expiry)
- CORS protection and input validation

This system provides enterprise-grade security for file sharing between operations teams and clients, with comprehensive testing and production-ready deployment options.# EZProject

# EZProject
