# 📋 Vercel Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub (`main` branch)
- [ ] MongoDB Atlas credentials ready
- [ ] Generated `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Vercel account created

---

## Deployment Steps

### 1. Connect GitHub to Vercel

```
✓ Go to https://vercel.com/new
✓ Click "Import Project"
✓ Select "Shahinshac/Yumm" from GitHub
✓ Click "Import"
```

### 2. Configure Project

```
Setting                Value
─────────────────     ──────────────
Root Directory        . (current)
Framework             Other
Build Command         (auto-detected)
Output Directory      (auto-detected)
Install Command       (auto-detected)
```

Click **Continue**

### 3. Add Environment Variables

```
Key                   Value
─────────────────     ──────────────────────
FLASK_ENV             production
MONGODB_URI           mongodb+srv://USER:PASS@cluster...
SECRET_KEY            <your generated key>
JWT_SECRET_KEY        <your generated key>
CORS_ORIGINS          https://YOUR-DOMAIN.vercel.app
PYTHONUNBUFFERED      1
ENABLE_DEMO_DATA      false
LOG_LEVEL             INFO
```

Click **Deploy**

---

## Post-Deployment

### ✓ Verify Backend API

```bash
curl https://YOUR-DOMAIN.vercel.app/api/health
```

Expected: `{"status":"healthy","database":"connected",...}`

### ✓ Verify Frontend

Visit: `https://YOUR-DOMAIN.vercel.app`

Should show: FoodHub login page

### ✓ Test Login

- Username: `customer`
- Password: `customer123`

Create a new account to test registration

### ✓ Monitor Logs

Dashboard → Project → Functions → api/index.py → Logs

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Build failed | Pre-build Flutter web, commit `build/web/` |
| MongoDB connection error | Check `MONGODB_URI` environment variable |
| CORS errors | Verify `CORS_ORIGINS` includes your Vercel domain |
| API 500 errors | Check function logs in Vercel dashboard |
| Cold start (slow first request) | Normal for serverless - upgrade to Pro if needed |

---

## Environment Variables Quick Reference

```bash
# Generate values
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Example MongoDB URI
mongodb+srv://username:password@cluster.mongodb.net/fooddelivery?retryWrites=true&w=majority

# Example Vercel domain
https://foodhub-xyz123.vercel.app
```

---

## After Successful Deployment

1. ✅ Share live URL with team
2. ✅ Test all features thoroughly
3. ✅ Monitor logs for 24 hours
4. ✅ Setup custom domain (optional)
5. ✅ Configure HTTPS (automatic on Vercel)

---

**Deployment time:** ~5-10 minutes
**Cost:** FREE ✅
**Status:** Production ready 🚀
