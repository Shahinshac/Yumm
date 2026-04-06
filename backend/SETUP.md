# FoodHub Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Python 3.8+
- MongoDB (local or Atlas)

### Step 1: Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

For local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/fooddelivery
FLASK_ENV=development
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fooddelivery
FLASK_ENV=development
```

### Step 3: Run
```bash
python run.py
```

Server: http://localhost:5000

---

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Customer | customer | customer123 |
| Restaurant | restaurant | rest123 |
| Delivery | delivery | delivery123 |

---

## 🗄️ MongoDB Setup

### Local MongoDB
```bash
# macOS
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Windows WSL
sudo service mongod start
```

### MongoDB Atlas
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to .env

---

## ✅ Verify

```bash
# Check app initialization
python -c "from backend.app import create_app; create_app(); print('✅ OK')"

# Test API
curl http://localhost:5000/api/restaurants
```

---

## 🔗 API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Current User
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/me
```

### List Restaurants
```bash
curl http://localhost:5000/api/restaurants
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check MongoDB is running, verify MONGODB_URI |
| Module not found | Run `pip install -r requirements.txt` |
| Port 5000 in use | Change PORT in .env |
| Import errors | Check FLASK_ENV and Python version |

Check `logs/app.log` for detailed errors.

---

## 🚀 Production

```bash
FLASK_ENV=production
SECRET_KEY=your-secure-key
JWT_SECRET_KEY=your-jwt-key
MONGODB_URI=your-production-uri

gunicorn --workers 4 --bind 0.0.0.0:5000 "backend.app:create_app()"
```

---

**Version**: 1.0.0 | **Status**: Production Ready ✅
