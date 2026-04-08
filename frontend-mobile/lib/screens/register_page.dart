import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/components/custom_button.dart';
import '../core/components/custom_text_field.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';
import '../services/auth_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _fullNameController = TextEditingController();
  String _selectedRole = 'customer';

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

  void _register(BuildContext context) async {
    final authProvider = context.read<AuthProvider>();
    final role = _selectedRole;
    final success = await authProvider.register(
      _usernameController.text,
      _emailController.text,
      _passwordController.text,
      _phoneController.text,
      _fullNameController.text,
      role,
    );

    if (success && mounted) {
      if (role == 'customer' && authProvider.isAuthenticated) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful! Welcome to FoodHub 🎉'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.go('/home');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              role == 'restaurant'
                  ? 'Registration submitted! Admin will review your shop.'
                  : 'Registration submitted! Admin will verify your details.',
            ),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 4),
          ),
        );
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) context.go('/login');
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Registration failed'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  void _handleGoogleSignIn(BuildContext context) async {
    try {
      final authService = AuthService();
      final result = await authService.googleLogin();

      if (result['success'] == true) {
        final token = result['access_token'] as String;
        final user = result['user'] as Map<String, dynamic>;

        // Persist token via AuthProvider
        if (mounted) {
          await context.read<AuthProvider>().loginWithToken(token, user);
          context.go('/home');
        }
      } else {
        throw Exception(result['error'] ?? 'Google Sign-In failed');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google Sign-In failed: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 450),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.person_add_rounded,
                  size: 64,
                  color: AppTheme.primary,
                ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
                const SizedBox(height: 16),
                Text(
                  'Join FoodHub',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.displayLarge,
                ).animate().fadeIn(delay: 200.ms).moveY(begin: 10, end: 0, duration: 400.ms),
                const SizedBox(height: 8),
                Text(
                  'Create an account to start ordering.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ).animate().fadeIn(delay: 300.ms),
                const SizedBox(height: 32),

                if (_selectedRole == 'customer')
                  ElevatedButton.icon(
                    onPressed: () => _handleGoogleSignIn(context),
                    icon: const Icon(Icons.login),
                    label: const Text('Sign up with Google', style: TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black87,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ).animate().fadeIn(delay: 400.ms),
                
                if (_selectedRole == 'customer')
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24.0),
                    child: Row(
                      children: [
                        Expanded(child: Divider(color: AppTheme.borderDark)),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Text('OR', style: TextStyle(color: AppTheme.textSecondary)),
                        ),
                        Expanded(child: Divider(color: AppTheme.borderDark)),
                      ],
                    ),
                  ).animate().fadeIn(delay: 450.ms),

                CustomTextField(
                  controller: _fullNameController,
                  hintText: 'Full Name',
                  prefixIcon: Icons.badge_outlined,
                ).animate().fadeIn(delay: 500.ms).moveX(begin: -20, end: 0),
                const SizedBox(height: 16),
                
                CustomTextField(
                  controller: _usernameController,
                  hintText: 'Username',
                  prefixIcon: Icons.person_outline,
                ).animate().fadeIn(delay: 550.ms).moveX(begin: -20, end: 0),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _emailController,
                  hintText: 'Email',
                  prefixIcon: Icons.email_outlined,
                ).animate().fadeIn(delay: 600.ms).moveX(begin: -20, end: 0),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _phoneController,
                  hintText: 'Phone Number',
                  prefixIcon: Icons.phone_outlined,
                  isNumber: true,
                ).animate().fadeIn(delay: 650.ms).moveX(begin: -20, end: 0),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _passwordController,
                  hintText: 'Password',
                  prefixIcon: Icons.lock_outline,
                  isPassword: true,
                ).animate().fadeIn(delay: 700.ms).moveX(begin: -20, end: 0),
                const SizedBox(height: 24),

                // Role Selector
                Text('Account Type', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceDark,
                    border: Border.all(color: AppTheme.borderDark),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      dropdownColor: AppTheme.surfaceDark,
                      value: _selectedRole,
                      icon: const Icon(Icons.arrow_drop_down, color: AppTheme.textSecondary),
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16),
                      items: ['customer', 'restaurant', 'delivery']
                          .map((role) => DropdownMenuItem(
                                value: role,
                                child: Text("${role[0].toUpperCase()}${role.substring(1)}"),
                              ))
                          .toList(),
                      onChanged: (value) => setState(() => _selectedRole = value ?? 'customer'),
                    ),
                  ),
                ).animate().fadeIn(delay: 750.ms),
                
                const SizedBox(height: 32),
                Consumer<AuthProvider>(
                  builder: (context, authProvider, _) {
                    return CustomButton(
                      text: 'Create Account',
                      onPressed: () => _register(context),
                      isLoading: authProvider.isLoading,
                    );
                  },
                ).animate().fadeIn(delay: 800.ms).scale(),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text('Already have an account? Login here', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                ).animate().fadeIn(delay: 850.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
