import 'package:googleai_dart/googleai_dart.dart';
import '../utils/constants.dart';

class GeminiService {
  static final GeminiService _instance = GeminiService._internal();

  late final GoogleAIClient _client;
  final String _model = 'gemini-2.5-flash'; 

  factory GeminiService() {
    return _instance;
  }

  GeminiService._internal() {
    _initClient();
  }

  void _initClient() {
    if (AppConstants.geminiApiKey.isEmpty) {
      throw Exception("Gemini API key is missing in constants.dart");
    }

    // ✅ FIXED: Use GoogleAIConfig with ApiKeyProvider
    _client = GoogleAIClient(
      config: GoogleAIConfig(
        authProvider: ApiKeyProvider(AppConstants.geminiApiKey),
      ),
    );
  }

  Future<String> sendMessage(String message) async {
    try {
      if (AppConstants.geminiApiKey.startsWith('AIzaSy_PLACEHOLDER')) {
        return "⚠️ Please configure your real Gemini API key in constants.dart";
      }

      final response = await _client.models.generateContent(
        model: _model,
        request: GenerateContentRequest(
          contents: [
            Content.text(
              '''
You are Jal-Mitra, an expert AI assistant for the GroundTruth app.

GroundTruth is a groundwater monitoring application using DWLR (Digital Water Level Recorders).

Rules:
- Help farmers, citizens, and officials
- Keep replies short, optimistic, and helpful
- Use emojis occasionally
- For real-time groundwater data, guide users to the Dashboard

Zones:
🟢 Green = Safe
🟡 Yellow = Semi-Critical
🔴 Red = Critical

User says:
$message
'''
            ),
          ],
        ),
      );

      return response.text?.trim().isNotEmpty == true
          ? response.text!
          : "🤔 I couldn't generate a response for that.";
    } catch (e) {
      return "😓 I'm having trouble connecting right now.\n$e";
    }
  }

  void dispose() {
    _client.close();
  }
}