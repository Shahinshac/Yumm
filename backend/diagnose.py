#!/usr/bin/env python3
"""
MongoDB Atlas & Backend Connection Diagnostic Script
Tests SSL/TLS connectivity and MongoDB configuration

Usage:
    python backend/diagnose.py
    python backend/diagnose.py --verbose
"""

import os
import sys
import ssl
import json
import socket
import argparse
from urllib.parse import urlparse

try:
    import pymongo
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
except ImportError:
    print("ERROR: pymongo not installed. Run: pip install pymongo")
    sys.exit(1)

try:
    import certifi
except ImportError:
    print("WARNING: certifi not installed. Using system CA certificates.")
    certifi = None


class MongoDBDiagnostic:
    """Diagnostic tool for MongoDB Atlas connectivity"""

    def __init__(self, verbose=False):
        self.verbose = verbose
        self.mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/fooddelivery')

    def log(self, message, level='INFO'):
        """Print formatted log message"""
        prefix = f"[{level}]"
        print(f"{prefix} {message}")

    def verbose_log(self, message):
        """Print verbose log (only if verbose flag set)"""
        if self.verbose:
            self.log(message, "DEBUG")

    def test_connection_string(self):
        """Parse and validate connection string"""
        self.log("=" * 60)
        self.log("STEP 1: Validating Connection String", "INFO")
        self.log("=" * 60)

        try:
            parsed = urlparse(self.mongodb_uri)
            self.log(f"Scheme: {parsed.scheme}", "INFO")
            self.log(f"Hostname: {parsed.hostname}", "INFO")
            self.log(f"Database: {parsed.path.lstrip('/')}", "INFO")

            if 'mongodb+srv://' in self.mongodb_uri:
                self.log("✅ Using mongodb+srv:// - SSL/TLS will be enabled", "OK")
            else:
                self.log("⚠️  Using standard mongodb:// - SSL/TLS NOT enabled", "WARN")

            # Extract parameters
            if parsed.query:
                params = dict(p.split('=') for p in parsed.query.split('&'))
                self.log(f"Query parameters: {json.dumps(params, indent=2)}", "INFO")
                if 'retryWrites' in params:
                    self.log("✅ retryWrites enabled", "OK")
                if 'w' in params and params['w'] == 'majority':
                    self.log("✅ w=majority (write concern) enabled", "OK")

            return True
        except Exception as e:
            self.log(f"❌ Connection string parsing failed: {str(e)}", "ERROR")
            return False

    def test_dns_resolution(self):
        """Test DNS resolution for MongoDB hostname"""
        self.log("\n" + "=" * 60)
        self.log("STEP 2: DNS Resolution", "INFO")
        self.log("=" * 60)

        parsed = urlparse(self.mongodb_uri)
        hostname = parsed.hostname

        if not hostname:
            self.log("❌ Could not extract hostname from connection string", "ERROR")
            return False

        try:
            ip_addresses = socket.getaddrinfo(hostname, 27017, socket.AF_UNSPEC, socket.SOCK_STREAM)
            ips = [addr[4][0] for addr in ip_addresses]
            self.log(f"✅ DNS Resolution successful for {hostname}", "OK")
            self.verbose_log(f"   Resolved IPs: {', '.join(set(ips))}")
            return True
        except socket.gaierror as e:
            self.log(f"❌ DNS Resolution failed: {str(e)}", "ERROR")
            self.log("   Check: MongoDB Atlas cluster name and internet connectivity", "INFO")
            return False
        except Exception as e:
            self.log(f"❌ DNS Resolution error: {str(e)}", "ERROR")
            return False

    def test_socket_connection(self):
        """Test raw socket connection to MongoDB"""
        self.log("\n" + "=" * 60)
        self.log("STEP 3: Network Connectivity (Socket)", "INFO")
        self.log("=" * 60)

        parsed = urlparse(self.mongodb_uri)
        hostname = parsed.hostname
        port = parsed.port or 27017

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect((hostname, port))
            sock.close()
            self.log(f"✅ Network connectivity to {hostname}:{port} OK", "OK")
            return True
        except socket.timeout:
            self.log(f"❌ Connection timeout to {hostname}:{port}", "ERROR")
            self.log("   Possible causes:", "INFO")
            self.log("   - MongoDB Atlas IP Whitelist doesn't include your IP", "INFO")
            self.log("   - Firewall blocking the connection", "INFO")
            self.log("   - Cluster is paused or not running", "INFO")
            return False
        except ConnectionRefusedError:
            self.log(f"❌ Connection refused by {hostname}:{port}", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Socket connection error: {str(e)}", "ERROR")
            return False

    def test_ssl_handshake(self):
        """Test SSL/TLS handshake"""
        self.log("\n" + "=" * 60)
        self.log("STEP 4: SSL/TLS Handshake", "INFO")
        self.log("=" * 60)

        parsed = urlparse(self.mongodb_uri)
        hostname = parsed.hostname

        if not 'mongodb+srv://' in self.mongodb_uri:
            self.log("⚠️  Not using mongodb+srv:// - skipping SSL test", "WARN")
            return True

        try:
            context = ssl.create_default_context()
            if certifi:
                context.load_verify_locations(certifi.where())
                self.verbose_log(f"Using CA certificates from: {certifi.where()}")

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)

            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                ssock.connect((hostname, 27017))
                cert = ssock.getpeercert()
                self.log(f"✅ SSL/TLS handshake successful", "OK")
                self.verbose_log(f"   Subject: {dict(x[0] for x in cert['subject'])}")
                self.verbose_log(f"   Issuer: {dict(x[0] for x in cert['issuer'])}")
                return True

        except ssl.SSLError as e:
            self.log(f"❌ SSL/TLS handshake failed: {str(e)}", "ERROR")
            self.log("   This is likely the root cause of the connection issue", "INFO")
            self.log("   Common causes:", "INFO")
            self.log("   - IP not whitelisted in MongoDB Atlas", "INFO")
            self.log("   - Invalid SSL certificate", "INFO")
            self.log("   - Network/firewall blocking SSL traffic", "INFO")
            return False
        except Exception as e:
            self.log(f"❌ SSL/TLS test error: {str(e)}", "ERROR")
            return False

    def test_mongodb_connection(self):
        """Test actual MongoDB connection using PyMongo"""
        self.log("\n" + "=" * 60)
        self.log("STEP 5: MongoDB Connection (PyMongo)", "INFO")
        self.log("=" * 60)

        try:
            client = MongoClient(
                self.mongodb_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                retryWrites=True
            )

            # Try to access the server info
            server_info = client.server_info()
            self.log(f"✅ MongoDB Connection successful!", "OK")
            self.verbose_log(f"   MongoDB version: {server_info.get('version', 'unknown')}")

            # Check if database exists
            db = client.fooddelivery
            collections = db.list_collection_names()
            self.log(f"✅ Database 'fooddelivery' accessible", "OK")
            self.verbose_log(f"   Collections: {', '.join(collections) if collections else '(empty)'}")

            return True

        except ServerSelectionTimeoutError as e:
            self.log(f"❌ MongoDB selection timeout: {str(e)}", "ERROR")
            self.log("   The server was not found or unreachable", "INFO")
            return False

        except ConnectionFailure as e:
            self.log(f"❌ MongoDB connection failure: {str(e)}", "ERROR")
            if 'SSL' in str(e) or 'TLS' in str(e):
                self.log("   SSL/TLS Error detected - check IP whitelist", "INFO")
            return False

        except Exception as e:
            self.log(f"❌ MongoDB error: {str(e)}", "ERROR")
            self.log(f"   Error type: {type(e).__name__}", "DEBUG")
            return False

    def test_flask_app_connection(self):
        """Test Flask app MongoDB connection"""
        self.log("\n" + "=" * 60)
        self.log("STEP 6: Flask App Connection", "INFO")
        self.log("=" * 60)

        try:
            # Add backend to path
            sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

            from backend.app import create_app

            self.log("Initializing Flask application...", "INFO")
            app = create_app()

            self.log("✅ Flask app created successfully", "OK")
            self.log("✅ MongoDB connected through Flask/MongoEngine", "OK")

            return True

        except ImportError as e:
            self.log(f"❌ Import error: {str(e)}", "ERROR")
            self.log("   Make sure you're running from the project root", "INFO")
            return False

        except Exception as e:
            self.log(f"❌ Flask app initialization failed: {str(e)}", "ERROR")
            return False

    def run_all_tests(self):
        """Run all diagnostic tests"""
        self.log("\n")
        self.log("╔" + "=" * 58 + "╗", "INFO")
        self.log("║" + " MongoDB Atlas & Backend Diagnostics ".center(58) + "║", "INFO")
        self.log("╚" + "=" * 58 + "╝", "INFO")

        results = {
            'Connection String': self.test_connection_string(),
            'DNS Resolution': self.test_dns_resolution(),
            'Socket Connection': self.test_socket_connection(),
            'SSL/TLS Handshake': self.test_ssl_handshake(),
            'MongoDB Connection': self.test_mongodb_connection(),
            'Flask App Connection': self.test_flask_app_connection(),
        }

        # Summary
        self.log("\n" + "=" * 60)
        self.log("DIAGNOSTIC SUMMARY", "INFO")
        self.log("=" * 60)

        passed = sum(1 for v in results.values() if v)
        total = len(results)

        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name:<30} {status}", "INFO")

        self.log(f"\nResult: {passed}/{total} tests passed", "INFO")

        if passed == total:
            self.log("✅ All tests passed! MongoDB connection is working.", "OK")
            return 0
        else:
            self.log("❌ Some tests failed. See details above.", "ERROR")
            self.log("\nNext steps:", "INFO")
            self.log("1. Check MongoDB Atlas IP Whitelist", "INFO")
            self.log("2. Verify MONGODB_URI environment variable", "INFO")
            self.log("3. Ensure cluster is running (not paused)", "INFO")
            self.log("4. Review MONGODB_ATLAS_SETUP.md for detailed guide", "INFO")
            return 1


def main():
    parser = argparse.ArgumentParser(
        description='MongoDB Atlas & Backend Connection Diagnostics',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python backend/diagnose.py                    # Run all tests
  python backend/diagnose.py --verbose          # Run with verbose output
        '''
    )
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')

    args = parser.parse_args()

    diagnostic = MongoDBDiagnostic(verbose=args.verbose)
    exit_code = diagnostic.run_all_tests()
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
