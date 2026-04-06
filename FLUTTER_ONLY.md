# FoodHub - Flutter Only Project

This project is a **Flutter-only** food delivery application with a professional Flask backend.

## 📱 Project Structure

```
foodhub/
├── backend/                    # Flask API + MongoDB
│   ├── app/
│   │   ├── __init__.py        # App factory with logging
│   │   ├── middleware/        # JWT & RBAC
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Security utilities
│   ├── config.py              # Multi-env configuration
│   ├── run.py                 # Entry point
│   ├── requirements.txt        # Dependencies
│   ├── .env.example            # Env template
│   ├── SETUP.md                # Quick start
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── logs/                   # Application logs
│
└── frontend-mobile/           # Flutter App (iOS + Android)
    ├── lib/
    │   ├── main.dart          # App entry point
    │   ├── pages/             # UI screens
    │   ├── services/          # API client
    │   ├── models/            # Data models
    │   ├── providers/         # State management
    │   └── widgets/           # Reusable widgets
    ├── android/               # Android config
    ├── ios/                   # iOS config
    ├── pubspec.yaml           # Dart dependencies
    └── pubspec.lock
```

## 🚀 Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
# Server: http://localhost:5000
```

### Mobile App
```bash
cd frontend-mobile
flutter pub get
flutter run
# On emulator/device
```

## 🔑 Key Features

✅ **Mobile-First** - Flutter app for iOS & Android
✅ **Professional Backend** - Flask with MongoDB
✅ **Production Ready** - Logging, error handling, security
✅ **Scalable** - Free tier deployable
✅ **30+ Features** - Full food delivery system

## 📱 Demo Credentials

```
Admin:       admin / admin123
Customer:    customer / customer123
Restaurant:  restaurant / rest123
Delivery:    delivery / delivery123
```

## 📚 Documentation

- **README.md** - Project overview and features
- **backend/README.md** - Backend API documentation
- **backend/SETUP.md** - 5-minute quick start
- **backend/DEPLOYMENT.md** - Production deployment
- **DEPLOYMENT_GUIDE.md** - Full deployment instructions
- **FLUTTER_QUICK_START.md** - Flutter app setup

## 🎯 Next Steps

1. Setup backend locally
2. Setup Flutter app locally
3. Test all features
4. Customize branding
5. Deploy to production
6. Launch on Play Store

## 📞 Support

See documentation files for detailed guides and troubleshooting.

---

**Flutter Only • Backend API • MongoDB • Production Ready** 🚀
