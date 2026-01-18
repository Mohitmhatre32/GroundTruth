import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import '../utils/app_colors.dart';

class LiquidWaveCard extends StatefulWidget {
  final double percentage; // 0.0 to 1.0 (Safety Level)
  final double depth;
  final String status;

  const LiquidWaveCard({
    super.key,
    required this.percentage,
    required this.depth,
    required this.status,
  });

  @override
  State<LiquidWaveCard> createState() => _LiquidWaveCardState();
}

class _LiquidWaveCardState extends State<LiquidWaveCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Determine color based on safety percentage
    // Low percentage = Critical (Red)
    // High percentage = Safe (Green/Blue)
    // Actually, let's stick to the theme:
    // Safe -> AccentCyan/PrimaryBlue
    // Critical -> Red
    Color waveColor = widget.percentage > 0.5 
        ? AppColors.accentCyan 
        : (widget.percentage > 0.2 ? AppColors.warningYellow : AppColors.criticalRed);
    
    // If it's safe, use the nice blue theme
    if (widget.status == 'Safe') waveColor = AppColors.accentCyan;

    return Container(
      height: 220,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: AppColors.accentCyan.withOpacity(0.1),
            blurRadius: 30,
            spreadRadius: -5,
            offset: const Offset(0, 0),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Background Gradient (Subtle)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.backgroundColor,
                    AppColors.softBlue.withOpacity(0.3),
                  ],
                ),
              ),
            ),
          ),

          // The Liquid Wave
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: _WavePainter(
                  _controller.value,
                  widget.percentage, 
                  waveColor,
                ),
                child: SizedBox.expand(),
              );
            },
          ),

          // Glass overlay Effect
          Positioned.fill(
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 0, sigmaY: 0),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          
          // Text Content (Floating above water)
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "GROUNDWATER",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                            color: widget.percentage > 0.85 ? Colors.white : AppColors.textGrey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "${widget.depth}m",
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            color: widget.percentage > 0.85 ? Colors.white : AppColors.primaryBlue,
                            shadows: widget.percentage > 0.85                           
                                ? [Shadow(color: Colors.black26, blurRadius: 4, offset: Offset(0,2))] 
                                : [],
                          ),
                        ),
                      ],
                    ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: widget.percentage > 0.85 
                              ? AppColors.white.withOpacity(0.2) 
                              : AppColors.primaryBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: widget.percentage > 0.85 ? Colors.white54 : AppColors.primaryBlue.withOpacity(0.5)),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              widget.status == 'Safe' ? Icons.check_circle : Icons.warning_rounded,
                              size: 14,
                              color: widget.percentage > 0.85 ? Colors.white : AppColors.primaryBlue,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              widget.status.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: widget.percentage > 0.85 ? Colors.white : AppColors.primaryBlue,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Bubbles overlay? (Optional enhancement)
        ],
      ),
    );
  }
}

class _WavePainter extends CustomPainter {
  final double animationValue;
  final double percentage; // 0.0 to 1.0
  final Color color;

  _WavePainter(this.animationValue, this.percentage, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // We want the wave height to correspond to the percentage.
    // However, percentage 1.0 means Full Water (Safe?), or wait.
    // Usually deeper water = Safe. Shallow = Critical?
    // Let's assume percentage matches "Water Level".
    // So 1.0 = Full, 0.0 = Empty.
    
    // Wave calculations
    final path = Path();
    final y = size.height * (1 - percentage); // Base height line

    // Draw two overlapping waves for 3D depth effect
    
    // Wave 1 (Back, lighter)
    paint.color = color.withOpacity(0.6);
    final path1 = Path();
    path1.moveTo(0, size.height);
    path1.lineTo(0, y);
    for (double i = 0; i <= size.width; i++) {
        path1.lineTo(
          i,
          y + 10 * math.sin((i / size.width * 2 * math.pi) + (animationValue * 2 * math.pi)),
        );
    }
    path1.lineTo(size.width, size.height);
    path1.close();
    canvas.drawPath(path1, paint);

    // Wave 2 (Front, solid)
    paint.color = color; // Solid color
    // Add gradient to paint
    paint.shader = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [color, color.withRed(color.red + 20)], // Slightly different shade
    ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    path.moveTo(0, size.height);
    path.lineTo(0, y);
    for (double i = 0; i <= size.width; i++) {
      path.lineTo(
        i,
        y + 12 * math.sin((i / size.width * 2 * math.pi) + (animationValue * 2 * math.pi) + 1.5),
      );
    }
    path.lineTo(size.width, size.height);
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
