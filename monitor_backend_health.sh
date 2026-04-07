#!/bin/bash

# MongoDB Atlas IP Whitelist Fix - Backend Health Monitor
# Polls the Render backend health endpoint until MongoDB is accessible

BACKEND_URL="https://yumm-ym2m.onrender.com/api/health"
MAX_ATTEMPTS=60  # 5 minutes with 5-second intervals
ATTEMPT=1

echo "======================================================================"
echo "RENDER BACKEND HEALTH MONITOR"
echo "======================================================================"
echo "Backend URL: $BACKEND_URL"
echo "Polling interval: 5 seconds"
echo "Max attempts: $MAX_ATTEMPTS (5 minutes)"
echo "======================================================================"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "[$(date '+%H:%M:%S')] Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    
    # Make request and capture response
    HTTP_CODE=$(curl -s -o /tmp/response.json -w "%{http_code}" "$BACKEND_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Backend responded with 200 OK"
        echo ""
        echo "Response:"
        cat /tmp/response.json | python3 -m json.tool 2>/dev/null || cat /tmp/response.json
        echo ""
        echo "======================================================================"
        echo "SUCCESS! Backend is now accessible and database is connected."
        echo "======================================================================"
        exit 0
    elif [ "$HTTP_CODE" = "503" ]; then
        echo "⏳ Backend responded with 503 (still initializing)"
        echo "   Database connection in progress..."
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "⏳ No response yet (endpoint not reachable)"
        echo "   Render deployment may still be in progress..."
    else
        echo "⚠️  Unexpected HTTP code: $HTTP_CODE"
        cat /tmp/response.json 2>/dev/null | head -n 1
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        sleep 5
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "======================================================================"
echo "FAILED: Backend did not become healthy after 5 minutes"
echo "======================================================================"
echo "Troubleshooting steps:"
echo "1. Verify MongoDB Atlas IP whitelist has 0.0.0.0/0 entry"
echo "2. Check that whitelist entry shows 'ACTIVE' status"
echo "3. Verify Render deployment completed successfully"
echo "4. Check Render logs: https://dashboard.render.com/"
echo "5. Render backend may need manual redeploy"
echo ""
echo "To redeploy Render:"
echo "  Option A: Go to dashboard.render.com → foodhub-api → Manual Deploy"
echo "  Option B: git commit --allow-empty -m 'trigger' && git push origin main"
echo "======================================================================"
exit 1
