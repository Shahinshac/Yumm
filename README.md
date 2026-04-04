# 🏦 Banking System - Full-Stack Application

A complete, production-ready banking system with secure authentication, transaction management, loan processing, and account management.

**Status**: ✅ Complete (170+ tests, 100% passing) | **Deployment**: Ready for Replit + Vercel

---

## 🚀 Quick Start

### Deploy on Replit (Free)
```bash
1. Go to: https://replit.com/new/github?repo=Shahinshac/bankmanagement
2. Click "Run"
3. Done! API runs automatically at https://your-repl.replit.dev
```

👉 **See [REPLIT_SETUP.md](./REPLIT_SETUP.md) for complete Replit guide**

### Deploy Locally with Docker
```bash
docker-compose up
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5432
```

### Deploy Frontend on Vercel (Free)
```bash
1. Go to: https://vercel.com/new
2. Import: Shahinshac/bankmanagement
3. Set root directory: frontend
4. Add env var: REACT_APP_API_URL=<your-backend-url>
5. Deploy!
```

---

## 📊 Project Overview

| Component | Details |
|-----------|---------|
| **Backend** | Flask + SQLAlchemy + PostgreSQL |
| **Frontend** | React + Zustand + Axios |
| **Endpoints** | 50+ API routes |
| **Tests** | 170+ tests (100% passing) |
| **Database Models** | 10+ with relationships |
| **Authentication** | JWT + RBAC |
| **Features** | Transactions, Loans, Cards, Beneficiaries, Scheduled Payments, Analytics |

---

## 🎯 Key Features

### 🔐 Authentication & Authorization
- JWT token-based authentication
- Role-Based Access Control (Admin, User)
- Password hashing with bcrypt
- Refresh token mechanism

### 💰 Transaction System
- Atomic multi-account transactions
- Transaction history tracking
- Balance updates with constraints
- Transaction reversal support

### 🏧 Account Management
- Multiple account types (Checking, Savings, Credit)
- Account opening/closing
- Balance inquiries
- Statement generation

### 🎁 Beneficiary Management
- Add/remove beneficiaries
- Approval workflow
- Quick transfers to saved beneficiaries

### 💳 Card Management
- Virtual & physical card support
- Card activation/deactivation
- Transaction limits
- Fee management

### 💰 Loan System
- Loan application & approval
- Repayment tracking
- Interest calculation
- Loan status management

### 📅 Scheduled Payments
- Set up recurring payments
- Automatic execution
- Cancel/modify schedules

### 🔔 Notifications
- Transaction alerts
- Payment reminders
- Loan status updates
- Email/SMS integration ready

### 📊 Analytics & Reporting
- Admin dashboard analytics
- Transaction reports
- User activity reports
- Revenue analytics

---

## 📁 Project Structure

```
bankmanagement/
├── backend/                     # Flask API (Python)
│   ├── run.py                  # Entry point
│   ├── config.py               # Configuration
│   ├── requirements.txt         # Dependencies
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── models/            # SQLAlchemy models (10+ models)
│   │   ├── routes/            # API endpoints (11 blueprints, 50+ routes)
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # RBAC middleware
│   │   └── utils/             # Utilities & exceptions
│   └── tests/                  # 170+ test files
│
├── frontend/                    # React App
│   ├── public/                # Static files
│   ├── src/
│   │   ├── App.jsx           # Main component
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API integration
│   │   ├── context/          # Zustand stores
│   │   └── styles/           # CSS
│   ├── package.json          # Dependencies
│   └── build/                # Production build
│
├── .replit                      # ⭐ Replit configuration
├── replit.nix                   # Environment setup
├── vercel.json                  # Vercel config
├── docker-compose.yml           # Local dev stack
├── REPLIT_SETUP.md              # ⭐ Replit installation guide
├── DEPLOYMENT.md                # Detailed deployment guide
└── scripts/
    └── init_replit.sh           # ⭐ Replit initialization script
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 2.3.3
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Authentication**: JWT (PyJWT)
- **Security**: Bcrypt
- **WSGI Server**: Gunicorn
- **Testing**: Pytest (170+ tests)

### Frontend
- **Framework**: React 18.2
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router 6.8
- **Build Tool**: Create React App

### DevOps
- **Container**: Docker & Docker Compose
- **VCS**: Git & GitHub
- **CI/CD**: GitHub Actions
- **Deployment**: Replit (Backend), Vercel (Frontend)

---

## 🔌 API Endpoints Overview

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/<id>` - Get user profile
- `PUT /api/users/<id>` - Update profile
- `GET /api/users/<id>/accounts` - User's accounts

