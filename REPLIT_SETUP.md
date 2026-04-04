# Replit Setup Guide - Banking System

## ✅ Quick Start

When you open this project in Replit:

1. **The `.replit` file** automatically configures the environment
2. **Just click "Run"** - the setup script handles everything:
   - ✓ PostgreSQL database initialization
   - ✓ Python dependencies installation
   - ✓ Database schema creation
   - ✓ Secure key generation
   - ✓ Flask API startup

---

## 📋 What Gets Set Up Automatically

### PostgreSQL Database
- **User**: `bankuser`
- **Password**: `bankpass123`
- **Database**: `bankmanagement`
- **Host**: `localhost`
- **Port**: `5432`

### Flask Backend
- **Language**: Python 3.11
- **Port**: `5000`
- **Environment**: Production-ready
- **Features**:
  - JWT Authentication
  - Role-Based Access Control (RBAC)
  - 50+ API endpoints
  - Full banking system backend

### Environment Variables
Auto-generated on first run:
- `FLASK_ENV`: production
- `SECRET_KEY`: Randomly generated (secure)
- `JWT_SECRET_KEY`: Randomly generated (secure)
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGINS`: http://localhost:3000

---

## 🚀 How to Deploy

### Option 1: Run Backend Only on Replit (Recommended)
1. Fork/clone to Replit: https://replit.com/new/github?repo=Shahinshac/bankmanagement
2. Click "Run"
3. Access API at: `https://your-repl.replit.dev`
4. Deploy **Frontend** separately on Vercel: see [Frontend Deployment](#frontend-deployment--vercel)

### Option 2: Full Stack on Replit (Advanced)
- Backend runs on port 5000
- To also run frontend:
  ```bash
  # In a separate replit terminal
  cd frontend
  npm install
  npm start
  ```
  - Frontend will be at: `https://your-repl.replit.dev:3000`
  - Update `CORS_ORIGINS` to include frontend

---

## 📊 API Endpoints

Once running, access:

- **Health Check**: `GET http://localhost:5000/health`
- **API Docs**: `GET http://localhost:5000/api/docs` (if enabled)
- **Auth**: `POST http://localhost:5000/api/auth/login`

Full API Documentation: See `DEPLOYMENT.md`

---

## 🔐 Security Notes

1. **Auto-generated Keys**: `.env` file is auto-generated with secure keys
   - Never commit `.env` to git
   - `.gitignore` already includes it

2. **Default Database Password**: `bankpass123` is only for local development
   - Change in production by modifying `.env`

3. **CORS Configuration**: Automatically allows localhost:3000 for frontend development

---

## 📂 Project Structure in Replit

```
bankmanagement/
├── .replit              ← Replit configuration (MAIN FILE)
├── replit.nix           ← Environment dependencies
├── backend/             ← Flask API
│   ├── run.py          ← Entry point
│   ├── requirements.txt ← Python dependencies
│   └── app/            ← Application code
├── frontend/           ← React app (optional in Replit)
├── scripts/
│   └── init_replit.sh  ← Initialization script
└── DEPLOYMENT.md       ← Detailed deployment guide
```

---

## 🛠️ Useful Commands

### In Replit Shell/Terminal

```bash
# Restart the app
# (Click Stop, then Run again)

# Check API status
curl http://localhost:5000/health

# Access PostgreSQL directly
psql -U bankuser -d bankmanagement

# View logs
tail -f logs/app.log

# Run tests (if tests exist)
cd backend && pytest test_*.py

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

---

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```
Error: "could not connect to server: Connection refused"
```
**Solution**: PostgreSQL needs initialization. The init script should handle this automatically. If still failing:
```bash
cd backend
bash ../scripts/init_replit.sh
```

### Port Already in Use
```
Error: "Address already in use"
```
**Solution**: Another process is using port 5000. Stop and restart:
- Click "Stop" button in Replit
- Wait 5 seconds
- Click "Run" again

### Import Errors
```
Error: "ModuleNotFoundError: No module named 'flask'"
```
**Solution**: Dependencies not installed. Run:
```bash
pip install -r requirements.txt
```

### Database Schema Error
```
Error: "relation 'user' does not exist"
```
**Solution**: Schema not initialized. Run:
```bash
cd backend
python -c "from app import create_app, db; app = create_app('production'); app.app_context().push(); db.create_all()"
```

---

## 📱 Frontend Deployment - Vercel

The frontend is configured for automatic deployment on Vercel:

1. **Push to GitHub** (already done or use Replit Git integration)
2. **Go to**: https://vercel.com/new
3. **Import**: `Shahinshac/bankmanagement` repository
4. **Configure**:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-replit.replit.dev
   ```

---

## 🔄 Full Deployment Flow

```
┌─────────────────────┐
│   Your GitHub Repo  │ (source code)
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ↓           ↓
┌─────────┐  ┌──────────┐
│ Replit  │  │  Vercel  │
│ Backend │  │ Frontend │
│ API:5000│  │ Hosted   │
└─────────┘  └──────────┘
     ↑             │
     │ API calls   │
     └─────────────┘
```

---

## 📞 Support & Resources

- **Replit Docs**: https://docs.replit.com
- **Flask Docs**: https://flask.palletsprojects.com
- **Project Repo**: https://github.com/Shahinshac/bankmanagement
- **Issues**: Report on GitHub Issues page

---

## ✅ Checklist for Success

- [ ] Cloned/forked repository to Replit
- [ ] Clicked "Run" - saw Flask startup message
- [ ] API responding at `http://localhost:5000/health`
- [ ] PostgreSQL initialized and running
- [ ] (Optional) Frontend deployed on Vercel
- [ ] Environment variables in `.env` are secure
- [ ] Can make API calls from frontend

---

**Happy Banking! 🏦**

For detailed API documentation, see `DEPLOYMENT.md` in the repository root.
