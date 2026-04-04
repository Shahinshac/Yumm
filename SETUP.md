# Complete Setup Guide

This guide covers local setup, testing, and deployment.

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL
flask cli init_db
pytest test_*.py -v
python run.py  # Runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# .env defaults work for local development
npm start  # Runs on http://localhost:3000
```

### Test Everything

1. Visit http://localhost:3000 - should see login page
2. Run: `curl http://localhost:5000/api/auth/me` - should return 401

---

## Using Docker

### With Docker Compose

```bash
docker-compose up -d
# Starts PostgreSQL, Backend, Frontend
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Manual Docker

```bash
docker run --name banking_db -e POSTGRES_USER=bankuser \
  -e POSTGRES_PASSWORD=bankpass123 \
  -e POSTGRES_DB=bankmanagement -p 5432:5432 postgres:15-alpine

cd backend && docker build -t banking-api . && docker run -p 5000:5000 banking-api
cd frontend && npm start
```

---

## Testing

```bash
cd backend
pytest test_*.py -v           # Run all tests
pytest test_user_account.py   # Specific file
pytest --cov=app test_*.py    # With coverage
```

**Expected**: 170+ tests passing (100% success)

---

## Configuration

### Development (.env)
```
FLASK_ENV=development
DATABASE_URL=postgresql://localhost/bankmanagement
JWT_SECRET_KEY=dev-secret
SECRET_KEY=dev-secret
DEBUG=True
```

### Production (.env)
```
FLASK_ENV=production
DATABASE_URL=[From Railway/Render]
JWT_SECRET_KEY=[Strong random key]
SECRET_KEY=[Strong random key]
DEBUG=False
CORS_ORIGINS=https://your-frontend-domain
```

---

## Database Management

```bash
createdb bankmanagement              # Create database
flask cli init_db                    # Initialize tables
flask cli drop_db                    # Drop all tables (warning!)
pg_dump bankmanagement > backup.sql  # Backup
```

---

## API Testing

```bash
# Health check
curl http://localhost:5000/api/auth/me

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"AdminPass123"}'

# Use token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## Troubleshooting

**Backend won't start**: Check PostgreSQL is running, DATABASE_URL correct
**API CORS errors**: Verify CORS_ORIGINS includes frontend URL
**Tests failing**: Check virtual environment activated, all dependencies installed
**Database connection fails**: Create database: `createdb bankmanagement`

---

See QUICK_DEPLOY.md for production deployment steps (30 min).
