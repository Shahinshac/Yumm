import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Google Sign-In Service for FoodHub
/// Handles authentication for all platforms (Android, iOS, Web)
class GoogleSignInService {
  late GoogleSignIn _googleSignIn;
  static const String TAG = '🔐 GoogleSignInService';

  GoogleSignInService() {
    debugPrint('$TAG: Initializing for ${kIsWeb ? 'WEB' : 'MOBILE'}');

    if (kIsWeb) {
      // Web: Provide the explicit web client ID so the plugin can retrieve ID tokens reliably.
      final clientId = _getClientId();
      _googleSignIn = GoogleSignIn(
        clientId: clientId,
        scopes: ['openid', 'email', 'profile'],
        signInOption: SignInOption.standard,
      );
      debugPrint(
        '$TAG: ✅ Web initialization complete with client ID (last 20 chars): ...${clientId.substring(clientId.length - 20)}',
      );
    } else {
      // Mobile: Use platform-specific Client ID
      final clientId = _getClientId();
      debugPrint(
        '$TAG: Mobile initialization with Client ID (last 20 chars): ...${clientId.substring(clientId.length - 20)}',
      );
      _googleSignIn = GoogleSignIn(
        clientId: clientId,
        scopes: ['openid', 'email', 'profile'],
      );
    }
  }

  /// Get platform-specific Google Client ID
  /// Replace these with your actual Client IDs from Google Cloud Console
  String _getClientId() {
    if (kIsWeb) {
      // Web Client ID - from Google Cloud Console > Credentials > Web Application
      return '946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com';
    }

    // For mobile: Determine platform by checking native channel or use defaultTargetPlatform
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return '946437330680-drp10qt4b720rhdl6h19uruj1pqirsat.apps.googleusercontent.com';
    }
    // Default: return Android client ID (most common)
    return '946437330680-87ma1tf4dg56rcp0mk4moi00r7f3159m.apps.googleusercontent.com';
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

  /// Get Google token for backend communication.
  /// On web (GIS), only accessToken is available via custom buttons.
  /// Falls back to accessToken automatically if idToken is null.
  Future<String?> getIdToken() async {
    try {
      var user = _googleSignIn.currentUser;

      if (user == null) {
        debugPrint('$TAG: No current user, triggering sign-in...');
        user = await signIn();

        if (user == null) {
          debugPrint('$TAG: User cancelled sign-in');
          return null;
        }
      }

      debugPrint('$TAG: Getting authentication details for ${user.email}...');

      final authentication = await user.authentication;

      // On Web with the new GIS library, idToken is null for custom buttons.
      // We fall back to accessToken which works equally well with our backend.
      final token = authentication.idToken ?? authentication.accessToken;

      if (token == null) {
        debugPrint('$TAG: ⚠️  Both idToken and accessToken are null.');
        throw Exception('Failed to retrieve any token from Google. Please try again.');
      }

      final tokenType = authentication.idToken != null ? 'ID Token' : 'Access Token (GIS fallback)';
      debugPrint('$TAG: ✅ Token obtained via $tokenType (length: ${token.length})');
      return token;
    } catch (e) {
      debugPrint('$TAG: ❌ Error getting token: $e');
      rethrow;
    }
  }

  /// Get access token directly (for explicit use)
  Future<String?> getAccessToken() async {
    try {
      var user = _googleSignIn.currentUser;
      if (user == null) return null;
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
