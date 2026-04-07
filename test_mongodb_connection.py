#!/usr/bin/env python3
"""
MongoDB Atlas Connection Diagnostic Tool
Tests connectivity from different environments
"""
import os
import sys
import time
import subprocess
from pymongo import MongoClient
from urllib.parse import urlparse

def test_local_connection():
    """Test MongoDB connection locally"""
    print("\n" + "="*70)
    print("MONGODB CONNECTION DIAGNOSTIC TOOL")
    print("="*70)

    # Load environment from .env if it exists
    env_file = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    if os.path.exists(env_file):
        print(f"\n📄 Loading environment from: {env_file}")
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/foodhub')
    print(f"\n🔗 Testing connection to: {mongodb_uri[:60]}...")

    try:
        # Parse connection string to mask credentials
        parsed = urlparse(mongodb_uri)
        safe_uri = f"{parsed.scheme}://***:{parsed.password}@{parsed.hostname}/{parsed.path}" if parsed.password else mongodb_uri
        print(f"✅ Connection string parsed: {safe_uri}")

        # Attempt connection with timeout
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=10000, connectTimeoutMS=10000)

        # Verify connection
        client.admin.command('ping')
        print("✅ PING successful - MongoDB Atlas is reachable!")

        # Get database info
        db = client['fooddelivery']
        collections = db.list_collection_names()
        print(f"✅ Database 'fooddelivery' accessible")
        print(f"✅ Collections found: {collections if collections else 'None (empty database)'}")

        client.close()
        return True

    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        error_str = str(e).lower()

        if 'ip' in error_str or 'whitelist' in error_str or 'unauthorized' in error_str or 'auth' in error_str:
            print("\n⚠️  DIAGNOSIS: IP Whitelist or Authentication Issue")
            print("\n📋 SOLUTION STEPS:")
            print("   1. Go to: https://cloud.mongodb.com/")
            print("   2. Select 'foodhub' project")
            print("   3. Go to: Network Access → IP Whitelist")
            print("   4. Click 'Add IP Address'")
            print("   5. Enter: 0.0.0.0/0 (allows all IPs - for Render compatibility)")
            print("   6. Click 'Confirm'")
            print("   7. Wait 1-2 minutes for changes to propagate")
            print("   8. Re-run this script to verify")
        elif 'timeout' in error_str or 'cannot reach' in error_str:
            print("\n⚠️  DIAGNOSIS: Connection Timeout")
            print("   - MongoDB Atlas cluster may be paused")
            print("   - Network connectivity issue")
            print("   - Check cluster status at: https://cloud.mongodb.com/")

        return False

def test_render_backend():
    """Test if Render backend is now working"""
    print("\n" + "="*70)
    print("TESTING RENDER BACKEND")
    print("="*70)

    render_backend_url = "https://yumm-ym2m.onrender.com/api/health"
    print(f"\n🌐 Testing: {render_backend_url}")

    try:
        result = subprocess.run(
            ['curl', '-s', '-w', '\nHTTP_CODE:%{http_code}', render_backend_url],
            capture_output=True,
            text=True,
            timeout=10
        )

        output = result.stdout
        if 'HTTP_CODE:200' in output:
            print("✅ Backend health check PASSED!")
            print("✅ Render can now access MongoDB Atlas!")
            return True
        elif 'HTTP_CODE:503' in output:
            print("⚠️  Backend returned 503 (Service Unavailable)")
            print("   Database is still not accessible - IP whitelist may not have propagated yet")
            print("   Wait 1-2 minutes and try again")
            return False
        else:
            print(f"⚠️  Unexpected response: {output}")
            return False
    except Exception as e:
        print(f"❌ Cannot reach Render backend: {str(e)}")
        return False

def main():
    """Run all diagnostics"""
    print("\n" + "🔧 Starting MongoDB connection diagnostics...")

    # Test local connection
    local_ok = test_local_connection()

    # Test Render backend
    backend_ok = test_render_backend()

    # Summary
    print("\n" + "="*70)
    print("DIAGNOSTIC SUMMARY")
    print("="*70)
    print(f"✅ Local MongoDB Connection: {'PASS' if local_ok else 'FAIL'}")
    print(f"✅ Render Backend Health: {'PASS' if backend_ok else 'FAIL'}")

    if local_ok and backend_ok:
        print("\n🎉 All systems operational! Your MongoDB Atlas setup is working correctly.")
        return 0
    elif local_ok and not backend_ok:
        print("\n⚠️  Local connection works but Render still failing.")
        print("   This typically means:")
        print("   - MongoDB Atlas IP whitelist changes haven't propagated yet (wait 1-2 min)")
        print("   - Or Render hasn't been redeployed with new code")
        return 1
    else:
        print("\n❌ Local connection failed - check credentials and IP whitelist")
        return 1

if __name__ == '__main__':
    sys.exit(main())
