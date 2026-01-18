import 'package:googleai_dart/googleai_dart.dart';
import 'package:dio/dio.dart'; // 👈 Needed for API calls
import '../utils/constants.dart';

class GeminiService {
  static final GeminiService _instance = GeminiService._internal();

  late final GoogleAIClient _client;
  late final Dio _dio; // 👈 Dio instance
  final String _model = 'gemini-1.5-flash'; // Updated to valid model name

  // ⚠️ ANDROID EMULATOR LOCALHOST IP
  // If running on real phone, use your PC's IP (e.g., http://192.168.1.5:8000)
  final String _backendUrl = 'http://10.0.2.2:8000/api/mobile/stations';

  factory GeminiService() {
    return _instance;
  }

  GeminiService._internal() {
    _initClient();
    _dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5),
    ));
  }

  void _initClient() {
    if (AppConstants.geminiApiKey.isEmpty) {
      throw Exception("Gemini API key is missing in constants.dart");
    }

    _client = GoogleAIClient(
      config: GoogleAIConfig(
        apiKey: AppConstants.geminiApiKey, // Simplified config
      ),
    );
  }

  /// 1. Fetch Real-Time Data from FastAPI
  Future<String> _fetchLiveContext() async {
    try {
      final response = await _dio.get(_backendUrl);
      
      if (response.statusCode == 200) {
        List<dynamic> stations = response.data;
        StringBuffer contextBuffer = StringBuffer();
        
        contextBuffer.writeln("CURRENT LIVE GROUNDWATER DATA:");
        
        // Convert JSON to a readable list for the AI
        for (var s in stations) {
          contextBuffer.writeln(
            "- ${s['name']}: Depth ${s['current_depth_m']}m (${s['status']})"
          );
        }
        return contextBuffer.toString();
      }
    } catch (e) {
      print("⚠️ Could not fetch live data for AI: $e");
    }
    return "Live data is currently unavailable. Ask the user to check their internet connection.";
  }

  /// 2. Send Message with Data Injection
  Future<String> sendMessage(String userMessage) async {
    try {
      // Step A: Get the live data first
      String liveDataContext = await _fetchLiveContext();

      // Step B: Construct the "System Prompt"
      final fullPrompt = '''
You are Jal-Mitra, a friendly and expert AI assistant for the GroundTruth app.

CONTEXT & RULES:
1. **Role:** Help farmers and citizens understand groundwater levels.
2. **Tone:** Optimistic, helpful, simple English (or Hinglish if asked). Use emojis 🌾💧.
3. **Data Source:** Use the LIVE DATA provided below to answer questions about specific locations.
4. **Safety:** If a zone is 'Critical' (Red), advise saving water immediately.
5. **Short Answers:** Keep replies under 3 sentences unless asked for details.

$liveDataContext

USER QUESTION:
$userMessage
''';

      // Step C: Send to Gemini
      final response = await _client.generateContent(
        modelId: _model,
        request: GenerateContentRequest(
          contents: [
            Content(parts: [Part(text: fullPrompt)]),
          ],
        ),
      );

      return response.candidates?.first.content?.parts?.first.text ?? 
          "🤔 I couldn't generate a response. Please try again.";

    } catch (e) {
      print("Gemini Error: $e");
      return "😓 I'm having trouble connecting to the brain. Please check your internet.";
    }
  }

  void dispose() {
    // No explicit close needed for this client version, but good practice if stream exists
  }
}