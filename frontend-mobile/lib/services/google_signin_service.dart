import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;
import 'package:flutter/services.dart';

/// Google Sign-In Service for FoodHub
/// Handles authentication for all platforms (Android, iOS, Web)
class GoogleSignInService {
  late GoogleSignIn _googleSignIn;
  static const String TAG = '🔐 GoogleSignInService';

  GoogleSignInService() {
    final clientId = _getClientId();

    debugPrint(
      '$TAG: Initializing with Client ID (last 20 chars): ...${clientId.substring(clientId.length - 20)}',
    );

    _googleSignIn = GoogleSignIn(
      clientId: clientId,
      scopes: ['email', 'profile', 'openid'],
    );
  }

  /// Get platform-specific Google Client ID
  /// Replace these with your actual Client IDs from Google Cloud Console
  String _getClientId() {
    if (kIsWeb) {
      // Web Client ID - from Google Cloud Console > Credentials > Web Application
      return '946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com';
    } else if (Platform.isAndroid) {
      // Android Client ID - from Google Cloud Console > Credentials > Android
      // Note: Must match SHA-1 of your signing key (05:1F:58:10:5C:1E:89:17:EA:E9:14:76:F2:10:7B:58:91:CA:94:11)
      return '946437330680-87ma1tf4dg56rcp0mk4moi00r7f3159m.apps.googleusercontent.com';
    } else if (Platform.isIOS) {
      // iOS Client ID - from Google Cloud Console > Credentials > iOS
      return '946437330680-drp10qt4b720rhdl6h19uruj1pqirsat.apps.googleusercontent.com';
    }
    throw UnsupportedError('Unsupported platform for Google Sign-In');
  }

  /// Sign in with Google
  /// Returns the signed-in account or null if cancelled/failed
  Future<GoogleSignInAccount?> signIn() async {
    try {
      debugPrint('$TAG: Starting sign-in process...');

      // Trigger the Google Sign-In dialog
      final account = await _googleSignIn.signIn();

      if (account != null) {
        debugPrint('$TAG: ✅ Sign-in successful for ${account.email}');
      } else {
        debugPrint('$TAG: ⚠️  Sign-in was cancelled by user');
      }

      return account;
    } on PlatformException catch (e) {
      debugPrint('$TAG: ❌ PlatformException: ${e.code} - ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('$TAG: ❌ Unexpected error during sign-in: $e');
      rethrow;
    }
  }

  /// Get ID token for backend communication
  /// This token is sent to the backend for authentication
  Future<String?> getIdToken() async {
    try {
      // Get current user or prompt to sign in
      var user = _googleSignIn.currentUser;

      if (user == null) {
        debugPrint('$TAG: No current user, triggering sign-in...');
        user = await signIn();

        if (user == null) {
          debugPrint('$TAG: User cancelled sign-in');
          return null;
        }
      }

      debugPrint('$TAG: Getting ID token for ${user.email}...');

      // Get authentication details
      final authentication = await user.authentication;
      final idToken = authentication.idToken;

      if (idToken == null) {
        throw Exception('Failed to retrieve ID token');
      }

      debugPrint('$TAG: ✅ ID token obtained (length: ${idToken.length})');
      return idToken;
    } catch (e) {
      debugPrint('$TAG: ❌ Error getting ID token: $e');
      rethrow;
    }
  }

  /// Get access token (optional, for other APIs)
  Future<String?> getAccessToken() async {
    try {
      var user = _googleSignIn.currentUser;

      if (user == null) {
        return null;
      }

      final authentication = await user.authentication;
      return authentication.accessToken;
    } catch (e) {
      debugPrint('$TAG: Error getting access token: $e');
      return null;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      debugPrint('$TAG: Signing out...');
      await _googleSignIn.signOut();
      debugPrint('$TAG: ✅ Sign out successful');
    } catch (e) {
      debugPrint('$TAG: ❌ Error during sign out: $e');
      rethrow;
    }
  }

  /// Disconnect (removes token permanently)
  Future<void> disconnect() async {
    try {
      debugPrint('$TAG: Disconnecting...');
      await _googleSignIn.disconnect();
      debugPrint('$TAG: ✅ Disconnect successful');
    } catch (e) {
      debugPrint('$TAG: ❌ Error during disconnect: $e');
      rethrow;
    }
  }

  /// Check if user is currently signed in
  bool isSignedIn() {
    return _googleSignIn.currentUser != null;
  }

  /// Get current user
  GoogleSignInAccount? getCurrentUser() {
    return _googleSignIn.currentUser;
  }

  /// Get stream of sign-in state changes
  Stream<GoogleSignInAccount?> get onCurrentUserChanged {
    return _googleSignIn.onCurrentUserChanged;
  }

  /// Silent sign-in (without UI)
  /// Useful for restoring previous session on app startup
  Future<GoogleSignInAccount?> silentSignIn() async {
    try {
      debugPrint('$TAG: Attempting silent sign-in...');
      final account = await _googleSignIn.signInSilently(suppressErrors: true);

      if (account != null) {
        debugPrint('$TAG: ✅ Silent sign-in successful');
      } else {
        debugPrint('$TAG: ℹ️  No previous sign-in found');
      }

      return account;
    } catch (e) {
      debugPrint('$TAG: Error during silent sign-in: $e');
      return null;
    }
  }

  /// Verify ID token format (for development/testing)
  /// Production backends should verify with Google's servers
  bool verifyTokenFormat(String token) {
    if (token.isEmpty) return false;

    // JWT format: header.payload.signature
    final parts = token.split('.');
    return parts.length == 3;
  }
}
