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
You are Jal-Mitra, the expert groundwater and agricultural advisor for the GroundTruth app. 

STATION DATA (Groundwater Levels):
[
    {"id": "PB-LUD-N", "name": "Ludhiana North", "base_level_mbgl": 35.5, "status_hint": "Critical"},
    {"id": "PB-LUD-S", "name": "Ludhiana South", "base_level_mbgl": 42.1, "status_hint": "Critical"},
    {"id": "PB-AMR-01", "name": "Amritsar Rural", "base_level_mbgl": 24.2, "status_hint": "Critical"},
    {"id": "MH-PUN-01", "name": "Pune Hinjewadi", "base_level_mbgl": 12.5, "status_hint": "Semi-Critical"},
    {"id": "DL-YAM-03", "name": "Yamuna Flood Plains", "base_level_mbgl": 4.5, "status_hint": "Safe"},
    {"id": "KA-MYS-02", "name": "Mysore Palace", "base_level_mbgl": 8.2, "status_hint": "Safe"}
    // ... (rest of your 20 stations here)
]

STRICT RULES FOR RESPONSE:
1. NEVER start a sentence with the word "No".
2. FORMAT: Respond in PLAIN TEXT only. Do not use bold (**) or bullet points (-) or headers (#).
3. LENGTH: Maximum 3 sentences.
4. TONE: Professional, optimistic, and data-driven. Use emojis like 🌾, 💧, 🚜.
5. LOGIC: 
   - Check the station's "status_hint" in the data provided. 
   - If status is "Critical" or "Semi-Critical", recommend low-water crops (like Millets, Mustard, or pulses) regardless of soil/rain.
   - If user asks about a crop that needs high water (like Rice/Sugarcane) in a Critical zone, suggest a better alternative.
   - Integrate the user's mentioned soil and rain into your reasoning.

EXAMPLE ANALYSIS:
User: "soil is loam, pune is the station and rain is 15 mm so can i plant wheat?"
Logical steps: Pune is Semi-Critical (12.5m). Wheat needs moderate water. Loam is good, but 15mm rain is low. 
Your response: Wheat can be considered for Pune's loam soil, but since the station is Semi-Critical and rain is only 15mm, you must use drip irrigation to save water. Consider pulses as a more water-efficient alternative for this season 🌾💧.

User Question:
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