### Accounts
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/<id>` - Account details
- `GET /api/accounts/<id>/balance` - Account balance

### Transactions
- `GET /api/transactions` - Transaction history
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/<id>` - Transaction details

### Beneficiaries
- `GET /api/beneficiaries` - List beneficiaries
- `POST /api/beneficiaries` - Add beneficiary
- `DELETE /api/beneficiaries/<id>` - Remove beneficiary

### Cards
- `GET /api/cards` - List cards
- `POST /api/cards` - Create card
- `PUT /api/cards/<id>` - Update card limits

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Apply for loan
- `GET /api/loans/<id>/repayment` - Repayment schedule

### Scheduled Payments
- `GET /api/scheduled-payments` - List schedules
- `POST /api/scheduled-payments` - Create schedule
- `DELETE /api/scheduled-payments/<id>` - Cancel schedule

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/<id>/read` - Mark as read

### Admin Analytics
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/transactions` - Transaction analytics
- `GET /api/analytics/revenue` - Revenue analytics

**Full API docs**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm 7+
- PostgreSQL 12+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shahinshac/bankmanagement.git
   cd bankmanagement
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   export FLASK_ENV=development
   python run.py
   # API runs at http://localhost:5000
   ```

3. **Setup Frontend** (in another terminal)
   ```bash
   cd frontend
   npm install
   npm start
   # App runs at http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # PostgreSQL must be running
   cd backend
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

---

## 🧪 Testing

```bash
cd backend

# Run all tests
pytest test_*.py

# Run specific test file
pytest test_auth.py

# Run with coverage
pytest --cov=app test_*.py

# Show all tests
pytest --collect-only
```

**Test Stats**: 170+ tests, 100% passing ✅

---

## 🚢 Deployment Options

| Platform | Backend | Frontend | Cost | Setup Time |
|----------|---------|----------|------|-----------|
| **Replit** | ✅ | ❌ (use separate) | Free | 1 min |
| **Vercel** | ❌ (Python not supported) | ✅ | Free | 2 min |
| **Render** | ✅ | ✅ | $7/month | 5 min |
| **Docker** | ✅ | ✅ | Self-hosted | 10 min |
| **Heroku** | ✅ | ✅ | Paid | 10 min |

### Recommended: Replit + Vercel (100% Free)
```
Replit (Backend API) + Vercel (Frontend) = Full Banking System Free
```

👉 **[REPLIT_SETUP.md](./REPLIT_SETUP.md)** - Complete setup guide

---

## 📋 Environment Variables

### Backend (`.env` in `/backend`)
```env
FLASK_ENV=production
FLASK_APP=run.py
DATABASE_URL=postgresql://user:pass@localhost:5432/bankmanagement
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600
CORS_ORIGINS=http://localhost:3000,https://your-frontend.com
BCRYPT_LOG_ROUNDS=12
DEBUG=False
```

### Frontend (`.env` in `/frontend`)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=10000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📞 Support & Documentation

- **Setup Guide**: [REPLIT_SETUP.md](./REPLIT_SETUP.md) - Complete Replit deployment
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md) - All deployment options
- **GitHub**: https://github.com/Shahinshac/bankmanagement
- **Issues**: [GitHub Issues](https://github.com/Shahinshac/bankmanagement/issues)

---

## 🎯 Next Steps

1. **Deploy Now**: Click → https://replit.com/new/github?repo=Shahinshac/bankmanagement
2. **Read Guide**: See [REPLIT_SETUP.md](./REPLIT_SETUP.md)
3. **Test API**: Once running, visit `http://localhost:5000/health`
4. **Login**: Use test credentials from documentation

---

**Made with ❤️ | Secure Banking System 🏦**
