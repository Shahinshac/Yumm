# Security Configuration Guide

## ⚠️ Important Security Notes

This project contains sensitive configuration. **Never commit credentials, API keys, or private keys to version control.**

### Environment Variables Setup

#### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Fill in your actual credentials in `backend/.env`:
   ```bash
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/fooddelivery?retryWrites=true&w=majority
   SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))">
   JWT_SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))">
   ```

3. The `.env` file is **gitignored** - it will never be committed.

#### For Production (Render)

Set environment variables directly in**Render Dashboard** → Environment Variables:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `SECRET_KEY` - Strong random key (32+ chars)
- `JWT_SECRET_KEY` - Strong random key (32+ chars)
- `CORS_ORIGINS` - Your frontend URLs
- Other configuration variables

**Do NOT** put credentials in code, config files, or YAML files.

### Android Keystore Security

The Android signing keystore (`android_keystore/foodhub-release-key.jks`) is **gitignored** and should never be committed.

To set up:
1. Keep the keystore file locally (don't share)
2. Store the keystore password securely
3. Use `.gradle/gradle.properties` (also gitignored) for keystore paths
4. For CI/CD, encode the keystore as base64 and store in secrets

### MongoDB Atlas Security

1. Use strong passwords for MongoDB Atlas
2. Restrict IP access to your server IPs only
3. Create database-specific users with minimal permissions
4. Use encrypted connections (default in MongoDB Atlas)

### Secrets Management

#### For Personal/Local Use:
- Keep `.env` files local only
- Use `.env.local` for machine-specific overrides
- Never share `.env` files

#### For Teams:
- Use a secrets management service (e.g., HashiCorp Vault)
- Use platform-specific secret management:
  - **Render**: Environment Variables in Dashboard
  - **Vercel**: Settings → Environment Variables
  - **GitHub Actions**: Secrets settings
  - **Local**: 1Password, Bitwarden, or similar

### Credential Rotation

Regularly rotate credentials:
1. Generate new `SECRET_KEY` and `JWT_SECRET_KEY`
2. Update MongoDB password
3. Invalidate old JWT tokens
4. Update CI/CD secrets

### Git Safety

Our `.gitignore` protects:
- `backend/.env` - Development environment file
- `*.jks` - Android signing keystores
- `*.key` & `*.pem` - SSL/TLS certificates and private keys
- `android_keystore/` - Keystore directory
- `.aws/` & `.ssh/` - AWS and SSH credentials

Check before committing:
```bash
git status
git diff --cached
```

Never force-push to remove sensitive data. If accidentally committed:
1. Rotate all credentials immediately
2. Contact platform support to purge from history
3. Use `git filter-branch` or tools like `git-filter-repo` to clean history

### API Keys & Third-Party Services

For any third-party service (AWS, SendGrid, etc.):
1. Never hardcode keys in source code
2. Use environment variables exclusively
3. Use service-specific IAM roles when available
4. Generate service-account credentials instead of personal ones
5. Regularly audit and remove unused credentials

## Audit Checklist

Before deployment:
- [ ] No `.env` file with credentials in git
- [ ] No API keys in source code
- [ ] No private keys committed
- [ ] `render.yaml` has `sync: false` for sensitive vars
- [ ] Secrets set in platform dashboards, not files
- [ ] MongoDB user has minimal required permissions
- [ ] CORS origins restricted to your domains
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting enabled on APIs
