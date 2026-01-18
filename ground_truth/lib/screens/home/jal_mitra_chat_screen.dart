import 'dart:math';
import 'package:flutter/material.dart';
import '../../utils/app_colors.dart';
import '../../services/gemini_service.dart';

class JalMitraChatScreen extends StatefulWidget {
  const JalMitraChatScreen({super.key});

  @override
  State<JalMitraChatScreen> createState() => _JalMitraChatScreenState();
}

class _JalMitraChatScreenState extends State<JalMitraChatScreen>
    with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [
    ChatMessage(
      text:
          'Hello! I\'m Jal-Mitra. How can I help you with your groundwater today?',
      isUser: false,
      timestamp: DateTime.now(),
    ),
  ];
  bool _isTyping = false;
  final ScrollController _scrollController = ScrollController();
  final String _currentStationName = "Ludhiana Block A";
  late AnimationController _bgAnimController;

  @override
  void initState() {
    super.initState();
    _bgAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent +
              100, // Small overscroll for comfort
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(text: text, isUser: true, timestamp: DateTime.now()),
      );
      _isTyping = true;
    });

    _scrollToBottom();
    _messageController.clear();

    try {
      final response = await GeminiService().sendMessage(text);
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.add(
            ChatMessage(
              text: response,
              isUser: false,
              timestamp: DateTime.now(),
            ),
          );
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isTyping = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // 1. Animated Gradient Background - REMOVED (Using Global)

          // 2. Moving Doodle Pattern (Faint)
          Positioned.fill(
            child: Opacity(
              opacity: 0.3,
              child: CustomPaint(
                painter: DoodlePatternPainter(
                  color: AppColors.primaryBlue.withOpacity(0.1),
                  offset: _bgAnimController.value * 20,
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // 3. Glassmorphic Header
                _buildGlassHeader(),

                // 4. Chat Area
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 24,
                    ),
                    itemCount: _messages.length + (_isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length) {
                        return _buildTypingIndicator();
                      }
                      final message = _messages[index];
                      // Spring Animation for New Messages
                      return TweenAnimationBuilder(
                        duration: Duration(milliseconds: 600),
                        curve: Curves.elasticOut,
                        tween: Tween<double>(begin: 0, end: 1),
                        builder: (context, double val, child) {
                          return Transform.translate(
                            offset: Offset(0, 50 * (1 - val)),
                            child: Transform.scale(
                              scale: 0.5 + (0.5 * val),
                              child: Opacity(
                                opacity: val.clamp(0.0, 1.0),
                                child: child,
                              ),
                            ),
                          );
                        },
                        child: _build3DMessageBubble(message),
                      );
                    },
                  ),
                ),

                // 5. Glassmorphic Footer
                _buildGlassInputFooter(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6), // Glass effect
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(30)),
        border: Border(
          bottom: BorderSide(color: Colors.white.withOpacity(0.5), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBlue.withOpacity(0.05),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [AppColors.accentCyan, AppColors.primaryBlue],
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accentCyan.withOpacity(0.4),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: CircleAvatar(
              backgroundColor: Colors.white,
              radius: 22,
              child: Icon(
                Icons.smart_toy_rounded,
                color: AppColors.primaryBlue,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Jal-Mitra AI',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primaryBlue,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: AppColors.safeGreen,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.safeGreen.withOpacity(0.5),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Online • $_currentStationName',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textGrey,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassInputFooter() {
    return Container(
      padding: EdgeInsets.only(bottom: 12, left: 16, right: 16, top: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        border: Border(top: BorderSide(color: Colors.white, width: 2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 20,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                _buildGlassChip(
                  '💧 Best Crops',
                  'Suggest crops for 50m water depth',
                ),
                const SizedBox(width: 8),
                _buildGlassChip(
                  '📜 Govt Schemes',
                  'List subsidies for borewell recharge',
                ),
                const SizedBox(width: 8),
                _buildGlassChip(
                  '🌧️ Rainwater',
                  'How to build a recharge pit?',
                ),
              ],
            ),
          ),

          // Field
          Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white, // Solid white background
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.3), // Soft shadow
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _messageController,
                    // Input text color (User typing)
                    style: TextStyle(
                      color: Colors.blue[900], // Dark blue text
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                    cursorColor: Colors.blue, // Blue cursor
                    decoration: InputDecoration(
                      hintText: 'Ask Jal-Mitra...',
                      // Hint text color
                      hintStyle: TextStyle(
                        color: Colors.blue.withOpacity(
                          0.5,
                        ), // Lighter blue for hint
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      suffixIcon: Icon(
                        Icons.mic_none_rounded,
                        color: Colors.blue, // Blue icon
                      ),
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () => _sendMessage(_messageController.text),
                child: Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.accentCyan, AppColors.primaryBlue],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryBlue.withOpacity(0.4),
                        blurRadius: 10,
                        offset: Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.send_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGlassChip(String label, String query) {
    return GestureDetector(
      onTap: () => _sendMessage(query),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryBlue.withOpacity(0.05),
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.primaryBlue,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _build3DMessageBubble(ChatMessage message) {
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          // 3D Gradient
          gradient: isUser
              ? LinearGradient(
                  colors: [AppColors.accentCyan, AppColors.primaryBlue],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : LinearGradient(
                  colors: [Colors.white, Color(0xFFF5F9FA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
            bottomLeft: Radius.circular(isUser ? 24 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 24),
          ),
          boxShadow: [
            BoxShadow(
              color: isUser
                  ? AppColors.primaryBlue.withOpacity(0.3)
                  : Colors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: Offset(0, 6),
            ),
          ],
        ),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isUser ? Colors.white : AppColors.black,
                fontSize: 16,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(left: 16, bottom: 16),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 8,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                _buildDot(0),
                SizedBox(width: 4),
                _buildDot(150),
                SizedBox(width: 4),
                _buildDot(300),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(int delay) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 600),
      curve: Curves.easeInOut,
      builder: (context, val, child) {
        return Transform.translate(
          offset: Offset(0, -3 * sin((val * pi * 2))), // Bouncing
          child: child,
        );
      },
      onEnd:
          () {}, // Loop handled by parent logic nicely in complex apps, simplified here
      child: Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: AppColors.accentCyan,
          shape: BoxShape.circle,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _bgAnimController.dispose();
    super.dispose();
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}

class DoodlePatternPainter extends CustomPainter {
  final Color color;
  final double offset;
  DoodlePatternPainter({required this.color, required this.offset});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final step = 80.0;

    for (double y = 0; y < size.height; y += step) {
      for (double x = 0; x < size.width; x += step) {
        // Animated shift
        double shiftX = sin((y + offset / 10)) * 10;
        double shiftY = cos((x + offset / 10)) * 10;

        double effectiveX = x + ((y / step) % 2 == 0 ? 0 : step / 2) + shiftX;
        double effectiveY = y + shiftY;

        drawDoodle(
          canvas,
          paint,
          Offset(effectiveX, effectiveY),
          (x + y).toInt() % 4,
        );
      }
    }
  }

  void drawDoodle(Canvas canvas, Paint paint, Offset center, int type) {
    switch (type) {
      case 0: // Drop
        Path path = Path();
        path.moveTo(center.dx, center.dy - 8);
        path.quadraticBezierTo(
          center.dx + 8,
          center.dy + 4,
          center.dx,
          center.dy + 8,
        );
        path.quadraticBezierTo(
          center.dx - 8,
          center.dy + 4,
          center.dx,
          center.dy - 8,
        );
        canvas.drawPath(path, paint);
        break;
      case 1: // Circle
        canvas.drawCircle(center, 6, paint);
        break;
      case 2: // Zigzag
        Path path = Path();
        path.moveTo(center.dx - 8, center.dy);
        path.lineTo(center.dx - 4, center.dy + 4);
        path.lineTo(center.dx, center.dy);
        path.lineTo(center.dx + 4, center.dy + 4);
        path.lineTo(center.dx + 8, center.dy);
        canvas.drawPath(path, paint);
        break;
      case 3: // Leaf
        canvas.drawOval(
          Rect.fromCenter(center: center, width: 12, height: 6),
          paint,
        );
        break;
    }
  }

  @override
  bool shouldRepaint(covariant DoodlePatternPainter old) => true; // Animate
}
