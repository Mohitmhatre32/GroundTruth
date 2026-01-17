import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 32),
              Text(
                'GroundTruth',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: AppColors.primaryBlue,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Real-Time Groundwater Monitoring',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textGrey,
                    ),
              ),
              const SizedBox(height: 48),
              Text(
                'Welcome Back',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Sign in to access groundwater monitoring',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textGrey,
                    ),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  hintText: 'Enter your email',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'Enter your password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                ),
                obscureText: _obscurePassword,
              ),
              const SizedBox(height: 24),
              Consumer<AuthProvider>(
                builder: (context, authProvider, _) {
                  return ElevatedButton(
                    onPressed: authProvider.isLoading ? null : _handleLogin,
                    child: authProvider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.white,
                              ),
                            ),
                          )
                        : const Text('Sign In'),
                  );
                },
              ),
              if (context.watch<AuthProvider>().error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.error),
                  ),
                  child: Text(
                    context.watch<AuthProvider>().error ?? '',
                    style: const TextStyle(color: AppColors.error),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: _handleSignUp,
                  child: const Text('Don\'t have an account? Sign up'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    final success = await context.read<AuthProvider>().login(
          _emailController.text,
          _passwordController.text,
        );

    if (success && mounted) {
      Navigator.of(context).pushReplacementNamed('/home');
    }
  }

  void _handleSignUp() {
    Navigator.of(context).pushNamed('/signup');
  }
}
